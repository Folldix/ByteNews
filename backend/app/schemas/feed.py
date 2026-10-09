from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ArticleFeedItem(BaseModel):
    id: UUID
    title: str
    slug: str
    lead: str | None = None
    is_hero: bool = False
    read_time_min: int = 1
    views_count: int = 0
    likes_count: int = 0
    published_at: datetime | None = None
    category: str | None = None
    author: str | None = None
    tags: list[str] = Field(default_factory=list)


class ArticleFeedPage(BaseModel):
    items: list[ArticleFeedItem]
    total: int
    limit: int
    offset: int


class FlashNewsItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    summary: str | None = None
    source_name: str
    url: str
    published_at: datetime


class FlashNewsPage(BaseModel):
    items: list[FlashNewsItem]
    total: int
    limit: int
    offset: int


class CatalogItem(BaseModel):
    id: UUID
    name: str
    slug: str


class CatalogPage(BaseModel):
    items: list[CatalogItem]
