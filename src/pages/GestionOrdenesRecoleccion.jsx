import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Input,
  Label,
  Button,
} from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Breadcrumbs from "../components/Recoleccion/Common/Breadcrumbs";
import TablaRutasRecoleccion from "../components/Recoleccion/TablaRutasRecoleccion";
import Pagination from "react-js-pagination";
import ModalConfirmarEliminar from "../components/Recoleccion/ModalConfirmarEliminar";
import AuthService from "../services/authService";

const API_URL = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 10;

const GestionOrdenesRecoleccion = () => {
  const [rutasRecoleccion, setRutasRecoleccion] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalOrdenes, setTotalOrdenes] = useState(0);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [rutaSeleccionada, setRutaSeleccionada] = useState(null);
  const [vehiculos, setVehiculos] = useState([]);
  const [estados, setEstados] = useState([]);

  const navigate = useNavigate();

  const verificarEstadoUsuarioLogueado = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userId");
      const token = AuthService.getCurrentUser()?.token;

      if (userId && token) {
        const response = await axios.get(`${API_URL}/auth/show/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
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
      toast.error("Error al verificar el estado del usuario.");
    }
  }, []);

  const fetchData = useCallback(async (page = 1) => {
    try {
      const token = localStorage.getItem("token");

      const [rutasRes, vehiculosRes, estadosRes] = await Promise.all([
        axios.get(
          `${API_URL}/rutas-recolecciones?page=${page}&per_page=${ITEMS_PER_PAGE}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.get(`${API_URL}/dropdown/get_vehiculos`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/dropdown/get_estado_rutas`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const rutasData = rutasRes.data.data || [];
      setRutasRecoleccion(rutasData);
      setTotalItems(rutasRes.data.total || 0);

      const totalOrdenes = rutasData.reduce(
        (total, ruta) => total + (ruta.ordenes_recolecciones?.length || 0),
        0
      );
      setTotalOrdenes(totalOrdenes);

      setVehiculos(vehiculosRes.data.vehiculos || []);
      setEstados(estadosRes.data.estado_rutas || []); // Guardamos los estados
    } catch (error) {
      console.error("Error al obtener datos:", error);
      toast.error("Error al cargar los datos.");
    }
  }, []);

  useEffect(() => {
    verificarEstadoUsuarioLogueado();
    fetchData();
  }, [verificarEstadoUsuarioLogueado, fetchData]);

  const handleSearchChange = (e) => {
    setBusqueda(e.target.value);
    setCurrentPage(1);
  };

  const filtrarRutas = useCallback(() => {
    if (!busqueda) return rutasRecoleccion;
    return rutasRecoleccion.filter(
      (ruta) =>
        ruta.nombre &&
        ruta.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [rutasRecoleccion, busqueda]);

  const rutasFiltradas = filtrarRutas();

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    fetchData(pageNumber);
  };

  const verDetallesRuta = (id) => {
    navigate(`/detalles-ruta-recoleccion/${id}`);
  };

  const editarRuta = (id) => {
    navigate(`/editar-ruta-recoleccion/${id}`);
  };

  const iniciarEliminarRuta = useCallback((id) => {
    setRutaSeleccionada(id);
    setModalEliminar(true);
  }, []);

  const confirmarEliminarRuta = async () => {
    try {
      const token = AuthService.getCurrentUser()?.token;
      await axios.delete(`${API_URL}/rutas-recolecciones/${rutaSeleccionada}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Ruta de recolección eliminada con éxito.");

      if (rutasRecoleccion.length === 1 && currentPage > 1) {
        await fetchData(currentPage - 1);
      } else {
        await fetchData(currentPage);
      }

      setModalEliminar(false);
      setRutaSeleccionada(null);
    } catch (error) {
      console.error("Error al eliminar la ruta de recolección:", error);
      toast.error("Error al eliminar la ruta de recolección.");
    }
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs
          title="Gestión de Rutas de Recolección"
          breadcrumbItem="Listado de Rutas"
        />
        <Row>
          <Col lg={12}>
            <div
              style={{
                marginTop: "10px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Label for="busqueda" style={{ marginRight: "10px" }}>
                Buscar:
              </Label>
              <Input
                type="text"
                id="busqueda"
                value={busqueda}
                onChange={handleSearchChange}
                placeholder="Buscar por código de ruta"
                style={{ width: "300px" }}
              />
              <div style={{ marginLeft: "auto" }}>
                <Link to="/crear-ruta-recoleccion" className="btn btn-primary">
                  <i className="fas fa-plus"></i> Crear Ruta de Recolección
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
                <TablaRutasRecoleccion
                  rutas={rutasFiltradas}
                  vehiculos={vehiculos}
                  estados={estados}
                  eliminarRuta={iniciarEliminarRuta}
                  verDetallesRuta={verDetallesRuta}
                  editarRuta={editarRuta}
                  totalOrdenes={totalOrdenes}
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col
            lg={12}
            style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Pagination
              activePage={currentPage}
              itemsCountPerPage={ITEMS_PER_PAGE}
              totalItemsCount={totalItems}
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
        toggle={() => setModalEliminar(!modalEliminar)}
        confirmarEliminar={confirmarEliminarRuta}
      />
    </div>
  );
};

export default GestionOrdenesRecoleccion;
