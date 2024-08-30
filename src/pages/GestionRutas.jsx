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
const ITEMS_PER_PAGE = 5;

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
  const [busqueda, setBusqueda] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [destinos, setDestinos] = useState([]);
  const [bodegas, setBodegas] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = AuthService.getCurrentUser();
    
        const [responseRutas, responseDestinos, responseBodegas] =
          await Promise.all([
            axios.get(`${API_URL}/rutas`, {
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
    
        // Verifica la estructura de las respuestas
        // console.log("Response Rutas:", responseRutas.data);
        // console.log("Response Destinos:", responseDestinos.data);
        // console.log("Response Bodegas:", responseBodegas.data);
    
        setRutas(responseRutas.data.data || []);
        setDestinos(responseDestinos.data.destinos || []);
        setBodegas(responseBodegas.data.bodegas || []);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };
    
  
    fetchData();
  }, []);
  
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

  const filtrarRutas = (rutas) => {
    if (!Array.isArray(rutas)) return [];
    if (!busqueda) return rutas;
    return rutas.filter((ruta) =>
      ruta.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const rutasFiltradas = filtrarRutas(rutas);
  const paginatedRutas = rutasFiltradas.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs
          title="Gestión de Rutas"
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
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre de ruta"
                style={{ width: "300px" }}
              />
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
                  rutas={paginatedRutas}
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
              totalItemsCount={rutasFiltradas.length}
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
