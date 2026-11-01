from __future__ import annotations

import re
import unicodedata
from datetime import datetime, timezone
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth.dependencies import get_current_user, require_reporter
from app.cms.schemas import (
    ArticleBlockInput,
    ArticleCreate,
    ArticleEditorPage,
    ArticleEditorRead,
    ArticleUpdate,
)
from app.db.session import get_db
from app.models.article import Article, ArticleBlock
from app.models.enums import ArticleStatus, BlockType, UserRole
from app.models.feed import ArticleTag, Category, Tag
from app.models.user import User

router = APIRouter(prefix="/api/v1", tags=["cms"])

_CYRILLIC = str.maketrans({
    "а": "a", "б": "b", "в": "v", "г": "h", "ґ": "g", "д": "d", "е": "e",
    "є": "ye", "ж": "zh", "з": "z", "и": "y", "і": "i", "ї": "yi", "й": "y",
    "к": "k", "л": "l", "м": "m", "н": "n", "о": "o", "п": "p", "р": "r",
    "с": "s", "т": "t", "у": "u", "ф": "f", "х": "kh", "ц": "ts", "ч": "ch",
    "ш": "sh", "щ": "shch", "ь": "", "ю": "yu", "я": "ya", "ы": "y", "э": "e",
    "ё": "yo", "ъ": "",
})


def _slugify(value: str) -> str:
    value = value.casefold().translate(_CYRILLIC)
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", value)).strip("-")


def _block_payload(block: ArticleBlockInput) -> dict[str, object]:
    return block.content_payload.model_dump(exclude_none=True)


def _reading_time(article: Article) -> int:
    text = [article.title, article.lead or ""]
    for block in article.blocks:
        payload = block.content_payload
        text.extend(str(value) for value in payload.values() if isinstance(value, str))
    words = sum(len(part.split()) for part in text)
    return max(1, (words + 199) // 200)


async def _article_for_editor(db: AsyncSession, article_id: UUID) -> Article:
    article = await db.scalar(
        select(Article)
        .where(Article.id == article_id)
        .options(
            selectinload(Article.blocks),
            selectinload(Article.tag_links).selectinload(ArticleTag.tag),
        )
    )
    if article is None:
        raise HTTPException(status_code=404, detail="Article not found")
    return article


def _editor_read(article: Article) -> ArticleEditorRead:
    return ArticleEditorRead(
        id=article.id,
        title=article.title,
        slug=article.slug,
        lead=article.lead,
        cover_image_url=article.cover_image_url,
        cover_caption=article.cover_caption,
        is_hero=article.is_hero,
        is_photo_reportage=article.is_photo_reportage,
        status=article.status,
        category_id=article.category_id,
        author_id=article.author_id,
        read_time_min=article.read_time_min,
        views_count=article.views_count,
        likes_count=article.likes_count,
        published_at=article.published_at,
        created_at=article.created_at,
        updated_at=article.updated_at,
        tags=[link.tag.name for link in article.tag_links],
        blocks=article.blocks,
    )


async def _choose_slug(db: AsyncSession, title: str, supplied: str | None = None) -> str:
    base = supplied or _slugify(title) or "article"
    candidate = base[:540]
    suffix = 2
    while await db.scalar(select(Article.id).where(Article.slug == candidate)) is not None:
        tail = f"-{suffix}"
        candidate = f"{base[:550 - len(tail)]}{tail}"
        suffix += 1
    return candidate


async def _category_exists(db: AsyncSession, category_id: UUID) -> None:
    if await db.get(Category, category_id) is None:
        raise HTTPException(status_code=422, detail="Unknown article category")


async def _replace_blocks(db: AsyncSession, article: Article, blocks: list[ArticleBlockInput]) -> None:
    article.blocks.clear()
    await db.flush()
    article.blocks.extend(
        ArticleBlock(
            block_type=block.block_type,
            order_index=index,
            content_payload=_block_payload(block),
        )
        for index, block in enumerate(blocks)
    )


async def _replace_tags(db: AsyncSession, article: Article, names: list[str]) -> None:
    existing = (await db.scalars(select(Tag))).all()
    by_name = {tag.name.casefold(): tag for tag in existing}
    by_slug = {tag.slug for tag in existing}
    selected: list[Tag] = []
    for name in names:
        tag = by_name.get(name.casefold())
        if tag is None:
            base = _slugify(name) or "topic"
            slug = base[:90]
            if slug in by_slug:
                slug = f"{base[:80]}-{uuid4().hex[:8]}"
            tag = Tag(name=name, slug=slug)
            db.add(tag)
            await db.flush()
            by_name[tag.name.casefold()] = tag
            by_slug.add(tag.slug)
        selected.append(tag)
    article.tag_links.clear()
    await db.flush()
    article.tag_links.extend(ArticleTag(tag=tag) for tag in selected)


def _can_manage(article: Article, user: User) -> None:
    if article.author_id != user.id and user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only the author or an administrator can manage this article")


@router.get("/articles/mine", response_model=ArticleEditorPage)
async def list_my_articles(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    user: User = Depends(require_reporter),
    db: AsyncSession = Depends(get_db),
) -> ArticleEditorPage:
    base = select(Article).where(Article.author_id == user.id)
    total = await db.scalar(select(func.count()).select_from(base.subquery())) or 0
    articles = (await db.scalars(
        base.options(
            selectinload(Article.blocks),
            selectinload(Article.tag_links).selectinload(ArticleTag.tag),
        )
        .order_by(Article.updated_at.desc(), Article.id)
        .limit(limit)
        .offset(offset)
    )).all()
    return ArticleEditorPage(
        items=[_editor_read(article) for article in articles], total=total, limit=limit, offset=offset
    )


@router.get("/articles/{article_id}/edit", response_model=ArticleEditorRead)
async def read_my_article(
    article_id: UUID,
    user: User = Depends(require_reporter),
    db: AsyncSession = Depends(get_db),
) -> ArticleEditorRead:
    article = await _article_for_editor(db, article_id)
    _can_manage(article, user)
    return _editor_read(article)


@router.post("/articles", response_model=ArticleEditorRead, status_code=status.HTTP_201_CREATED)
async def create_article(
    payload: ArticleCreate,
    user: User = Depends(require_reporter),
    db: AsyncSession = Depends(get_db),
) -> ArticleEditorRead:
    await _category_exists(db, payload.category_id)
    published_at = datetime.now(timezone.utc) if payload.status == ArticleStatus.PUBLISHED else None
    article = Article(
        title=payload.title,
        slug=await _choose_slug(db, payload.title, payload.slug),
        lead=payload.lead,
        cover_image_url=payload.cover_image_url,
        cover_caption=payload.cover_caption,
        is_hero=payload.is_hero,
        is_photo_reportage=payload.is_photo_reportage,
        status=payload.status,
        category_id=payload.category_id,
        author_id=user.id,
        published_at=published_at,
        blocks=[
            ArticleBlock(
                block_type=block.block_type,
                order_index=index,
                content_payload=_block_payload(block),
            )
            for index, block in enumerate(payload.blocks)
        ],
        tag_links=[],
    )
    db.add(article)
    await db.flush()
    await _replace_tags(db, article, payload.tags)
    article.read_time_min = _reading_time(article)
    try:
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Article slug or tag already exists") from exc
    return _editor_read(await _article_for_editor(db, article.id))


@router.put("/articles/{article_id}", response_model=ArticleEditorRead)
async def update_article(
    article_id: UUID,
    payload: ArticleUpdate,
    user: User = Depends(require_reporter),
    db: AsyncSession = Depends(get_db),
) -> ArticleEditorRead:
    article = await _article_for_editor(db, article_id)
    _can_manage(article, user)
    values = payload.model_dump(exclude_unset=True)
    if "category_id" in values and values["category_id"] is not None:
        await _category_exists(db, values["category_id"])
    if "slug" in values and values["slug"] is not None and values["slug"] != article.slug:
        values["slug"] = await _choose_slug(db, article.title, values["slug"])
    new_status = values.get("status", article.status)
    for field in (
        "title", "slug", "lead", "cover_image_url", "cover_caption",
        "is_hero", "is_photo_reportage", "category_id",
    ):
        if field in values and values[field] is not None:
            setattr(article, field, values[field])
        elif field in values and field in {"lead", "cover_image_url", "cover_caption"}:
            setattr(article, field, None)
    blocks = payload.blocks
    if "blocks" in values and blocks is not None:
        await _replace_blocks(db, article, blocks)
    if "tags" in values and values["tags"] is not None:
        await _replace_tags(db, article, values["tags"])
    article.status = new_status
    if new_status == ArticleStatus.PUBLISHED and article.published_at is None:
        article.published_at = datetime.now(timezone.utc)
    elif new_status == ArticleStatus.DRAFT:
        article.published_at = None
    article.read_time_min = _reading_time(article)
    try:
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Article slug or tag already exists") from exc
    return _editor_read(await _article_for_editor(db, article.id))


@router.delete("/articles/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_article(
    article_id: UUID,
    user: User = Depends(require_reporter),
    db: AsyncSession = Depends(get_db),
) -> Response:
    article = await _article_for_editor(db, article_id)
    _can_manage(article, user)
    await db.delete(article)
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
