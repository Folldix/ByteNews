from __future__ import annotations

import re
import secrets
from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from starlette.concurrency import run_in_threadpool
from sqlalchemy import func, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.auth.schemas import (
    Credentials,
    Message,
    PublicUserProfile,
    RefreshRequest,
    RegisterRequest,
    TokenPair,
    UpgradeRoleRequest,
    UserArticle,
    UserProfile,
)
from app.auth.security import (
    decode_token,
    hash_password,
    issue_token_pair,
    verify_password,
    verify_token_hash,
)
from app.db.session import get_db
from app.models.article import Article
from app.models.community import Bookmark, Comment
from app.models.enums import ArticleStatus, UserRole
from app.models.feed import Category
from app.models.user import RefreshToken, User

router = APIRouter(prefix="/api/v1", tags=["identity"])


def _handle_base(email: str) -> str:
    value = re.sub(r"[^a-zA-Z0-9_]+", "_", email.split("@", 1)[0]).strip("_").lower()
    return (value or "reader")[:70]


async def _unique_handle(db: AsyncSession, email: str) -> str:
    base = _handle_base(email)
    for _ in range(5):
        candidate = f"{base}_{secrets.token_hex(3)}"
        if await db.scalar(select(User.id).where(User.handle == candidate)) is None:
            return candidate
    raise HTTPException(status_code=503, detail="Could not allocate a user handle")


async def _profile(db: AsyncSession, user: User, *, public: bool = False) -> UserProfile:
    visibility = Article.status == ArticleStatus.PUBLISHED if public else True
    article_rows = (await db.execute(
        select(
            Article,
            Category.name.label("category_name"),
            select(func.count(Comment.id))
            .where(Comment.article_id == Article.id)
            .correlate(Article)
            .scalar_subquery()
            .label("comments_count"),
        )
        .join(Category, Category.id == Article.category_id)
        .where(Article.author_id == user.id, visibility)
        .order_by(Article.published_at.desc().nullslast(), Article.created_at.desc())
        .limit(50)
    )).all()
    article_count = await db.scalar(
        select(func.count(Article.id)).where(
            Article.author_id == user.id, Article.status == ArticleStatus.PUBLISHED
        )
    ) or 0
    total_views = await db.scalar(
        select(func.coalesce(func.sum(Article.views_count), 0)).where(
            Article.author_id == user.id, Article.status == ArticleStatus.PUBLISHED
        )
    ) or 0
    bookmarks_count = await db.scalar(
        select(func.count(Bookmark.article_id)).where(Bookmark.user_id == user.id)
    ) or 0
    articles = [
        UserArticle(
            id=row[0].id,
            title=row[0].title,
            slug=row[0].slug,
            summary=row[0].lead or "",
            cover_image_url=row[0].cover_image_url,
            category_name=row.category_name,
            read_time_min=row[0].read_time_min,
            views_count=row[0].views_count,
            comments_count=row.comments_count,
            published_at=row[0].published_at,
            status=row[0].status.value,
        )
        for row in article_rows
    ]
    return UserProfile(
        id=user.id,
        email=None if public else user.email,
        full_name=user.full_name,
        handle=user.handle,
        role=user.role.value,
        role_title=user.role_title,
        reporter_topics=user.reporter_topics or [],
        bio=user.bio,
        avatar_initials="".join(part[0] for part in user.full_name.split()[:2]).upper(),
        avatar_url=user.avatar_url,
        location=user.location,
        joined_date=(user.created_at or datetime.now(timezone.utc)).strftime("%B %Y"),
        articles_count=article_count,
        total_views=int(total_views),
        bookmarks_count=0 if public else bookmarks_count,
        articles=articles,
    )


async def _token_response(db: AsyncSession, user: User, family_id: UUID | None = None) -> TokenPair:
    tokens = issue_token_pair(db, user, family_id)
    return TokenPair(user=await _profile(db, user), **tokens)


@router.post("/auth/register", response_model=TokenPair, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_db)) -> TokenPair:
    if await db.scalar(select(User.id).where(User.email == payload.email)) is not None:
        raise HTTPException(status_code=409, detail="An account with this email already exists")
    user = User(
        email=payload.email,
        password_hash=await run_in_threadpool(hash_password, payload.password),
        full_name=payload.full_name,
        handle=await _unique_handle(db, payload.email),
        role=UserRole.READER,
        role_title="Читач спільноти",
        bio="Тут я скоро розкажу про себе...",
    )
    db.add(user)
    try:
        await db.flush()
        response = await _token_response(db, user)
        await db.commit()
        return response
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(status_code=409, detail="An account with this email already exists") from exc


@router.post("/auth/login", response_model=TokenPair)
async def login(payload: Credentials, db: AsyncSession = Depends(get_db)) -> TokenPair:
    user = await db.scalar(select(User).where(User.email == payload.email))
    if user is None or not await run_in_threadpool(verify_password, payload.password, user.password_hash if user else ""):
        raise HTTPException(status_code=401, detail="Email or password is incorrect")
    response = await _token_response(db, user)
    await db.commit()
    return response


@router.post("/auth/refresh", response_model=TokenPair)
async def refresh(payload: RefreshRequest, db: AsyncSession = Depends(get_db)) -> TokenPair:
    claims = decode_token(payload.refresh_token, "refresh")
    token_id = UUID(str(claims["jti"]))
    family_id = UUID(str(claims["family_id"]))
    stored = await db.scalar(select(RefreshToken).where(RefreshToken.id == token_id).with_for_update())
    if stored is None or not verify_token_hash(payload.refresh_token, stored.token_hash):
        raise HTTPException(status_code=401, detail="Refresh session is invalid")
    if stored.revoked_at is not None:
        await db.execute(
            update(RefreshToken)
            .where(RefreshToken.family_id == stored.family_id, RefreshToken.revoked_at.is_(None))
            .values(revoked_at=datetime.now(timezone.utc))
        )
        await db.commit()
        raise HTTPException(status_code=401, detail="Refresh token reuse detected; session revoked")
    now = datetime.now(timezone.utc)
    expires_at = stored.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at <= now or stored.family_id != family_id:
        raise HTTPException(status_code=401, detail="Refresh session has expired")
    user = await db.get(User, stored.user_id)
    if user is None:
        raise HTTPException(status_code=401, detail="User no longer exists")
    tokens = issue_token_pair(db, user, stored.family_id)
    # The replacement row is pending; flush to make its id available for linkage.
    await db.flush()
    replacement_claims = decode_token(tokens["refresh_token"], "refresh")
    stored.revoked_at = now
    stored.replaced_by_id = UUID(str(replacement_claims["jti"]))
    await db.commit()
    return TokenPair(user=await _profile(db, user), **tokens)


@router.post("/auth/logout", response_model=Message)
async def logout(payload: RefreshRequest, db: AsyncSession = Depends(get_db)) -> Message:
    try:
        claims = decode_token(payload.refresh_token, "refresh")
    except HTTPException:
        return Message(message="Signed out")
    stored = await db.scalar(
        select(RefreshToken).where(RefreshToken.id == UUID(str(claims["jti"])))
    )
    if stored is not None and verify_token_hash(payload.refresh_token, stored.token_hash):
        if stored.revoked_at is None:
            stored.revoked_at = datetime.now(timezone.utc)
            await db.commit()
    return Message(message="Signed out")


@router.get("/users/me", response_model=UserProfile)
async def read_me(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)) -> UserProfile:
    return await _profile(db, user)


@router.get("/users/{handle}", response_model=PublicUserProfile)
async def read_public_profile(handle: str, db: AsyncSession = Depends(get_db)) -> PublicUserProfile:
    user = await db.scalar(select(User).where(User.handle == handle, User.role == UserRole.REPORTER))
    if user is None:
        raise HTTPException(status_code=404, detail="Reporter profile not found")
    return PublicUserProfile(**(await _profile(db, user, public=True)).model_dump())


@router.patch("/users/upgrade-role", response_model=UserProfile)
async def upgrade_role(
    payload: UpgradeRoleRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserProfile:
    handle = payload.handle.lower()
    conflict = await db.scalar(select(User.id).where(User.handle == handle, User.id != user.id))
    if conflict is not None:
        raise HTTPException(status_code=409, detail="This handle is already taken")
    user.handle = handle
    user.role_title = payload.role_title
    user.reporter_topics = payload.topics
    user.role = UserRole.REPORTER
    try:
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(status_code=409, detail="This handle is already taken") from exc
    await db.refresh(user)
    return await _profile(db, user)
