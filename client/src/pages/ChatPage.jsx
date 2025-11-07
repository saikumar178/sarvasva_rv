import React from "react";
import ChatContainer from "../components/ChatContainer";

function ChatPage({ language }) {
  // ✅ prevent re-render loops
  const selectedLanguage = language || "en-IN";

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <ChatContainer language={selectedLanguage} />
    </div>
  );
}

export default ChatPage;
