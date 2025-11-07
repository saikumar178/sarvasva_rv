import React from "react";

function ChatHeader({ isConnected }) {
  return (
    <div className="chat-header">
      <div className="chat-header-left">
        <div className="logo">🤖</div>
        <h1>CrediBot</h1>
        <div className={`connection-status ${isConnected ? "connected" : "disconnected"}`}>
          <span className="status-dot"></span>
          <span className="status-text">{isConnected ? "Online" : "Offline"}</span>
        </div>
      </div>
    </div>
  );
}

export default ChatHeader;
