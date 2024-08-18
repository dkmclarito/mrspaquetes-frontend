import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import Footer from './Footer';
import Header from './Header';
import 'bootstrap/dist/css/bootstrap.min.css';
import './VerticalLayout.css';
import { BiHome, BiUser, BiGroup, BiPackage, BiDirections, BiCar, BiShield, BiShoppingBag, BiMenu, BiPlus } from 'react-icons/bi';
import logoImage from "../../assets/logo-oscuro.png";
import { useAuth } from '../../services/AuthContext';

const VerticalLayout = () => {
  const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem('darkMode')) || false);
  const [menuCollapsed, setMenuCollapsed] = useState(() => JSON.parse(localStorage.getItem('menuCollapsed')) || false);
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const [selectedSubMenuItem, setSelectedSubMenuItem] = useState(null);
  const [shouldReload, setShouldReload] = useState(true);
  const { user, loading } = useAuth();

  useEffect(() => {
    if (shouldReload && !loading) {
      window.location.reload();
    }
    setShouldReload(false);
  }, [loading, shouldReload]);

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

  const handleSubMenuClick = (subMenuName) => {
    setActiveSubMenu(prev => (prev === subMenuName ? null : subMenuName));
  };

  const handleSubMenuItemClick = (item) => {
    setSelectedSubMenuItem(item);
    setActiveSubMenu(null);
  };

  const handleMenuItemClick = () => {
    setActiveSubMenu(null);
    setSelectedSubMenuItem(null);
  };

  const hasRole = (role) => {
    return user && user.role === role;
  };

  //console.log('Usuario:', user);
  //console.log('Tiene rol de admin:', hasRole('admin'));

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
              <NavLink to="/home" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={handleMenuItemClick}>
                <BiHome className="nav-icon" />
                {!menuCollapsed && <span>Inicio</span>}
              </NavLink>
            </li>

            {hasRole('admin') && (
              <>
                <li className="nav-item">
                  <NavLink to="/GestionUsuarios" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={handleMenuItemClick}>
                    <BiUser className="nav-icon" />
                    {!menuCollapsed && <span>Usuarios</span>}
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/GestionEmpleados" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={handleMenuItemClick}>
                    <BiGroup className="nav-icon" />
                    {!menuCollapsed && <span>Empleados</span>}
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/GestionClientes" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={handleMenuItemClick}>
                    <BiGroup className="nav-icon" />
                    {!menuCollapsed && <span>Clientes</span>}
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/GestionPaquetes" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={handleMenuItemClick}>
                    <BiPackage className="nav-icon" />
                    {!menuCollapsed && <span>Paquetes</span>}
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/rutas" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={handleMenuItemClick}>
                    <BiDirections className="nav-icon" />
                    {!menuCollapsed && <span>Rutas</span>}
                  </NavLink>
                </li>

                {/* Submenu for Vehículos */}
                <li className="nav-item">
                  <div
                    className={`nav-link text-white ${activeSubMenu === 'vehicles' || selectedSubMenuItem ? 'active' : ''}`} 
                    onClick={() => handleSubMenuClick('vehicles')}
                  >
                    <BiCar className="nav-icon" />
                    {!menuCollapsed && <span>Vehículos</span>}
                    {activeSubMenu === 'vehicles' ? <BiDirections className="sub-menu-icon" /> : <BiPlus className="sub-menu-icon" />}
                  </div>
                  <ul className={`sub-menu ${activeSubMenu === 'vehicles' ? 'active' : ''}`}>
                    <li>
                      <NavLink 
                        to="/GestionMarcas" 
                        className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                        onClick={() => handleSubMenuItemClick('Marcas')}
                      >
                        <BiPlus className="nav-icon sub-icon" />
                        Marcas
                      </NavLink>
                    </li>
                    <li>
                      <NavLink 
                        to="/GestionModelos" 
                        className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                        onClick={() => handleSubMenuItemClick('Modelos')}
                      >
                        <BiPlus className="nav-icon sub-icon" />
                        Modelos
                      </NavLink>
                    </li>
                    <li>
                      <NavLink 
                        to="/GestionVehiculos" 
                        className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                        onClick={() => handleSubMenuItemClick('Vehículos')}
                      >
                        <BiPlus className="nav-icon sub-icon" />
                        Vehículos
                      </NavLink>
                    </li>
                  </ul>
                </li>

                <li className="nav-item">
                  <NavLink to="/GestionRolesPermisos" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={handleMenuItemClick}>
                    <BiShield className="nav-icon" />
                    {!menuCollapsed && <span>Roles y permisos</span>}
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/historial" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={handleMenuItemClick}>
                    <BiShoppingBag className="nav-icon" />
                    {!menuCollapsed && <span>Historial</span>}
                  </NavLink>
                </li>
              </>
            )}

            {hasRole('conductor') && (
              <>
                <li className="nav-item">
                  <NavLink to="/GestionPaquetes" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={handleMenuItemClick}>
                    <BiPackage className="nav-icon" />
                    {!menuCollapsed && <span>Paquetes</span>}
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/rutas" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={handleMenuItemClick}>
                    <BiDirections className="nav-icon" />
                    {!menuCollapsed && <span>Rutas</span>}
                  </NavLink>
                </li>
              </>
            )}

            {hasRole('cliente') && (
              <li className="nav-item">
                <NavLink to="/GestionPaquetes" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={handleMenuItemClick}>
                  <BiPackage className="nav-icon" />
                  {!menuCollapsed && <span>Paquetes</span>}
                </NavLink>
              </li>
            )}
          </ul>
        </nav>
      </div>
      <div className={`main-content ${menuCollapsed ? 'collapsed' : ''}`}>
        <Outlet />
      </div>
      <Footer menuCollapsed={menuCollapsed}/>
    </div>
  );
};

export default VerticalLayout;
