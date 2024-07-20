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
import VerticalLayout from './components/Layout/VerticalLayout'; 

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
          </Route>
        </Route>
        
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />} />
      </Routes>
    </Router>
  );
};

export default App;
