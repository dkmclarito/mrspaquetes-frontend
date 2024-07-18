import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import Footer from './Footer';
import 'bootstrap/dist/css/bootstrap.min.css';
import './VerticalLayout.css';
import { BiHome, BiLogOut, BiUser, BiPlus, BiSearch, BiGroup, BiHappy, BiPackage, BiDirections, BiCar, BiShoppingBag } from 'react-icons/bi';
import logoImage from "../../assets/images/logo-dark.png";

const VerticalLayout = ({ children }) => {
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
            <NavLink to="/home" className="nav-link text-white" activeClassName="active">
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
                <NavLink to="/users/add" className="nav-link text-white" activeClassName="active">
                  <BiPlus className="nav-icon sub-icon" />
                  Agregar
                </NavLink>
              </li>
              <li>
                <NavLink to="/users/view" className="nav-link text-white" activeClassName="active">
                  <BiSearch className="nav-icon sub-icon" />
                  Ver
                </NavLink>
              </li>
            </ul>
          </li>
          <li className="nav-item">
            <div className={`nav-link text-white ${activeSubMenu === 'employees' ? 'active' : ''}`} onClick={() => handleSubMenuClick('employees')}>
              <BiGroup className="nav-icon" />
              Employees
              {activeSubMenu === 'employees' ? <BiDirections className="sub-menu-icon" /> : <BiPlus className="sub-menu-icon" />}
            </div>
            <ul className={`sub-menu ${activeSubMenu === 'employees' ? 'active' : ''}`}>
              <li>
                <NavLink to="/Employees" className="nav-link text-white" activeClassName="active">
                  <BiPlus className="nav-icon sub-icon" />
                  Agregar
                </NavLink>
              </li>
              <li>
                <NavLink to="/employees/view" className="nav-link text-white" activeClassName="active">
                  <BiSearch className="nav-icon sub-icon" />
                  Ver
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
                <NavLink to="/clients/add" className="nav-link text-white" activeClassName="active">
                  <BiPlus className="nav-icon sub-icon" />
                  Agregar
                </NavLink>
              </li>
              <li>
                <NavLink to="/clients/view" className="nav-link text-white" activeClassName="active">
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
                <NavLink to="/packages/add" className="nav-link text-white" activeClassName="active">
                  <BiPlus className="nav-icon sub-icon" />
                  Agregar
                </NavLink>
              </li>
              <li>
                <NavLink to="/packages/view" className="nav-link text-white" activeClassName="active">
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
                <NavLink to="/routes/add" className="nav-link text-white" activeClassName="active">
                  <BiPlus className="nav-icon sub-icon" />
                  Agregar
                </NavLink>
              </li>
              <li>
                <NavLink to="/routes/view" className="nav-link text-white" activeClassName="active">
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
                <NavLink to="/vehicles/add" className="nav-link text-white" activeClassName="active">
                  <BiPlus className="nav-icon sub-icon" />
                  Agregar
                </NavLink>
              </li>
              <li>
                <NavLink to="/vehicles/view" className="nav-link text-white" activeClassName="active">
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
                <NavLink to="/orders/add" className="nav-link text-white" activeClassName="active">
                  <BiPlus className="nav-icon sub-icon" />
                  Agregar
                </NavLink>
              </li>
              <li>
                <NavLink to="/orders/view" className="nav-link text-white" activeClassName="active">
                  <BiSearch className="nav-icon sub-icon" />
                  Ver
                </NavLink>
              </li>
            </ul>
          </li>
          <li className="nav-item">
            <NavLink to="/logout" className="nav-link nav-link-logout text-white" activeclassname="active">
              <BiLogOut className="nav-icon" />
              Logout
            </NavLink>
          </li>
        </ul>
      </nav>
      <div className="main-content">
        {children}
        <Footer />
      </div>
    </div>
  );
};

export default VerticalLayout;
