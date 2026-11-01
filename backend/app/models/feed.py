"""Category, tag, RSS ingestion, and breaking-news persistence models.

The shared declarative Base and Article model are owned by the platform/CMS
workstreams. This module imports that Base and references the existing
``articles`` table by foreign key; it does not define a second Article model.
"""

from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, String, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Category(Base):
    """A news category shared by authored articles and RSS sources."""

    __tablename__ = "categories"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)

    articles: Mapped[list["Article"]] = relationship(back_populates="category")
    rss_sources: Mapped[list["RSSSource"]] = relationship(back_populates="category")


class Tag(Base):
    """A topic label used for feed filtering and discovery."""

    __tablename__ = "tags"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)

    article_links: Mapped[list["ArticleTag"]] = relationship(
        back_populates="tag", cascade="all, delete-orphan", passive_deletes=True
    )
    articles: Mapped[list["Article"]] = relationship(secondary="article_tags", viewonly=True)


class ArticleTag(Base):
    """Many-to-many association from the CMS Article model to topic tags."""

    __tablename__ = "article_tags"
    __table_args__ = (Index("ix_article_tags_tag_article", "tag_id", "article_id"),)

    article_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("articles.id", ondelete="CASCADE"), primary_key=True
    )
    tag_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    article: Mapped["Article"] = relationship(back_populates="tag_links")
    tag: Mapped[Tag] = relationship(back_populates="article_links")


class RSSSource(Base):
    """A configurable RSS feed owned by the discovery/aggregation feature."""

    __tablename__ = "rss_sources"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    feed_url: Mapped[str] = mapped_column(String(500), unique=True, nullable=False)
    category_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default="true")
    last_fetched_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    category: Mapped["Category"] = relationship(back_populates="rss_sources")
    flash_news: Mapped[list["FlashNews"]] = relationship(back_populates="source")


class FlashNews(Base):
    """A short item displayed in the breaking-news timeline."""

    __tablename__ = "flash_news"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    source_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("rss_sources.id", ondelete="SET NULL"), index=True
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    summary: Mapped[str | None] = mapped_column(Text)
    source_name: Mapped[str] = mapped_column(String(150), nullable=False)
    url: Mapped[str] = mapped_column(String(2000), unique=True, nullable=False)
    published_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    source: Mapped["RSSSource | None"] = relationship(back_populates="flash_news")
