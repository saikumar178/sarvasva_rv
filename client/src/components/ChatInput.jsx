import React, { useState } from "react";

function ChatInput({ onSend, onMicStart, onMicStop, recording, disabled = false }) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    onSend(input);
    setInput("");
  };

  return (
    <div className="chat-input-wrapper">
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !disabled && handleSend()}
          placeholder={disabled ? "Processing..." : "Type a message..."}
          disabled={disabled}
        />
        <button
          onClick={recording ? onMicStop : onMicStart}
          className={`mic-button ${recording ? "recording" : ""}`}
          disabled={disabled}
          title={recording ? "Stop recording" : "Start voice recording"}
        >
          🎤
        </button>
        <button 
          onClick={handleSend} 
          className="send-button"
          disabled={disabled || !input.trim()}
          title="Send message"
        >
          ➤
        </button>
      </div>
    </div>
  );
}

export default ChatInput;
