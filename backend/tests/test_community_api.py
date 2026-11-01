from __future__ import annotations

import os
from collections.abc import AsyncIterator
from datetime import datetime, timedelta, timezone
from uuid import UUID, uuid4

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.engine import make_url

from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models import Article, ArticleStatus, Category, Poll, PollOption

pytestmark = pytest.mark.skipif(
    not os.getenv("TEST_DATABASE_URL"),
    reason="Set TEST_DATABASE_URL to a disposable PostgreSQL database",
)


@pytest_asyncio.fixture
async def community_client() -> AsyncIterator[dict[str, object]]:
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
                json={"full_name": "QA Reader", "email": f"qa-{uuid4().hex[:8]}@example.test", "password": "correct-horse-789"},
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
                poll = Poll(question="Community API test poll", is_active=True, closes_at=datetime.now(timezone.utc) + timedelta(days=7))
                session.add_all([article, poll])
                await session.flush()
                options = [PollOption(poll_id=poll.id, option_text="Yes"), PollOption(poll_id=poll.id, option_text="No")]
                session.add_all(options)
                await session.commit()
                ids = {"article": str(article.id), "slug": article.slug, "poll": str(poll.id), "option": str(options[0].id)}
            yield {"client": client, "token": token, "ids": ids}
        finally:
            app.dependency_overrides.pop(get_db, None)
            async with engine.begin() as connection:
                await connection.run_sync(Base.metadata.drop_all)
            await engine.dispose()


@pytest.mark.asyncio
async def test_reader_community_flows(community_client: dict[str, object]) -> None:
    client = community_client["client"]
    token = community_client["token"]
    ids = community_client["ids"]
    assert isinstance(client, AsyncClient) and isinstance(token, str) and isinstance(ids, dict)
    headers = {"Authorization": f"Bearer {token}"}
    article_id = ids["article"]

    article = await client.get(f"/api/v1/articles/{ids['slug']}", headers=headers)
    assert article.status_code == 200
    assert article.json()["views_count"] == 1

    parent = await client.post(
        f"/api/v1/articles/{article_id}/comments", headers=headers, json={"text": "Root comment"}
    )
    assert parent.status_code == 201
    child = await client.post(
        f"/api/v1/articles/{article_id}/comments",
        headers=headers,
        json={"text": "Nested reply", "parent_id": parent.json()["id"]},
    )
    assert child.status_code == 201
    comment_tree = await client.get(f"/api/v1/articles/{article_id}/comments")
    assert comment_tree.json()["items"][0]["replies"][0]["text"] == "Nested reply"

    reaction = await client.put(
        f"/api/v1/articles/{article_id}/react", headers=headers, json={"kind": "useful"}
    )
    assert reaction.status_code == 200
    assert reaction.json()["counts"]["useful"] == 1

    saved = await client.put(f"/api/v1/articles/{article_id}/bookmark", headers=headers)
    assert saved.json() == {"bookmarked": True}
    bookmarks = await client.get("/api/v1/bookmarks", headers=headers)
    assert bookmarks.json()["total"] == 1

    poll_id = ids["poll"]
    vote = await client.post(
        f"/api/v1/polls/{poll_id}/vote", headers=headers, json={"option_id": ids["option"]}
    )
    assert vote.status_code == 200
    selected_option = next(option for option in vote.json()["options"] if option["id"] == ids["option"])
    assert selected_option["percentage"] == 100
    duplicate_vote = await client.post(
        f"/api/v1/polls/{poll_id}/vote", headers=headers, json={"option_id": ids["option"]}
    )
    assert duplicate_vote.status_code == 409

    removed = await client.delete(f"/api/v1/articles/{article_id}/bookmark", headers=headers)
    assert removed.json() == {"bookmarked": False}
