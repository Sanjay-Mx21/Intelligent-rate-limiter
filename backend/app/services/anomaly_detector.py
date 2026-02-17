import time
import redis
from typing import Dict


class AnomalyDetector:
    """
    Detects suspicious traffic patterns using simple rule-based detection.
    
    What counts as suspicious?
    - More than 50 requests in 10 seconds (burst attack)
    - More than 80% of requests being blocked (hammering the limit)
    - Requests coming in at impossibly fast intervals (bot behavior)
    """

    def __init__(self, redis_client: redis.Redis):
        self.redis = redis_client

    def record_request(self, user_id: str, was_allowed: bool):
        """
        Record every request for a user so we can analyze patterns.
        We store the last 100 request timestamps in Redis.
        """
        key = f"anomaly:{user_id}"
        current_time = time.time()

        # Store: timestamp and whether it was allowed (1) or blocked (0)
        entry = f"{current_time}:{1 if was_allowed else 0}"

        # Add to list, keep only last 100 entries
        self.redis.lpush(key, entry)
        self.redis.ltrim(key, 0, 99)
        self.redis.expire(key, 300)  # Expire after 5 minutes

    def analyze(self, user_id: str) -> Dict:
        """
        Analyze a user's recent traffic pattern.
        Returns anomaly report.
        """
        key = f"anomaly:{user_id}"
        entries = self.redis.lrange(key, 0, -1)

        if len(entries) < 10:
            return {
                "is_anomaly": False,
                "reason": "Not enough data yet",
                "request_count": len(entries),
                "risk_score": 0
            }

        # Parse entries
        parsed = []
        for entry in entries:
            try:
                parts = entry.decode().split(":")
                timestamp = float(parts[0])
                allowed = int(parts[1])
                parsed.append({"timestamp": timestamp, "allowed": allowed})
            except Exception:
                continue

        if not parsed:
            return {"is_anomaly": False, "reason": "No data", "risk_score": 0}

        # Sort by timestamp (newest first)
        parsed.sort(key=lambda x: x["timestamp"], reverse=True)

        current_time = time.time()
        risk_score = 0
        reasons = []

        # Check 1: Burst detection - more than 50 requests in last 10 seconds
        last_10_seconds = [
            p for p in parsed
            if current_time - p["timestamp"] <= 10
        ]
        if len(last_10_seconds) > 50:
            risk_score += 40
            reasons.append(
                f"🚨 Burst detected: {len(last_10_seconds)} requests in last 10 seconds"
            )

        # Check 2: High block rate - more than 70% of requests blocked
        total = len(parsed[:50])  # Look at last 50 requests
        blocked = sum(1 for p in parsed[:50] if p["allowed"] == 0)
        block_rate = (blocked / total * 100) if total > 0 else 0

        if block_rate > 70:
            risk_score += 35
            reasons.append(
                f"⚠️ High block rate: {block_rate:.1f}% of requests being blocked"
            )

        # Check 3: Extremely fast requests - avg interval less than 50ms
        if len(parsed) >= 20:
            timestamps = [p["timestamp"] for p in parsed[:20]]
            intervals = []
            for i in range(len(timestamps) - 1):
                interval = abs(timestamps[i] - timestamps[i + 1]) * 1000  # ms
                intervals.append(interval)

            avg_interval = sum(intervals) / len(intervals) if intervals else 999
            if avg_interval < 50:
                risk_score += 25
                reasons.append(
                    f"🤖 Bot-like behavior: avg {avg_interval:.1f}ms between requests"
                )

        # Determine if anomaly
        is_anomaly = risk_score >= 35

        return {
            "is_anomaly": is_anomaly,
            "risk_score": min(risk_score, 100),  # Cap at 100
            "reasons": reasons if reasons else ["✅ Traffic pattern looks normal"],
            "stats": {
                "total_requests_analyzed": len(parsed),
                "requests_last_10s": len(last_10_seconds),
                "block_rate_percent": round(block_rate, 1),
            }
        }