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
            per_page: 1000,
          },
          ...config,
        });
        setUbicaciones(responseUbicaciones.data || []);
        //console.log(responseUbicaciones.data);
      } catch (error) {
        console.error("Error al obtener ubicaciones:", error);
      }
    };

    fetchData();
  }, [ubicaciones]);

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
      toast.success("Ubicación eliminada con éxito", {
        position: "bottom-right",
        autoClose: 6000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
     
    } catch (error) {
      console.error("Error al eliminar ubicación:", error);
      setConfirmarEliminar(false);
      toast.error("Error al eliminar la ubicación", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
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
          codigo_nomenclatura_ubicacion: ubicacionEditada.codigo_nomenclatura_ubicacion,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUbicaciones((prevUbicaciones) =>
        prevUbicaciones.map((ubicacion) =>
          ubicacion.id === ubicacionEditada.id
            ? { ...ubicacion, codigo_nomenclatura_ubicacion: ubicacionEditada.codigo_nomenclatura_ubicacion }
            : ubicacion
        )
      );
      
      setModalEditar(false);
      
      toast.success("Ubicación actualizada con éxito", {
        position: "bottom-right",
        autoClose: 6000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error("Error al actualizar ubicación:", error);
      toast.error("Error al actualizar la ubicación, ya está asignada o no existe", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const filtrarUbicaciones = (ubicaciones) => {
    if (!Array.isArray(ubicaciones)) return [];

    return ubicaciones.filter((ubicacion) =>
      ubicacion.id.toString().toLowerCase().includes(busqueda.toLowerCase()) ||
      (ubicacion.numero_orden && ubicacion.numero_orden.toLowerCase().includes(busqueda.toLowerCase())) ||
      (ubicacion.qr_paquete && ubicacion.qr_paquete.toLowerCase().includes(busqueda.toLowerCase())) ||
      (ubicacion.descripcion_paquete && ubicacion.descripcion_paquete.toLowerCase().includes(busqueda.toLowerCase())) ||
      (ubicacion.nomenclatura_ubicacion && ubicacion.nomenclatura_ubicacion.toLowerCase().includes(busqueda.toLowerCase()))
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
