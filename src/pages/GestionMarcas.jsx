import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, Card, CardBody, Input, Label, Button } from "reactstrap";
import { Link } from "react-router-dom";
import Breadcrumbs from "../components/Vehiculos/Common/Breadcrumbs";
import TablaMarcas from "../components/Vehiculos/TablaMarcas";
import ModalEditarMarca from "../components/Vehiculos/ModalEditarMarca";
import ModalConfirmarEliminar from "../components/Vehiculos/ModalConfirmarEliminarMarca";
import AuthService from "../services/authService";
import Pagination from 'react-js-pagination';
import "../styles/Vehiculos.css";

const API_URL = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 5;

const GestionMarcas = () => {
  document.title = "Marcas | Vehículos";

  const [marcas, setMarcas] = useState([]);
  const [modalEditar, setModalEditar] = useState(false);
  const [marcaEditada, setMarcaEditada] = useState(null);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [marcaAEliminar, setMarcaAEliminar] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = AuthService.getCurrentUser();
        const response = await axios.get(`${API_URL}/marcaVehiculo`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.data && Array.isArray(response.data)) {
          setMarcas(response.data);
        } else if (response.data && Array.isArray(response.data.data)) {
          setMarcas(response.data.data);
        } else {
          console.error("Respuesta no válida para marcas:", response.data);
        }
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };

    fetchData();
  }, []);

  const eliminarMarca = (idMarca) => {
    setConfirmarEliminar(true);
    setMarcaAEliminar(idMarca);
  };

  const confirmarEliminarMarca = async () => {
    try {
      const token = AuthService.getCurrentUser();
      await axios.delete(`${API_URL}/marcaVehiculo/${marcaAEliminar}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setMarcas(marcas.filter(marca => marca.id !== marcaAEliminar));
      setConfirmarEliminar(false);
      setMarcaAEliminar(null);
    } catch (error) {
      console.error("Error al eliminar marca:", error);
      setConfirmarEliminar(false);
    }
  };

  const toggleModalEditar = (marca) => {
    setMarcaEditada(marca);
    setModalEditar(!modalEditar);
  };

  const guardarCambiosMarca = async () => {
    try {
      const token = AuthService.getCurrentUser();
      await axios.put(`${API_URL}/marcaVehiculo/${marcaEditada.id}`, marcaEditada, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      setMarcas(marcas.map(marca => marca.id === marcaEditada.id ? marcaEditada : marca));
      setModalEditar(false);
      setMarcaEditada(null);
    } catch (error) {
      console.error("Error al actualizar marca:", error);
    }
  };

  const filtrarMarcas = (marcas) => {
    if (!busqueda) return marcas;
    return marcas.filter(marca =>
      marca.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const marcasFiltradas = filtrarMarcas(marcas);
  const paginatedMarcas = marcasFiltradas.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Gestión de Marcas" breadcrumbItem="Listado de Marcas" />
        <Row>
          <Col lg={12}>
            <div style={{ marginTop: "10px", display: 'flex', alignItems: 'center' }}>
              <Label for="busqueda" style={{ marginRight: "10px" }}>Buscar:</Label>
              <Input
                type="text"
                id="busqueda"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre de marca"
                style={{ width: "300px" }}
              />
              <div style={{ marginLeft: "auto" }}>
                <Link to="/AgregarMarca" className="btn btn-primary custom-button">
                  <i className="fas fa-plus"></i> Agregar Marca
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
                <TablaMarcas
                  marcas={paginatedMarcas}
                  eliminarMarca={eliminarMarca}
                  toggleModalEditar={toggleModalEditar}
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
              totalItemsCount={marcasFiltradas.length}
              pageRangeDisplayed={5}
              onChange={handlePageChange}
              itemClass="page-item"
              linkClass="page-link"
              innerClass="pagination"
            />
          </Col>
        </Row>
      </Container>
      <ModalEditarMarca
        modalEditar={modalEditar}
        marcaEditada={marcaEditada}
        setMarcaEditada={setMarcaEditada}
        guardarCambiosMarca={guardarCambiosMarca}
        setModalEditar={setModalEditar}
      />
      <ModalConfirmarEliminar
        confirmarEliminar={confirmarEliminar}
        confirmarEliminarMarca={confirmarEliminarMarca}
        setConfirmarEliminar={setConfirmarEliminar}
      />
    </div>
  );
};

export default GestionMarcas;
