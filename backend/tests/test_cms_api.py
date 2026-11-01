from __future__ import annotations

import os
from pathlib import Path

import pytest
from httpx import AsyncClient

from app.config import settings

pytestmark = pytest.mark.skipif(
    not os.getenv("TEST_DATABASE_URL"),
    reason="Set TEST_DATABASE_URL to a disposable PostgreSQL database",
)


@pytest.mark.asyncio
async def test_cms_article_lifecycle_and_media(
    community_client: dict[str, object], tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    client = community_client["client"]
    token = community_client["token"]
    ids = community_client["ids"]
    assert isinstance(client, AsyncClient) and isinstance(token, str) and isinstance(ids, dict)
    headers = {"Authorization": f"Bearer {token}"}
    article_payload = {
        "title": "Стаття редактора",
        "category_id": ids["category"],
        "tags": ["React", "React", "Розробка"],
        "blocks": [
            {"block_type": "heading", "content_payload": {"text": "Розділ", "level": 2}},
            {"block_type": "text", "content_payload": {"text": "Тіло технічної статті з кількома словами."}},
        ],
    }
    reader_upload = await client.post(
        "/api/v1/media/upload",
        headers=headers,
        files={"file": ("cover.png", b"\x89PNG\r\n\x1a\ncontent", "image/png")},
    )
    assert reader_upload.status_code == 403
    denied = await client.post("/api/v1/articles", headers=headers, json=article_payload)
    assert denied.status_code == 403

    upgraded = await client.patch(
        "/api/v1/users/upgrade-role",
        headers=headers,
        json={"handle": "qa_cms_author", "role_title": "Редактор", "topics": ["backend"]},
    )
    assert upgraded.status_code == 200

    monkeypatch.setattr(settings, "media_storage_path", str(tmp_path))
    monkeypatch.setattr(settings, "media_public_base_url", "https://media.example.test")
    uploaded = await client.post(
        "/api/v1/media/upload",
        headers=headers,
        files={"file": ("cover.png", b"\x89PNG\r\n\x1a\ncontent", "image/png")},
    )
    assert uploaded.status_code == 201
    media = uploaded.json()
    assert media["url"].startswith("https://media.example.test/uploads/")
    assert (tmp_path / media["filename"]).read_bytes().startswith(b"\x89PNG\r\n\x1a\n")
    invalid_type = await client.post(
        "/api/v1/media/upload",
        headers=headers,
        files={"file": ("cover.png", b"not an image", "image/png")},
    )
    assert invalid_type.status_code == 415
    monkeypatch.setattr(settings, "media_max_bytes", 8)
    oversized = await client.post(
        "/api/v1/media/upload",
        headers=headers,
        files={"file": ("large.png", b"\x89PNG\r\n\x1a\nX", "image/png")},
    )
    assert oversized.status_code == 413
    monkeypatch.setattr(settings, "media_max_bytes", 8 * 1024 * 1024)

    created = await client.post("/api/v1/articles", headers=headers, json=article_payload)
    assert created.status_code == 201, created.text
    article = created.json()
    assert article["status"] == "draft"
    assert article["slug"]
    assert article["tags"] == ["React", "Розробка"]
    assert [block["order_index"] for block in article["blocks"]] == [0, 1]
    article_id = article["id"]

    mine = await client.get("/api/v1/articles/mine", headers=headers)
    assert mine.status_code == 200
    assert mine.json()["total"] == 2  # The fixture also owns its published reader-flow article.
    editor = await client.get(f"/api/v1/articles/{article_id}/edit", headers=headers)
    assert editor.json()["blocks"][1]["content_payload"]["text"] == "Тіло технічної статті з кількома словами."

    published = await client.put(
        f"/api/v1/articles/{article_id}",
        headers=headers,
        json={"status": "published", "blocks": list(reversed(article_payload["blocks"]))},
    )
    assert published.status_code == 200, published.text
    assert published.json()["published_at"] is not None
    assert published.json()["blocks"][0]["content_payload"]["text"].startswith("Тіло")

    other = await client.post(
        "/api/v1/auth/register",
        json={"full_name": "Other Reporter", "email": "other-reporter@example.test", "password": "correct-horse-789"},
    )
    other_headers = {"Authorization": f"Bearer {other.json()['access_token']}"}
    await client.patch(
        "/api/v1/users/upgrade-role",
        headers=other_headers,
        json={"handle": "other_cms_author", "role_title": "Автор", "topics": ["systems"]},
    )
    forbidden = await client.put(
        f"/api/v1/articles/{article_id}", headers=other_headers, json={"title": "Hijack"}
    )
    assert forbidden.status_code == 403

    deleted = await client.delete(f"/api/v1/articles/{article_id}", headers=headers)
    assert deleted.status_code == 204
    missing = await client.get(f"/api/v1/articles/{article_id}/edit", headers=headers)
    assert missing.status_code == 404
