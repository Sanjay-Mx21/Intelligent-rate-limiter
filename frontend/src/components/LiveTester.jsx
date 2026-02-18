import React, { useState } from "react";
import { testRequest, spamRequests } from "../services/api";
import StatsCard from "./StatsCard";
import AnomalyAlert from "./AnomalyAlert";

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

  const buttons = [
    {
      label: "📤 Send 1 Request",
      count: 1,
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    },
    {
      label: "⚡ Send 10 Requests",
      count: 10,
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      label: "🔥 Send 50 Requests",
      count: 50,
      gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    },
    {
      label: "💣 SPAM 150!",
      count: 150,
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="neo-card" style={{ marginBottom: "24px" }}>
        <h2
          style={{
            margin: "0 0 8px 0",
            fontSize: "22px",
            fontWeight: "800",
            color: "#1e293b",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>🧪</span> Live Rate Limiter Tester
        </h2>
        <p
          style={{
            margin: 0,
            color: "#64748b",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          Send requests and watch the rate limiter in action!
        </p>
      </div>

      {/* User ID Input */}
      <div className="neo-card" style={{ marginBottom: "24px" }}>
        <label
          style={{
            display: "block",
            marginBottom: "8px",
            fontSize: "13px",
            fontWeight: "700",
            color: "#475569",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          🔑 API Key / User ID:
        </label>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter user ID"
          style={{
            width: "100%",
            padding: "14px 18px",
            borderRadius: "12px",
            border: "2px solid rgba(102, 126, 234, 0.2)",
            fontSize: "15px",
            fontWeight: "600",
            outline: "none",
            background: "rgba(255,255,255,0.8)",
            transition: "all 0.3s ease",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#667eea";
            e.target.style.boxShadow = "0 0 0 4px rgba(102, 126, 234, 0.1)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "rgba(102, 126, 234, 0.2)";
            e.target.style.boxShadow = "none";
          }}
        />
      </div>

      {/* Action Buttons */}
      <div className="neo-card" style={{ marginBottom: "24px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "12px",
          }}
        >
          {buttons.map((btn) => (
            <button
              key={btn.count}
              onClick={() =>
                btn.count === 1 ? handleSingleRequest() : handleSpam(btn.count)
              }
              disabled={isRunning}
              className="gradient-button"
              style={{
                padding: "16px 20px",
                fontSize: "14px",
                fontWeight: "700",
                background: btn.gradient,
                opacity: isRunning ? 0.6 : 1,
                cursor: isRunning ? "not-allowed" : "pointer",
              }}
            >
              {btn.label}
            </button>
          ))}

          <button
            onClick={resetAll}
            disabled={isRunning}
            style={{
              padding: "16px 20px",
              fontSize: "14px",
              fontWeight: "700",
              borderRadius: "12px",
              border: "2px solid #cbd5e1",
              background: "rgba(255,255,255,0.8)",
              color: "#475569",
              cursor: isRunning ? "not-allowed" : "pointer",
              opacity: isRunning ? 0.6 : 1,
              transition: "all 0.3s ease",
            }}
          >
            🔄 Reset All
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginBottom: "24px",
        }}
      >
        <StatsCard
          title="Total Requests"
          value={totalRequests}
          icon="📊"
          gradient="blue"
          subtitle="Sent so far"
        />
        <StatsCard
          title="Successful"
          value={globalStats.success}
          icon="✅"
          gradient="green"
          subtitle="Allowed through"
        />
        <StatsCard
          title="Blocked"
          value={globalStats.blocked}
          icon="🚫"
          gradient="red"
          subtitle="Rate limited"
        />
        <StatsCard
          title="Success Rate"
          value={`${successRate}%`}
          icon="🎯"
          gradient="orange"
          subtitle="Of total requests"
        />
      </div>

      {/* Loading indicator */}
      {isRunning && (
        <div
          className="neo-card"
          style={{
            marginBottom: "24px",
            background:
              "linear-gradient(135deg, rgba(250, 112, 154, 0.1) 0%, rgba(254, 225, 64, 0.1) 100%)",
            border: "2px solid rgba(250, 112, 154, 0.3)",
            textAlign: "center",
            padding: "20px",
          }}
        >
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>⏳</div>
          <p
            style={{
              margin: 0,
              fontSize: "15px",
              fontWeight: "700",
              color: "#be185d",
            }}
          >
            Sending requests... Please wait!
          </p>
        </div>
      )}

      {/* Request Logs */}
      {logs.length > 0 && (
        <div className="neo-card" style={{ marginBottom: "24px" }}>
          <h3
            style={{
              margin: "0 0 16px 0",
              fontSize: "16px",
              fontWeight: "800",
              color: "#1e293b",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>📝</span> Request Log (Latest 50)
          </h3>
          <div
            style={{
              borderRadius: "12px",
              overflow: "hidden",
              maxHeight: "400px",
              overflowY: "auto",
              border: "2px solid rgba(226, 232, 240, 0.5)",
            }}
          >
            {logs.map((log, index) => (
              <div
                key={index}
                style={{
                  padding: "14px 18px",
                  background: log.success
                    ? "linear-gradient(90deg, rgba(67, 233, 123, 0.1) 0%, rgba(255,255,255,0.5) 100%)"
                    : "linear-gradient(90deg, rgba(240, 147, 251, 0.1) 0%, rgba(255,255,255,0.5) 100%)",
                  borderBottom: "1px solid rgba(226, 232, 240, 0.5)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "13px",
                  fontWeight: "600",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                <span style={{ color: "#1e293b" }}>
                  {log.success ? "✅" : "🚫"} Request
                </span>
                <span
                  style={{
                    color: log.success ? "#059669" : "#be185d",
                    fontWeight: "800",
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
