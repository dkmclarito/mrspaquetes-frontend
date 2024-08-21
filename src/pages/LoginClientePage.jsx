import React from "react";
import ClienteLogin from "../components/LoginClientes/ClienteLogin";
import logo from "../assets/logo-dark.png";
import "../styles/LoginCliente.css";

const LoginClientePage = () => {
  return (
    <div className="area">
      <div className="circles">
        <ul>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
        </ul>
      </div>
      <div className="context">
        <ClienteLogin logo={logo} />
      </div>
    </div>
  );
};

export default LoginClientePage;
