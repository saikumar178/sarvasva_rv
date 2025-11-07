import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import LanguagePage from "./pages/LanguagePage";
import ChatPage from "./pages/ChatPage";
import "./styles/app.css";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("en-IN");

  const toggleTheme = () => setDarkMode((prev) => !prev);

  return (
    <div className={darkMode ? "dark" : ""}>
      <Navbar darkMode={darkMode} toggleTheme={toggleTheme} />
      <Routes>
        <Route path="/" element={<LanguagePage setLanguage={setLanguage} />} />
        <Route path="/chat" element={<ChatPage language={language} />} />
      </Routes>

    </div>
  );
}

export default App;
