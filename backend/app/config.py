from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg://bytenews:bytenews@localhost:5432/bytenews"
    cors_origins: list[str] = ["http://localhost:3000"]
    rss_interval_minutes: int = 10
    jwt_secret_key: str = "local-development-secret-change-before-deploying-32bytes-minimum"
    access_token_minutes: int = 15
    refresh_token_days: int = 30

    @field_validator("jwt_secret_key")
    @classmethod
    def validate_jwt_secret(cls, value: str) -> str:
        if len(value.encode("utf-8")) < 32:
            raise ValueError("JWT_SECRET_KEY must contain at least 32 bytes")
        return value

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
