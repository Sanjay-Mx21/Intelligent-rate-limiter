import React, { useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getRateLimitInfo } from "../services/api";
import StatsCard from "./StatsCard";

const Dashboard = ({
  globalStats,
  graphData,
  isLive,
  toggleLiveMonitoring,
}) => {
  const [rateLimitInfo, setRateLimitInfo] = React.useState(null);

  useEffect(() => {
    const fetchInfo = async () => {
      const info = await getRateLimitInfo();
      setRateLimitInfo(info);
    };
    fetchInfo();
  }, []);

  const totalRequests = globalStats.success + globalStats.blocked;

  return (
    <div style={{ padding: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h2
            style={{
              margin: "0 0 4px 0",
              fontSize: "20px",
              fontWeight: "700",
              color: "#1e293b",
            }}
          >
            📊 Live Dashboard
          </h2>
          <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
            Real-time monitoring of rate limiter activity
          </p>
        </div>

        <button
          onClick={toggleLiveMonitoring}
          style={{
            padding: "10px 20px",
            backgroundColor: isLive ? "#ef4444" : "#22c55e",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "700",
            fontSize: "14px",
          }}
        >
          {isLive ? "⏹ Stop Monitoring" : "▶ Start Live Monitor"}
        </button>
      </div>

      {/* Rate Limit Config */}
      {rateLimitInfo && (
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "#eff6ff",
            border: "2px solid #93c5fd",
            borderRadius: "8px",
            marginBottom: "24px",
            fontSize: "14px",
            color: "#1d4ed8",
            display: "flex",
            gap: "24px",
          }}
        >
          <span>
            ⚙️ <strong>Algorithm:</strong> {rateLimitInfo.algorithm}
          </span>
          <span>
            🎯 <strong>Max Requests:</strong> {rateLimitInfo.max_requests}
          </span>
          <span>
            ⏱️ <strong>Window:</strong> {rateLimitInfo.window_seconds} seconds
          </span>
        </div>
      )}

      {/* Stats Cards */}
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
          subtitle="Since monitoring started"
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
          title="Block Rate"
          value={
            totalRequests > 0
              ? `${((globalStats.blocked / totalRequests) * 100).toFixed(1)}%`
              : "0%"
          }
          icon="⚠️"
          color="orange"
          subtitle="Of total requests"
        />
      </div>

      {/* Graph */}
      <div
        style={{
          backgroundColor: "white",
          border: "2px solid #e2e8f0",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "24px",
        }}
      >
        <h3
          style={{
            margin: "0 0 16px 0",
            fontSize: "15px",
            fontWeight: "700",
            color: "#1e293b",
          }}
        >
          📈 Tokens Remaining Over Time
        </h3>

        {graphData.length === 0 ? (
          <div
            style={{
              height: "200px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#94a3b8",
              fontSize: "14px",
              backgroundColor: "#f8fafc",
              borderRadius: "8px",
              border: "2px dashed #e2e8f0",
            }}
          >
            {isLive
              ? "⏳ Waiting for data..."
              : '▶ Click "Start Live Monitor" to see real-time data!'}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={graphData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "none",
                  borderRadius: "8px",
                  color: "white",
                  fontSize: "12px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="remaining"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", r: 4 }}
                name="Tokens Remaining"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Status */}
      <div
        style={{
          padding: "16px",
          backgroundColor: isLive ? "#f0fdf4" : "#f8fafc",
          border: `2px solid ${isLive ? "#86efac" : "#e2e8f0"}`,
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: isLive ? "#22c55e" : "#94a3b8",
          }}
        />
        <span
          style={{
            fontSize: "14px",
            fontWeight: "600",
            color: isLive ? "#15803d" : "#64748b",
          }}
        >
          {isLive
            ? "🟢 Live monitoring active - sending 1 request per second"
            : "⚪ Monitoring stopped - click Start to begin"}
        </span>
      </div>
    </div>
  );
};

export default Dashboard;
