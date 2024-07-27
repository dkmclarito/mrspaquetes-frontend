import React from 'react';
import { BiUser, BiLogOut } from 'react-icons/bi';
import DarkModeSwitch from './DarkModeSwitch';
import './Header.css';

const Header = ({ toggleDarkMode, darkMode, menuCollapsed }) => {
  return (
    <header className={`header-container ${menuCollapsed ? 'collapsed' : ''}`}>
      <button className="oculto"></button>
      <div className="header-right">
        <BiUser className="header-icon" />
        <BiLogOut className="header-icon" />
        <DarkModeSwitch darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      </div>
    </header>
  );
};
export default Header;