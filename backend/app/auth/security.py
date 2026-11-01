from __future__ import annotations

import hashlib
import hmac
from datetime import datetime, timedelta, timezone
from uuid import UUID, uuid4

import bcrypt
import jwt
from fastapi import HTTPException, status
from jwt import InvalidTokenError
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.user import RefreshToken, User

JWT_ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("ascii")


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), stored_hash.encode("ascii"))
    except (ValueError, TypeError):
        return False


def _token_hash(token: str) -> str:
    return hashlib.sha256(token.encode("ascii")).hexdigest()


def verify_token_hash(token: str, stored_hash: str) -> bool:
    return hmac.compare_digest(_token_hash(token), stored_hash)


def _encode_token(*, subject: UUID, token_type: str, expires_at: datetime, jti: UUID, family_id: UUID | None = None) -> str:
    claims = {
        "sub": str(subject),
        "typ": token_type,
        "jti": str(jti),
        "iat": datetime.now(timezone.utc),
        "exp": expires_at,
    }
    if family_id is not None:
        claims["family_id"] = str(family_id)
    return jwt.encode(claims, settings.jwt_secret_key, algorithm=JWT_ALGORITHM)


def decode_token(token: str, expected_type: str) -> dict[str, object]:
    try:
        claims = jwt.decode(token, settings.jwt_secret_key, algorithms=[JWT_ALGORITHM])
        if claims.get("typ") != expected_type:
            raise InvalidTokenError("Incorrect token type")
        UUID(str(claims["sub"]))
        UUID(str(claims["jti"]))
        if expected_type == "refresh":
            UUID(str(claims["family_id"]))
        return claims
    except (InvalidTokenError, KeyError, ValueError, TypeError) as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token") from exc


def issue_token_pair(db: AsyncSession, user: User, family_id: UUID | None = None) -> dict[str, str]:
    now = datetime.now(timezone.utc)
    access_expiry = now + timedelta(minutes=settings.access_token_minutes)
    refresh_expiry = now + timedelta(days=settings.refresh_token_days)
    refresh_id = uuid4()
    family_id = family_id or uuid4()
    access_token = _encode_token(
        subject=user.id, token_type="access", expires_at=access_expiry, jti=uuid4()
    )
    refresh_token = _encode_token(
        subject=user.id,
        token_type="refresh",
        expires_at=refresh_expiry,
        jti=refresh_id,
        family_id=family_id,
    )
    db.add(
        RefreshToken(
            id=refresh_id,
            user_id=user.id,
            token_hash=_token_hash(refresh_token),
            family_id=family_id,
            expires_at=refresh_expiry,
        )
    )
    return {"access_token": access_token, "refresh_token": refresh_token}
