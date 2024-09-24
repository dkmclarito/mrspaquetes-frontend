import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { Container, Row, Col, Card, CardBody, Input, Label, Button } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import Breadcrumbs from "../components/Incidencias/Common/Breadcrumbs";
import TablaIncidencias from "../components/Incidencias/TablaIncidencias";
import ModalConfirmarEliminar from "../components/Incidencias/ModalConfirmarEliminar";
import ModalEditarIncidencia from "../components/Incidencias/ModalEditarIncidencia";
import AuthService from "../services/authService";
import Pagination from 'react-js-pagination';

const API_URL = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 5;

const GestionIncidencias = () => {
  document.title = "Incidencias | Mr. Paquetes";
  const navigate = useNavigate();

  const [incidencias, setIncidencias] = useState([]);
  const [tiposIncidencia, setTiposIncidencia] = useState([]); // Estado para los tipos de incidencia
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [incidenciaAEliminar, setIncidenciaAEliminar] = useState(null);
  const [incidenciaEditada, setIncidenciaEditada] = useState(null);
  const [modalEditar, setModalEditar] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState(""); // Estado para el filtro de tipo de incidencia
  const [currentPage, setCurrentPage] = useState(1);
  const [roleName, setRoleName] = useState("");

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
        setRoleName(response.data.user.role_name);
        console.log("Role Name:", response.data.user.role_name); // Depuración
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
      if (response.data && Array.isArray(response.data.data)) {
        setIncidencias(response.data.data);
        console.log("Incidencias obtenidas:", response.data.data); // Depuración
      } else {
        console.error("Datos inesperados al obtener incidencias:", response.data);
      }
    } catch (error) {
      console.error("Error al obtener incidencias:", error);
    }
  }, []);

  const fetchTiposIncidencia = useCallback(async () => {
    try {
      const token = AuthService.getCurrentUser();
      const response = await axios.get(`${API_URL}/dropdown/get_tipo_incidencia`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && Array.isArray(response.data.tipo_incidencia)) {
        setTiposIncidencia(response.data.tipo_incidencia);
        console.log("Tipos de Incidencia obtenidos:", response.data.tipo_incidencia); // Depuración
      } else {
        console.error("Datos inesperados al obtener tipos de incidencia:", response.data);
      }
    } catch (error) {
      console.error("Error al obtener tipos de incidencia:", error);
    }
  }, []);

  useEffect(() => {
    verificarEstadoUsuarioLogueado();
    fetchData();
    fetchTiposIncidencia(); // Cargar los tipos de incidencia
  }, [fetchData, fetchTiposIncidencia, verificarEstadoUsuarioLogueado]);

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
    console.log("Filtro Busqueda:", busqueda); // Depuración
    console.log("Filtro Estado:", estadoFiltro); // Depuración
    console.log("Filtro Tipo:", tipoFiltro); // Depuración
    return incidencias.filter(incidencia => {
      const cumpleBusqueda = !busqueda ||
        (incidencia.uuid && incidencia.uuid.toLowerCase().includes(busqueda.toLowerCase())) ||
        (incidencia.usuario_reporta && incidencia.usuario_reporta.toLowerCase().includes(busqueda.toLowerCase()));
      const cumpleEstado = !estadoFiltro || incidencia.estado === estadoFiltro;
      const cumpleTipo = !tipoFiltro || incidencia.tipo_incidencia === tipoFiltro;
      console.log("Incidencia:", incidencia); // Depuración
      return cumpleBusqueda && cumpleEstado && cumpleTipo;
    });
  }, [incidencias, busqueda, estadoFiltro, tipoFiltro]);

  const incidenciasFiltradas = useMemo(() => filtrarIncidencias(), [filtrarIncidencias]);

  const paginatedIncidencias = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return incidenciasFiltradas.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [incidenciasFiltradas, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [busqueda, estadoFiltro, tipoFiltro]);

  const toggleModalEditar = useCallback((incidencia) => {
    setIncidenciaEditada(incidencia);
    setModalEditar(true);
  }, []);

  const guardarCambiosIncidencia = useCallback(async (incidenciaActualizada) => {
    try {
      const token = AuthService.getCurrentUser();
      const { id, estado, tipo_incidencia, solucion } = incidenciaActualizada;
      const data = { estado, tipo_incidencia, solucion };

      const response = await axios.put(`${API_URL}/incidencias/${id}`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        setIncidencias(prevIncidencias =>
          prevIncidencias.map(incidencia => incidencia.id === id ? incidenciaActualizada : incidencia)
        );
        setModalEditar(false);
        setIncidenciaEditada(null);
      }
    } catch (error) {
      console.error("Error al actualizar incidencia:", error);
    }
  }, []);

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Gestión de Incidencias" breadcrumbItem="Lista de incidencias" />
        <Row>
          <Col lg={12}>
          <div style={{ marginTop: "10px", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
  {roleName === "acompanante" && (
    <>
      <Link
        to="/MisIncidencias"
        className="btn btn-primary"
        style={{ marginRight: "10px" }}
      >
        Mis incidencias reportadas
      </Link>
      <Link
        to="/AgregarIncidencia"
        className="btn btn-primary"
      >
        <i className="fas fa-plus"></i> Agregar Incidencia
      </Link>
    </>
  )}
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
                  toggleModalEditar={toggleModalEditar}
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

      {incidenciaEditada && (
        <ModalEditarIncidencia
          modalEditar={modalEditar}
          setModalEditar={setModalEditar}
          incidenciaEditada={incidenciaEditada}
          setIncidenciaEditada={setIncidenciaEditada}
          guardarCambiosIncidencia={guardarCambiosIncidencia}
        />
      )}

      <ModalConfirmarEliminar
        confirmarEliminar={confirmarEliminar}
        confirmarEliminarUsuario={confirmarEliminarIncidencia}
        setConfirmarEliminar={setConfirmarEliminar}
      />
    </div>
  );
};

export default GestionIncidencias;