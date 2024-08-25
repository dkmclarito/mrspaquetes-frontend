import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/Login/PrivateRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import LoginClientePage from './pages/LoginClientePage';
import RegisterCliente from './pages/RegisterCliente';
import Logout from './components/Login/Logout';
import AuthService from './services/authService';
import 'bootstrap/dist/css/bootstrap.min.css';
import GestionEmpleados from './pages/GestionEmpleados';
import AgregarEmpleado from './pages/AgregarEmpleado';
import DetallesEmpleado from './pages/DetallesEmpleado';
import GestionClientes from './pages/GestionClientes';
import AgregarCliente from './pages/AgregarCliente';
import DetallesCliente from './pages/DetallesCliente';
import AgregarDatos from './pages/PerfilCliente';
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
import EmailVerification from './pages/EmailVerification';
import ForgetPassword from './components/LoginClientes/ForgetPassword'; // Nuevo: Importación de ForgetPassword
import ResetPassword from './components/LoginClientes/ResetPassword';   // Nuevo: Importación de ResetPassword
import DataUsuario from './pages/DataUsuario';

const App = () => {
  const isAuthenticated = AuthService.getCurrentUser();

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/clientelogin" element={<LoginClientePage />} />
          <Route path="/registercliente" element={<RegisterCliente />} />
          <Route path="/email-verification" element={<EmailVerification />} />
          <Route path="/logout" element={<Logout />} />

          {/* Nuevas rutas para "Olvidé mi contraseña" y "Restablecer contraseña" */}
          <Route path="/forget-password" element={<ForgetPassword />} /> 
          <Route path="/reset-password" element={<ResetPassword />} /> 

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
                <Route path="/DetallesEmpleado/:id" element={<DetallesEmpleado />} />
                <Route path="/GestionClientes" element={<GestionClientes />} />
                <Route path="/AgregarCliente" element={<AgregarCliente />} />
                <Route path="/DetallesCliente/:id" element={<DetallesCliente />} />
                <Route path="/GestionVehiculos" element={<GestionVehiculos />} />
                <Route path="/AgregarVehiculo" element={<AgregarVehiculo />} />
                <Route path="/GestionMarcas" element={<GestionMarcas />} />
                <Route path="/AgregarMarca" element={<AgregarMarca />} />
                <Route path="/GestionModelos" element={<GestionModelos />} />
                <Route path="/AgregarModelo" element={<AgregarModelo />} />
                <Route path="/DataUsuario/:id" element={<DataUsuario />} />


              </Route>

              {/* Rutas para 'conductor' */}
              <Route element={<PrivateRoute allowedRoles={['admin', 'conductor', 'cliente']} />}>
                <Route path="/GestionPaquetes" element={<GestionPaquetes />} />
                <Route path="/AgregarPaquete" element={<AgregarPaquete />} />
                {/* Aquí van las rutas adicionales */}
              </Route>
              
               {/* Rutas para 'cliente' */}
              <Route element={<PrivateRoute allowedRoles={['cliente']} />}>
                <Route path="/PerfilCliente" element={<AgregarDatos />} />
                {/* Aquí van las rutas adicionales */}
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
