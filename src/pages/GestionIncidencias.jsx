import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { Container, Row, Col, Card, CardBody, Input, Label } from "reactstrap";
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
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [incidenciaAEliminar, setIncidenciaAEliminar] = useState(null);
  const [incidenciaEditada, setIncidenciaEditada] = useState(null);
  const [modalEditar, setModalEditar] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState(""); // Nuevo estado para el tipo de incidencia
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
        // Guardar el role_name del usuario logueado
        setRoleName(response.data.user.role_name);
        console.log("Role Name del Usuario:", response.data.user.role_name); // Depuración
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
        console.log("Incidencias obtenidas:", response.data.data); // Depuración
        setIncidencias(response.data.data);
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
        (incidencia.usuario_asignado && incidencia.usuario_asignado.toString().includes(busqueda));
      const cumpleEstado = !estadoFiltro || incidencia.estado === estadoFiltro; // Ajustar aquí para comparar correctamente el estado
      const cumpleTipo = !tipoFiltro || incidencia.tipo_incidencia === tipoFiltro; // Nuevo filtro para tipo de incidencia
      return cumpleBusqueda && cumpleEstado && cumpleTipo;
    });
  }, [incidencias, busqueda, estadoFiltro, tipoFiltro]);

  const filtrarIncidenciasAdmin = useCallback(() => {
    // No filtrar, devolver todas las incidencias
    console.log("Mostrando todas las incidencias para Admin:", incidencias); // Depuración
    return incidencias;
  }, [incidencias]);

  const incidenciasFiltradas = useMemo(() => {
    if (roleName === "conductor") {
      return filtrarIncidencias();
    } else if (roleName === "admin") {
      return filtrarIncidenciasAdmin();
    } else {
      return incidencias; // Mostrar todas las incidencias si no es conductor ni admin
    }
  }, [roleName, filtrarIncidencias, filtrarIncidenciasAdmin, incidencias]);

  const paginatedIncidencias = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return incidenciasFiltradas.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [incidenciasFiltradas, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [busqueda, estadoFiltro, tipoFiltro]);

  const toggleModalEditar = (incidencia) => {
    setIncidenciaEditada(incidencia);
    setModalEditar(true);
  };

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
                <option value="Abierta">Abierta</option>
                <option value="En Proceso">En Proceso</option>
                <option value="Cerrada">Cerrada</option>
              </Input>
              <Label for="tipoFiltro" style={{ marginRight: "10px", marginLeft: "20px" }}>
                Tipo de Incidencia:
              </Label>
              <Input
                type="select"
                id="tipoFiltro"
                value={tipoFiltro}
                onChange={(e) => setTipoFiltro(e.target.value)}
                style={{ width: "150px" }}
              >
                <option value="">Todos</option>
                <option value="Tipo1">Daño</option>
                <option value="Tipo2">Tipo 2</option>
                {/* Agregar más opciones de tipo de incidencia según sea necesario */}
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
