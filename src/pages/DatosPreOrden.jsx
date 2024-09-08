import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Container,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  FormFeedback,
  Row,
  Col,
  CardHeader,
  Nav,
  NavItem,
  NavLink,
  Progress,
} from "reactstrap";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faMapMarkerAlt,
  faBook,
  faDollarSign,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

export default function DatosPreOrden() {
  // ... (mismo código que DatosPaquete)

  const handleSubmit = async (e) => {
    e.preventDefault();
    // ... (validación)
    navigate(`/GenerarPreOrden/${idCliente}`, {
      state: {
        detalles: detalles,
        totalPrice: totalPrice,
        commonData: commonData,
      },
    });
  };

  // ... (resto del código igual que DatosPaquete)

  return (
    <Container fluid>
      <h1 className="text-center titulo-pasos">
        Agregar datos de los Paquetes para Pre-Orden
      </h1>
      {/* ... (resto del JSX igual que DatosPaquete) */}
    </Container>
  );
}
