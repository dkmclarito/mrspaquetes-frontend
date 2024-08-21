import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import AuthService from "../../services/authService";

const PrivateRoute = ({ allowedRoles }) => {
  const isAuthenticated = AuthService.getCurrentUser();
  const userRole = JSON.parse(localStorage.getItem("role"))?.role;

  if (!isAuthenticated) {
    return <Navigate to="/cliente-login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/cliente-login" replace />; // Redirige a la página de inicio si no tiene el rol adecuado
  }

  return <Outlet />;
};

export default PrivateRoute;
