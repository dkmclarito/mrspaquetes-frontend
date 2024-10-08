import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLock } from "react-icons/fi";
import AuthService from "../../services/authService";
import "../../styles/LoginForm.css";

const Login = ({ logo }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const token = await AuthService.login(email, password);
      if (token) {
        navigate("/LoadingPage");
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

  return (
    <div className="login-form">
      <img src={logo} alt="Logo" className="logo" />
      <h2>Bienvenido/a!</h2>
      <p>Inicia Sesión para acceder a Mr. Paquetes</p>
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
          
        </div>
        <button type="submit">Iniciar Sesión</button>
      </form>
    </div>
  );
};

export default Login;
