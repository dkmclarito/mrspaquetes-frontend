import React, { useState, useEffect } from 'react';
import { BiUser, BiLogOut } from 'react-icons/bi';
import DarkModeSwitch from './DarkModeSwitch';
import './Header.css';
import AuthService from "../../services/authService";
import { useNavigate } from 'react-router-dom';


const Header = ({ toggleDarkMode, darkMode, menuCollapsed }) => {
  const [user, setUser] = useState({});
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user')); // Obtener datos del usuario desde el Local Storage
    const userRole = JSON.parse(localStorage.getItem('role'))?.role;
    if (userData) {
      setUser(userData);
      setRole(userRole);
    }
  }, []);
  const handlePerfil = () => {
    navigate("/PerfilCliente"); // Redirigir a la página de perfil
  };

  const handleLogout = () => {
    const role = JSON.parse(localStorage.getItem("role"))?.role;
  
    AuthService.logout();
  
    if (role === "admin" || role === "acompanante" || role === "basico" || role === "conductor" || role === "operador_de_almacen" || role === "coordinador_de_rutas" || role === "atencion_al_cliente") {
      navigate("/login");
    } else {
      navigate("/clientelogin");
    }
  
    window.location.reload();
  };

  return (
    <header className={`header-container ${menuCollapsed ? 'collapsed' : ''}`}>
    <div className="header-left"> {/* Contenedor para el nombre del usuario e ícono */}
      {user && <span>{user.name}</span>} {/* Mostrar el nombre del usuario */}
      {role === 'cliente' && (
      <button className='user' onClick={handlePerfil}>
      <BiUser className="user-icon" />
      Perfil
      </button>
      )}
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
