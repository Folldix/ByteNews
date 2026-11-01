from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID, uuid4

from sqlalchemy import (
    CheckConstraint,
    Computed,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    Uuid,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, TSVECTOR
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import ArticleStatus, BlockType
from app.models.user import enum_values


class Article(Base):
    __tablename__ = "articles"
    __table_args__ = (
        CheckConstraint("read_time_min > 0", name="positive_read_time"),
        CheckConstraint("views_count >= 0", name="nonnegative_views"),
        CheckConstraint("likes_count >= 0", name="nonnegative_likes"),
        CheckConstraint(
            "(status = 'draft' AND published_at IS NULL) OR "
            "(status = 'published' AND published_at IS NOT NULL)",
            name="status_publication_time",
        ),
        Index("ix_articles_search_vector", "search_vector", postgresql_using="gin"),
        Index("ix_articles_published_at", "published_at"),
        Index("ix_articles_category_published", "category_id", "published_at"),
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    slug: Mapped[str] = mapped_column(String(550), unique=True, nullable=False)
    lead: Mapped[str | None] = mapped_column(Text)
    cover_image_url: Mapped[str | None] = mapped_column(String(2048))
    cover_caption: Mapped[str | None] = mapped_column(String(500))
    is_hero: Mapped[bool] = mapped_column(default=False, nullable=False, server_default="false")
    is_photo_reportage: Mapped[bool] = mapped_column(default=False, nullable=False, server_default="false")
    status: Mapped[ArticleStatus] = mapped_column(
        Enum(
            ArticleStatus,
            name="article_status",
            native_enum=False,
            create_constraint=True,
            values_callable=enum_values,
            length=20,
        ),
        nullable=False,
        default=ArticleStatus.DRAFT,
        server_default=ArticleStatus.DRAFT.value,
        index=True,
    )
    category_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False
    )
    author_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    read_time_min: Mapped[int] = mapped_column(Integer, nullable=False, default=1, server_default="1")
    views_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    likes_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )
    search_vector: Mapped[Any] = mapped_column(
        TSVECTOR,
        Computed(
            "setweight(to_tsvector('simple'::regconfig, coalesce(title, '')), 'A') || "
            "setweight(to_tsvector('simple'::regconfig, coalesce(lead, '')), 'B')",
            persisted=True,
        ),
        nullable=False,
    )

    author: Mapped["User"] = relationship(back_populates="articles")
    category: Mapped["Category"] = relationship(back_populates="articles")
    blocks: Mapped[list["ArticleBlock"]] = relationship(
        back_populates="article", cascade="all, delete-orphan", passive_deletes=True,
        order_by="ArticleBlock.order_index",
    )
    tag_links: Mapped[list["ArticleTag"]] = relationship(
        back_populates="article", cascade="all, delete-orphan", passive_deletes=True
    )
    tags: Mapped[list["Tag"]] = relationship(secondary="article_tags", viewonly=True)
    comments: Mapped[list["Comment"]] = relationship(
        back_populates="article", cascade="all, delete-orphan", passive_deletes=True
    )
    bookmarks: Mapped[list["Bookmark"]] = relationship(
        back_populates="article", cascade="all, delete-orphan", passive_deletes=True
    )
    reactions: Mapped[list["Reaction"]] = relationship(
        back_populates="article", cascade="all, delete-orphan", passive_deletes=True
    )


class ArticleBlock(Base):
    __tablename__ = "article_blocks"
    __table_args__ = (
        Index("uq_article_blocks_article_order", "article_id", "order_index", unique=True),
        CheckConstraint("order_index >= 0", name="nonnegative_order_index"),
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    article_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("articles.id", ondelete="CASCADE"), nullable=False
    )
    block_type: Mapped[BlockType] = mapped_column(
        Enum(
            BlockType,
            name="article_block_type",
            native_enum=False,
            create_constraint=True,
            values_callable=enum_values,
            length=20,
        ),
        nullable=False,
    )
    order_index: Mapped[int] = mapped_column(Integer, nullable=False)
    content_payload: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )

    article: Mapped["Article"] = relationship(back_populates="blocks")
