import React from "react";

const StatsCard = ({ title, value, subtitle, icon, gradient }) => {
  const gradients = {
    purple: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    blue: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    green: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    orange: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    red: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  };

  return (
    <div
      className="neo-card"
      style={{
        flex: 1,
        minWidth: "200px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Gradient accent bar on top */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: gradients[gradient] || gradients.purple,
        }}
      />

      {/* Icon with gradient background */}
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          background: gradients[gradient] || gradients.purple,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
          marginBottom: "16px",
          boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
        }}
      >
        {icon}
      </div>

      {/* Title */}
      <p
        style={{
          margin: "0 0 8px 0",
          fontSize: "12px",
          fontWeight: "700",
          color: "#64748b",
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        {title}
      </p>

      {/* Value */}
      <p
        style={{
          margin: "0 0 4px 0",
          fontSize: "36px",
          fontWeight: "800",
          background: gradients[gradient] || gradients.purple,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          lineHeight: 1.2,
        }}
      >
        {value}
      </p>

      {/* Subtitle */}
      {subtitle && (
        <p
          style={{
            margin: 0,
            fontSize: "13px",
            color: "#94a3b8",
            fontWeight: "500",
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default StatsCard;
