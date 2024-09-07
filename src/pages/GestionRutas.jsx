import React, { useState, useEffect } from "react";
import axios from "axios";
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
import { Link } from "react-router-dom";
import Breadcrumbs from "../components/Rutas/Common/Breadcrumbs";
import AuthService from "../services/authService";
import Pagination from "react-js-pagination";
import "../styles/Vehiculos.css";
import TablaRutas from "../components/Rutas/TablaRutas";
import ModalEditarRuta from "../components/Rutas/ModalEditarRuta";
import ModalConfirmarEliminarRuta from "../components/Rutas/ModalConfirmarEliminarRuta";

const API_URL = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 10;

const GestionRutas = () => {
  document.title = "Rutas | Mr. Paquetes";

  const [rutas, setRutas] = useState([]);
  const [modalEditar, setModalEditar] = useState(false);
  const [rutaEditada, setRutaEditada] = useState({
    id: null,
    nombre: "",
    distancia_km: "",
    duracion_aproximada: "",
    fecha_programada: "",
    id_destino: "",
    id_bodega: "",
  });
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [rutaAEliminar, setRutaAEliminar] = useState(null);
  const [busquedaNombre, setBusquedaNombre] = useState("");
  const [busquedaBodega, setBusquedaBodega] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [destinos, setDestinos] = useState([]);
  const [bodegas, setBodegas] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = AuthService.getCurrentUser();

        const [responseRutas, responseDestinos, responseBodegas] =
          await Promise.all([
            axios.get(`${API_URL}/rutas`, {
              params: {
                page: currentPage,
                per_page: ITEMS_PER_PAGE,
                nombre: busquedaNombre,
                id_bodega: busquedaBodega,
              },
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
            axios.get(`${API_URL}/destinos`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
            axios.get(`${API_URL}/bodegas`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
          ]);

        setRutas(responseRutas.data.data || []);
        setTotalItems(responseRutas.data.total || 0);
        setDestinos(responseDestinos.data.destinos || []);
        setBodegas(responseBodegas.data.bodegas || []);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };

    fetchData();
  }, [currentPage, busquedaNombre, busquedaBodega]);

  const confirmarEliminarRuta = async () => {
    try {
      const token = AuthService.getCurrentUser();
      await axios.delete(`${API_URL}/rutas/${rutaAEliminar}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRutas(rutas.filter((ruta) => ruta.id !== rutaAEliminar));
      setConfirmarEliminar(false);
      setRutaAEliminar(null);
    } catch (error) {
      console.error("Error al eliminar ruta:", error);
      setConfirmarEliminar(false);
    }
  };

  const toggleModalEditar = (ruta) => {
    setRutaEditada(
      ruta || {
        id: null,
        nombre: "",
        distancia_km: "",
        duracion_aproximada: "",
        fecha_programada: "",
        id_destino: "",
        id_bodega: "",
      }
    );
    setModalEditar(!modalEditar);
  };

  const eliminarRuta = (id) => {
    setRutaAEliminar(id);
    setConfirmarEliminar(true);
  };

  const guardarCambiosRuta = async () => {
    try {
      const token = AuthService.getCurrentUser();
      await axios.put(`${API_URL}/rutas/${rutaEditada.id}`, rutaEditada, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      setRutas(
        rutas.map((ruta) => (ruta.id === rutaEditada.id ? rutaEditada : ruta))
      );
      setModalEditar(false);
      setRutaEditada({
        id: null,
        nombre: "",
        distancia_km: "",
        duracion_aproximada: "",
        fecha_programada: "",
        id_destino: "",
        id_bodega: "",
      });
    } catch (error) {
      console.error("Error al actualizar ruta:", error);
    }
  };

  const handleBusquedaNombreChange = (e) => {
    setBusquedaNombre(e.target.value);
    setCurrentPage(1);
  };

  const handleBusquedaBodegaChange = (e) => {
    setBusquedaBodega(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs
          title="Gestión de Rutas"
          breadcrumbItem="Listado de Rutas"
        />
        <Row>
          <Col lg={12}>
            <div style={{ marginTop: "10px", display: "flex", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", marginRight: "10px" }}>
                <Label for="busquedaNombre" style={{ marginRight: "10px" }}>
                  Nombre:
                </Label>
                <Input
                  type="text"
                  id="busquedaNombre"
                  value={busquedaNombre}
                  onChange={handleBusquedaNombreChange}
                  placeholder="Buscar por nombre"
                  style={{ width: "200px" }}
                />
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <Label for="busquedaBodega" style={{ marginRight: "10px" }}>
                  Bodega:
                </Label>
                <Input
                  type="select"
                  id="busquedaBodega"
                  value={busquedaBodega}
                  onChange={handleBusquedaBodegaChange}
                  style={{ width: "200px" }}
                >
                  <option value="">Todas las bodegas</option>
                  {bodegas.map((bodega) => (
                    <option key={bodega.id} value={bodega.id}>
                      {bodega.nombre}
                    </option>
                  ))}
                </Input>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <Link
                  to="/AgregarRuta"
                  className="btn btn-primary custom-button"
                >
                  <i className="fas fa-plus"></i> Agregar Ruta
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
                <TablaRutas
                  rutas={rutas}
                  destinos={destinos}
                  bodegas={bodegas}
                  eliminarRuta={eliminarRuta}
                  toggleModalEditar={toggleModalEditar}
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
      <ModalEditarRuta
        modalEditar={modalEditar}
        rutaEditada={rutaEditada}
        setRutaEditada={setRutaEditada}
        guardarCambiosRuta={guardarCambiosRuta}
        setModalEditar={setModalEditar}
        destinos={destinos}
        bodegas={bodegas}
      />

      <ModalConfirmarEliminarRuta
        confirmarEliminar={confirmarEliminar}
        confirmarEliminarRuta={confirmarEliminarRuta}
        setConfirmarEliminar={setConfirmarEliminar}
      />
    </div>
  );
};

export default GestionRutas;