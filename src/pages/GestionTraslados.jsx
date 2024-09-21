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
import Breadcrumbs from "../components/Traslados/Common/Breadcrumbs";
import AuthService from "../services/authService";
import Pagination from "react-js-pagination";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TablaTraslados from "../components/Traslados/TablaTraslados";
import ModalConfirmarEliminarTraslado from "../components/Traslados/ModalConfirmarEliminarTraslado";

const API_URL = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 10;

const GestionTraslados = () => {
  document.title = "Traslados | Gestión";
  const navigate = useNavigate();
  const [traslados, setTraslados] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [selectedTrasladoId, setSelectedTrasladoId] = useState(null);

  const verificarEstadoUsuarioLogueado = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userId");
      const token = AuthService.getCurrentUser();

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
  }, [verificarEstadoUsuarioLogueado]);

  useEffect(() => {
    const interval = setInterval(() => {
      verificarEstadoUsuarioLogueado();
    }, 30000);

    return () => clearInterval(interval);
  }, [verificarEstadoUsuarioLogueado]);

  useEffect(() => {
    fetchTraslados();
  }, [currentPage]);

  const fetchTraslados = async () => {
    try {
      const token = AuthService.getCurrentUser();
      const response = await axios.get(`${API_URL}/traslados`, {
        params: {
          page: currentPage,
          per_page: ITEMS_PER_PAGE,
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      setTraslados(response.data.data);
      setTotalItems(response.data.total);
    } catch (error) {
      console.error("Error al obtener traslados:", error);
      toast.error("Error al cargar los traslados");
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearchChange = (e) => {
    setBusqueda(e.target.value);
    setCurrentPage(1);
  };

  const verDetallesTraslado = (id) => {
    navigate(`/DetallesTraslados/${id}`);
  };

  const eliminarTraslado = (id) => {
    setSelectedTrasladoId(id);
    setModalEliminar(true);
  };

  const onTrasladoEliminado = () => {
    fetchTraslados();
  };

  const filtrarTraslados = (traslados) => {
    if (!Array.isArray(traslados)) return [];

    return traslados.filter((traslado) =>
      traslado.numero_traslado.toLowerCase().includes(busqueda.toLowerCase())
    );
  };

  const editarTraslado = (id) => {
    navigate(`/EditarTraslados/${id}`);
  };

  const trasladosFiltrados = filtrarTraslados(traslados);

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs
          title="Gestión de Traslados"
          breadcrumbItem="Listado de Traslados"
        />
        <Row>
          <Col lg={12}>
            <div className="d-flex align-items-center mb-2">
              <Label for="busqueda" className="me-2">
                Buscar:
              </Label>
              <Input
                type="text"
                id="busqueda"
                value={busqueda}
                onChange={handleSearchChange}
                placeholder="Buscar por número de traslado"
                style={{ width: "300px" }}
              />
              <div className="ms-auto">
                <Link
                  to="/AgregarTraslados"
                  className="btn btn-primary"
                >
                  <i className="fas fa-plus me-1"></i> Agregar Traslado
                </Link>
              </div>
            </div>
          </Col>
        </Row>
        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <TablaTraslados
                  traslados={trasladosFiltrados}
                  verDetallesTraslado={verDetallesTraslado}
                  editarTraslado={editarTraslado}
                  eliminarTraslado={eliminarTraslado}
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col lg={12} className="d-flex justify-content-center mt-3">
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
      <ToastContainer />
      <ModalConfirmarEliminarTraslado
        isOpen={modalEliminar}
        toggle={() => setModalEliminar(!modalEliminar)}
        trasladoId={selectedTrasladoId}
        onTrasladoEliminado={onTrasladoEliminado}
      />
    </div>
  );
};

export default GestionTraslados;