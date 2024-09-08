import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Input,
  Label,
  Nav,
  NavItem,
  NavLink,
  Progress,
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Breadcrumbs from "../components/Empleados/Common/Breadcrumbs";
import TablaSeleccionCliente from "../components/Ordenes/TablaSeleccionCliente";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faMapMarkerAlt,
  faBook,
  faDollarSign,
} from "@fortawesome/free-solid-svg-icons";
import Pagination from "react-js-pagination";

const API_URL = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 10;

export default function PreOrdenesSeleccionarCliente() {
  // ... (mismo código que OrdenesSeleccionarCliente)

  const generarPreOrden = (clienteId) => {
    navigate(`/PreOrdenesDirecciones/${clienteId}`);
  };

  // ... (resto del código igual que OrdenesSeleccionarCliente)

  return (
    <div className="page-content">
      <Container fluid>
        <h1 className="text-center titulo-pasos">
          Seleccionar Cliente para Pre-Orden
        </h1>
        {/* ... (resto del JSX igual que OrdenesSeleccionarCliente) */}
        <TablaSeleccionCliente
          clientes={paginatedClientes}
          tipoPersona={tipoPersona}
          generarOrden={generarPreOrden}
        />
        {/* ... */}
      </Container>
    </div>
  );
}
