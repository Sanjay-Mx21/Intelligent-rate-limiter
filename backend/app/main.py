from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import time
from app.config import get_settings
from app.services.rate_limiter import check_rate_limit, redis_client
from app.services.anomaly_detector import AnomalyDetector
from app.api.routes import router

settings = get_settings()

app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    description="Production-grade rate limiting system"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize anomaly detector
anomaly_detector = AnomalyDetector(redis_client)

# Include routes
app.include_router(router)


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    """Rate limiting middleware"""

    # Skip rate limiting for these paths
    skip_paths = ["/", "/health", "/docs", "/openapi.json"]
    if request.url.path in skip_paths:
        return await call_next(request)

    # Get user identifier
    user_id = request.headers.get("X-API-Key") or request.client.host

    start_time = time.time()

    # Check rate limit
    allowed, info = check_rate_limit(user_id)

    response_time = (time.time() - start_time) * 1000

    # Record for anomaly detection
    anomaly_detector.record_request(user_id, allowed)

    if not allowed:
        return JSONResponse(
            status_code=429,
            content={
                "error": "Rate limit exceeded",
                "message": f"Too many requests. Try again in {info['retry_after']} seconds.",
                "retry_after": info['retry_after'],
                "user_id": user_id
            },
            headers={
                "Retry-After": str(int(info['retry_after'])),
                "X-RateLimit-Remaining": "0"
            }
        )

    response = await call_next(request)
    response.headers["X-RateLimit-Remaining"] = str(info['tokens_remaining'])
    response.headers["X-RateLimit-Algorithm"] = info['algorithm']
    response.headers["X-Response-Time"] = f"{response_time:.2f}ms"

    return response


@app.get("/")
async def root():
    return {
        "message": "Intelligent Rate Limiter API",
        "version": settings.api_version,
        "status": "active"
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)