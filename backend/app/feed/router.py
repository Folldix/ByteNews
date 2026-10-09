"""Feed API router factory.

The core app, database session dependency, Article, and User models are owned
by other workstreams. They are injected here to keep this feature from
creating duplicate platform models or application configuration.
"""

from collections.abc import Callable
from datetime import datetime, timedelta, timezone
from typing import Any, Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import distinct, func, select
from sqlalchemy.orm import Session

from app.models.feed import ArticleTag, Category, FlashNews, Tag
from app.schemas.feed import (
    ArticleFeedItem,
    ArticleFeedPage,
    CatalogItem,
    CatalogPage,
    FlashNewsItem,
    FlashNewsPage,
)


def create_feed_router(
    *,
    get_db: Callable[..., Any],
    article_model: type[Any],
    user_model: type[Any],
) -> APIRouter:
    """Build routes using the app's shared session and existing domain models."""
    router = APIRouter(prefix="/api/v1", tags=["feed"])

    def article_statement(
        db: Session,
        *,
        category: str | None,
        tag: str | None,
        sort: Literal["latest", "popular"],
        query: str | None = None,
    ):
        article = article_model
        statement = (
            select(
                article,
                Category.name.label("category_name"),
                user_model.full_name.label("author_name"),
                user_model.role.label("author_role"),
                func.array_agg(Tag.name).filter(Tag.id.is_not(None)).label("tag_names"),
            )
            .outerjoin(Category, article.category_id == Category.id)
            .outerjoin(user_model, article.author_id == user_model.id)
            .outerjoin(ArticleTag, ArticleTag.article_id == article.id)
            .outerjoin(Tag, Tag.id == ArticleTag.tag_id)
            .where(article.published_at.is_not(None))
            .group_by(article.id, Category.name, user_model.full_name, user_model.role)
        )
        if category:
            statement = statement.where(Category.slug == category)
        if tag:
            statement = statement.where(
                article.id.in_(
                    select(ArticleTag.article_id)
                    .join(Tag, Tag.id == ArticleTag.tag_id)
                    .where(Tag.slug == tag)
                )
            )
        if query:
            # PostgreSQL FTS over both title and lead; plainto_tsquery treats
            # user input as plain text and avoids accepting raw tsquery syntax.
            document = func.to_tsvector(
                "simple", article.title + " " + func.coalesce(article.lead, "")
            )
            statement = statement.where(
                document.op("@@")(func.plainto_tsquery("simple", query))
            )
        if sort == "popular":
            statement = statement.where(
                article.published_at >= datetime.now(timezone.utc) - timedelta(hours=24)
            )
            statement = statement.order_by(article.views_count.desc(), article.published_at.desc())
        else:
            statement = statement.order_by(article.published_at.desc(), article.id)
        return statement

    def read_page(
        db: Session,
        *,
        category: str | None,
        tag: str | None,
        sort: Literal["latest", "popular"],
        limit: int,
        offset: int,
        query: str | None = None,
    ) -> ArticleFeedPage:
        statement = article_statement(db, category=category, tag=tag, sort=sort, query=query)
        rows = db.execute(statement.limit(limit).offset(offset)).all()
        count_statement = select(func.count(distinct(article_model.id))).select_from(article_model)
        count_statement = count_statement.outerjoin(
            Category, article_model.category_id == Category.id
        )
        if tag:
            count_statement = count_statement.where(
                article_model.id.in_(
                    select(ArticleTag.article_id)
                    .join(Tag, Tag.id == ArticleTag.tag_id)
                    .where(Tag.slug == tag)
                )
            )
        if category:
            count_statement = count_statement.where(Category.slug == category)
        if query:
            document = func.to_tsvector(
                "simple", article_model.title + " " + func.coalesce(article_model.lead, "")
            )
            count_statement = count_statement.where(
                document.op("@@")(func.plainto_tsquery("simple", query))
            )
        count_statement = count_statement.where(article_model.published_at.is_not(None))
        if sort == "popular":
            count_statement = count_statement.where(
                article_model.published_at >= datetime.now(timezone.utc) - timedelta(hours=24)
            )
        items = []
        for row in rows:
            author_role = row.author_role
            author_role = getattr(author_role, "value", author_role)
            items.append(ArticleFeedItem(
                id=row[0].id,
                title=row[0].title,
                slug=row[0].slug,
                lead=row[0].lead,
                cover_image_url=getattr(row[0], "cover_image_url", None),
                is_hero=row[0].is_hero,
                is_photo_reportage=getattr(row[0], "is_photo_reportage", False),
                read_time_min=row[0].read_time_min,
                views_count=row[0].views_count,
                likes_count=row[0].likes_count,
                comments_count=getattr(row[0], "comments_count", None),
                published_at=row[0].published_at,
                category=row.category_name,
                author=row.author_name,
                author_role=str(author_role) if author_role is not None else None,
                tags=row.tag_names or [],
            ))
        return ArticleFeedPage(
            items=items,
            total=db.scalar(count_statement) or 0,
            limit=limit,
            offset=offset,
        )

    @router.get("/articles", response_model=ArticleFeedPage)
    def list_articles(
        category: str | None = None,
        tag: str | None = None,
        sort: Literal["latest", "popular"] = "latest",
        limit: int = Query(default=20, ge=1, le=100),
        offset: int = Query(default=0, ge=0),
        db: Session = Depends(get_db),
    ) -> ArticleFeedPage:
        return read_page(db, category=category, tag=tag, sort=sort, limit=limit, offset=offset)

    @router.get("/articles/search", response_model=ArticleFeedPage)
    def search_articles(
        q: str = Query(min_length=1, max_length=200),
        category: str | None = None,
        tag: str | None = None,
        sort: Literal["latest", "popular"] = "latest",
        limit: int = Query(default=20, ge=1, le=100),
        offset: int = Query(default=0, ge=0),
        db: Session = Depends(get_db),
    ) -> ArticleFeedPage:
        query = q.strip()
        if not query:
            raise HTTPException(status_code=422, detail="Search query cannot be blank")
        return read_page(
            db,
            category=category,
            tag=tag,
            sort=sort,
            limit=limit,
            offset=offset,
            query=query,
        )

    @router.get("/flash-news", response_model=FlashNewsPage)
    def list_flash_news(
        limit: int = Query(default=30, ge=1, le=100),
        offset: int = Query(default=0, ge=0),
        db: Session = Depends(get_db),
    ) -> FlashNewsPage:
        statement = select(FlashNews).order_by(FlashNews.published_at.desc(), FlashNews.id)
        items = db.scalars(statement.limit(limit).offset(offset)).all()
        total = db.scalar(select(func.count()).select_from(FlashNews)) or 0
        return FlashNewsPage(
            items=[FlashNewsItem.model_validate(item) for item in items],
            total=total,
            limit=limit,
            offset=offset,
        )

    @router.get("/public/feed", response_model=ArticleFeedPage)
    def public_feed(
        limit: int = Query(default=20, ge=1, le=100),
        offset: int = Query(default=0, ge=0),
        db: Session = Depends(get_db),
    ) -> ArticleFeedPage:
        return read_page(db, category=None, tag=None, sort="latest", limit=limit, offset=offset)

    @router.get("/categories", response_model=CatalogPage)
    def list_categories(db: Session = Depends(get_db)) -> CatalogPage:
        rows = db.scalars(select(Category).order_by(Category.name)).all()
        return CatalogPage(items=[CatalogItem(id=row.id, name=row.name, slug=row.slug) for row in rows])

    @router.get("/tags", response_model=CatalogPage)
    def list_tags(db: Session = Depends(get_db)) -> CatalogPage:
        usage_count = func.count(ArticleTag.article_id).label("usage_count")
        rows = db.execute(
            select(Tag, usage_count)
            .outerjoin(ArticleTag, ArticleTag.tag_id == Tag.id)
            .group_by(Tag.id)
            .order_by(usage_count.desc(), Tag.name)
            .limit(24)
        ).all()
        return CatalogPage(
            items=[CatalogItem(id=row[0].id, name=row[0].name, slug=row[0].slug) for row in rows]
        )

    return router
