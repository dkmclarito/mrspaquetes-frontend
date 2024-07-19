import React from "react";
import Login from "../components/Login/Login";
import logo from "../assets/logo-dark.png";
import "../styles/Login.css";

const LoginPage = () => {
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
        <Login logo={logo} />
      </div>
    </div>
  );
};

export default LoginPage;
