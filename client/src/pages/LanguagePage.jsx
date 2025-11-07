import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/languageSelection.css";

const languages = [
  { code: "en-IN", name: "English", native: "English" },
  { code: "hi-IN", name: "Hindi", native: "हिन्दी" },
  { code: "te-IN", name: "Telugu", native: "తెలుగు" },
  { code: "ta-IN", name: "Tamil", native: "தமிழ்" },
  { code: "kn-IN", name: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml-IN", name: "Malayalam", native: "മലയാളം" },
  { code: "mr-IN", name: "Marathi", native: "मराठी" },
  { code: "bn-IN", name: "Bengali", native: "বাংলা" },
  { code: "gu-IN", name: "Gujarati", native: "ગુજરાતી" },
  { code: "pa-IN", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "or-IN", name: "Odia", native: "ଓଡ଼ିଆ" },
  { code: "ur-IN", name: "Urdu", native: "اُردُو" },
];

function LanguagePage({ setLanguage }) {
  const navigate = useNavigate();

  const handleSelect = (lang) => {
    setLanguage(lang);
    navigate("/chat");
  };

  return (
    <div className="language-selection-screen">
      <div className="language-selection-content">
        <div className="logo-container">
          <div className="logo">🤖</div>
          <h1>Multilingual Assistant</h1>
        </div>
        <p className="welcome-text">Select your preferred language.</p>
        <div className="language-grid">
          {languages.map((lang) => (
            <button
              key={lang.code}
              className="language-option"
              onClick={() => handleSelect(lang.code)}
            >
              <span className="language-name">{lang.name}</span>
              <span className="language-native">{lang.native}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LanguagePage;
