import React from 'react';
import { BiMenu, BiUser, BiLogOut } from 'react-icons/bi';
import DarkModeSwitch from './DarkModeSwitch';
import './Header.css';

const Header = ({ onToggleMenu, menuVisible, toggleDarkMode, darkMode }) => {
  const handleMenuToggle = () => {
    if (onToggleMenu) {
      onToggleMenu(!menuVisible);
    }
  };

  const user = JSON.parse(localStorage.getItem("user")); // Obtén los datos del usuario desde localStorage

  const userType = user ? (+user.type === 0 ? "Empleado" : "Cliente") : "";


  return (
    <header className={`header-container ${menuCollapsed ? 'collapsed' : ''}`}>
      <button className="menu-toggle" onClick={handleMenuToggle}>
        <BiMenu />
      </button>
      <div className="header-right">
      
        <BiUser className="header-icon" />
        <BiLogOut className="header-icon" />
        <DarkModeSwitch darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      </div>
    </header>
  );
};

export default Header;
