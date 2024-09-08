import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  FormFeedback,
  Nav,
  NavItem,
  NavLink,
  Progress,
} from "reactstrap";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faMapMarkerAlt,
  faBook,
  faDollarSign,
} from "@fortawesome/free-solid-svg-icons";
import Breadcrumbs from "../components/Empleados/Common/Breadcrumbs";
import AuthService from "../services/authService";

const API_URL = import.meta.env.VITE_API_URL;

export default function GenerarPreOrden() {
  // ... (mismo código que GenerarOrden)

  const handleSubmit = async (e) => {
    e.preventDefault();
    // ... (validación y preparación de datos)
    try {
      const token = AuthService.getCurrentUser();
      await updateAddress();

      const orderData = {
        ...formData,
        tipo_orden: "preorden", // Cambiado a preorden
      };

      console.log("Datos enviados a la API:", orderData);

      const response = await axios.post(`${API_URL}/ordenes`, orderData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Respuesta de la API:", response.data);

      toast.success("Pre-orden registrada con éxito", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      navigate(`/GestionPreOrdenes`);
    } catch (error) {
      console.error("Error al registrar la pre-orden:", error);
      toast.error(
        "Error al registrar la pre-orden: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  // ... (resto del código igual que GenerarOrden)

  return (
    <div className="page-content">
      <Container fluid>
        <h1 className="text-center titulo-pasos">Detalles de Pre-Orden</h1>
        {/* ... (resto del JSX igual que GenerarOrden) */}
      </Container>
    </div>
  );
}
