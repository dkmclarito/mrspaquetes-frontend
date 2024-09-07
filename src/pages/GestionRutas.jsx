import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Container, Row, Col, Card, CardBody, Input, Label, Button } from "reactstrap";
import { Link } from "react-router-dom";
import Breadcrumbs from "../components/Rutas/Common/Breadcrumbs";
import AuthService from "../services/authService";
import Pagination from "react-js-pagination";
import "../styles/Vehiculos.css";
import TablaRutas from "../components/Rutas/TablaRutas";
import ModalEditarRuta from "../components/Rutas/ModalEditarRuta";
import ModalConfirmarEliminarRuta from "../components/Rutas/ModalConfirmarEliminarRuta";
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 10;

const GestionRutas = () => {
  const [rutas, setRutas] = useState([]);
  const [modalEditar, setModalEditar] = useState(false);
  const [rutaEditada, setRutaEditada] = useState(null);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [rutaAEliminar, setRutaAEliminar] = useState(null);
  const [busquedaNombre, setBusquedaNombre] = useState("");
  const [busquedaBodega, setBusquedaBodega] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [destinos, setDestinos] = useState([]);
  const [bodegas, setBodegas] = useState([]);

  const fetchData = useCallback(async (page = currentPage) => {
    try {
      const token = AuthService.getCurrentUser();

      const [responseRutas, responseDestinos, responseBodegas] = await Promise.all([
        axios.get(`${API_URL}/rutas`, {
          params: {
            page: page,
            per_page: ITEMS_PER_PAGE,
            nombre: busquedaNombre,
            id_bodega: busquedaBodega,
          },
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/destinos`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/bodegas`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      setRutas(responseRutas.data.data);
      setTotalItems(responseRutas.data.total || 0);
      setDestinos(responseDestinos.data.destinos || []);
      setBodegas(responseBodegas.data.bodegas || []);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error al obtener datos:", error);
      toast.error("Error al cargar los datos. Por favor, intente de nuevo.");
    }
  }, [busquedaNombre, busquedaBodega]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const confirmarEliminarRuta = async () => {
    try {
      const token = AuthService.getCurrentUser();
      await axios.delete(`${API_URL}/rutas/${rutaAEliminar}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Ruta eliminada con éxito");

      // Verificar si la página actual queda vacía
      if (rutas.length === 1 && currentPage > 1) {
        // Si es la última ruta de la página y no es la primera página,
        // cargar la página anterior
        await fetchData(currentPage - 1);
      } else {
        // Si no, simplemente recargar la página actual
        await fetchData(currentPage);
      }

      setConfirmarEliminar(false);
      setRutaAEliminar(null);
    } catch (error) {
      console.error("Error al eliminar ruta:", error);
      toast.error("Error al eliminar la ruta. Por favor, intente de nuevo.");
    }
  };

  const toggleModalEditar = (ruta) => {
    setRutaEditada(ruta);
    setModalEditar(!modalEditar);
  };

  const eliminarRuta = (id) => {
    setRutaAEliminar(id);
    setConfirmarEliminar(true);
  };

  const guardarCambiosRuta = async (rutaActualizada) => {
    try {
      const token = AuthService.getCurrentUser();
      
      const dataToSend = {
        ...rutaActualizada,
        estado: rutaActualizada.estado === 'Activo' ? 1 : 0,
        id_bodega: rutaActualizada.id_bodega.toString(),
        id_destino: parseInt(rutaActualizada.id_destino, 10),
      };
  
      const response = await axios.put(`${API_URL}/rutas/${rutaActualizada.id}`, dataToSend, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.data && response.data.ruta) {
        setModalEditar(false);
        setRutaEditada(null);
        toast.success("Cambios guardados con éxito");
        await fetchData(currentPage);
      } else {
        throw new Error('Respuesta inesperada del servidor');
      }
    } catch (error) {
      console.error("Error al actualizar ruta:", error);
      if (error.response && error.response.data && error.response.data.errors) {
        console.error("Errores de validación:", error.response.data.errors);
      }
      toast.error("Error al guardar los cambios. Por favor, intente de nuevo.");
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
    fetchData(pageNumber);
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Gestión de Rutas" breadcrumbItem="Listado de Rutas" />
        <Row>
        <Col lg={12}>
          <div
              style={{
                marginTop: "10px",
                display: "flex",
                alignItems: "center",
              }}
            >
                <Label for="busquedaNombre" style={{ marginRight: "10px" }}>
                  Buscar:
                </Label>
                <Input
                  type="text"
                  id="busqueda"
                  value={busquedaNombre}
                  onChange={handleBusquedaNombreChange}
                  placeholder="Buscar por nombre"
                  style={{ width: "300px" }}
                />
      
                <Label for="busquedaBodega" style={{ marginLeft: "10px", marginRight: "10px" }}>
                  Bodega:
                </Label>
                <Input
                  type="select"
                  id="busquedaBodega"
                  value={busquedaBodega}
                  onChange={handleBusquedaBodegaChange}
                  style={{ width: "200px" }}
                >
                  <option value="">Todas</option>
                  {bodegas.map((bodega) => (
                    <option key={bodega.id} value={bodega.id}>
                      {bodega.nombre}
                    </option>
                  ))}
                </Input>
              <div className="ms-auto mb-2">
                <Link to="/AgregarRuta" className="btn btn-primary">
                  <i className="fas fa-plus me-2"></i>Agregar Ruta
                </Link>
              </div>
            </div>
          </Col>
        </Row>
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
          <Col lg={12} className="d-flex justify-content-center mt-4">
            <Pagination
              activePage={currentPage}
              itemsCountPerPage={ITEMS_PER_PAGE}
              totalItemsCount={totalItems}
              pageRangeDisplayed={5}
              onChange={handlePageChange}
              itemClass="page-item"
              linkClass="page-link"
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