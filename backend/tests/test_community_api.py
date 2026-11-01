from __future__ import annotations

import os

import pytest
from httpx import ASGITransport, AsyncClient

pytestmark = pytest.mark.skipif(
    not os.getenv("TEST_DATABASE_URL"),
    reason="Set TEST_DATABASE_URL to a disposable PostgreSQL database",
)


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
