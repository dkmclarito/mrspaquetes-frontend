import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  CardBody,
  Row,
  Col,
  Button,
  Table,
  Input,
  Label,
  FormGroup,
  Nav,
  NavItem,
  NavLink,
  Progress,
} from "reactstrap";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faMapMarkerAlt,
  faBook,
  faDollarSign,
} from "@fortawesome/free-solid-svg-icons";
import Breadcrumbs from "../components/Empleados/Common/Breadcrumbs";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default function PreOrdenesDirecciones() {
  // ... (mismo código que OrdenesDirecciones)

  const handleContinuar = () => {
    if (selectedDireccion) {
      localStorage.setItem(
        "selectedAddress",
        JSON.stringify(selectedDireccion)
      );
      localStorage.setItem("clienteData", JSON.stringify(cliente));
      navigate(`/DatosPreOrden/${idCliente}`);
    } else {
      toast.warn("Por favor, seleccione una dirección antes de continuar");
    }
  };

  // ... (resto del código igual que OrdenesDirecciones)

  return (
    <Container fluid>
      <h1 className="text-center titulo-pasos">
        Seleccionar Dirección para Pre-Orden
      </h1>
      {/* ... (resto del JSX igual que OrdenesDirecciones) */}
    </Container>
  );
}
