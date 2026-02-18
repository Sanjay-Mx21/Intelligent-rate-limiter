import redis
import os
from urllib.parse import urlparse
from app.config import get_settings
from app.services.algorithms import TokenBucketRateLimiter

settings = get_settings()

# Get Redis URL from environment
redis_url = os.environ.get("REDIS_URL")

if redis_url:
    # Railway deployment - parse the URL manually
    url = urlparse(redis_url)
    
    # Extract connection details
    redis_client = redis.Redis(
        host=url.hostname,
        port=url.port or 6379,
        password=url.password,
        decode_responses=False,
        socket_connect_timeout=5,
        socket_timeout=5
    )
else:
    # Local development
    redis_client = redis.Redis(
        host=settings.redis_host,
        port=settings.redis_port,
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