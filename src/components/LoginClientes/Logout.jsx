import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../../services/authService";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    AuthService.logout();
    navigate("/cliente-login");
  }, [navigate]);

  return null;
};

export default Logout;
