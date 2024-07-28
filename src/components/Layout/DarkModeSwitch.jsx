import React from 'react';
import { BiSun, BiMoon } from 'react-icons/bi';
import './DarkModeSwitch.css'; // Asegúrate de que el CSS del switch esté importado

const DarkModeSwitch = ({ darkMode, toggleDarkMode }) => (
  <div className={`theme-switch-wrapper ${darkMode ? 'dark-mode' : ''}`}>
    <div className="theme-switch">
      <input 
        type="checkbox" 
        id="checkbox" 
        checked={darkMode} 
        onChange={toggleDarkMode} 
      />
      <label htmlFor="checkbox" className="slider">
        <span className="icon left">
          {darkMode ? <BiMoon /> : null}
        </span>
        <span className="icon right">
          {!darkMode ? <BiSun /> : null}
        </span>
      </label>
    </div>    
  </div>
);

export default DarkModeSwitch;
