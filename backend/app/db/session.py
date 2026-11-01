from collections.abc import AsyncIterator

from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import Session, sessionmaker

from app.config import settings

def _sync_database_url(url: str) -> str:
    if "+asyncpg" in url:
        return url.replace("+asyncpg", "+psycopg", 1)
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+psycopg://", 1)
    return url


def _async_database_url(url: str) -> str:
    if "+psycopg" in url:
        return url.replace("+psycopg", "+asyncpg", 1)
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return url


engine = create_async_engine(_async_database_url(settings.database_url), pool_pre_ping=True)
AsyncSessionLocal = async_sessionmaker(
    bind=engine, class_=AsyncSession, autoflush=False, expire_on_commit=False
)

# APScheduler's BackgroundScheduler runs RSS collection in a worker thread.
sync_engine = create_engine(_sync_database_url(settings.database_url), pool_pre_ping=True)
SessionLocal = sessionmaker(bind=sync_engine, class_=Session, autoflush=False, expire_on_commit=False)


async def get_db() -> AsyncIterator[AsyncSession]:
    async with AsyncSessionLocal() as session:
        yield session
