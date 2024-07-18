import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import VerticalLayout from './components/Layout/VerticalLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import Logout from './components/Logout';
import AuthService from './services/authService';
import EmployeesPage from './pages/EmployeesPage';
import PrivateRoute from './components/PrivateRoute';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  const isAuthenticated = AuthService.getCurrentUser();

   return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/logout" element={<Logout />} />
        {isAuthenticated ? (
          
          <Route path="*" element={            
            <VerticalLayout>
              
              <Routes>
                
                <Route path="/home" element={<HomePage />} />
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/Employees" element={<EmployeesPage />} />
              </Routes>
            </VerticalLayout>
          } />
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </Router>
  );
};

export default App;
