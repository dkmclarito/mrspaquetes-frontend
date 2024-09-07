import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Container, Row, Col, Card, CardBody, Input, Label, Button } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import Breadcrumbs from "../components/AsignacionRutas/Common/Breadcrumbs";
import TablaAsignacionRutas from "../components/AsignacionRutas/TablaAsignarRuta";
import Pagination from 'react-js-pagination';
import { toast } from "react-toastify";
import ModalConfirmarEliminar from "../components/AsignacionRutas/ModalConfirmarEliminar";
import ModalEditarAsignacionRuta from "../components/AsignacionRutas/ModalEditarAsignarRuta";
import AuthService from "../services/authService";

const API_URL = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 10;

export default function GestionAsignarRutas() {
  const [asignaciones, setAsignaciones] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [asignacionSeleccionada, setAsignacionSeleccionada] = useState(null);

  const navigate = useNavigate();

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
      console.error("Error al verificar el estado del usuario:", error);
    }
  }, []);

  const fetchAsignaciones = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/asignacionrutas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data && response.data.asignacionrutas) {
        setAsignaciones(response.data.asignacionrutas);
      } else {
        console.error("Unexpected API response structure:", response.data);
        toast.error("Error al cargar las asignaciones de rutas");
      }
    } catch (error) {
      console.error("Error al obtener asignaciones:", error);
      toast.error("Error al cargar las asignaciones de rutas");
    }
  };

  useEffect(() => {
    verificarEstadoUsuarioLogueado();
    fetchAsignaciones();
  }, [verificarEstadoUsuarioLogueado]);

  const toggleModalEliminar = () => setModalEliminar(!modalEliminar);
  const toggleModalEditar = () => setModalEditar(!modalEditar);

  const iniciarEliminarAsignacion = (id) => {
    setAsignacionSeleccionada(id);
    toggleModalEliminar();
  };

  const confirmarEliminarAsignacion = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/asignacionrutas/${asignacionSeleccionada}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Asignación eliminada con éxito");
      fetchAsignaciones();
      toggleModalEliminar();
    } catch (error) {
      console.error("Error al eliminar la asignación:", error);
      toast.error("Error al eliminar la asignación");
    }
  };

  const iniciarEditarAsignacion = (asignacion) => {
    setAsignacionSeleccionada(asignacion);
    toggleModalEditar();
  };

  const guardarCambiosAsignacion = async (asignacionEditada) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/asignacionrutas/${asignacionEditada.id}`, asignacionEditada, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Asignación actualizada con éxito");
      fetchAsignaciones();
      toggleModalEditar();
    } catch (error) {
      console.error("Error al actualizar la asignación:", error);
      toast.error("Error al actualizar la asignación");
    }
  };

  const handleSearchChange = (e) => {
    setBusqueda(e.target.value);
    setCurrentPage(1);
  };

  const filtrarAsignaciones = (asignaciones) => {
    if (!busqueda) return asignaciones;
    return asignaciones.filter(
      (asignacion) =>
        asignacion.codigo_unico_asignacion.toLowerCase().includes(busqueda.toLowerCase())
    );
  };

  const asignacionesFiltradas = filtrarAsignaciones(asignaciones);
  const paginatedAsignaciones = asignacionesFiltradas.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Gestión de Asignación de Rutas" breadcrumbItem="Listado de Asignaciones" />
        <Row>
          <Col lg={12}>
            <div style={{ marginTop: "10px", display: "flex", alignItems: "center" }}>
              <Label for="busqueda" style={{ marginRight: "10px" }}>Buscar:</Label>
              <Input
                type="text"
                id="busqueda"
                value={busqueda}
                onChange={handleSearchChange}
                placeholder="Buscar por código de asignación"
                style={{ width: "500px" }}
              />
              <div style={{ marginLeft: "auto" }}>
                <Link to="/AgregarAsignacionRuta" className="btn btn-primary">
                  <i className="fas fa-plus"></i> Agregar Asignación
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
                <TablaAsignacionRutas
                  asignaciones={paginatedAsignaciones}
                  eliminarAsignacion={iniciarEliminarAsignacion}
                  editarAsignacion={iniciarEditarAsignacion}
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
              totalItemsCount={asignacionesFiltradas.length}
              pageRangeDisplayed={5}
              onChange={handlePageChange}
              itemClass="page-item"
              linkClass="page-link"
              innerClass="pagination"
            />
          </Col>
        </Row>
      </Container>
      <ModalConfirmarEliminar
        isOpen={modalEliminar}
        toggle={toggleModalEliminar}
        confirmarEliminar={confirmarEliminarAsignacion}
      />
      <ModalEditarAsignacionRuta
        isOpen={modalEditar}
        toggle={toggleModalEditar}
        asignacion={asignacionSeleccionada}
        guardarCambios={guardarCambiosAsignacion}
      />
    </div>
  );
}