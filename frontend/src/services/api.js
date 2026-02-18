import axios from 'axios';

// Base URL of our backend - use Railway URL in production, localhost in development
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // Increased timeout for Railway's slower free tier
});

// Test a single request to the rate limiter
export const testRequest = async (userId = "dashboard_user") => {
  try {
    const response = await api.get("/api/test", {
      headers: { "X-API-Key": userId },
    });
    return {
      success: true,
      status: response.status,
      remaining: response.headers["x-ratelimit-remaining"],
      algorithm: response.headers["x-ratelimit-algorithm"],
      responseTime: response.headers["x-response-time"],
    };
  } catch (error) {
    if (error.response && error.response.status === 429) {
      return {
        success: false,
        status: 429,
        remaining: 0,
        retryAfter: error.response.data.retry_after,
      };
    }
    return { success: false, status: "error" };
  }
};

// Get rate limit info
export const getRateLimitInfo = async () => {
  try {
    const response = await api.get("/api/info");
    return response.data;
  } catch (error) {
    return null;
  }
};

// Send multiple requests at once
export const spamRequests = async (count, userId, onProgress) => {
  const results = { success: 0, blocked: 0, logs: [] };

  for (let i = 0; i < count; i++) {
    const result = await testRequest(userId);

    if (result.success) {
      results.success++;
    } else {
      results.blocked++;
    }

    results.logs.push({
      id: i + 1,
      ...result,
      timestamp: new Date().toLocaleTimeString(),
    });

    // Update progress after each request
    if (onProgress) onProgress({ ...results });

    // Small delay to not freeze the browser
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  return results;
};
// Check anomaly for a specific user
export const checkAnomaly = async (userId) => {
  try {
    const response = await api.get(`/api/anomaly/${userId}`);
    return response.data;
  } catch (error) {
    return null;
  }
};