from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql://user:password@localhost:5432/ratelimiter"
    
    # Redis
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_password: str = ""
    
    # API
    api_title: str = "Intelligent Rate Limiter"
    api_version: str = "1.0.0"
    debug: bool = True
    
    # Rate Limiting
    default_rate_limit: int = 100
    default_window_seconds: int = 60
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings():
    return Settings()