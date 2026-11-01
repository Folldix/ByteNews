from __future__ import annotations

import re
from datetime import datetime
from typing import Annotated, Literal, Union
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.models.enums import ArticleStatus, BlockType


class TextPayload(BaseModel):
    text: str = Field(min_length=1, max_length=200_000)


class HeadingPayload(BaseModel):
    text: str = Field(min_length=1, max_length=2_000)
    level: Literal[2, 3] = 2


class ImagePayload(BaseModel):
    url: str = Field(min_length=1, max_length=2048)
    alt: str = Field(default="", max_length=500)
    caption: str | None = Field(default=None, max_length=500)
    credit: str | None = Field(default=None, max_length=255)

    @field_validator("url")
    @classmethod
    def safe_image_url(cls, value: str) -> str:
        value = value.strip()
        if value.startswith("/") and not value.startswith("//"):
            return value
        if not re.fullmatch(r"https?://[^\s]+", value, flags=re.IGNORECASE):
            raise ValueError("Image URL must use HTTP(S) or a local absolute path")
        return value


class CodePayload(BaseModel):
    code: str = Field(min_length=1, max_length=200_000)
    language: str = Field(default="text", min_length=1, max_length=50)


class QuotePayload(BaseModel):
    text: str = Field(min_length=1, max_length=20_000)
    author: str | None = Field(default=None, max_length=255)
    source: str | None = Field(default=None, max_length=500)


class CalloutPayload(BaseModel):
    text: str = Field(min_length=1, max_length=20_000)


class TextBlock(BaseModel):
    block_type: Literal[BlockType.TEXT]
    content_payload: TextPayload


class HeadingBlock(BaseModel):
    block_type: Literal[BlockType.HEADING]
    content_payload: HeadingPayload


class ImageBlock(BaseModel):
    block_type: Literal[BlockType.IMAGE]
    content_payload: ImagePayload


class CodeBlock(BaseModel):
    block_type: Literal[BlockType.CODE]
    content_payload: CodePayload


class QuoteBlock(BaseModel):
    block_type: Literal[BlockType.QUOTE]
    content_payload: QuotePayload


class CalloutBlock(BaseModel):
    block_type: Literal[BlockType.CALLOUT]
    content_payload: CalloutPayload


ArticleBlockInput = Annotated[
    Union[TextBlock, HeadingBlock, ImageBlock, CodeBlock, QuoteBlock, CalloutBlock],
    Field(discriminator="block_type"),
]


def _normalize_tags(values: list[str]) -> list[str]:
    tags: list[str] = []
    seen: set[str] = set()
    for raw in values:
        name = " ".join(raw.split())
        if not name:
            continue
        folded = name.casefold()
        if folded not in seen:
            tags.append(name)
            seen.add(folded)
    if len(tags) > 30 or any(len(name) > 100 for name in tags):
        raise ValueError("Use up to 30 tags, each no longer than 100 characters")
    return tags


class ArticleCreate(BaseModel):
    title: str = Field(min_length=3, max_length=500)
    slug: str | None = Field(default=None, min_length=1, max_length=550, pattern=r"^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$")
    lead: str | None = Field(default=None, max_length=20_000)
    cover_image_url: str | None = Field(default=None, max_length=2048)
    cover_caption: str | None = Field(default=None, max_length=500)
    is_hero: bool = False
    is_photo_reportage: bool = False
    category_id: UUID
    status: ArticleStatus = ArticleStatus.DRAFT
    tags: list[str] = Field(default_factory=list, max_length=30)
    blocks: list[ArticleBlockInput] = Field(default_factory=list, max_length=200)

    @field_validator("title", "lead", "cover_caption")
    @classmethod
    def trim_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None

    @field_validator("tags")
    @classmethod
    def normalize_tags(cls, values: list[str]) -> list[str]:
        return _normalize_tags(values)

    @field_validator("slug")
    @classmethod
    def normalize_slug(cls, value: str | None) -> str | None:
        return value.lower() if value is not None else None

    @field_validator("cover_image_url")
    @classmethod
    def validate_cover_url(cls, value: str | None) -> str | None:
        return ImagePayload.safe_image_url(value) if value else value


class ArticleUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=500)
    slug: str | None = Field(default=None, min_length=1, max_length=550, pattern=r"^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$")
    lead: str | None = Field(default=None, max_length=20_000)
    cover_image_url: str | None = Field(default=None, max_length=2048)
    cover_caption: str | None = Field(default=None, max_length=500)
    is_hero: bool | None = None
    is_photo_reportage: bool | None = None
    category_id: UUID | None = None
    status: ArticleStatus | None = None
    tags: list[str] | None = Field(default=None, max_length=30)
    blocks: list[ArticleBlockInput] | None = Field(default=None, max_length=200)

    @field_validator("title", "lead", "cover_caption")
    @classmethod
    def trim_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None

    @field_validator("tags")
    @classmethod
    def normalize_tags(cls, values: list[str] | None) -> list[str] | None:
        return None if values is None else _normalize_tags(values)

    @field_validator("slug")
    @classmethod
    def normalize_slug(cls, value: str | None) -> str | None:
        return value.lower() if value is not None else None

    @field_validator("cover_image_url")
    @classmethod
    def validate_cover_url(cls, value: str | None) -> str | None:
        return ImagePayload.safe_image_url(value) if value else value

    @model_validator(mode="after")
    def reject_null_for_non_nullable_fields(self) -> ArticleUpdate:
        nullable = {"lead", "cover_image_url", "cover_caption"}
        for field in self.model_fields_set - nullable:
            if getattr(self, field) is None:
                raise ValueError(f"{field} cannot be null")
        return self


class ArticleBlockRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    block_type: BlockType
    order_index: int
    content_payload: dict[str, object]


class ArticleEditorRead(BaseModel):
    id: UUID
    title: str
    slug: str
    lead: str | None
    cover_image_url: str | None
    cover_caption: str | None
    is_hero: bool
    is_photo_reportage: bool
    status: ArticleStatus
    category_id: UUID
    author_id: UUID
    read_time_min: int
    views_count: int
    likes_count: int
    published_at: datetime | None
    created_at: datetime
    updated_at: datetime
    tags: list[str]
    blocks: list[ArticleBlockRead]


class ArticleEditorPage(BaseModel):
    items: list[ArticleEditorRead]
    total: int
    limit: int
    offset: int


class MediaUploadResult(BaseModel):
    url: str
    filename: str
    content_type: str
    size: int
