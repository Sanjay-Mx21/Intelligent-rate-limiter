from fastapi import APIRouter, Request
from app.services.rate_limiter import check_rate_limit
from app.services.anomaly_detector import AnomalyDetector
from app.services.rate_limiter import redis_client

router = APIRouter()

# Initialize anomaly detector
anomaly_detector = AnomalyDetector(redis_client)


@router.get("/api/test")
async def test_endpoint(request: Request):
    """Test endpoint to demonstrate rate limiting"""
    user_id = request.headers.get("X-API-Key") or request.client.host
    return {
        "message": "Request successful!",
        "user_id": user_id
    }


@router.get("/api/info")
async def rate_limit_info():
    """Get current rate limit configuration"""
    return {
        "max_requests": 100,
        "window_seconds": 60,
        "algorithm": "Token Bucket"
    }


@router.get("/api/anomaly/{user_id}")
async def check_anomaly(user_id: str):
    """
    Check if a user's traffic pattern is suspicious
    """
    result = anomaly_detector.analyze(user_id)
    return result


@router.get("/api/anomaly-status")
async def get_all_anomalies():
    """
    Get anomaly status for common test users
    """
    test_users = ["demo_user", "monitor_user", "test_user_123"]
    results = {}

    for user in test_users:
        results[user] = anomaly_detector.analyze(user)

    return results