import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Container, Row, Col, Card, CardBody, Input, Label } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import Breadcrumbs from "../components/Clientes/Common/Breadcrumbs";
import TablaClientes from "../components/Clientes/TablaClientes";
import ModalEditarCliente from "../components/Clientes/ModalEditarCliente";
import ModalConfirmarEliminar from "../components/Clientes/ModalConfirmarEliminar";
import ModalDirecciones from "../components/Clientes/ModalDirecciones";
import AuthService from "../services/authService";
import "../styles/Clientes.css";
import { toast } from 'react-toastify';
import Pagination from 'react-js-pagination';

const API_URL = import.meta.env.VITE_API_URL;

const TIPO_PERSONA = {
  1: 'Persona Natural',
  2: 'Persona Jurídica'
};

const ITEMS_PER_PAGE = 10;

const GestionClientes = () => {
  document.title = "Clientes | Mr. Paquetes";

  const [clientes, setClientes] = useState([]);
  const [modalEditar, setModalEditar] = useState(false);
  const [clienteEditado, setClienteEditado] = useState(null);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [clienteAEliminar, setClienteAEliminar] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalClientes, setTotalClientes] = useState(0);
  const [modalDirecciones, setModalDirecciones] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  const navigate = useNavigate();

  // Nueva función para verificar el estado del usuario logueado
  const verificarEstadoUsuarioLogueado = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userId");
      const token = AuthService.getCurrentUser();

      if (userId && token) {
        const response = await axios.get(`${API_URL}/auth/show/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.status === "Token is Invalid") {
          console.error("Token is invalid. Logging out...");
          AuthService.logout();
          window.location.href = "/login";
          return;
        }
      }
    } catch (error) {
      console.error("Error 500 DKM:", error);
    }
  }, []);

  const fetchData = async (pageNumber = 1) => {
    try {
      const token = AuthService.getCurrentUser();
      const response = await axios.get(`${API_URL}/clientes?page=${pageNumber}&limit=${ITEMS_PER_PAGE}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data && response.data.data) {
        setClientes(response.data.data);
        setTotalClientes(response.data.total);
      } else {
        console.error("Respuesta no válida para clientes:", response.data);
      }
    } catch (error) {
      console.error("Error al obtener datos:", error);
    }
  };

  useEffect(() => {
    verificarEstadoUsuarioLogueado();
    fetchData(currentPage);
  }, [verificarEstadoUsuarioLogueado, currentPage]);

  useEffect(() => {
    const interval = setInterval(() => {
      verificarEstadoUsuarioLogueado();
    }, 30000);

    return () => clearInterval(interval);
  }, [verificarEstadoUsuarioLogueado]);

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

      fetchData(currentPage);
      toast.success("Cliente eliminado correctamente.");
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      toast.error("Error al eliminar el cliente.");
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

      fetchData(currentPage);
      setModalEditar(false);
      setClienteEditado(null);
      toast.success("Cliente actualizado correctamente.");
    } catch (error) {
      console.error("Error al actualizar cliente:", error);
      toast.error("Error al actualizar el cliente.");
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

  const handleSearchChange = (e) => {
    setBusqueda(e.target.value);
    setCurrentPage(1);
  };

  const verDirecciones = (idCliente) => {
    setClienteSeleccionado(idCliente);
    setModalDirecciones(true);
  };

  const verDetallesCliente = (idCliente) => {
    navigate(`/DetallesCliente/${idCliente}`);
  };

  const clientesFiltrados = filtrarClientes(clientes);

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Gestión de Clientes" breadcrumbItem="Listado de Clientes" />
        <Row>
          <Col lg={12}>
            <div style={{ marginTop: "10px", display: 'flex', alignItems: 'center' }}>
              <Label for="busqueda" style={{ marginRight: "10px" }}>Buscar:</Label>
              <Input
                type="text"
                id="busqueda"
                value={busqueda}
                onChange={handleSearchChange}
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
                  clientes={clientesFiltrados}
                  eliminarCliente={eliminarCliente}
                  toggleModalEditar={toggleModalEditar}
                  verDetallesCliente={verDetallesCliente}
                  tipoPersona={TIPO_PERSONA}
                  verDirecciones={verDirecciones}
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
              totalItemsCount={totalClientes}
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
      <ModalDirecciones
        isOpen={modalDirecciones}
        toggle={() => setModalDirecciones(!modalDirecciones)}
        clienteId={clienteSeleccionado}
      />
    </div>
  );
};

export default GestionClientes;
