import React, { useState, useRef, useEffect } from "react";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";
import "../styles/chat.css";

function ChatContainer({ language }) {
  const [messages, setMessages] = useState([]);
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check server connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const res = await fetch("/health");
        if (res.ok) {
          setIsConnected(true);
          setConnectionError(false);
        } else {
          setIsConnected(false);
          setConnectionError(true);
        }
      } catch (error) {
        setIsConnected(false);
        setConnectionError(true);
      }
    };
    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // ✅ Only run once on mount
  useEffect(() => {
    console.log("ChatContainer mounted with language:", language);
    const welcomeMessage = language.startsWith("hi") 
      ? "👋 नमस्ते! CrediBot के साथ चैटिंग शुरू करें।"
      : language.startsWith("ta")
      ? "👋 வணக்கம்! CrediBot உடன் அரட்டை அடிக்கத் தொடங்குங்கள்।"
      : "👋 Hello! Start chatting with CrediBot.";
    setMessages([{ text: welcomeMessage, user: false }]);
  }, [language]);

  // 🎤 Start mic recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Get the best supported mime type
      const options = { mimeType: 'audio/webm' };
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        options.mimeType = 'audio/webm;codecs=opus';
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'audio/ogg;codecs=opus';
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        delete options.mimeType; // Use browser default
      }
      
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      audioChunks.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunks.current.push(e.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        setIsLoading(true);
        try {
          // Get the actual mime type from the recorder
          const mimeType = mediaRecorderRef.current.mimeType || 'audio/webm';
          const audioBlob = new Blob(audioChunks.current, { type: mimeType });
          
          // Determine file extension based on mime type
          let extension = 'webm';
          if (mimeType.includes('ogg')) extension = 'ogg';
          if (mimeType.includes('wav')) extension = 'wav';
          
          const formData = new FormData();
          formData.append("audio", audioBlob, `recording.${extension}`);
          formData.append("language", language); // Pass language for recognition
          
          const res = await fetch("/speech-to-text", { method: "POST", body: formData });
          
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          
          const data = await res.json();
          if (data.transcription) {
            handleSend(data.transcription);
          } else {
            setMessages((prev) => [...prev, { 
              text: data.error || "Could not understand audio. Please try again.", 
              user: false 
            }]);
          }
        } catch (error) {
          console.error("Speech-to-text error:", error);
          setMessages((prev) => [...prev, { 
            text: "⚠️ Error processing audio. Please try typing instead.", 
            user: false 
          }]);
        } finally {
          setIsLoading(false);
          // Clean up stream
          stream.getTracks().forEach(track => track.stop());
        }
      };
      
      mediaRecorderRef.current.start(100); // Collect data every 100ms
      setRecording(true);
    } catch (err) {
      console.error("Mic error:", err);
      setMessages((prev) => [...prev, { 
        text: "⚠️ Microphone access denied or unavailable. Please use text input.", 
        user: false 
      }]);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      if (mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    }
    setRecording(false);
  };

  // 💬 Send user message + fetch AI reply
  const handleSend = async (message) => {
    if (!message.trim()) return;
    
    setMessages((prev) => [...prev, { text: message, user: true }]);
    setIsLoading(true);
    setConnectionError(false);

    try {
      const res = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, language }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      const botReply = data.response || "Sorry, I couldn't process that.";
      setMessages((prev) => [...prev, { text: botReply, user: false }]);
      setIsConnected(true);

      // Text-to-speech
      try {
        const tts = await fetch("/text-to-speech", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inputs: [botReply], target_language_code: language }),
        });

        if (tts.ok) {
          const blob = await tts.blob();
          setAudioURL(URL.createObjectURL(blob));
        }
      } catch (ttsError) {
        console.error("TTS error:", ttsError);
        // Don't show error for TTS, just continue without audio
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setIsConnected(false);
      setConnectionError(true);
      setMessages((prev) => [...prev, { 
        text: "⚠️ Connection error. Please check if the server is running and try again.", 
        user: false 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <ChatHeader isConnected={isConnected} />
      <div className="chat-messages-wrapper">
        <ChatMessages messages={messages} />
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>
      {connectionError && (
        <div className="connection-error">
          ⚠️ Connection lost. Trying to reconnect...
        </div>
      )}
      <ChatInput
        onSend={handleSend}
        onMicStart={startRecording}
        onMicStop={stopRecording}
        recording={recording}
        disabled={isLoading}
      />
      {audioURL && (
        <audio
          src={audioURL}
          autoPlay
          onEnded={() => {
            setAudioURL(null);
            URL.revokeObjectURL(audioURL);
          }}
          style={{ display: "none" }}
        />
      )}
    </div>
  );
}

export default ChatContainer;
