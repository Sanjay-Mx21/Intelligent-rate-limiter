import React, { useState, useEffect } from "react";
import { checkAnomaly } from "../services/api";

const AnomalyAlert = ({ userId }) => {
  const [anomalyData, setAnomalyData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAnomaly = async () => {
    if (!userId) return;
    setIsLoading(true);
    const result = await checkAnomaly(userId);
    setAnomalyData(result);
    setIsLoading(false);
  };

  // Auto-check every 5 seconds
  useEffect(() => {
    fetchAnomaly();
    const interval = setInterval(fetchAnomaly, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  if (isLoading && !anomalyData) {
    return (
      <div
        style={{
          padding: "16px",
          backgroundColor: "#f8fafc",
          border: "2px solid #e2e8f0",
          borderRadius: "10px",
          fontSize: "14px",
          color: "#64748b",
        }}
      >
        ⏳ Analyzing traffic patterns...
      </div>
    );
  }

  if (!anomalyData) return null;

  const getRiskColor = (score) => {
    if (score >= 70)
      return { bg: "#fef2f2", border: "#fca5a5", text: "#dc2626" };
    if (score >= 35)
      return { bg: "#fff7ed", border: "#fdba74", text: "#ea580c" };
    return { bg: "#f0fdf4", border: "#86efac", text: "#16a34a" };
  };

  const getRiskLabel = (score) => {
    if (score >= 70) return "🔴 HIGH RISK";
    if (score >= 35) return "🟡 SUSPICIOUS";
    return "🟢 NORMAL";
  };

  const colors = getRiskColor(anomalyData.risk_score);

  return (
    <div
      style={{
        backgroundColor: colors.bg,
        border: `2px solid ${colors.border}`,
        borderRadius: "12px",
        padding: "20px",
        marginTop: "20px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <div>
          <h3
            style={{
              margin: "0 0 4px 0",
              fontSize: "16px",
              fontWeight: "700",
              color: "#1e293b",
            }}
          >
            🤖 ML Anomaly Detection
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: "12px",
              color: "#64748b",
            }}
          >
            Analyzing: <strong>{userId}</strong>
          </p>
        </div>

        {/* Risk Score Badge */}
        <div
          style={{
            backgroundColor: colors.border,
            padding: "8px 16px",
            borderRadius: "20px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: "700",
              color: colors.text,
              marginBottom: "2px",
            }}
          >
            RISK SCORE
          </div>
          <div
            style={{
              fontSize: "24px",
              fontWeight: "800",
              color: colors.text,
              lineHeight: 1,
            }}
          >
            {anomalyData.risk_score}
          </div>
          <div
            style={{
              fontSize: "10px",
              color: colors.text,
              fontWeight: "600",
            }}
          >
            {getRiskLabel(anomalyData.risk_score)}
          </div>
        </div>
      </div>

      {/* Risk Bar */}
      <div style={{ marginBottom: "16px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "4px",
            fontSize: "12px",
            color: "#64748b",
            fontWeight: "600",
          }}
        >
          <span>Risk Level</span>
          <span>{anomalyData.risk_score}/100</span>
        </div>
        <div
          style={{
            height: "8px",
            backgroundColor: "#e2e8f0",
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${anomalyData.risk_score}%`,
              backgroundColor:
                anomalyData.risk_score >= 70
                  ? "#ef4444"
                  : anomalyData.risk_score >= 35
                    ? "#f59e0b"
                    : "#22c55e",
              borderRadius: "4px",
              transition: "width 0.5s ease",
            }}
          />
        </div>
      </div>

      {/* Reasons */}
      <div style={{ marginBottom: "16px" }}>
        <p
          style={{
            margin: "0 0 8px 0",
            fontSize: "13px",
            fontWeight: "700",
            color: "#374151",
          }}
        >
          Analysis:
        </p>
        {anomalyData.reasons &&
          anomalyData.reasons.map((reason, i) => (
            <div
              key={i}
              style={{
                padding: "8px 12px",
                backgroundColor: "rgba(255,255,255,0.7)",
                borderRadius: "6px",
                marginBottom: "6px",
                fontSize: "13px",
                color: "#374151",
              }}
            >
              {reason}
            </div>
          ))}
      </div>

      {/* Stats */}
      {anomalyData.stats && (
        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          {[
            {
              label: "Requests Analyzed",
              value: anomalyData.stats.total_requests_analyzed,
            },
            {
              label: "Last 10 Seconds",
              value: anomalyData.stats.requests_last_10s,
            },
            {
              label: "Block Rate",
              value: `${anomalyData.stats.block_rate_percent}%`,
            },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                minWidth: "100px",
                padding: "10px",
                backgroundColor: "rgba(255,255,255,0.7)",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "800",
                  color: colors.text,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                  fontWeight: "600",
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Auto refresh note */}
      <p
        style={{
          margin: "12px 0 0 0",
          fontSize: "11px",
          color: "#94a3b8",
          textAlign: "right",
        }}
      >
        🔄 Auto-refreshes every 5 seconds
      </p>
    </div>
  );
};

export default AnomalyAlert;
