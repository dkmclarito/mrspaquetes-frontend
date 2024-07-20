import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import Footer from './Footer';
import Header from './Header'; // Importa el Header

import 'bootstrap/dist/css/bootstrap.min.css';
import './VerticalLayout.css';
import { BiHome, BiLogOut, BiUser, BiGroup, BiPackage, BiDirections, BiCar, BiShoppingBag } from 'react-icons/bi';
import logoImage from "../../assets/images/logo-dark.png";

const VerticalLayout = () => {
  return (
    <div className="d-flex vertical-layout">
      <Header />
      <nav className="vertical-nav fondo text-white">
      
        <div className=" p-3">
          <img src={logoImage} alt="Logo" className="logo-img" />
        </div>
        <ul className="nav flex-column">
          <li className="nav-item">
            <NavLink to="/home" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <BiHome className="nav-icon" />
              Inicio
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/GestionUsuarios" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <BiUser className="nav-icon" />
              Usuarios
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/GestionEmpleados" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <BiGroup className="nav-icon" />
              Empleados
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/GestionClientes" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <BiGroup className="nav-icon" />
              Clientes
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/GestionPaquetes" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <BiPackage className="nav-icon" />
              Paquetes
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/rutas" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <BiDirections className="nav-icon" />
              Rutas
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/vehiculos" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <BiCar className="nav-icon" />
              Vehículos
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/historial" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <BiShoppingBag className="nav-icon" />
              Historial
            </NavLink>
          </li>
          <li className="nav-item mt-auto">
            <NavLink to="/logout" className="nav-link">
              <BiLogOut className="nav-icon" />
              Logout
            </NavLink>
          </li>
        </ul>
      </nav>
      <div className="main-content p-4">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default VerticalLayout;
