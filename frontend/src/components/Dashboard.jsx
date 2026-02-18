import React, { useEffect, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { getRateLimitInfo, testRequest } from "../services/api";
import StatsCard from "./StatsCard";

const Dashboard = ({
  globalStats,
  graphData,
  isLive,
  setIsLive,
  setGraphData,
  setGlobalStats,
}) => {
  const [rateLimitInfo, setRateLimitInfo] = React.useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const fetchInfo = async () => {
      const info = await getRateLimitInfo();
      setRateLimitInfo(info);
    };
    fetchInfo();
  }, []);

  const toggleLiveMonitoring = () => {
    if (isLive) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsLive(false);
    } else {
      setIsLive(true);
      intervalRef.current = setInterval(async () => {
        const result = await testRequest("monitor_user");
        const now = new Date().toLocaleTimeString();

        setGraphData((prev) => {
          const newPoint = {
            time: now,
            remaining: result.success ? parseInt(result.remaining) : 0,
          };
          return [...prev, newPoint].slice(-20);
        });

        setGlobalStats((prev) => ({
          success: prev.success + (result.success ? 1 : 0),
          blocked: prev.blocked + (result.success ? 0 : 1),
        }));
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const totalRequests = globalStats.success + globalStats.blocked;
  const blockRate =
    totalRequests > 0
      ? ((globalStats.blocked / totalRequests) * 100).toFixed(1)
      : 0;

  return (
    <div>
      {/* Top Section - Config Info & Live Monitor Button */}
      <div
        className="neo-card"
        style={{
          marginBottom: "24px",
          background:
            "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          {rateLimitInfo && (
            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
              {[
                {
                  icon: "⚙️",
                  label: "Algorithm",
                  value: rateLimitInfo.algorithm,
                },
                {
                  icon: "🎯",
                  label: "Max Requests",
                  value: rateLimitInfo.max_requests,
                },
                {
                  icon: "⏱️",
                  label: "Window",
                  value: `${rateLimitInfo.window_seconds}s`,
                },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <span style={{ fontSize: "20px" }}>{item.icon}</span>
                  <div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#64748b",
                        fontWeight: "600",
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        fontSize: "15px",
                        fontWeight: "800",
                        color: "#1e293b",
                      }}
                    >
                      {item.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={toggleLiveMonitoring}
            className="gradient-button"
            style={{
              padding: "12px 24px",
              fontSize: "14px",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: isLive
                ? "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                : "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "white",
                animation: isLive ? "pulse 1s infinite" : "none",
              }}
            />
            {isLive ? "⏹ Stop Monitor" : "▶ Start Live Monitor"}
          </button>
        </div>
      </div>

      {/* Stats Cards Grid */}
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
          subtitle="Since monitoring started"
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
          title="Block Rate"
          value={`${blockRate}%`}
          icon="⚠️"
          gradient="orange"
          subtitle="Of total requests"
        />
      </div>

      {/* Graph Card */}
      <div className="neo-card" style={{ marginBottom: "24px" }}>
        <h3
          style={{
            margin: "0 0 20px 0",
            fontSize: "18px",
            fontWeight: "800",
            color: "#1e293b",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>📈</span> Tokens Remaining Over Time
        </h3>

        {graphData.length === 0 ? (
          <div
            style={{
              height: "250px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
              borderRadius: "12px",
              border: "2px dashed rgba(102, 126, 234, 0.3)",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>
              {isLive ? "⏳" : "📊"}
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "15px",
                color: "#64748b",
                fontWeight: "600",
              }}
            >
              {isLive
                ? "Waiting for data..."
                : 'Click "Start Live Monitor" to see real-time data!'}
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={graphData}>
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#667eea" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#764ba2" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }}
                stroke="#cbd5e1"
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }}
                domain={[0, 100]}
                stroke="#cbd5e1"
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(255,255,255,0.95)",
                  backdropFilter: "blur(10px)",
                  border: "none",
                  borderRadius: "12px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  fontWeight: 600,
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="remaining"
                stroke="#667eea"
                strokeWidth={3}
                fill="url(#colorGradient)"
                name="Tokens Remaining"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Status Indicator */}
      <div
        className="neo-card"
        style={{
          background: isLive
            ? "linear-gradient(135deg, rgba(67, 233, 123, 0.1) 0%, rgba(56, 249, 215, 0.1) 100%)"
            : "linear-gradient(135deg, rgba(148, 163, 184, 0.1) 0%, rgba(203, 213, 225, 0.1) 100%)",
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
            background: isLive
              ? "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
              : "#94a3b8",
            boxShadow: isLive ? "0 0 20px rgba(67, 233, 123, 0.6)" : "none",
          }}
        />
        <span
          style={{
            fontSize: "14px",
            fontWeight: "700",
            color: isLive ? "#059669" : "#64748b",
          }}
        >
          {isLive
            ? "🟢 Live monitoring active - sending 1 request per second"
            : "⚪ Monitoring stopped - click Start to begin"}
        </span>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
