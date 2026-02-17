import requests
from concurrent.futures import ThreadPoolExecutor

url = "http://localhost:8000/api/test"

print("🚀 Testing Rate Limiter - Sending 200 requests CONCURRENTLY...\n")

def make_request(i):
    """Make a single request"""
    try:
        response = requests.get(url, headers={"X-API-Key": "test_user_123"}, timeout=5)
        
        if response.status_code == 200:
            remaining = response.headers.get('X-RateLimit-Remaining', 'N/A')
            return ('success', i+1, remaining)
        elif response.status_code == 429:
            data = response.json()
            retry_after = data.get('retry_after', 'N/A')
            return ('blocked', i+1, retry_after)
    except Exception as e:
        return ('error', i+1, str(e))

# Send 200 requests concurrently
with ThreadPoolExecutor(max_workers=50) as executor:
    results = list(executor.map(make_request, range(200)))

# Separate and display results
success_results = [r for r in results if r[0] == 'success']
blocked_results = [r for r in results if r[0] == 'blocked']
error_results = [r for r in results if r[0] == 'error']

# Show first 10 successful
print("First 10 successful requests:")
for result in success_results[:10]:
    print(f"✅ Request {result[1]}: SUCCESS - {result[2]} remaining")

print("\n...")

# Show last 10 successful
print(f"\nLast 10 successful requests:")
for result in success_results[-10:]:
    print(f"✅ Request {result[1]}: SUCCESS - {result[2]} remaining")

# Show all blocked
if blocked_results:
    print(f"\n🚫 BLOCKED REQUESTS:")
    for result in blocked_results[:20]:  # Show first 20 blocked
        print(f"🚫 Request {result[1]}: BLOCKED - Retry after {result[2]}s")
    if len(blocked_results) > 20:
        print(f"... and {len(blocked_results) - 20} more blocked requests")

print(f"\n" + "="*50)
print(f"📊 RESULTS:")
print(f"✅ Successful Requests: {len(success_results)}")
print(f"🚫 Blocked Requests: {len(blocked_results)}")
print(f"❌ Error Requests: {len(error_results)}")
print(f"🎯 Rate Limiter Status: {'✅ WORKING!' if len(blocked_results) > 0 else '❌ NOT WORKING'}")
print("="*50)