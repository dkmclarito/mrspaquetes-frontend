import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import Footer from './Footer';
import 'bootstrap/dist/css/bootstrap.min.css';
import './VerticalLayout.css';
import { BiHome, BiLogOut, BiUser, BiPlus, BiSearch, BiGroup, BiHappy, BiPackage, BiDirections, BiCar, BiShoppingBag } from 'react-icons/bi';
import logoImage from "../../assets/images/logo-dark.png";

const VerticalLayout = () => {
  const [activeSubMenu, setActiveSubMenu] = useState(null);

  const handleSubMenuClick = (subMenuName) => {
    setActiveSubMenu(activeSubMenu === subMenuName ? null : subMenuName);
  };

  return (
    <div className="d-flex vertical-layout">
      <nav className="vertical-nav bg-dark text-white">
        <div className="header p-3">
          <img src={logoImage} alt="Logo" className="logo-img" />
        </div>
        <ul className="nav flex-column">
          <li className="nav-item">
            <NavLink to="/home" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <BiHome className="nav-icon" />
              Home
            </NavLink>
          </li>
          <li className="nav-item">
            <div className={`nav-link text-white ${activeSubMenu === 'users' ? 'active' : ''}`} onClick={() => handleSubMenuClick('users')}>
              <BiUser className="nav-icon" />
              Users
              {activeSubMenu === 'users' ? <BiDirections className="sub-menu-icon" /> : <BiPlus className="sub-menu-icon" />}
            </div>
            <ul className={`sub-menu ${activeSubMenu === 'users' ? 'active' : ''}`}>
              <li>
                <NavLink to="/users/add" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                  <BiPlus className="nav-icon sub-icon" />
                  Agregar
                </NavLink>
              </li>
              <li>
                <NavLink to="/users/view" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                  <BiSearch className="nav-icon sub-icon" />
                  Ver
                </NavLink>
              </li>
            </ul>
          </li>
          <li className="nav-item">
            <div className={`nav-link text-white ${activeSubMenu === 'employees' ? 'active' : ''}`} onClick={() => handleSubMenuClick('employees')}>
              <BiGroup className="nav-icon" />
              Empleados
              {activeSubMenu === 'employees' ? <BiDirections className="sub-menu-icon" /> : <BiPlus className="sub-menu-icon" />}
            </div>
            <ul className={`sub-menu ${activeSubMenu === 'employees' ? 'active' : ''}`}>
              <li>
                <NavLink to="/GestionEmpleados" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                  <BiGroup className="nav-icon sub-icon" />
                  Gestión Empleados
                </NavLink>
              </li>
            </ul>
          </li>
          <li className="nav-item">
            <div className={`nav-link text-white ${activeSubMenu === 'clients' ? 'active' : ''}`} onClick={() => handleSubMenuClick('clients')}>
              <BiHappy className="nav-icon" />
              Clients
              {activeSubMenu === 'clients' ? <BiDirections className="sub-menu-icon" /> : <BiPlus className="sub-menu-icon" />}
            </div>
            <ul className={`sub-menu ${activeSubMenu === 'clients' ? 'active' : ''}`}>
              <li>
                <NavLink to="/clients/add" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                  <BiPlus className="nav-icon sub-icon" />
                  Agregar
                </NavLink>
              </li>
              <li>
                <NavLink to="/clients/view" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                  <BiSearch className="nav-icon sub-icon" />
                  Ver
                </NavLink>
              </li>
            </ul>
          </li>
          <li className="nav-item">
            <div className={`nav-link text-white ${activeSubMenu === 'packages' ? 'active' : ''}`} onClick={() => handleSubMenuClick('packages')}>
              <BiPackage className="nav-icon" />
              Packages
              {activeSubMenu === 'packages' ? <BiDirections className="sub-menu-icon" /> : <BiPlus className="sub-menu-icon" />}
            </div>
            <ul className={`sub-menu ${activeSubMenu === 'packages' ? 'active' : ''}`}>
              <li>
                <NavLink to="/packages/add" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                  <BiPlus className="nav-icon sub-icon" />
                  Agregar
                </NavLink>
              </li>
              <li>
                <NavLink to="/packages/view" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                  <BiSearch className="nav-icon sub-icon" />
                  Ver
                </NavLink>
              </li>
            </ul>
          </li>
          <li className="nav-item">
            <div className={`nav-link text-white ${activeSubMenu === 'routes' ? 'active' : ''}`} onClick={() => handleSubMenuClick('routes')}>
              <BiDirections className="nav-icon" />
              Routes
              {activeSubMenu === 'routes' ? <BiDirections className="sub-menu-icon" /> : <BiPlus className="sub-menu-icon" />}
            </div>
            <ul className={`sub-menu ${activeSubMenu === 'routes' ? 'active' : ''}`}>
              <li>
                <NavLink to="/routes/add" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                  <BiPlus className="nav-icon sub-icon" />
                  Agregar
                </NavLink>
              </li>
              <li>
                <NavLink to="/routes/view" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                  <BiSearch className="nav-icon sub-icon" />
                  Ver
                </NavLink>
              </li>
            </ul>
          </li>
          <li className="nav-item">
            <div className={`nav-link text-white ${activeSubMenu === 'vehicles' ? 'active' : ''}`} onClick={() => handleSubMenuClick('vehicles')}>
              <BiCar className="nav-icon" />
              Vehicles
              {activeSubMenu === 'vehicles' ? <BiDirections className="sub-menu-icon" /> : <BiPlus className="sub-menu-icon" />}
            </div>
            <ul className={`sub-menu ${activeSubMenu === 'vehicles' ? 'active' : ''}`}>
              <li>
                <NavLink to="/vehicles/add" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                  <BiPlus className="nav-icon sub-icon" />
                  Agregar
                </NavLink>
              </li>
              <li>
                <NavLink to="/vehicles/view" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                  <BiSearch className="nav-icon sub-icon" />
                  Ver
                </NavLink>
              </li>
            </ul>
          </li>
          <li className="nav-item">
            <div className={`nav-link text-white ${activeSubMenu === 'orders' ? 'active' : ''}`} onClick={() => handleSubMenuClick('orders')}>
              <BiShoppingBag className="nav-icon" />
              Orders              
              {activeSubMenu === 'orders' ? <BiDirections className="sub-menu-icon" /> : <BiPlus className="sub-menu-icon" />}
            </div>
            <ul className={`sub-menu ${activeSubMenu === 'orders' ? 'active' : ''}`}>
              <li>
                <NavLink to="/orders/add" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                  <BiPlus className="nav-icon sub-icon" />
                  Agregar
                </NavLink>
              </li>
              <li>
                <NavLink to="/orders/view" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                  <BiSearch className="nav-icon sub-icon" />
                  Ver
                </NavLink>
              </li>
            </ul>
          </li>
          <li className="nav-item">
            <NavLink to="/logout" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <BiLogOut className="nav-icon" />
              Logout
            </NavLink>
          </li>
        </ul>
      </nav>
      <div className="main-content">
        <Outlet />
        <Footer />
      </div>
    </div>
  );
};

export default VerticalLayout;
