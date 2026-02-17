import AnomalyAlert from "./AnomalyAlert";
import React, { useState } from "react";
import { testRequest, spamRequests } from "../services/api";
import StatsCard from "./StatsCard";

const LiveTester = ({ globalStats, logs, updateStats, resetAll }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [userId, setUserId] = useState("demo_user");

  const handleSingleRequest = async () => {
    const result = await testRequest(userId);
    const log = {
      id: Date.now(),
      ...result,
      timestamp: new Date().toLocaleTimeString(),
    };
    updateStats(result.success ? 1 : 0, result.success ? 0 : 1, [log]);
  };

  const handleSpam = async (count) => {
    if (isRunning) return;
    setIsRunning(true);

    await spamRequests(count, userId, (progress) => {
      const latestLog = progress.logs[progress.logs.length - 1];
      if (latestLog) {
        updateStats(latestLog.success ? 1 : 0, latestLog.success ? 0 : 1, [
          { ...latestLog, id: Date.now() },
        ]);
      }
    });

    setIsRunning(false);
  };

  const totalRequests = globalStats.success + globalStats.blocked;
  const successRate =
    totalRequests > 0
      ? ((globalStats.success / totalRequests) * 100).toFixed(1)
      : 0;

  return (
    <div style={{ padding: "24px" }}>
      <h2
        style={{
          margin: "0 0 8px 0",
          fontSize: "20px",
          fontWeight: "700",
          color: "#1e293b",
        }}
      >
        🧪 Live Rate Limiter Tester
      </h2>
      <p style={{ margin: "0 0 24px 0", color: "#64748b", fontSize: "14px" }}>
        Send requests and watch the rate limiter in action!
      </p>

      {/* User ID Input */}
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "block",
            marginBottom: "6px",
            fontSize: "13px",
            fontWeight: "600",
            color: "#374151",
          }}
        >
          API Key / User ID:
        </label>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          style={{
            padding: "10px 14px",
            borderRadius: "8px",
            border: "2px solid #e2e8f0",
            fontSize: "14px",
            width: "280px",
            outline: "none",
            color: "#1e293b",
          }}
        />
      </div>

      {/* Buttons */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "24px",
        }}
      >
        {[
          { label: "📤 Send 1 Request", count: 1, color: "#3b82f6" },
          { label: "⚡ Send 10 Requests", count: 10, color: "#8b5cf6" },
          { label: "🔥 Send 50 Requests", count: 50, color: "#f59e0b" },
          { label: "💣 SPAM 150 Requests!", count: 150, color: "#ef4444" },
        ].map((btn) => (
          <button
            key={btn.count}
            onClick={() =>
              btn.count === 1 ? handleSingleRequest() : handleSpam(btn.count)
            }
            disabled={isRunning}
            style={{
              padding: "10px 20px",
              backgroundColor: btn.color,
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: isRunning ? "not-allowed" : "pointer",
              fontWeight: "600",
              fontSize: "14px",
              opacity: isRunning ? 0.7 : 1,
            }}
          >
            {btn.label}
          </button>
        ))}

        <button
          onClick={resetAll}
          disabled={isRunning}
          style={{
            padding: "10px 20px",
            backgroundColor: "#6b7280",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: isRunning ? "not-allowed" : "pointer",
            fontWeight: "600",
            fontSize: "14px",
            opacity: isRunning ? 0.7 : 1,
          }}
        >
          🔄 Reset All
        </button>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}
      >
        <StatsCard
          title="Total Requests"
          value={totalRequests}
          icon="📊"
          color="blue"
          subtitle="Sent so far"
        />
        <StatsCard
          title="Successful"
          value={globalStats.success}
          icon="✅"
          color="green"
          subtitle="Allowed through"
        />
        <StatsCard
          title="Blocked"
          value={globalStats.blocked}
          icon="🚫"
          color="red"
          subtitle="Rate limited"
        />
        <StatsCard
          title="Success Rate"
          value={`${successRate}%`}
          icon="🎯"
          color="orange"
          subtitle="Of total requests"
        />
      </div>

      {/* Loading */}
      {isRunning && (
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "#fef3c7",
            border: "2px solid #fbbf24",
            borderRadius: "8px",
            marginBottom: "16px",
            fontSize: "14px",
            fontWeight: "600",
            color: "#92400e",
          }}
        >
          ⏳ Sending requests... Please wait!
        </div>
      )}

      {/* Logs */}
      {logs.length > 0 && (
        <div>
          <h3
            style={{
              margin: "0 0 12px 0",
              fontSize: "15px",
              fontWeight: "700",
              color: "#1e293b",
            }}
          >
            📝 Request Log (Latest 50)
          </h3>
          <div
            style={{
              border: "2px solid #e2e8f0",
              borderRadius: "10px",
              overflow: "hidden",
              maxHeight: "350px",
              overflowY: "auto",
            }}
          >
            {logs.map((log, index) => (
              <div
                key={index}
                style={{
                  padding: "10px 16px",
                  backgroundColor: log.success ? "#f0fdf4" : "#fef2f2",
                  borderBottom: "1px solid #e2e8f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "13px",
                }}
              >
                <span style={{ fontWeight: "600" }}>
                  {log.success ? "✅" : "🚫"} Request
                </span>
                <span
                  style={{
                    color: log.success ? "#16a34a" : "#dc2626",
                    fontWeight: "700",
                  }}
                >
                  {log.success ? "200 OK" : "429 BLOCKED"}
                </span>
                <span style={{ color: "#64748b" }}>
                  {log.success
                    ? `${log.remaining} remaining`
                    : `Retry in ${log.retryAfter}s`}
                </span>
                <span style={{ color: "#94a3b8" }}>{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Anomaly Detection */}
      <AnomalyAlert userId={userId} />
    </div>
  );
};

export default LiveTester;
