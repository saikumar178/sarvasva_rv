import React from "react";

function ChatMessages({ messages }) {
  return (
    <div className="chat-messages">
      {messages.map((msg, i) => (
        <div key={i} className={`message ${msg.user ? "user-message" : "bot-message"}`}>
          <div className="message-content">{msg.text}</div>
        </div>
      ))}
    </div>
  );
}

export default ChatMessages;
