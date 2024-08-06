import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import Footer from './Footer';
import Header from './Header';
import 'bootstrap/dist/css/bootstrap.min.css';
import './VerticalLayout.css';
import { BiHome, BiUser, BiGroup, BiPackage, BiDirections, BiCar, BiShoppingBag, BiShield, BiMenu } from 'react-icons/bi';
import logoImage from "../../assets/images/logo-dark.png";

const VerticalLayout = () => {
  const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem('darkMode')) || false);
  const [menuCollapsed, setMenuCollapsed] = useState(() => JSON.parse(localStorage.getItem('menuCollapsed')) || false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
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
                {!menuCollapsed && <span>Inicio</span>}
              </NavLink>
            </li>
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
            <li className="nav-item">
              <NavLink to="/GestionPaquetes" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <BiPackage className="nav-icon" />
                {!menuCollapsed && <span>Paquetes</span>}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/rutas" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <BiDirections className="nav-icon" />
                {!menuCollapsed && <span>Rutas</span>}
              </NavLink>
            </li>
            <li className="nav-item">
              <Dropdown nav isOpen={dropdownOpen} toggle={toggleDropdown}>
                <DropdownToggle nav caret>
                  <BiCar className="nav-icon" />
                  {!menuCollapsed && <span>Vehículos</span>}
                </DropdownToggle>
                <DropdownMenu className={dropdownOpen ? 'dropdown-expanded' : ''}>
                  <DropdownItem>
                    <NavLink to="/GestionMarcas" className="dropdown-item">
                      Marcas
                    </NavLink>
                  </DropdownItem>
                  <DropdownItem>
                    <NavLink to="/GestionModelos" className="dropdown-item">
                      Modelos
                    </NavLink>
                  </DropdownItem>
                  <DropdownItem>
                    <NavLink to="/GestionVehiculos" className="dropdown-item">
                      Vehículos
                    </NavLink>
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </li>
            <li className="nav-item">
              <NavLink to="/GestionRolesPermisos" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <BiShield className="nav-icon" />
                {!menuCollapsed && <span>Roles y permisos</span>}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/historial" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <BiShoppingBag className="nav-icon" />
                {!menuCollapsed && <span>Historial</span>}
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
      <div className={`main-content ${menuCollapsed ? 'collapsed' : ''} ${dropdownOpen ? 'dropdown-open' : ''}`}>
        <Outlet />
      </div>
      <Footer menuCollapsed={menuCollapsed} />
    </div>
  );
};

export default VerticalLayout;
