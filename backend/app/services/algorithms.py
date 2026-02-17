import time
import redis
from typing import Tuple, Dict


class TokenBucketRateLimiter:
    """
    Token Bucket Algorithm with atomic Redis operations
    """
    
    def __init__(self, redis_client: redis.Redis, max_tokens: int, refill_rate: float):
        self.redis = redis_client
        self.max_tokens = max_tokens
        self.refill_rate = refill_rate
        
        # Lua script for atomic token bucket operations
        self.lua_script = """
        local key = KEYS[1]
        local max_tokens = tonumber(ARGV[1])
        local refill_rate = tonumber(ARGV[2])
        local current_time = tonumber(ARGV[3])
        
        -- Get current state
        local tokens = tonumber(redis.call('HGET', key, 'tokens'))
        local last_refill = tonumber(redis.call('HGET', key, 'last_refill'))
        
        -- Initialize if first time
        if not tokens then
            tokens = max_tokens - 1
            redis.call('HSET', key, 'tokens', tokens)
            redis.call('HSET', key, 'last_refill', current_time)
            redis.call('EXPIRE', key, 3600)
            return {1, tokens, 0}  -- allowed, remaining, retry_after
        end
        
        -- Calculate refill
        local time_passed = current_time - last_refill
        local tokens_to_add = time_passed * refill_rate
        tokens = math.min(max_tokens, tokens + tokens_to_add)
        
        -- Check if we can allow the request
        if tokens >= 1 then
            tokens = tokens - 1
            redis.call('HSET', key, 'tokens', tokens)
            redis.call('HSET', key, 'last_refill', current_time)
            return {1, math.floor(tokens), 0}  -- allowed, remaining, retry_after
        else
            local retry_after = (1 - tokens) / refill_rate
            return {0, 0, retry_after}  -- denied, 0 remaining, retry_after
        end
        """
        
        # Register the script
        self.script_sha = self.redis.script_load(self.lua_script)
    
    def allow_request(self, user_id: str) -> Tuple[bool, Dict]:
        """Check if request should be allowed using atomic Lua script"""
        key = f"token_bucket:{user_id}"
        current_time = time.time()
        
        try:
            # Execute Lua script atomically
            result = self.redis.evalsha(
                self.script_sha,
                1,  # number of keys
                key,
                self.max_tokens,
                self.refill_rate,
                current_time
            )
            
            allowed = result[0] == 1
            tokens_remaining = int(result[1])
            retry_after = float(result[2])
            
            return allowed, {
                'tokens_remaining': tokens_remaining,
                'retry_after': round(retry_after, 2),
                'algorithm': 'token_bucket'
            }
        except redis.exceptions.NoScriptError:
            # Script was flushed, reload it
            self.script_sha = self.redis.script_load(self.lua_script)
            return self.allow_request(user_id)