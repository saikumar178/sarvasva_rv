import React from "react";
import { useNavigate } from "react-router-dom";
import ChatContainer from "../components/ChatContainer";
import "../styles/ChatPage.css"; // 👈 Add this line

function ChatPage({ language }) {
  const navigate = useNavigate();
  const selectedLanguage = language || "en-IN";

  return (
    <div className="chat-page">
      {/* 🔙 Back Button */}
      <button className="back-btn" onClick={() => navigate("/")}>
        <span className="arrow">←</span>
      </button>

      <ChatContainer language={selectedLanguage} />
    </div>
  );
}

export default ChatPage;
