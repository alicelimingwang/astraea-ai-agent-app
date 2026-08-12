"""
Async Database Models & Engine
Provides persistent database tables using Async SQLAlchemy & SQLite.
Stores user sessions, conversation turns, user profiles, and memory summaries.
"""

import time
from typing import Optional, List
from sqlalchemy import String, Text, Float, Integer, ForeignKey
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from backend.config import config


class Base(DeclarativeBase):
    pass


class UserSession(Base):
    __tablename__ = "user_sessions"

    session_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    created_at: Mapped[float] = mapped_column(Float, default=time.time)
    updated_at: Mapped[float] = mapped_column(Float, default=time.time, onupdate=time.time)
    
    # Relationships
    messages: Mapped[List["ConversationHistory"]] = relationship("ConversationHistory", back_populates="session", cascade="all, delete-orphan")
    profile: Mapped[Optional["UserProfile"]] = relationship("UserProfile", back_populates="session", uselist=False, cascade="all, delete-orphan")
    summaries: Mapped[List["MemorySummary"]] = relationship("MemorySummary", back_populates="session", cascade="all, delete-orphan")


class ConversationHistory(Base):
    __tablename__ = "conversation_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[str] = mapped_column(String(64), ForeignKey("user_sessions.session_id"))
    role: Mapped[str] = mapped_column(String(16))  # 'user', 'assistant', 'system', 'tool'
    content: Mapped[str] = mapped_column(Text)
    timestamp: Mapped[float] = mapped_column(Float, default=time.time)
    meta_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    session: Mapped["UserSession"] = relationship("UserSession", back_populates="messages")


class UserProfile(Base):
    __tablename__ = "user_profiles"

    session_id: Mapped[str] = mapped_column(String(64), ForeignKey("user_sessions.session_id"), primary_key=True)
    birth_date: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    birth_time: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    unknown_time_mode: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    gender: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    day_master: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    fav_element: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)

    session: Mapped["UserSession"] = relationship("UserSession", back_populates="profile")


class MemorySummary(Base):
    __tablename__ = "memory_summaries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[str] = mapped_column(String(64), ForeignKey("user_sessions.session_id"))
    summary_text: Mapped[str] = mapped_column(Text)
    compacted_turn_count: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[float] = mapped_column(Float, default=time.time)

    session: Mapped["UserSession"] = relationship("UserSession", back_populates="summaries")


# Create Async Engine & SessionMaker
engine = create_async_engine(config.database_url, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def init_db():
    """Initializes persistent database tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
