import React from "react";
import "../styles/navbar.css";

function Navbar({ darkMode, toggleTheme }) {
  return (
    <nav>
      <h1 className="brand-text">CrediBot</h1>
      <div className="theme-toggle">
        <input
          type="checkbox"
          id="theme-switch"
          className="theme-switch"
          checked={darkMode}
          onChange={toggleTheme}
        />
        <label htmlFor="theme-switch" className="theme-switch-label">
          <span className="theme-switch-icon"></span>
        </label>
      </div>
    </nav>
  );
}

export default Navbar;
