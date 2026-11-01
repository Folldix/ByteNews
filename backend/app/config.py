from functools import lru_cache
from pathlib import Path

from pydantic import field_validator
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg://bytenews:bytenews@localhost:5432/bytenews"
    cors_origins: list[str] = ["http://localhost:3000"]
    rss_interval_minutes: int = 10
    jwt_secret_key: str = "local-development-secret-change-before-deploying-32bytes-minimum"
    access_token_minutes: int = 15
    refresh_token_days: int = 30
    media_storage_path: str = "uploads"
    media_max_bytes: int = 8 * 1024 * 1024
    media_public_base_url: str | None = None

    @field_validator("jwt_secret_key")
    @classmethod
    def validate_jwt_secret(cls, value: str) -> str:
        if len(value.encode("utf-8")) < 32:
            raise ValueError("JWT_SECRET_KEY must contain at least 32 bytes")
        return value

    @field_validator("media_max_bytes")
    @classmethod
    def validate_media_max_bytes(cls, value: int) -> int:
        if value < 1 or value > 100 * 1024 * 1024:
            raise ValueError("MEDIA_MAX_BYTES must be between 1 byte and 100 MiB")
        return value

    @field_validator("media_storage_path")
    @classmethod
    def normalize_media_storage_path(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("MEDIA_STORAGE_PATH cannot be empty")
        return str(Path(value).expanduser())
    # JSON array: [{"name":"Example Tech","feed_url":"https://example.com/feed.xml","category_slug":"development"}]
    rss_sources: list[dict[str, str]] = Field(default_factory=list)

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
