import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, Card, CardBody, Input, Label, Button } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import Breadcrumbs from "../components/Vehiculos/Common/Breadcrumbs";
import TablaModelos from "../components/Vehiculos/TablaModelos";
import ModalEditarModelo from "../components/Vehiculos/ModalEditarModelo";
import ModalConfirmarEliminar from "../components/Vehiculos/ModalConfirmarEliminarModelo";
import AuthService from "../services/authService";
import Pagination from 'react-js-pagination';
import "../styles/Vehiculos.css";

const API_URL = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 5;

const GestionModelos = () => {
  document.title = "Modelos | Vehículos";

  const [modelos, setModelos] = useState([]);
  const [modalEditar, setModalEditar] = useState(false);
  const [modeloEditado, setModeloEditado] = useState(null);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [modeloAEliminar, setModeloAEliminar] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();

  const checkUserStatus = async () => {
    try {
      const token = AuthService.getCurrentUser();
      const userId = localStorage.getItem("userId");
      const role = JSON.parse(localStorage.getItem("role"))?.role;

      if (!token || !userId) {
        console.warn("Token o User ID no disponible, redirigiendo al login.");
        navigate("/login");
        return;
      }

      const response = await axios.get(`${API_URL}/auth/get_users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const user = response.data.users.find(u => u.id === parseInt(userId, 10));

      if (user) {
        if (user.status === 0) {
          console.warn("Usuario inactivo, cerrando sesión.");
          AuthService.logout();

          if (role === "admin" || role === "empleado" || role === "basico") {
            navigate("/login");
          } else {
            navigate("/clientelogin");
          }

          window.location.reload();
        } else {
          console.log("Usuario activo, puede continuar.");
        }
      } else {
        console.error("Usuario no encontrado en la respuesta.");
        AuthService.logout();
        navigate("/login");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error al verificar el estado del usuario:", error);
      AuthService.logout();
      navigate("/login");
      window.location.reload();
    }
  };

  useEffect(() => {
    checkUserStatus();

    const fetchData = async () => {
      try {
        const token = AuthService.getCurrentUser();
        const response = await axios.get(`${API_URL}/modeloVehiculo`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data && Array.isArray(response.data)) {
          setModelos(response.data);
        } else if (response.data && Array.isArray(response.data.data)) {
          setModelos(response.data.data);
        } else {
          console.error("Respuesta no válida para modelos:", response.data);
        }
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };

    fetchData();
  }, [navigate]);

  const eliminarModelo = (idModelo) => {
    setConfirmarEliminar(true);
    setModeloAEliminar(idModelo);
  };

  const confirmarEliminarModelo = async () => {
    try {
      const token = AuthService.getCurrentUser();
      await axios.delete(`${API_URL}/modeloVehiculo/${modeloAEliminar}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setModelos(modelos.filter(modelo => modelo.id !== modeloAEliminar));
      setConfirmarEliminar(false);
      setModeloAEliminar(null);
    } catch (error) {
      console.error("Error al eliminar modelo:", error);
      setConfirmarEliminar(false);
    }
  };

  const toggleModalEditar = (modelo) => {
    setModeloEditado(modelo);
    setModalEditar(!modalEditar);
  };

  const guardarCambiosModelo = async () => {
    try {
      const token = AuthService.getCurrentUser();
      await axios.put(`${API_URL}/modeloVehiculo/${modeloEditado.id}`, modeloEditado, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      setModelos(modelos.map(modelo => modelo.id === modeloEditado.id ? modeloEditado : modelo));
      setModalEditar(false);
      setModeloEditado(null);
    } catch (error) {
      console.error("Error al actualizar modelo:", error);
    }
  };

  const filtrarModelos = (modelos) => {
    if (!busqueda) return modelos;
    return modelos.filter(modelo =>
      modelo.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const modelosFiltrados = filtrarModelos(modelos);
  const paginatedModelos = modelosFiltrados.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Gestión de Modelos" breadcrumbItem="Listado de Modelos" />
        <Row>
          <Col lg={12}>
            <div style={{ marginTop: "10px", display: 'flex', alignItems: 'center' }}>
              <Label for="busqueda" style={{ marginRight: "10px" }}>Buscar:</Label>
              <Input
                type="text"
                id="busqueda"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre de modelo"
                style={{ width: "300px" }}
              />
              <div style={{ marginLeft: "auto" }}>
                <Link to="/AgregarModelo" className="btn btn-primary custom-button">
                  <i className="fas fa-plus"></i> Agregar Modelo
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
                <TablaModelos
                  modelos={paginatedModelos}
                  eliminarModelo={eliminarModelo}
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
              totalItemsCount={modelosFiltrados.length}
              pageRangeDisplayed={5}
              onChange={handlePageChange}
              itemClass="page-item"
              linkClass="page-link"
              innerClass="pagination"
            />
          </Col>
        </Row>
      </Container>
      <ModalEditarModelo
        modalEditar={modalEditar}
        modeloEditado={modeloEditado}
        setModeloEditado={setModeloEditado}
        guardarCambiosModelo={guardarCambiosModelo}
        setModalEditar={setModalEditar}
      />
      <ModalConfirmarEliminar
        confirmarEliminar={confirmarEliminar}
        confirmarEliminarModelo={confirmarEliminarModelo}
        setConfirmarEliminar={setConfirmarEliminar}
      />
    </div>
  );
};

export default GestionModelos;
