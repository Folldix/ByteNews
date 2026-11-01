from __future__ import annotations

from collections.abc import AsyncIterator
from datetime import datetime, timedelta, timezone
from uuid import UUID, uuid4

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.engine import make_url
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models import Article, ArticleStatus, Category, Poll, PollOption


@pytest_asyncio.fixture
async def community_client() -> AsyncIterator[dict[str, object]]:
    import os

    test_url = os.getenv("TEST_DATABASE_URL")
    assert test_url
    url = make_url(test_url)
    if not url.database or not url.database.endswith("_test"):
        pytest.fail("TEST_DATABASE_URL database name must end in _test")
    async_url = test_url.replace("+psycopg", "+asyncpg", 1)
    engine = create_async_engine(async_url)
    sessions = async_sessionmaker(engine, expire_on_commit=False, autoflush=False)
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.drop_all)
        await connection.run_sync(Base.metadata.create_all)

    async def override_db() -> AsyncIterator[object]:
        async with sessions() as session:
            yield session

    app.dependency_overrides[get_db] = override_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        try:
            registration = await client.post(
                "/api/v1/auth/register",
                json={
                    "full_name": "QA Reader",
                    "email": f"qa-{uuid4().hex[:8]}@example.test",
                    "password": "correct-horse-789",
                },
            )
            assert registration.status_code == 201
            token = registration.json()["access_token"]
            user_id = registration.json()["user"]["id"]
            async with sessions() as session:
                category = Category(name=f"QA {uuid4().hex[:6]}", slug=f"qa-{uuid4().hex[:8]}")
                session.add(category)
                await session.flush()
                article = Article(
                    title="Community API test article",
                    slug=f"community-test-{uuid4().hex}",
                    lead="Test article lead",
                    category_id=category.id,
                    author_id=UUID(user_id),
                    status=ArticleStatus.PUBLISHED,
                    published_at=datetime.now(timezone.utc),
                )
                poll = Poll(
                    question="Community API test poll",
                    is_active=True,
                    closes_at=datetime.now(timezone.utc) + timedelta(days=7),
                )
                session.add_all([article, poll])
                await session.flush()
                options = [
                    PollOption(poll_id=poll.id, option_text="Yes"),
                    PollOption(poll_id=poll.id, option_text="No"),
                ]
                session.add_all(options)
                await session.commit()
                ids = {
                    "article": str(article.id),
                    "slug": article.slug,
                    "poll": str(poll.id),
                    "option": str(options[0].id),
                    "category": str(category.id),
                }
            yield {"client": client, "token": token, "ids": ids}
        finally:
            app.dependency_overrides.pop(get_db, None)
            async with engine.begin() as connection:
                await connection.run_sync(Base.metadata.drop_all)
            await engine.dispose()
