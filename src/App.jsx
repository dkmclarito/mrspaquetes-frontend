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
import GestionVehiculos from './pages/GestionVehiculos';  
import AgregarVehiculo from './pages/AgregarVehiculo';    
import GestionMarcas from './pages/GestionMarcas';        
import AgregarMarca from './pages/AgregarMarca';          
import GestionModelos from './pages/GestionModelos';      
import AgregarModelo from './pages/AgregarModelo';        
import GestionPaquetes from './pages/GestionPaquetes';
import AgregarPaquete from './pages/AgregarPaquete';
import { ToastContainer } from 'react-toastify';  
import { AuthProvider } from './services/AuthContext';

const App = () => {
  const isAuthenticated = AuthService.getCurrentUser();

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/logout" element={<Logout />} />

          {/* Rutas privadas con VerticalLayout */}
          <Route element={<PrivateRoute allowedRoles={['admin', 'conductor', 'cliente']} />}>
            <Route element={<VerticalLayout />}>
            <Route path="/home" element={<HomePage />} />
              {/* Rutas específicas para 'admin' */}
              <Route element={<PrivateRoute allowedRoles={['admin']} />}>
                <Route path="/GestionUsuarios" element={<GestionUsuarios />} />
                <Route path="/AgregarUsuario" element={<AgregarUsuario />} />
                <Route path="/GestionRolesPermisos" element={<GestionRolesPermisos />} />
                <Route path="/AgregarRolesPermisos/:id" element={<AgregarRolesPermisos />} />
                <Route path="/GestionEmpleados" element={<GestionEmpleados />} />
                <Route path="/AgregarEmpleado" element={<AgregarEmpleado />} />
                <Route path="/GestionClientes" element={<GestionClientes />} />
                <Route path="/AgregarCliente" element={<AgregarCliente />} />
                <Route path="/GestionVehiculos" element={<GestionVehiculos />} />
                <Route path="/AgregarVehiculo" element={<AgregarVehiculo />} />
                <Route path="/GestionMarcas" element={<GestionMarcas />} />
                <Route path="/AgregarMarca" element={<AgregarMarca />} />
                <Route path="/GestionModelos" element={<GestionModelos />} />
                <Route path="/AgregarModelo" element={<AgregarModelo />} />
              </Route>

              {/* Rutas para 'conductor' */}
              <Route element={<PrivateRoute allowedRoles={['admin','conductor','cliente']} />}>
                <Route path="/GestionPaquetes" element={<GestionPaquetes />} />
                <Route path="/AgregarPaquete" element={<AgregarPaquete />} />

                {/*AQUI RUTAS */}
              </Route>              
            </Route>
          </Route>

          <Route path="/" element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />} />
          <Route path="*" element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />} />
        </Routes>
      </AuthProvider>
      <ToastContainer />
    </Router>
  );
};

export default App;
