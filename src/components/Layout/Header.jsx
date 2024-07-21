import React from 'react';
import { BiMenu, BiUser, BiLogOut } from 'react-icons/bi';
import './Header.css';

const Header = ({ onToggleMenu, menuVisible }) => {
  const handleMenuToggle = () => {
    if (onToggleMenu) {
      onToggleMenu(!menuVisible);
    }
  };

  return (
    <header className="header-container">
      <button className="menu-toggle" onClick={handleMenuToggle}>
        <BiMenu />
      </button>
      <div className="header-right">
        <BiUser className="header-icon" />
        <BiLogOut className="header-icon" />
      </div>
    </header>
  );
};

export default Header;
