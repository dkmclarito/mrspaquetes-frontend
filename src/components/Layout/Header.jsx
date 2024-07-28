import React, { useState, useEffect } from 'react';
import { BiUser, BiLogOut } from 'react-icons/bi';
import DarkModeSwitch from './DarkModeSwitch';
import './Header.css';
import AuthService from "../../services/authService";

const Header = ({ toggleDarkMode, darkMode, menuCollapsed }) => {
  const [user, setUser] = useState({});

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user')); // Obtener datos del usuario desde el Local Storage
    if (userData) {
      setUser(userData);
    }
  }, []);

  const handleLogout = () => {
    AuthService.logout(); // Utiliza AuthService para manejar el logout
    window.location.reload(); // Recarga la página o redirige al usuario al inicio de sesión
  };

  return (
    <header className={`header-container ${menuCollapsed ? 'collapsed' : ''}`}>
    <div className="header-left"> {/* Contenedor para el nombre del usuario e ícono */}
      {user && <span>{user.name}</span>} {/* Mostrar el nombre del usuario */}
      <BiUser className="header-icon" />
    </div>
    <div className="header-right"> {/* Contenedor para logout y dark mode switch */}
    <button className="logout-button" onClick={handleLogout}>
          <BiLogOut className="header-icon" />
          Logout
        </button>
      <DarkModeSwitch darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
    </div>
  </header>  
  );
};

export default Header;
