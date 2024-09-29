import React, { useState, useEffect, useCallback } from "react";
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
import Breadcrumbs from "../components/Vehiculos/Common/Breadcrumbs";
import TablaVehiculos from "../components/Vehiculos/TablaVehiculos";
import ModalEditarVehiculo from "../components/Vehiculos/ModalEditarVehiculo";
import ModalConfirmarEliminar from "../components/Vehiculos/ModalConfirmarEliminarVehiculo";
import AuthService from "../services/authService";
import Pagination from "react-js-pagination";
import "../styles/Vehiculos.css";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 10;

const GestionVehiculos = () => {
  document.title = "Vehículos | Gestión";
  const navigate = useNavigate();

  const [vehiculos, setVehiculos] = useState([]);
  const [modalEditar, setModalEditar] = useState(false);
  const [vehiculoEditado, setVehiculoEditado] = useState(null);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [vehiculoAEliminar, setVehiculoAEliminar] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const verificarEstadoUsuarioLogueado = useCallback(async () => {
    try {
      const token = AuthService.getCurrentUser();
      const userId = localStorage.getItem("userId");
      if (userId && token) {
        const response = await fetch(`${API_URL}/auth/show/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const responseData = await response.json();

        if (responseData.status === "Token is Invalid") {
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

  useEffect(() => {
    verificarEstadoUsuarioLogueado();

    const interval = setInterval(() => {
      verificarEstadoUsuarioLogueado();
    }, 30000);

    return () => clearInterval(interval);
  }, [verificarEstadoUsuarioLogueado]);

  const verDetallesVehiculo = (idVehiculo) => {
    navigate(`/DetallesVehiculo/${idVehiculo}`);
  };

  const handleSearch = (event) => {
    setBusqueda(event.target.value);
    setCurrentPage(1); // Reiniciar a la primera página al buscar
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(`${API_URL}/vehiculo`, {
          params: {
            page: 1,
            per_page: 1000, // Cargar una gran cantidad de vehículos para buscar en todos
          },
          ...config,
        });

        if (response.data && Array.isArray(response.data)) {
          setVehiculos(response.data);
        } else if (response.data && Array.isArray(response.data.data)) {
          setVehiculos(response.data.data);
        } else {
          console.error("Respuesta no válida para vehículos:", response.data);
        }
      } catch (error) {
        console.error("Error al obtener vehículos:", error);
      }
    };

    fetchData();
  }, []);

  const eliminarVehiculo = (idVehiculo) => {
    setConfirmarEliminar(true);
    setVehiculoAEliminar(idVehiculo);
  };

  const confirmarEliminarVehiculo = async () => {
    try {
      const token = AuthService.getCurrentUser();
      await axios.delete(`${API_URL}/vehiculo/${vehiculoAEliminar}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setVehiculos(
        vehiculos.filter((vehiculo) => vehiculo.id !== vehiculoAEliminar)
      );
      setConfirmarEliminar(false);
      setVehiculoAEliminar(null);
    } catch (error) {
      console.error("Error al eliminar vehículo:", error);
      setConfirmarEliminar(false);
    }
  };

  const toggleModalEditar = (vehiculo) => {
    setVehiculoEditado(vehiculo);
    setModalEditar(true);
  };

  const guardarCambiosVehiculo = async (vehiculoActualizado) => {
    try {
      const token = AuthService.getCurrentUser();
      const response = await axios.put(
        `${API_URL}/vehiculo/${vehiculoActualizado.id}`,
        vehiculoActualizado,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.vehiculo) {
        setVehiculos(
          vehiculos.map((v) =>
            v.id === response.data.vehiculo.id ? response.data.vehiculo : v
          )
        );
      } else {
        console.error("Respuesta inesperada del servidor:", response.data);
      }

      setModalEditar(false);
      setVehiculoEditado(null);
    } catch (error) {
      console.error("Error al actualizar vehículo:", error);
      if (error.response) {
        console.error("Respuesta del servidor:", error.response.data);
      }
      throw error;
    }
  };

  const filtrarVehiculos = (vehiculos) => {
    if (!busqueda) return vehiculos;
    return vehiculos.filter((vehiculo) =>
      (vehiculo.placa || "").toLowerCase().includes(busqueda.toLowerCase())
    );
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const vehiculosFiltrados = filtrarVehiculos(vehiculos);

  const paginatedVehiculos = vehiculosFiltrados.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs
          title="Gestión de Vehículos"
          breadcrumbItem="Listado de Vehículos"
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
                onChange={handleSearch}
                placeholder="Buscar por placa de vehículo"
                style={{ width: "300px" }}
              />
              <div style={{ marginLeft: "auto" }}>
                <Link
                  to="/AgregarVehiculo"
                  className="btn btn-primary custom-button"
                >
                  <i className="fas fa-plus"></i> Agregar Vehículo
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
                <TablaVehiculos
                  vehiculos={paginatedVehiculos}
                  eliminarVehiculo={eliminarVehiculo}
                  toggleModalEditar={toggleModalEditar}
                  verDetallesVehiculo={verDetallesVehiculo}
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
              totalItemsCount={vehiculosFiltrados.length}
              pageRangeDisplayed={5}
              onChange={handlePageChange}
              itemClass="page-item"
              linkClass="page-link"
              innerClass="pagination"
            />
          </Col>
        </Row>
      </Container>

      <ModalEditarVehiculo
        modalEditar={modalEditar}
        vehiculoEditado={vehiculoEditado}
        setVehiculoEditado={setVehiculoEditado}
        guardarCambiosVehiculo={guardarCambiosVehiculo}
        setModalEditar={setModalEditar}
      />

      <ModalConfirmarEliminar
        confirmarEliminar={confirmarEliminar}
        confirmarEliminarVehiculo={confirmarEliminarVehiculo}
        setConfirmarEliminar={setConfirmarEliminar}
      />
    </div>
  );
};

export default GestionVehiculos;
