import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { Container, Row, Col, Card, CardBody, Input, Label } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import Breadcrumbs from "../components/Incidencias/Common/Breadcrumbs";
import TablaIncidencias from "../components/Incidencias/TablaIncidencias"; // Componente creado previamente
import ModalConfirmarEliminar from "../components/Incidencias/ModalConfirmarEliminar"; // Reutilizado de usuarios
import AuthService from "../services/authService";
import Pagination from 'react-js-pagination';

const API_URL = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 5;

const GestionIncidencias = () => {
  document.title = "Incidencias | Mr. Paquetes";
  const navigate = useNavigate();

  const [incidencias, setIncidencias] = useState([]);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [incidenciaAEliminar, setIncidenciaAEliminar] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

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
      console.error("Error al verificar estado del usuario:", error);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const token = AuthService.getCurrentUser();
      const response = await axios.get(`${API_URL}/incidencias`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Respuesta completa de la API:", response.data.data);
      // Verifica si la respuesta incluye los datos paginados correctamente
      if (response.data && Array.isArray(response.data.data)) {
        setIncidencias(response.data.data);  // Aquí asignamos el array `data` de incidencias
      } else {
        console.error("Datos inesperados al obtener incidencias:", response.data);
      }
    } catch (error) {
      console.error("Error al obtener incidencias:", error);
    }
  }, []);
  

  useEffect(() => {
    verificarEstadoUsuarioLogueado();
    fetchData();
  }, [fetchData, verificarEstadoUsuarioLogueado]);

  useEffect(() => {
    const interval = setInterval(() => {
      verificarEstadoUsuarioLogueado();
    }, 30000);

    return () => clearInterval(interval);
  }, [verificarEstadoUsuarioLogueado]);

  const eliminarIncidencia = useCallback((idIncidencia) => {
    setConfirmarEliminar(true);
    setIncidenciaAEliminar(idIncidencia);
  }, []);

  const confirmarEliminarIncidencia = useCallback(async () => {
    try {
      const token = AuthService.getCurrentUser();
      await axios.delete(`${API_URL}/incidencias/${incidenciaAEliminar}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIncidencias(prevIncidencias => prevIncidencias.filter(incidencia => incidencia.id !== incidenciaAEliminar));
    } catch (error) {
      console.error("Error al eliminar incidencia:", error);
    } finally {
      setConfirmarEliminar(false);
      setIncidenciaAEliminar(null);
    }
  }, [incidenciaAEliminar]);

  const filtrarIncidencias = useCallback(() => {
    return incidencias.filter(incidencia => {
      const cumpleBusqueda = !busqueda ||
        incidencia.id_paquete.toString().includes(busqueda) ||
        (incidencia.id_usuario_asignado && incidencia.id_usuario_asignado.toString().includes(busqueda));
      const cumpleEstado = !estadoFiltro || incidencia.estado.toString() === estadoFiltro;
      return cumpleBusqueda && cumpleEstado;
    });
  }, [incidencias, busqueda, estadoFiltro]);

  const incidenciasFiltradas = useMemo(() => filtrarIncidencias(), [filtrarIncidencias]);

  const paginatedIncidencias = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return incidenciasFiltradas.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [incidenciasFiltradas, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [busqueda, estadoFiltro]);

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Gestión de Incidencias" breadcrumbItem="Lista de incidencias" />
        <Row>
          <Col lg={12}>
            <div style={{ marginTop: "10px", display: "flex", alignItems: "center" }}>
              <Label for="busqueda" style={{ marginRight: "10px", marginLeft: "20px" }}>
                Buscar:
              </Label>
              <Input
                type="text"
                id="busqueda"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Escriba ID del paquete o usuario asignado"
                style={{ width: "300px" }}
              />
              <Label for="estadoFiltro" style={{ marginRight: "10px", marginLeft: "20px" }}>
                Estado:
              </Label>
              <Input
                type="select"
                id="estadoFiltro"
                value={estadoFiltro}
                onChange={(e) => setEstadoFiltro(e.target.value)}
                style={{ width: "150px" }}
              >
                <option value="">Todos</option>
                <option value="1">Abierta</option>
                <option value="0">Cerrada</option>
              </Input>
              <div style={{ marginLeft: "auto" }}>
                <Link to="/AgregarIncidencia" className="btn btn-primary custom-button">
                  <i className="fas fa-plus"></i> Agregar Incidencia
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
                <TablaIncidencias
                  incidencias={paginatedIncidencias}
                  eliminarIncidencia={eliminarIncidencia}
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col lg={12} style={{ marginTop: "20px", display: "flex", justifyContent: "center" }}>
            <Pagination
              activePage={currentPage}
              itemsCountPerPage={ITEMS_PER_PAGE}
              totalItemsCount={incidenciasFiltradas.length}
              pageRangeDisplayed={5}
              onChange={setCurrentPage}
              itemClass="page-item"
              linkClass="page-link"
              innerClass="pagination"
            />
          </Col>
        </Row>
      </Container>
      <ModalConfirmarEliminar
        confirmarEliminar={confirmarEliminar}
        confirmarEliminarUsuario={confirmarEliminarIncidencia}
        setConfirmarEliminar={setConfirmarEliminar}
      />
    </div>
  );
};

export default GestionIncidencias;
