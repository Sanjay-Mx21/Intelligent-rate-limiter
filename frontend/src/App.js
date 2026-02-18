import React, { useState } from "react";
import Dashboard from "./components/Dashboard";
import LiveTester from "./components/LiveTester";
import "./index.css";

const App = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [globalStats, setGlobalStats] = useState({ success: 0, blocked: 0 });
  const [graphData, setGraphData] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isLive, setIsLive] = useState(false);

  const updateStats = (success, blocked, newLogs) => {
    setGlobalStats((prev) => ({
      success: prev.success + success,
      blocked: prev.blocked + blocked,
    }));
    setLogs((prev) => [...newLogs, ...prev].slice(0, 50));
  };

  const resetAll = () => {
    setGlobalStats({ success: 0, blocked: 0 });
    setGraphData([]);
    setLogs([]);
  };

  return (
    <div
      style={{
        maxWidth: "1400px",
        margin: "0 auto",
      }}
    >
      {/* Header Card */}
      <div
        className="neo-card fade-in"
        style={{
          marginBottom: "24px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          boxShadow: "0 8px 32px rgba(102, 126, 234, 0.4)",
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
          <div>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: "800",
                margin: "0 0 8px 0",
                letterSpacing: "-0.5px",
              }}
            >
              🚦 Intelligent Rate Limiter
            </h1>
            <p
              style={{
                margin: 0,
                opacity: 0.9,
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Production-Grade API Protection System
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "16px",
              flexWrap: "wrap",
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            {[
              { icon: "⚙️", label: "Token Bucket" },
              { icon: "⚡", label: "Redis" },
              { icon: "🐍", label: "FastAPI" },
              { icon: "⚛️", label: "React" },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  backdropFilter: "blur(10px)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        className="neo-card fade-in"
        style={{
          marginBottom: "24px",
          padding: "12px",
          display: "flex",
          gap: "8px",
        }}
      >
        {[
          { id: "dashboard", label: "📊 Dashboard", emoji: "📊" },
          { id: "tester", label: "🧪 Live Tester", emoji: "🧪" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={activeTab === tab.id ? "gradient-button" : ""}
            style={{
              flex: 1,
              padding: "14px 24px",
              fontSize: "15px",
              fontWeight: "700",
              borderRadius: "12px",
              border: "none",
              cursor: "pointer",
              background:
                activeTab === tab.id
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  : "rgba(255,255,255,0.5)",
              color: activeTab === tab.id ? "white" : "#4a5568",
              transition: "all 0.3s ease",
              boxShadow:
                activeTab === tab.id
                  ? "0 4px 15px rgba(102, 126, 234, 0.4)"
                  : "none",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="fade-in">
        <div style={{ display: activeTab === "dashboard" ? "block" : "none" }}>
          <Dashboard
            globalStats={globalStats}
            graphData={graphData}
            isLive={isLive}
            setIsLive={setIsLive}
            setGraphData={setGraphData}
            setGlobalStats={setGlobalStats}
          />
        </div>
        <div style={{ display: activeTab === "tester" ? "block" : "none" }}>
          <LiveTester
            globalStats={globalStats}
            logs={logs}
            updateStats={updateStats}
            resetAll={resetAll}
          />
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          marginTop: "32px",
          padding: "20px",
          color: "#4a5568",
          fontSize: "13px",
          fontWeight: "600",
          opacity: 0.7,
        }}
      >
        Built for FAANG Interviews 🚀 | FastAPI + Redis + React + ML
      </div>
    </div>
  );
};

export default App;
