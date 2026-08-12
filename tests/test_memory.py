"""
Unit Tests for Context & Memory Management.
Tests async SQLite database persistence, history compaction, and profile storage.
"""

import pytest
from backend.memory.db import init_db
from backend.memory.async_memory import memory_manager
from backend.memory.compactor import HistoryCompactor


@pytest.mark.asyncio
async def test_database_init_and_message_save():
    """Tests initializing SQLite database and saving conversation messages."""
    await init_db()
    session_id = "test_session_mem_1"
    
    saved = await memory_manager.save_message(session_id, "user", "Hello Astraea")
    assert saved["session_id"] == session_id
    assert saved["role"] == "user"

    history = await memory_manager.get_history(session_id)
    assert len(history) >= 1
    assert history[0]["content"] == "Hello Astraea"


@pytest.mark.asyncio
async def test_history_compaction():
    """Tests automatic history compaction when turn count exceeds threshold."""
    await init_db()
    session_id = "test_session_compact"

    # Insert 15 conversation turns
    for i in range(15):
        role = "user" if i % 2 == 0 else "assistant"
        await memory_manager.save_message(session_id, role, f"Message turn {i}")

    # Compact history
    compacted = await memory_manager.compact_history_if_needed(session_id)
    assert compacted is True

    # Check remaining uncompacted turns
    remaining = await memory_manager.get_history(session_id)
    assert len(remaining) <= 5
