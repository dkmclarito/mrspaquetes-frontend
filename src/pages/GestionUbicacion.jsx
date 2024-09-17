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
import { Link, useNavigate } from "react-router-dom";
import Breadcrumbs from "../components/Ubicaciones/Common/Breadcrumbs";
import AuthService from "../services/authService";
import Pagination from "react-js-pagination";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ModalEditarUbicacion from "../components/Ubicaciones/ModalEditarUbicacion";
import ModalConfirmarEliminarUbicacion from "../components/Ubicaciones/ModalConfirmarEliminarUbicacion";
import TablaUbicacion from "../components/Ubicaciones/TablaUbicacion";

const API_URL = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 10;

const GestionUbicacion = () => {
  document.title = "Ubicaciones | Gestión";
  const navigate = useNavigate();
  const [ubicaciones, setUbicaciones] = useState([]);
  const [modalEditar, setModalEditar] = useState(false);
  const [ubicacionEditada, setUbicacionEditada] = useState({
    id: null,
    id_ubicacion: null,
    nombre: "",
    estado: false,
  });
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [ubicacionAEliminar, setUbicacionAEliminar] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // const verificarEstadoUsuarioLogueado = useCallback(async () => {
  //   try {
  //     const userId = localStorage.getItem("userId");
  //     const token = AuthService.getCurrentUser();

  //     if (userId && token) {
  //       const response = await fetch(`${API_URL}/auth/show/${userId}`, {
  //         headers: { Authorization: `Bearer ${token}` },
  //       });

  //       const responseData = await response.json();

  //       if (responseData.status === "Token is Invalid") {
  //         console.error("Token is invalid. Logging out...");
  //         AuthService.logout();
  //         window.location.href = "/login";
  //         return;
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error al verificar el estado del usuario:", error);
  //   }
  // }, [API_URL]);

  // useEffect(() => {
  //   verificarEstadoUsuarioLogueado();
  // }, [verificarEstadoUsuarioLogueado]);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     verificarEstadoUsuarioLogueado();
  //   }, 30000);

  //   return () => clearInterval(interval);
  // }, [verificarEstadoUsuarioLogueado]);

  const verDetallesUbicacion = (idUbicacion) => {
    navigate(`/DetallesUbicacion/${idUbicacion}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { 'Authorization': `Bearer ${token}` } };
        const responseUbicaciones = await axios.get(`${API_URL}/ubicaciones-paquetes`, {
          params: {
            page: 1,
            per_page: 1000
          },
          ...config
        });
        setUbicaciones(responseUbicaciones.data.data || []);
        console.log(responseUbicaciones.data.data);
      } catch (error) {
        console.error("Error al obtener ubicaciones:", error);
      }
    };

    fetchData();
  }, []);

  const confirmarEliminarUbicacion = async () => {
    try {
      const token = AuthService.getCurrentUser();
      await axios.delete(`${API_URL}/ubicaciones-paquetes/${ubicacionAEliminar}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const ubicacionesRestantes = ubicaciones.filter(
        (ubicacion) => ubicacion.id !== ubicacionAEliminar
      );

      setUbicaciones(ubicacionesRestantes);
      setConfirmarEliminar(false);
      toast.success("Ubicación eliminada con éxito");
    } catch (error) {
      console.error("Error al eliminar ubicación:", error);
      setConfirmarEliminar(false);
      toast.error("Error al eliminar la ubicación");
    }
  };

  const toggleModalEditar = (ubicacion) => {
    setUbicacionEditada(
      ubicacion || {
        id: null,
        id_ubicacion: null,
        nombre: "",
        estado: false,
      }
    );
    setModalEditar(!modalEditar);
  };

  const eliminarUbicacion = (id) => {
    setUbicacionAEliminar(id);
    setConfirmarEliminar(true);
  };

  const guardarCambiosUbicacion = async () => {
    try {
      const token = AuthService.getCurrentUser();
      await axios.put(
        `${API_URL}/ubicaciones-paquetes/${ubicacionEditada.id}`,
        {
          id_ubicacion: ubicacionEditada.id_ubicacion,
          nombre: ubicacionEditada.nombre,
          estado: ubicacionEditada.estado,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUbicaciones(
        ubicaciones.map((ubicacion) =>
          ubicacion.id === ubicacionEditada.id
            ? ubicacionEditada
            : ubicacion
        )
      );
      setModalEditar(false);
      toast.success("Ubicación actualizada con éxito");
    } catch (error) {
      console.error("Error al actualizar ubicación:", error);
      toast.error("Error al actualizar la ubicación");
    }
  };

  const filtrarUbicaciones = (ubicaciones) => {
    if (!Array.isArray(ubicaciones)) return [];

    return ubicaciones.filter((ubicacion) =>
      ubicacion.id_ubicacion.toString().includes(busqueda.toLowerCase())
    );
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearchChange = (e) => {
    setBusqueda(e.target.value);
    setCurrentPage(1);
  };

  const ubicacionesFiltradas = filtrarUbicaciones(ubicaciones);

  const paginatedUbicaciones = ubicacionesFiltradas.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs
          title="Gestión de Ubicaciones"
          breadcrumbItem="Listado de Ubicaciones"
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
                placeholder="Buscar por ID de ubicación"
                style={{ width: "300px" }}
              />
              <div style={{ marginLeft: "auto" }}>
                <Link
                  to="/AgregarUbicacion"
                  className="btn btn-primary custom-button"
                >
                  <i className="fas fa-plus"></i> Agregar Ubicación
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
                <TablaUbicacion
                  ubicaciones={paginatedUbicaciones}
                  eliminarUbicacion={eliminarUbicacion}
                  toggleModalEditar={toggleModalEditar}
                  verDetallesUbicacion={verDetallesUbicacion}
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
              totalItemsCount={ubicacionesFiltradas.length}
              pageRangeDisplayed={5}
              onChange={handlePageChange}
              itemClass="page-item"
              linkClass="page-link"
              innerClass="pagination"
            />
          </Col>
        </Row>
      </Container>
      <ModalEditarUbicacion
        modalEditar={modalEditar}
        ubicacionEditada={ubicacionEditada}
        setUbicacionEditada={setUbicacionEditada}
        guardarCambiosUbicacion={guardarCambiosUbicacion}
        setModalEditar={setModalEditar}
      />

      <ModalConfirmarEliminarUbicacion
        confirmarEliminar={confirmarEliminar}
        confirmarEliminarUbicacion={confirmarEliminarUbicacion}
        setConfirmarEliminar={setConfirmarEliminar}
      />
      <ToastContainer />
    </div>
  );
};

export default GestionUbicacion;
