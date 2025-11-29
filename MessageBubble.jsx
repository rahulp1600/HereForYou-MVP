import React from "react";

function MessageBubble({ from, text }) {
  const isUser = from === "You";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: 8,
      }}
    >
      <div
        style={{
          maxWidth: "75%",
          padding: "8px 12px",
          borderRadius: 16,
          fontSize: 14,
          lineHeight: 1.4,
          background: isUser ? "#7F7FD5" : "#ffffff",
          color: isUser ? "#ffffff" : "#333333",
          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        }}
      >
        {text}
      </div>
    </div>
  );
}

export default MessageBubble;
