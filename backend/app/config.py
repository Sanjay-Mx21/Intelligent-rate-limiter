from pydantic_settings import BaseSettings
from functools import lru_cache
import os


class Settings(BaseSettings):
    # Database - Railway provides DATABASE_URL automatically
    database_url: str = os.environ.get(
        "DATABASE_URL",
        "postgresql://postgres:password@localhost:5432/ratelimiter"
    )

    # Redis
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_password: str = ""

    # API
    api_title: str = "Intelligent Rate Limiter"
    api_version: str = "1.0.0"
    debug: bool = False

    # Rate Limiting
    default_rate_limit: int = 20
    default_window_seconds: int = 60

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings():
    return Settings()