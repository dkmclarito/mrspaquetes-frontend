import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Container, Row, Col, Card, CardBody, Input, Label } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import Breadcrumbs from "../components/Empleados/Common/Breadcrumbs";
import TablaOrdenes from "../components/Ordenes/TablaOrdenes";
import Pagination from "react-js-pagination";
import { toast } from "react-toastify";
import ModalConfirmarCancelar from "../components/Ordenes/ModalConfirmarCancelar";

import AuthService from "../services/authService";

const API_URL = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 7;

export default function GestionOrdenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalCancelar, setModalCancelar] = useState(false);
  const [ordenACancelar, setOrdenACancelar] = useState(null);

  const navigate = useNavigate();

  // Nueva función para verificar el estado del usuario logueado
  const verificarEstadoUsuarioLogueado = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userId");
      const token = AuthService.getCurrentUser();

      if (userId && token) {
        const response = await axios.get(`${API_URL}/auth/show/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Verifica si el token es inválido
        if (response.data.status === "Token is Invalid") {
          console.error("Token is invalid. Logging out...");
          AuthService.logout();
          window.location.href = "/login"; // Redirige a login si el token es inválido
          return;
        }

        // Si el token es válido y el usuario está activo, no se hace nada
      }
    } catch (error) {
      console.error("Error 500 DKM:", error);
      //AuthService.logout();
      //window.location.href = "/login";
    }
  }, []);

  const fetchOrdenes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/ordenes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Ordenes recibidas desde API:", response.data);

      // Filtrar las órdenes para mostrar solo las de tipo entrega normal
      const ordenesNormales = response.data.data.filter(
        (orden) =>
          orden.tipo_orden === "orden" &&
          orden.detalles.some(
            (detalle) => detalle.tipo_entrega === "Entrega Normal"
          )
      );

      setOrdenes(ordenesNormales);
    } catch (error) {
      console.error("Error al obtener órdenes:", error);
      toast.error("Error al cargar las órdenes");
    }
  };

  useEffect(() => {
    verificarEstadoUsuarioLogueado(); // Verifica el estado del usuario al cargar la página
    fetchOrdenes();
  }, [verificarEstadoUsuarioLogueado]);

  useEffect(() => {
    const interval = setInterval(() => {
      verificarEstadoUsuarioLogueado(); // Verifica el estado del usuario cada cierto tiempo
    }, 30000); // Verifica cada 30 segundos, ajusta según sea necesario

    return () => clearInterval(interval); // Limpia el intervalo al desmontar el componente
  }, [verificarEstadoUsuarioLogueado]);

  const toggleModalCancelar = () => {
    setModalCancelar(!modalCancelar);
  };

  const iniciarCancelarOrden = (id) => {
    setOrdenACancelar(id);
    toggleModalCancelar();
  };

  const confirmarCancelarOrden = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_URL}/ordenes/${ordenACancelar}/cancelar`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        toast.success("Orden cancelada con éxito");
        actualizarOrdenLocal(ordenACancelar, { estado: "Cancelada" });
        toggleModalCancelar();
      }
    } catch (error) {
      console.error("Error al cancelar la orden:", error);
      toast.error(
        error.response?.data?.message || "Error al cancelar la orden"
      );
    }
  };

  const actualizarOrdenLocal = (id, nuevosDatos) => {
    setOrdenes((ordenesActuales) =>
      ordenesActuales.map((orden) =>
        orden.id === id ? { ...orden, ...nuevosDatos } : orden
      )
    );
  };

  const verDetallesOrden = (idOrden) => {
    navigate(`/VerDetallesOrden/${idOrden}`);
  };

  const navegarAEditar = (idOrden) => {
    navigate(`/editar-orden/${idOrden}`);
  };

  const handleSearchChange = (e) => {
    setBusqueda(e.target.value);
    setCurrentPage(1);
  };

  const filtrarOrdenes = (ordenes) => {
    if (!busqueda) return ordenes;
    return ordenes.filter(
      (orden) =>
        orden.cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        orden.numero_seguimiento.toLowerCase().includes(busqueda.toLowerCase())
    );
  };

  const ordenesFiltradas = filtrarOrdenes(ordenes);
  const paginatedOrdenes = ordenesFiltradas.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs
          title="Gestión de Órdenes"
          breadcrumbItem="Listado de Órdenes"
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
                placeholder="Buscar por nombre del cliente o número de seguimiento"
                style={{ width: "500px" }}
              />
              <div style={{ marginLeft: "auto" }}>
                <Link
                  to="/OrdenesSeleccionarCliente"
                  className="btn btn-primary custom-button"
                >
                  <i className="fas fa-plus"></i> Agregar Orden
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
                <TablaOrdenes
                  ordenes={paginatedOrdenes}
                  cancelarOrden={iniciarCancelarOrden}
                  navegarAEditar={navegarAEditar}
                  verDetallesOrden={verDetallesOrden}
                  actualizarOrden={actualizarOrdenLocal}
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
              totalItemsCount={ordenesFiltradas.length}
              pageRangeDisplayed={5}
              onChange={handlePageChange}
              itemClass="page-item"
              linkClass="page-link"
              innerClass="pagination"
            />
          </Col>
        </Row>
      </Container>
      <ModalConfirmarCancelar
        isOpen={modalCancelar}
        toggle={toggleModalCancelar}
        ordenId={ordenACancelar}
        confirmarCancelar={confirmarCancelarOrden}
      />
    </div>
  );
}
