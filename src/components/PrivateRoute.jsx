// components/PrivateRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthService from '../services/authService';

const PrivateRoute = () => {
  const isAuthenticated = AuthService.getCurrentUser();

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
