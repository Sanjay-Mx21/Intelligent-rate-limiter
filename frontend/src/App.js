import React, { useState, useEffect, useRef } from 'react';
import Dashboard from './components/Dashboard';
import LiveTester from './components/LiveTester';
import { testRequest } from './services/api';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Shared state - lives here so tabs don't reset it
  const [globalStats, setGlobalStats] = useState({
    success: 0,
    blocked: 0,
  });
  const [graphData, setGraphData] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isLive, setIsLive] = useState(false);
  const intervalRef = useRef(null);

  // Live monitoring logic lives here now
  const toggleLiveMonitoring = () => {
    if (isLive) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsLive(false);
    } else {
      setIsLive(true);
      intervalRef.current = setInterval(async () => {
        const result = await testRequest('monitor_user');
        const now = new Date().toLocaleTimeString();

        setGraphData(prev => {
          const newPoint = {
            time: now,
            remaining: result.success ? parseInt(result.remaining) : 0,
          };
          return [...prev, newPoint].slice(-20);
        });

        setGlobalStats(prev => ({
          success: prev.success + (result.success ? 1 : 0),
          blocked: prev.blocked + (result.success ? 0 : 1),
        }));
      }, 1000);
    }
  };

  // Update global stats from live tester
  const updateStats = (success, blocked, newLogs) => {
    setGlobalStats(prev => ({
      success: prev.success + success,
      blocked: prev.blocked + blocked,
    }));
    setLogs(prev => [...newLogs, ...prev].slice(0, 50));
  };

  // Reset everything
  const resetAll = () => {
    setGlobalStats({ success: 0, blocked: 0 });
    setGraphData([]);
    setLogs([]);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'tester', label: '🧪 Live Tester' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f1f5f9',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>

      {/* Header */}
      <div style={{
        backgroundColor: '#1e293b',
        padding: '0 24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>🚦</span>
            <div>
              <h1 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: '800',
                color: 'white',
              }}>
                Intelligent Rate Limiter
              </h1>
              <p style={{
                margin: 0,
                fontSize: '11px',
                color: '#94a3b8',
                fontWeight: '500'
              }}>
                Production-Grade API Protection
              </p>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#064e3b',
            padding: '6px 14px',
            borderRadius: '20px',
            border: '1px solid #059669'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#22c55e',
            }} />
            <span style={{ fontSize: '12px', color: '#6ee7b7', fontWeight: '600' }}>
              API Online
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '2px solid #e2e8f0',
        padding: '0 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'flex',
          gap: '4px'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '14px 20px',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                color: activeTab === tab.id ? '#3b82f6' : '#64748b',
                borderBottom: activeTab === tab.id
                  ? '3px solid #3b82f6'
                  : '3px solid transparent',
                transition: 'all 0.2s',
                marginBottom: '-2px'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1100px',
        margin: '24px auto',
        padding: '0 24px'
      }}>

        {/* Info Banner */}
        <div style={{
          backgroundColor: '#1e293b',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {[
              { label: 'Algorithm', value: 'Token Bucket', icon: '⚙️' },
              { label: 'Rate Limit', value: '100 req / 60s', icon: '🎯' },
              { label: 'Storage', value: 'Redis', icon: '⚡' },
              { label: 'Backend', value: 'FastAPI', icon: '🐍' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{item.icon}</span>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>{item.label}:</span>
                <span style={{ fontSize: '12px', color: 'white', fontWeight: '700' }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>
            Built for FAANG Interviews 🚀
          </div>
        </div>

        {/* Tab Content */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          border: '2px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          overflow: 'hidden'
        }}>
          {/* IMPORTANT: We use visibility instead of conditional rendering */}
          {/* This keeps components alive even when tab is not active */}
          <div style={{ display: activeTab === 'dashboard' ? 'block' : 'none' }}>
            <Dashboard
              globalStats={globalStats}
              graphData={graphData}
              isLive={isLive}
              toggleLiveMonitoring={toggleLiveMonitoring}
            />
          </div>
          <div style={{ display: activeTab === 'tester' ? 'block' : 'none' }}>
            <LiveTester
              globalStats={globalStats}
              logs={logs}
              updateStats={updateStats}
              resetAll={resetAll}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          padding: '20px',
          color: '#94a3b8',
          fontSize: '12px'
        }}>
          Built with FastAPI + Redis + React • Intelligent Rate Limiter System
        </div>
      </div>
    </div>
  );
};

export default App;