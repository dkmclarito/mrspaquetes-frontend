import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLock } from "react-icons/fi";
import axios from "axios";
import "../../styles/LoginClientForm.css";

const API_URL = import.meta.env.VITE_API_URL;

const ClienteLogin = ({ logo }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${API_URL}/login-cliente`, { email, password });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        navigate("/home");
      } else {
        setError("Credenciales inválidas");
      }
    } catch (err) {
      setError("Credenciales inválidas");
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  const handleRegister = () => {
    navigate("/RegisterCliente");
  };

  return (
    <div className="client-login-form">
      <img src={logo} alt="Logo" className="logo" />
      <h2>Bienvenido/a!</h2>
      <p>Inicia sesión para acceder a tu cuenta</p>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleLogin}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Contraseña</label>
          <div className="password-input">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <span className="forgot-password" onClick={handleForgotPassword}>
            <FiLock className="password-icon" /> ¿Olvidaste tu contraseña?
          </span>
        </div>
        <button type="submit">Iniciar Sesión</button>
        <button type="button" onClick={handleRegister} className="register-button">
          ¿No estás registrado? Regístrate aquí
        </button>
      </form>
    </div>
  );
};

export default ClienteLogin;
