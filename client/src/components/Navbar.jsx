import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({ darkMode, toggleTheme, user, handleLogout }) => {
  return (
    <nav className={`navbar ${darkMode ? "dark" : ""}`}>
      <div className="navbar-left">
        <h1 className="brand">💬 SARVASVA</h1>
      </div>

      <div className="navbar-right">
        <button className="theme-toggle" onClick={toggleTheme}>
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>

        {!user ? (
          <>
            <Link className="nav-btn" to="/login">
              Login
            </Link>
            <Link className="nav-btn" to="/signup">
              Signup
            </Link>
          </>
        ) : (
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
