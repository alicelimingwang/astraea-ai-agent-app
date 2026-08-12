"""
Async Memory Operations Manager
Provides non-blocking async operations for conversation state, user profile persistence, and memory compaction.
"""

from typing import List, Dict, Any, Optional
from sqlalchemy import select, delete
from backend.memory.db import AsyncSessionLocal, UserSession, ConversationHistory, UserProfile, MemorySummary
from backend.memory.compactor import HistoryCompactor
from backend.config import config


class AsyncMemoryManager:
    """Async memory manager handling persistent CRUD and context window compaction."""

    @staticmethod
    async def ensure_session(session_id: str) -> None:
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(UserSession).where(UserSession.session_id == session_id))
            session = result.scalar_one_or_none()
            if not session:
                new_session = UserSession(session_id=session_id)
                db.add(new_session)
                await db.commit()

    @staticmethod
    async def save_message(session_id: str, role: str, content: str, meta_json: Optional[str] = None) -> Dict[str, Any]:
        await AsyncMemoryManager.ensure_session(session_id)
        async with AsyncSessionLocal() as db:
            msg = ConversationHistory(session_id=session_id, role=role, content=content, meta_json=meta_json)
            db.add(msg)
            await db.commit()
            return {"id": msg.id, "session_id": session_id, "role": role, "content": content}

    @staticmethod
    async def get_history(session_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        await AsyncMemoryManager.ensure_session(session_id)
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(ConversationHistory)
                .where(ConversationHistory.session_id == session_id)
                .order_by(ConversationHistory.timestamp.asc())
                .limit(limit)
            )
            rows = result.scalars().all()
            return [{"role": r.role, "content": r.content, "timestamp": r.timestamp} for r in rows]

    @staticmethod
    async def get_context_for_prompt(session_id: str) -> str:
        """Retrieves active memory summaries + recent messages to build prompt context."""
        await AsyncMemoryManager.ensure_session(session_id)
        async with AsyncSessionLocal() as db:
            # Check summaries
            sum_result = await db.execute(
                select(MemorySummary)
                .where(MemorySummary.session_id == session_id)
                .order_by(MemorySummary.created_at.desc())
            )
            summaries = sum_result.scalars().all()
            summary_text = "\n".join([s.summary_text for s in summaries]) if summaries else "No prior compacted memory."

            # Check profile
            prof_result = await db.execute(select(UserProfile).where(UserProfile.session_id == session_id))
            profile = prof_result.scalar_one_or_none()
            profile_text = f"Birth Date: {profile.birth_date}, Day Master: {profile.day_master}" if profile else "Profile not calculated."

            return f"--- USER PERSISTENT MEMORY ---\nProfile: {profile_text}\nSummaries:\n{summary_text}\n-----------------------------"

    @staticmethod
    async def compact_history_if_needed(session_id: str) -> bool:
        """
        Executes history compaction if conversation length exceeds max_history_turns.
        Moves older messages into a MemorySummary row and purges compacted history.
        """
        await AsyncMemoryManager.ensure_session(session_id)
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(ConversationHistory)
                .where(ConversationHistory.session_id == session_id)
                .order_by(ConversationHistory.timestamp.asc())
            )
            messages = result.scalars().all()
            
            if len(messages) > config.max_history_turns:
                to_compact = messages[:-4] # Keep last 4 messages intact
                compacted_dicts = [{"role": m.role, "content": m.content} for m in to_compact]
                summary_str = HistoryCompactor.compact_turns(compacted_dicts)

                # Store summary
                mem_sum = MemorySummary(
                    session_id=session_id,
                    summary_text=summary_str,
                    compacted_turn_count=len(to_compact)
                )
                db.add(mem_sum)

                # Delete compacted messages
                for m in to_compact:
                    await db.delete(m)

                await db.commit()
                return True
        return False

    @staticmethod
    async def save_profile(session_id: str, birth_date: str, birth_time: str, gender: str, day_master: str = "") -> None:
        await AsyncMemoryManager.ensure_session(session_id)
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(UserProfile).where(UserProfile.session_id == session_id))
            profile = result.scalar_one_or_none()
            if not profile:
                profile = UserProfile(session_id=session_id)
                db.add(profile)
            profile.birth_date = birth_date
            profile.birth_time = birth_time
            profile.gender = gender
            if day_master:
                profile.day_master = day_master
            await db.commit()


memory_manager = AsyncMemoryManager()
