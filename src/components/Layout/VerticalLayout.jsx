import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import Footer from './Footer';
import Header from './Header';
import 'bootstrap/dist/css/bootstrap.min.css';
import './VerticalLayout.css';
import { BiHome, BiUser, BiGroup, BiPackage, BiDirections, BiCar, BiShoppingBag, BiShield, BiMenu} from 'react-icons/bi';
import logoImage from "../../assets/images/logo-dark.png";

const VerticalLayout = () => {
  // Recuperar el estado del modo oscuro y el menú colapsado desde localStorage
  const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem('darkMode')) || false);
  const [menuCollapsed, setMenuCollapsed] = useState(() => JSON.parse(localStorage.getItem('menuCollapsed')) || false);

  // Guardar el estado en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('menuCollapsed', JSON.stringify(menuCollapsed));
  }, [menuCollapsed]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleMenuToggle = () => {
    setMenuCollapsed(!menuCollapsed);
  };

  return (
    <div className={`vertical-layout ${darkMode ? 'dark-mode' : ''}`}>
      <Header toggleDarkMode={toggleDarkMode} darkMode={darkMode} menuCollapsed={menuCollapsed} handleMenuToggle={handleMenuToggle} />
      <div className="menu-container">
        <nav className={`vertical-nav fondo text-white ${menuCollapsed ? 'menu-collapsed' : 'menu-expanded'}`}>
          <div className="p-3">
          <button className="menu-toggle" onClick={handleMenuToggle}>
        <BiMenu />
      </button>
            <img
              src={logoImage}
              alt="Logo"
              className={`logo-img ${menuCollapsed ? 'logo-collapsed' : 'logo-expanded'}`}
              
            />
          </div>
          <ul className={`nav flex-column ${menuCollapsed ? 'icons-only' : ''}`}>
            <li className="nav-item">
              <NavLink to="/home" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <BiHome className="nav-icon" />
                {!menuCollapsed && 'Inicio'}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/GestionUsuarios" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <BiUser className="nav-icon" />
                {!menuCollapsed && 'Usuarios'}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/GestionEmpleados" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <BiGroup className="nav-icon" />
                {!menuCollapsed && 'Empleados'}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/GestionClientes" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <BiGroup className="nav-icon" />
                {!menuCollapsed && 'Clientes'}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/GestionPaquetes" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <BiPackage className="nav-icon" />
                {!menuCollapsed && 'Paquetes'}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/rutas" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <BiDirections className="nav-icon" />
                {!menuCollapsed && 'Rutas'}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/vehiculos" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <BiCar className="nav-icon" />
                {!menuCollapsed && 'Vehículos'}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/AgregarRutasPermisos" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <BiShield className="nav-icon" />
                {!menuCollapsed && 'Roles y permisos'}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/historial" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <BiShoppingBag className="nav-icon" />
                {!menuCollapsed && 'Historial'}
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
      <div className={`main-content ${menuCollapsed ? 'collapsed' : ''}`}>
        <Outlet />
      </div>
      <Footer menuCollapsed={menuCollapsed} />
    </div>
  );
};

export default VerticalLayout;
