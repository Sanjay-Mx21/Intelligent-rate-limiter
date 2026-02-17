import redis
from app.config import get_settings
from app.services.algorithms import TokenBucketRateLimiter

settings = get_settings()

# Initialize Redis connection
redis_client = redis.Redis(
    host=settings.redis_host,
    port=settings.redis_port,
    password=settings.redis_password if settings.redis_password else None,
    decode_responses=False  # We'll handle decoding manually
)

# Initialize rate limiter with Token Bucket algorithm
# 100 requests per 60 seconds = 100/60 = 1.67 tokens per second
rate_limiter = TokenBucketRateLimiter(
    redis_client=redis_client,
    max_tokens=settings.default_rate_limit,
    refill_rate=settings.default_rate_limit / settings.default_window_seconds
)


def check_rate_limit(user_id: str) -> tuple[bool, dict]:
    """
    Check if a user's request should be allowed
    
    Args:
        user_id: Unique identifier for the user (API key, IP, etc.)
    
    Returns:
        (allowed: bool, info: dict)
    """
    return rate_limiter.allow_request(user_id)