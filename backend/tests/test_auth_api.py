from __future__ import annotations

import os
from uuid import uuid4

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.skipif(
    not os.getenv("TEST_DATABASE_URL"),
    reason="Set TEST_DATABASE_URL to a disposable PostgreSQL database",
)

PASSWORD = "correct-horse-789"


async def _register(client: AsyncClient) -> tuple[str, dict[str, object]]:
    email = f"auth-{uuid4().hex[:8]}@example.test"
    response = await client.post(
        "/api/v1/auth/register",
        json={"full_name": "Auth Tester", "email": email, "password": PASSWORD},
    )
    assert response.status_code == 201, response.text
    return email, response.json()


@pytest.mark.asyncio
async def test_register_login_and_profile(community_client: dict[str, object]) -> None:
    client = community_client["client"]
    assert isinstance(client, AsyncClient)
    email, registered = await _register(client)
    assert registered["user"]["role"] == "reader"

    duplicate = await client.post(
        "/api/v1/auth/register",
        json={"full_name": "Auth Tester", "email": email, "password": PASSWORD},
    )
    assert duplicate.status_code == 409

    short_password = await client.post(
        "/api/v1/auth/register",
        json={"full_name": "Auth Tester", "email": f"x{email}", "password": "short"},
    )
    assert short_password.status_code == 422

    wrong = await client.post("/api/v1/auth/login", json={"email": email, "password": "wrong-password"})
    assert wrong.status_code == 401
    unknown = await client.post(
        "/api/v1/auth/login", json={"email": f"nobody-{email}", "password": PASSWORD}
    )
    assert unknown.status_code == 401

    login = await client.post("/api/v1/auth/login", json={"email": email, "password": PASSWORD})
    assert login.status_code == 200
    access = login.json()["access_token"]

    me = await client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {access}"})
    assert me.status_code == 200
    assert me.json()["email"] == email

    anonymous = await client.get("/api/v1/users/me")
    assert anonymous.status_code == 401
    garbage = await client.get("/api/v1/users/me", headers={"Authorization": "Bearer not-a-jwt"})
    assert garbage.status_code == 401
    # A refresh token must not be accepted where an access token is expected.
    wrong_type = await client.get(
        "/api/v1/users/me", headers={"Authorization": f"Bearer {login.json()['refresh_token']}"}
    )
    assert wrong_type.status_code == 401


@pytest.mark.asyncio
async def test_refresh_rotation_reuse_detection_and_logout(
    community_client: dict[str, object],
) -> None:
    client = community_client["client"]
    assert isinstance(client, AsyncClient)
    _, registered = await _register(client)
    first_refresh = registered["refresh_token"]

    rotated = await client.post("/api/v1/auth/refresh", json={"refresh_token": first_refresh})
    assert rotated.status_code == 200
    second_refresh = rotated.json()["refresh_token"]
    assert second_refresh != first_refresh

    # Replaying the already rotated token revokes the whole token family.
    reused = await client.post("/api/v1/auth/refresh", json={"refresh_token": first_refresh})
    assert reused.status_code == 401
    assert "reuse" in reused.json()["detail"]
    revoked_family = await client.post("/api/v1/auth/refresh", json={"refresh_token": second_refresh})
    assert revoked_family.status_code == 401

    invalid = await client.post("/api/v1/auth/refresh", json={"refresh_token": "x" * 40})
    assert invalid.status_code == 401

    login = await client.post(
        "/api/v1/auth/login",
        json={"email": registered["user"]["email"], "password": PASSWORD},
    )
    refresh_token = login.json()["refresh_token"]
    logout = await client.post("/api/v1/auth/logout", json={"refresh_token": refresh_token})
    assert logout.json() == {"message": "Signed out"}
    after_logout = await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert after_logout.status_code == 401

    # Logging out with an unreadable token is a harmless no-op.
    noop = await client.post("/api/v1/auth/logout", json={"refresh_token": "y" * 40})
    assert noop.status_code == 200


@pytest.mark.asyncio
async def test_upgrade_role_and_public_profile(community_client: dict[str, object]) -> None:
    client = community_client["client"]
    assert isinstance(client, AsyncClient)
    _, first = await _register(client)
    _, second = await _register(client)
    first_headers = {"Authorization": f"Bearer {first['access_token']}"}
    second_headers = {"Authorization": f"Bearer {second['access_token']}"}
    handle = f"reporter_{uuid4().hex[:6]}"

    reader_profile = await client.get(f"/api/v1/users/{first['user']['handle']}")
    assert reader_profile.status_code == 404  # readers have no public page

    upgraded = await client.patch(
        "/api/v1/users/upgrade-role",
        headers=first_headers,
        json={"handle": handle, "role_title": "Tech reporter", "topics": ["AI"]},
    )
    assert upgraded.status_code == 200
    assert upgraded.json()["role"] == "reporter"

    taken = await client.patch(
        "/api/v1/users/upgrade-role",
        headers=second_headers,
        json={"handle": handle, "role_title": "Tech reporter", "topics": ["AI"]},
    )
    assert taken.status_code == 409

    bad_handle = await client.patch(
        "/api/v1/users/upgrade-role",
        headers=second_headers,
        json={"handle": "bad handle!", "role_title": "Tech reporter", "topics": ["AI"]},
    )
    assert bad_handle.status_code == 422

    public = await client.get(f"/api/v1/users/{handle}")
    assert public.status_code == 200
    assert public.json()["email"] is None
