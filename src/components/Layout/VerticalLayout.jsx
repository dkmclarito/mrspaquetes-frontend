import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import Footer from './Footer';
import Header from './Header';
import 'bootstrap/dist/css/bootstrap.min.css';
import './VerticalLayout.css';
import { BiHome, BiUser, BiReceipt, BiGroup, BiPackage, BiBuilding, BiDirections, BiCar, BiShield, BiShoppingBag, BiMenu, BiPlus, BiMap } from 'react-icons/bi';
import logoImage from "../../assets/logo-menu.png";
import { useAuth } from '../../services/AuthContext';

const VerticalLayout = () => {
  const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem('darkMode')) || false);
  const [menuCollapsed, setMenuCollapsed] = useState(() => JSON.parse(localStorage.getItem('menuCollapsed')) || false);
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const [visibleSubMenu, setVisibleSubMenu] = useState(null);
  const [shouldReload, setShouldReload] = useState(true);
  const { user, loading } = useAuth();
  const location = useLocation();
  const menuRef = useRef(null); // Referencia al contenedor del menú

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

  useEffect(() => {
    // Determine which menu should be active based on the current route
    if (location.pathname.includes('/GestionOrdenes') || location.pathname.includes('/GestionPaquetes')) {
      setActiveSubMenu('ordenes');
      setVisibleSubMenu(null);
    } else if (location.pathname.includes('/GestionMarcas') || location.pathname.includes('/GestionModelos') || location.pathname.includes('/GestionVehiculos')) {
      setActiveSubMenu('vehicles');
      setVisibleSubMenu(null);
    } else {
      setActiveSubMenu(null);
      setVisibleSubMenu(null);
    }
  }, [location]);

  useEffect(() => {
    // Manejo de clics fuera del menú
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        if (!menuCollapsed) {
          setMenuCollapsed(true);
          setVisibleSubMenu(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuCollapsed]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleMenuToggle = () => {
    setMenuCollapsed(!menuCollapsed);
    if (!menuCollapsed) {
      setVisibleSubMenu(null);
    }
  };

  const handleSubMenuClick = (subMenuName) => {
    if (menuCollapsed) {
      setActiveSubMenu(subMenuName);
      setVisibleSubMenu(subMenuName);
      setMenuCollapsed(false);
    } else {
      if (activeSubMenu === subMenuName) {
        setVisibleSubMenu(prev => prev === subMenuName ? null : subMenuName);
      } else {
        setActiveSubMenu(subMenuName);
        setVisibleSubMenu(subMenuName);
      }
    }
  };

  const hasRole = (role) => {
    return user && user.role === role;
  };

  return (
    <div className={`vertical-layout ${darkMode ? 'dark-mode' : ''}`}>
      <Header toggleDarkMode={toggleDarkMode} darkMode={darkMode} menuCollapsed={menuCollapsed} handleMenuToggle={handleMenuToggle} />
      <div className="menu-container" ef={menuRef}>
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
                {!menuCollapsed && <span>Inicio</span>}
              </NavLink>
            </li>

            {hasRole('admin') && (
              <>
                <li className="nav-item">
                  <NavLink to="/GestionUsuarios" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    <BiUser className="nav-icon" />
                    {!menuCollapsed && <span>Usuarios</span>}
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/GestionEmpleados" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    <BiGroup className="nav-icon" />
                    {!menuCollapsed && <span>Empleados</span>}
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/GestionClientes" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    <BiGroup className="nav-icon" />
                    {!menuCollapsed && <span>Clientes</span>}
                  </NavLink>
                </li>

                {/* Submenu for Ordenes */}
                <li className="nav-item">
                  <div
                    className={`nav-link text-white ${activeSubMenu === 'ordenes' ? 'active' : ''}`}
                    onClick={() => handleSubMenuClick('ordenes')}
                  >
                    <BiReceipt className="nav-icon" />
                    {(!menuCollapsed || visibleSubMenu === 'ordenes') && <span>Ordenes</span>}
                    {visibleSubMenu === 'ordenes' ? <BiDirections className="sub-menu-icon" /> : <BiPlus className="sub-menu-icon" />}
                  </div>
                  <ul className={`sub-menu ${visibleSubMenu === 'ordenes' ? 'active' : ''}`}>
                    <li>
                      <NavLink
                        to="/GestionOrdenes"
                        className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                      >
                        <BiPlus className="nav-icon sub-icon" />
                        Ordenes
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/GestionPaquetes"
                        className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                      >
                        <BiPlus className="nav-icon sub-icon" />
                        Paquetes
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/TrackingPage"
                        className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                      >
                        <BiPlus className="nav-icon sub-icon" />
                        Tracking
                      </NavLink>
                    </li>
                    
                    {/* <li>
                      <NavLink 
                        to="/GestionPaquetes" 
                        className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                      >
                        <BiPlus className="nav-icon sub-icon" />
                        Historial de Paquetes
                      </NavLink>
                    </li> */}
                  </ul>
                </li>

                <li className="nav-item">
                  <NavLink to="/GestionRutas" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    <BiMap className="nav-icon" />
                    {!menuCollapsed && <span>Rutas</span>}
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink to="/GestionBodegas" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    <BiBuilding className="nav-icon" />
                    {!menuCollapsed && <span>Bodegas</span>}
                  </NavLink>
                </li>

                {/* Submenu for Vehículos */}
                <li className="nav-item">
                  <div
                    className={`nav-link text-white ${activeSubMenu === 'vehicles' ? 'active' : ''}`}
                    onClick={() => handleSubMenuClick('vehicles')}
                  >
                    <BiCar className="nav-icon" />
                    {(!menuCollapsed || visibleSubMenu === 'vehicles') && <span>Vehículos</span>}
                    {visibleSubMenu === 'vehicles' ? <BiDirections className="sub-menu-icon" /> : <BiPlus className="sub-menu-icon" />}
                  </div>
                  <ul className={`sub-menu ${visibleSubMenu === 'vehicles' ? 'active' : ''}`}>
                    <li>
                      <NavLink
                        to="/GestionMarcas"
                        className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                      >
                        <BiPlus className="nav-icon sub-icon" />
                        Marcas
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/GestionModelos"
                        className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                      >
                        <BiPlus className="nav-icon sub-icon" />
                        Modelos
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/GestionVehiculos"
                        className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                      >
                        <BiPlus className="nav-icon sub-icon" />
                        Vehículos
                      </NavLink>
                    </li>
                  </ul>
                </li>

                <li className="nav-item">
                  <NavLink to="/GestionRolesPermisos" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    <BiShield className="nav-icon" />
                    {!menuCollapsed && <span>Roles y permisos</span>}
                  </NavLink>
                </li>
              </>
            )}

            {hasRole('conductor') && (
              <>
                <li className="nav-item">
                  <NavLink to="/GestionPaquetes" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    <BiPackage className="nav-icon" />
                    {!menuCollapsed && <span>Paquetes</span>}
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/rutas" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    <BiMap className="nav-icon" />
                    {!menuCollapsed && <span>Rutas</span>}
                  </NavLink>
                </li>
              </>
            )}

            {hasRole('cliente') && (
              <li className="nav-item">
                <NavLink to="/GestionPaquetes" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
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
      <Footer menuCollapsed={menuCollapsed} />
    </div>
  );
};

export default VerticalLayout;