from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class Credentials(BaseModel):
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=8, max_length=72)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        value = value.strip().lower()
        if value.count("@") != 1 or "." not in value.rsplit("@", 1)[-1]:
            raise ValueError("Enter a valid email address")
        return value

    @field_validator("password")
    @classmethod
    def bcrypt_byte_limit(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Password must be at most 72 UTF-8 bytes")
        return value


class RegisterRequest(Credentials):
    full_name: str = Field(min_length=2, max_length=150)

    @field_validator("full_name")
    @classmethod
    def normalize_name(cls, value: str) -> str:
        value = " ".join(value.split())
        if len(value) < 2:
            raise ValueError("Name must contain at least two characters")
        return value


class RefreshRequest(BaseModel):
    refresh_token: str = Field(min_length=20, max_length=4096)


class UpgradeRoleRequest(BaseModel):
    handle: str = Field(min_length=3, max_length=80, pattern=r"^[a-zA-Z0-9_]+$")
    role_title: str = Field(min_length=2, max_length=150)
    topics: list[str] = Field(min_length=1, max_length=12)

    @field_validator("role_title")
    @classmethod
    def normalize_title(cls, value: str) -> str:
        value = " ".join(value.split())
        if len(value) < 2:
            raise ValueError("Role title must contain at least two characters")
        return value

    @field_validator("topics")
    @classmethod
    def normalize_topics(cls, values: list[str]) -> list[str]:
        topics = list(dict.fromkeys(" ".join(item.split()).strip() for item in values if item.strip()))
        if not topics or any(len(topic) > 60 for topic in topics):
            raise ValueError("Choose between 1 and 12 topics, each at most 60 characters")
        return topics


class UserArticle(BaseModel):
    id: UUID
    title: str
    slug: str
    summary: str
    cover_image_url: str | None = None
    category_name: str
    read_time_min: int
    views_count: int
    comments_count: int
    published_at: datetime | None
    status: Literal["draft", "published"]


class UserProfile(BaseModel):
    id: UUID
    email: str | None = None
    full_name: str
    handle: str
    role: str
    role_title: str | None = None
    reporter_topics: list[str] = Field(default_factory=list)
    bio: str | None = None
    avatar_initials: str
    avatar_url: str | None = None
    location: str | None = None
    joined_date: str
    articles_count: int
    total_views: int
    bookmarks_count: int
    articles: list[UserArticle] = Field(default_factory=list)


class TokenPair(BaseModel):
    user: UserProfile
    access_token: str
    refresh_token: str
    token_type: Literal["bearer"] = "bearer"


class PublicUserProfile(UserProfile):
    email: None = None


class Message(BaseModel):
    message: str
