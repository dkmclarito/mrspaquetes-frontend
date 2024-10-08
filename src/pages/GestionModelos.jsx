import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Container, Row, Col, Card, CardBody, Input, Label, Button } from "reactstrap";
import { Link } from "react-router-dom";
import Breadcrumbs from "../components/Vehiculos/Common/Breadcrumbs";
import TablaModelos from "../components/Vehiculos/TablaModelos";
import ModalEditarModelo from "../components/Vehiculos/ModalEditarModelo";
import ModalConfirmarEliminar from "../components/Vehiculos/ModalConfirmarEliminarModelo";
import AuthService from "../services/authService";
import Pagination from 'react-js-pagination';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../styles/Vehiculos.css";

const API_URL = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 10;

const GestionModelos = () => {
  document.title = "Modelos | Vehículos";

  const [modelos, setModelos] = useState([]);
  const [modalEditar, setModalEditar] = useState(false);
  const [modeloEditado, setModeloEditado] = useState(null);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [modeloAEliminar, setModeloAEliminar] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [marcas, setMarcas] = useState([]);
  const token = AuthService.getCurrentUser();

  const verificarEstadoUsuarioLogueado = useCallback(async () => {
    try {
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
  }, [token]);

  useEffect(() => {
    verificarEstadoUsuarioLogueado();

    const interval = setInterval(() => {
      verificarEstadoUsuarioLogueado();
    }, 30000);

    return () => clearInterval(interval);
  }, [verificarEstadoUsuarioLogueado]);

  useEffect(() => {
    const fetchData = async () => {
      try {
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
  }, [token]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseMarcas = await axios.get(`${API_URL}/dropdown/get_marcas`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setMarcas(responseMarcas.data.marcas || []);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };

    fetchData();
  }, [token]);

  const eliminarModelo = (idModelo) => {
    setConfirmarEliminar(true);
    setModeloAEliminar(idModelo);
  };

  const confirmarEliminarModelo = async () => {
    try {
      await axios.delete(`${API_URL}/modeloVehiculo/${modeloAEliminar}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setModelos(modelos.filter(modelo => modelo.id !== modeloAEliminar));
      setConfirmarEliminar(false);
      setModeloAEliminar(null);
      toast.success("Modelo eliminado exitosamente.", { position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true, }); // Mostrar notificación de éxito
    } catch (error) {
      console.error("Error al eliminar modelo:", error);
      setConfirmarEliminar(false);
      toast.error("Error al eliminar el modelo.", { position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true, });// Mostrar notificación de error
    }
  };

  const toggleModalEditar = (modelo) => {
    setModeloEditado(modelo);
    setModalEditar(!modalEditar);
  };

  const guardarCambiosModelo = async () => {
    try {
      await axios.put(`${API_URL}/modeloVehiculo/${modeloEditado.id}`, modeloEditado, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
 
      setModelos(prevModelos => {
        const updatedModelos = prevModelos.map(modelo =>
          modelo.id === modeloEditado.id ? { ...modelo, ...modeloEditado } : modelo
        );
        return updatedModelos;
      });
 
      setModalEditar(false);
      setModeloEditado(null);
      toast.success("Modelo actualizado exitosamente.", { position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true, }); // Mostrar notificación de éxito
    } catch (error) {
      console.error("Error al actualizar modelo:", error);
      toast.error("Error al actualizar el modelo.", { position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true, }); // Mostrar notificación de error
    }
  };

  const filtrarModelos = (modelos) => {
    if (!busqueda) return modelos;
    return modelos.filter(modelo =>
      modelo.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
  };

  const handleSearch = (event) => {
    setBusqueda(event.target.value);
    setCurrentPage(1); // Reiniciar a la primera página al buscar
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
                onChange={handleSearch}
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
                  marcas={marcas}
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
        marcas={marcas}
      />
      <ModalConfirmarEliminar
        confirmarEliminar={confirmarEliminar}
        confirmarEliminarModelo={confirmarEliminarModelo}
        setConfirmarEliminar={setConfirmarEliminar}
      />
      <ToastContainer />
    </div>
  );
};

export default GestionModelos;
