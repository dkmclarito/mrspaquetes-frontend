import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { Container, Row, Col, Card, CardBody, Input, Label } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import Breadcrumbs from "../components/Incidencias/Common/Breadcrumbs";
import TablaIncidencias2 from "../components/Incidencias/TablaIncidencias2";
import ModalConfirmarEliminar from "../components/Incidencias/ModalConfirmarEliminar";
import ModalEditarIncidencia from "../components/Incidencias/ModalEditarIncidencia";
import AuthService from "../services/authService";
import Pagination from 'react-js-pagination';

const API_URL = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 5;

const MisIncidencias = () => {
  document.title = "Incidencias | Mr. Paquetes";
  const navigate = useNavigate();

  const [incidencias, setIncidencias] = useState([]);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [incidenciaAEliminar, setIncidenciaAEliminar] = useState(null);
  const [incidenciaEditada, setIncidenciaEditada] = useState(null);
  const [modalEditar, setModalEditar] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Verificar el estado del usuario logueado
  const verificarEstadoUsuarioLogueado = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userId");
      const token = AuthService.getCurrentUser();

      if (userId && token) {
        const response = await axios.get(`${API_URL}/auth/show/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.status === "Token is Invalid") {
          AuthService.logout();
          window.location.href = "/login";
        }
      }
    } catch (error) {
      console.error("Error al verificar estado del usuario:", error);
    }
  }, []);

  // Obtener incidencias desde la API
  const fetchData = useCallback(async () => {
    try {
      const token = AuthService.getCurrentUser();
      const response = await axios.get(`${API_URL}/incidencias`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && Array.isArray(response.data.data)) {
        setIncidencias(response.data.data);
      } else {
        console.error("Datos inesperados al obtener incidencias:", response.data);
      }
    } catch (error) {
      console.error("Error al obtener incidencias:", error);
    }
  }, []);

  // Cargar datos al montar el componente
  useEffect(() => {
    verificarEstadoUsuarioLogueado();
    fetchData();
  }, [fetchData, verificarEstadoUsuarioLogueado]);

  // Actualizar estado del usuario periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      verificarEstadoUsuarioLogueado();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [verificarEstadoUsuarioLogueado]);

  // Eliminar una incidencia
  const eliminarIncidencia = useCallback((idIncidencia) => {
    setConfirmarEliminar(true);
    setIncidenciaAEliminar(idIncidencia);
  }, []);

  // Confirmar la eliminación de la incidencia
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

  // Filtrar las incidencias según los filtros de búsqueda, estado y tipo
  const filtrarIncidencias = useCallback(() => {
    return incidencias.filter(incidencia => {
      const cumpleBusqueda = !busqueda ||
        incidencia.id_paquete.toString().includes(busqueda) ||
        (incidencia.usuario_asignado && incidencia.usuario_asignado.toString().includes(busqueda));
      const cumpleEstado = !estadoFiltro || incidencia.estado === estadoFiltro;
      const cumpleTipo = !tipoFiltro || incidencia.tipo_incidencia === tipoFiltro;
      return cumpleBusqueda && cumpleEstado && cumpleTipo;
    });
  }, [incidencias, busqueda, estadoFiltro, tipoFiltro]);

  const incidenciasFiltradas = useMemo(() => filtrarIncidencias(), [filtrarIncidencias]);

  // Paginación de incidencias
  const paginatedIncidencias = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return incidenciasFiltradas.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [incidenciasFiltradas, currentPage]);

  // Resetear la página actual si cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [busqueda, estadoFiltro, tipoFiltro]);

  // Abrir el modal para editar la incidencia
  const toggleModalEditar = (incidencia) => {
    setIncidenciaEditada(incidencia);
    setModalEditar(true);
  };

  // Guardar los cambios en la incidencia editada
  const guardarCambiosIncidencia = (incidenciaActualizada) => {
    setIncidencias((prevIncidencias) =>
      prevIncidencias.map((incidencia) =>
        incidencia.id === incidenciaActualizada.id ? incidenciaActualizada : incidencia
      )
    );
    setModalEditar(false);
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Gestión de Incidencias" breadcrumbItem="Lista de incidencias" />
        <Row>
          <Col lg={12}>
            <div style={{ marginTop: "10px", display: "flex", alignItems: "center" }}>
              <div style={{ marginLeft: "auto" }}>
                <Link to="/AgregarIncidencia" className="btn btn-primary custom-button">
                  <i className="fas fa-plus"></i> Agregar Incidencia
                </Link> <span></span>
                <Link to="/GestionIncidencias" className="btn btn-secondary btn-regresar custom-button">
                  <i className="fas fa-arrow-left"></i> Regresar
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
                <TablaIncidencias2
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

export default MisIncidencias;
