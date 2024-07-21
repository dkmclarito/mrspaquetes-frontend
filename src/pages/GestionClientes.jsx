import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, Card, CardBody, Input, Label, Button } from "reactstrap";
import { Link } from "react-router-dom";
import Breadcrumbs from "../components/Clientes/Common/Breadcrumbs";
import TablaClientes from "../components/Clientes/TablaClientes";
import ModalEditarCliente from "../components/Clientes/ModalEditarCliente";
import ModalConfirmarEliminar from "../components/Clientes/ModalConfirmarEliminar";
import AuthService from "../services/authService";
import "../styles/Clientes.css";
import Pagination from 'react-js-pagination';

const API_URL = import.meta.env.VITE_API_URL;

// Define el mapeo de tipos de persona
const TIPO_PERSONA = {
  1: 'Persona Natural',
  2: 'Persona Jurídica'
};

const ITEMS_PER_PAGE = 5;

const GestionClientes = () => {
  document.title = "Clientes | Mr. Paquetes";

  const [clientes, setClientes] = useState([]);
  const [modalEditar, setModalEditar] = useState(false);
  const [clienteEditado, setClienteEditado] = useState(null);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [clienteAEliminar, setClienteAEliminar] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = AuthService.getCurrentUser();
        const response = await axios.get(`${API_URL}/clientes`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
  
        if (response.data && Array.isArray(response.data)) {
          setClientes(response.data);
        } else if (response.data && Array.isArray(response.data.data)) {
          setClientes(response.data.data);
        } else {
          console.error("Respuesta no válida para clientes:", response.data);
        }
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };
  
    fetchData();
  }, []);

  const eliminarCliente = (idCliente) => {
    setConfirmarEliminar(true);
    setClienteAEliminar(idCliente);
  };

  const confirmarEliminarCliente = async () => {
    try {
      const token = AuthService.getCurrentUser();
      await axios.delete(`${API_URL}/clientes/${clienteAEliminar}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const nuevosClientes = clientes.filter(cliente => cliente.id !== clienteAEliminar);
      setClientes(nuevosClientes);
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
    } finally {
      setConfirmarEliminar(false);
      setClienteAEliminar(null);
    }
  };

  const toggleModalEditar = (cliente) => {
    setClienteEditado(cliente);
    setModalEditar(!modalEditar);
  };

  const guardarCambiosCliente = async () => {
    try {
      const token = AuthService.getCurrentUser();
      await axios.put(`${API_URL}/clientes/${clienteEditado.id}`, clienteEditado, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      const nuevosClientes = clientes.map(cliente =>
        cliente.id === clienteEditado.id ? clienteEditado : cliente
      );
      setClientes(nuevosClientes);
      setModalEditar(false);
      setClienteEditado(null);
    } catch (error) {
      console.error("Error al actualizar cliente:", error);
    }
  };

  const filtrarClientes = (clientes) => {
    if (!busqueda) return clientes;

    const busquedaLower = busqueda.toLowerCase();
    return clientes.filter(cliente =>
      `${cliente.nombre} ${cliente.apellido}`.toLowerCase().includes(busquedaLower)
    );
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Obtener los clientes filtrados y paginados
  const clientesFiltrados = filtrarClientes(clientes);
  const paginatedClientes = clientesFiltrados.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(clientesFiltrados.length / ITEMS_PER_PAGE);

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Clientes" breadcrumbItem="Listado" />
        <Row>
          <Col lg={12}>
            <div style={{ marginTop: "10px", display: 'flex', alignItems: 'center' }}>
              <Label for="busqueda" style={{ marginRight: "10px" }}>Buscar:</Label>
              <Input
                type="text"
                id="busqueda"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre o apellido"
                style={{ width: "300px" }}
              />
              <div style={{ marginLeft: "auto" }}>
                <Link to="/AgregarCliente" className="btn btn-primary custom-button">
                  <i className="fas fa-plus"></i> Agregar Cliente
                </Link>
              </div>
            </div>
          </Col>
        </Row>
        <br />
        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <TablaClientes
                  clientes={paginatedClientes}
                  eliminarCliente={eliminarCliente}
                  toggleModalEditar={toggleModalEditar}
                  tipoPersona={TIPO_PERSONA} // Pasar el mapeo de tipos de persona
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col lg={12} style={{ marginTop: "20px", display: 'flex', justifyContent: 'center' }}>
            <Pagination
              activePage={currentPage}
              itemsCountPerPage={ITEMS_PER_PAGE}
              totalItemsCount={clientesFiltrados.length}
              pageRangeDisplayed={5}
              onChange={handlePageChange}
              itemClass="page-item"
              linkClass="page-link"
              innerClass="pagination"
            />
          </Col>
        </Row>
      </Container>
      <ModalEditarCliente
        modalEditar={modalEditar}
        clienteEditado={clienteEditado}
        setClienteEditado={setClienteEditado}
        guardarCambiosCliente={guardarCambiosCliente}
        setModalEditar={setModalEditar}
      />
      <ModalConfirmarEliminar
        confirmarEliminar={confirmarEliminar}
        confirmarEliminarCliente={confirmarEliminarCliente}
        setConfirmarEliminar={setConfirmarEliminar}
      />
    </div>
  );
};

export default GestionClientes;
