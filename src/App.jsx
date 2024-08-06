import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/Login/PrivateRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import Logout from './components/Login/Logout';
import AuthService from './services/authService';
import 'bootstrap/dist/css/bootstrap.min.css';
import GestionEmpleados from './pages/GestionEmpleados';
import AgregarEmpleado from './pages/AgregarEmpleado';
import GestionClientes from './pages/GestionClientes';
import AgregarCliente from './pages/AgregarCliente';
import GestionUsuarios from './pages/GestionUsuarios';
import AgregarUsuario from './pages/AgregarUsuario';
import GestionRolesPermisos from './pages/GestionRolesPermisos';
import VerticalLayout from './components/Layout/VerticalLayout';
import 'react-toastify/dist/ReactToastify.css';
import AgregarRolesPermisos from './pages/AgregarRolesPermisos';
import GestionVehiculos from './pages/GestionVehiculos';  // Nuevo
import AgregarVehiculo from './pages/AgregarVehiculo';    // Nuevo
import GestionMarcas from './pages/GestionMarcas';        // Nuevo
import AgregarMarca from './pages/AgregarMarca';          // Nuevo
import GestionModelos from './pages/GestionModelos';      // Nuevo
import AgregarModelo from './pages/AgregarModelo';        // Nuevo
import 'react-toastify/dist/ReactToastify.css'; 
import { ToastContainer } from 'react-toastify';  
import GestionPaquetes from './pages/GestionPaquetes';
import AgregarPaquete from './pages/AgregarPaquete';

const App = () => {
  const isAuthenticated = AuthService.getCurrentUser();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/logout" element={<Logout />} />
        
        {/* Rutas privadas envueltas con VerticalLayout */}
        <Route element={<PrivateRoute />}>
          <Route element={<VerticalLayout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/GestionEmpleados" element={<GestionEmpleados />} />
            <Route path="/AgregarEmpleado" element={<AgregarEmpleado />} />
            <Route path="/GestionClientes" element={<GestionClientes />} />
            <Route path="/AgregarCliente" element={<AgregarCliente />} />
            <Route path="/GestionUsuarios" element={<GestionUsuarios />} />
            <Route path="/AgregarUsuario" element={<AgregarUsuario />} />
            <Route path="/GestionRolesPermisos" element={<GestionRolesPermisos />} />
            <Route path="/AgregarRolesPermisos/:id" element={<AgregarRolesPermisos />} />

            {/* Rutas para el módulo de vehículos */}
            <Route path="/GestionVehiculos" element={<GestionVehiculos />} />
            <Route path="/AgregarVehiculo" element={<AgregarVehiculo />} />
            <Route path="/GestionMarcas" element={<GestionMarcas />} />
            <Route path="/AgregarMarca" element={<AgregarMarca />} />
            <Route path="/GestionModelos" element={<GestionModelos />} />
            <Route path="/AgregarModelo" element={<AgregarModelo />} />

             {/* Rutas para el módulo de paquetes */}
             <Route path="/GestionPaquetes" element={<GestionPaquetes />} />
            <Route path="/AgregarPaquete" element={<AgregarPaquete />} />
          </Route>
        </Route>
        
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />} />
      </Routes>
    </Router>
  );
};

export default App;