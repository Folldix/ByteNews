from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field, field_validator

from app.models.enums import ReactionKind
from app.schemas.feed import ArticleFeedItem


class ArticleBlockItem(BaseModel):
    id: UUID
    block_type: str
    order_index: int
    content_payload: dict[str, Any]


class ArticleRead(BaseModel):
    id: UUID
    title: str
    slug: str
    lead: str | None
    cover_image_url: str | None
    cover_caption: str | None
    read_time_min: int
    views_count: int
    likes_count: int
    comments_count: int
    is_hero: bool
    is_photo_reportage: bool
    published_at: datetime
    category: str
    author: str
    author_role: str | None
    blocks: list[ArticleBlockItem]
    tags: list[str]
    reaction_counts: dict[ReactionKind, int]
    my_reaction: ReactionKind | None = None
    is_bookmarked: bool = False


class CommentCreate(BaseModel):
    text: str = Field(min_length=1, max_length=5000)
    parent_id: UUID | None = None

    @field_validator("text")
    @classmethod
    def strip_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Comment cannot be empty")
        return value


class CommentNode(BaseModel):
    id: UUID
    article_id: UUID
    parent_id: UUID | None
    text: str
    author_id: UUID
    author_name: str
    author_avatar_url: str | None = None
    created_at: datetime
    replies: list["CommentNode"] = Field(default_factory=list)


CommentNode.model_rebuild()


class CommentPage(BaseModel):
    items: list[CommentNode]
    total: int


class ReactionUpdate(BaseModel):
    kind: ReactionKind | None


class ReactionState(BaseModel):
    counts: dict[ReactionKind, int]
    selected: ReactionKind | None = None


class BookmarkCreateResult(BaseModel):
    bookmarked: bool


class BookmarkedArticle(BaseModel):
    article: ArticleFeedItem
    bookmarked_at: datetime


class BookmarkPage(BaseModel):
    items: list[BookmarkedArticle]
    total: int


class PollOptionResult(BaseModel):
    id: UUID
    option_text: str
    votes_count: int
    percentage: int


class PollResult(BaseModel):
    id: UUID
    question: str
    closes_at: datetime | None
    total_votes: int
    selected_option_id: UUID | None = None
    options: list[PollOptionResult]


class PollVoteCreate(BaseModel):
    option_id: UUID
