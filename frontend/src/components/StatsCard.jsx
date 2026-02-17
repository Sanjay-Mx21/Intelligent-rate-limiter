import React from "react";

const StatsCard = ({ title, value, subtitle, color, icon }) => {
  const colors = {
    green: {
      bg: "#f0fdf4",
      border: "#86efac",
      text: "#16a34a",
      value: "#15803d",
    },
    red: {
      bg: "#fef2f2",
      border: "#fca5a5",
      text: "#dc2626",
      value: "#b91c1c",
    },
    blue: {
      bg: "#eff6ff",
      border: "#93c5fd",
      text: "#2563eb",
      value: "#1d4ed8",
    },
    orange: {
      bg: "#fff7ed",
      border: "#fdba74",
      text: "#ea580c",
      value: "#c2410c",
    },
  };

  const scheme = colors[color] || colors.blue;

  return (
    <div
      style={{
        backgroundColor: scheme.bg,
        border: `2px solid ${scheme.border}`,
        borderRadius: "12px",
        padding: "20px",
        flex: 1,
        minWidth: "150px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "8px",
        }}
      >
        <span style={{ fontSize: "20px" }}>{icon}</span>
        <p
          style={{
            margin: 0,
            fontSize: "13px",
            fontWeight: "600",
            color: scheme.text,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {title}
        </p>
      </div>
      <p
        style={{
          margin: "0 0 4px 0",
          fontSize: "32px",
          fontWeight: "800",
          color: scheme.value,
          lineHeight: 1,
        }}
      >
        {value}
      </p>
      {subtitle && (
        <p
          style={{
            margin: 0,
            fontSize: "12px",
            color: scheme.text,
            opacity: 0.8,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default StatsCard;
