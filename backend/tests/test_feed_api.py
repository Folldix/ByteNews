from __future__ import annotations

import os

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.skipif(
    not os.getenv("TEST_DATABASE_URL"),
    reason="Set TEST_DATABASE_URL to a disposable PostgreSQL database",
)


@pytest.mark.asyncio
async def test_feed_search_and_public_feed(community_client: dict[str, object]) -> None:
    client = community_client["client"]
    assert isinstance(client, AsyncClient)

    feed = await client.get("/api/v1/articles")
    assert feed.status_code == 200, feed.text
    assert feed.json()["total"] >= 1
    assert feed.json()["items"][0]["author_role"] == "Читач спільноти"

    searched = await client.get("/api/v1/articles/search", params={"q": "Community"})
    assert searched.status_code == 200, searched.text
    assert searched.json()["total"] == 1
    assert searched.json()["items"][0]["title"] == "Community API test article"

    public_feed = await client.get("/api/v1/public/feed", params={"limit": 1, "offset": 0})
    assert public_feed.status_code == 200, public_feed.text
    assert public_feed.json()["total"] >= 1
    assert public_feed.json()["limit"] == 1
    assert len(public_feed.json()["items"]) == 1
