import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";

import Navbar from "./components/Navbar";
import LanguagePage from "./pages/LanguagePage";
import ChatPage from "./pages/ChatPage";
import Login from "./components/LoginPage";
import Signup from "./components/SignupPage";

const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("en-IN");
  const [user, setUser] = useState(null);

  const navigate = useNavigate();
  const toggleTheme = () => setDarkMode(!darkMode);

  // ✅ Track login state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // ✅ Logout handler
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <Navbar
        darkMode={darkMode}
        toggleTheme={toggleTheme}
        user={user}
        handleLogout={handleLogout}
      />

      <Routes>
        {/* If not logged in → show Login or Signup */}
        {!user ? (
          <>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </>
        ) : (
          <>
            <Route path="/" element={<LanguagePage setLanguage={setLanguage} />} />
            <Route path="/chat" element={<ChatPage language={language} />} />
          </>
        )}
      </Routes>
    </div>
  );
};

export default App;
