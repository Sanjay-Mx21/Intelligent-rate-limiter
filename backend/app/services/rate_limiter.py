import redis
import os
from app.config import get_settings
from app.services.algorithms import TokenBucketRateLimiter

settings = get_settings()

# Use REDIS_URL if available (Railway), otherwise use host/port (local)
redis_url = os.environ.get("REDIS_URL")

if redis_url:
    # Railway deployment - use URL directly
    redis_client = redis.from_url(redis_url, decode_responses=False)
else:
    # Local development - use host/port
    redis_client = redis.Redis(
        host=settings.redis_host,
        port=settings.redis_port,
        password=settings.redis_password if settings.redis_password else None,
        decode_responses=False
    )

# Initialize rate limiter
rate_limiter = TokenBucketRateLimiter(
    redis_client=redis_client,
    max_tokens=settings.default_rate_limit,
    refill_rate=settings.default_rate_limit / settings.default_window_seconds
)


def check_rate_limit(user_id: str) -> tuple[bool, dict]:
    return rate_limiter.allow_request(user_id)