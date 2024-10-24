import React, { useState, useEffect, useCallback, useMemo } from "react";
import { debounce } from "lodash";
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
  Collapse,
} from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import Breadcrumbs from "../components/Empleados/Common/Breadcrumbs";
import TablaOrdenes from "../components/Ordenes/TablaOrdenes";
import Pagination from "react-js-pagination";
import { toast } from "react-toastify";
import ModalConfirmarCancelar from "../components/Ordenes/ModalConfirmarCancelar";
import AuthService from "../services/authService";

const API_URL = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 7;

export default function GestionPreOrdenes() {
  document.title = "Pre Orden | Mr. Paquetes";
  const [ordenes, setOrdenes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalCancelar, setModalCancelar] = useState(false);
  const [ordenACancelar, setOrdenACancelar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filtros, setFiltros] = useState({
    cliente: "",
    numeroSeguimiento: "",
    estado: "",
    fechaDesde: "",
    fechaHasta: "",
  });
  const [ordenamiento, setOrdenamiento] = useState({
    campo: "",
    direccion: "asc",
  });

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

  const fetchOrdenes = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      let allOrdenes = [];
      let currentPage = 1;
      let hasNextPage = true;

      while (hasNextPage) {
        const response = await axios.get(`${API_URL}/ordenes`, {
          params: { page: currentPage },
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log(
          `Ordenes recibidas de la página ${currentPage}:`,
          response.data
        );

        const preOrdenesNormales = response.data.data.filter(
          (orden) =>
            orden.tipo_orden === "preorden" &&
            orden.detalles.every(
              (detalle) => detalle.tipo_entrega === "Entrega Normal"
            )
        );

        allOrdenes = [...allOrdenes, ...preOrdenesNormales];

        if (response.data.next_page_url) {
          currentPage++;
        } else {
          hasNextPage = false;
        }
      }

      console.log(
        "Total de pre-órdenes normales filtradas:",
        allOrdenes.length
      );
      setOrdenes(allOrdenes);
      setTotalItems(allOrdenes.length);
    } catch (error) {
      console.error("Error al obtener órdenes:", error);
      toast.error("Error al cargar las órdenes");
    } finally {
      setLoading(false);
    }
  }, []);

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

  const toggleFiltros = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  const aplicarFiltrosYOrdenamiento = useCallback(
    (ordenes) => {
      let resultado = ordenes.filter(
        (orden) =>
          orden.cliente.nombre
            .toLowerCase()
            .includes(filtros.cliente.toLowerCase()) &&
          orden.numero_seguimiento
            .toLowerCase()
            .includes(filtros.numeroSeguimiento.toLowerCase()) &&
          (filtros.estado === "" || orden.estado === filtros.estado) &&
          (!filtros.fechaDesde ||
            new Date(orden.created_at) >= new Date(filtros.fechaDesde)) &&
          (!filtros.fechaHasta ||
            new Date(orden.created_at) <= new Date(filtros.fechaHasta))
      );

      if (ordenamiento.campo) {
        resultado.sort((a, b) => {
          if (a[ordenamiento.campo] < b[ordenamiento.campo])
            return ordenamiento.direccion === "asc" ? -1 : 1;
          if (a[ordenamiento.campo] > b[ordenamiento.campo])
            return ordenamiento.direccion === "asc" ? 1 : -1;
          return 0;
        });
      }

      return resultado;
    },
    [filtros, ordenamiento]
  );

  const ordenesFiltradas = useMemo(
    () => aplicarFiltrosYOrdenamiento(ordenes),
    [ordenes, aplicarFiltrosYOrdenamiento]
  );

  const handleOrdenar = (campo) => {
    setOrdenamiento((prev) => ({
      campo,
      direccion:
        prev.campo === campo && prev.direccion === "asc" ? "desc" : "asc",
    }));
  };

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

  const handleProcesarPago = useCallback(
    (idCliente, ruta) => {
      if (!idCliente) {
        console.error("Error: ID del cliente no disponible");
        toast.error("Error: Información del cliente no disponible");
        return;
      }
      navigate(ruta);
    },
    [navigate]
  );

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

  const filtrarOrdenes = useCallback(
    (ordenes) => {
      if (!busqueda) return ordenes;
      return ordenes.filter(
        (orden) =>
          orden.cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          orden.cliente.apellido
            .toLowerCase()
            .includes(busqueda.toLowerCase()) ||
          orden.numero_seguimiento
            .toLowerCase()
            .includes(busqueda.toLowerCase())
      );
    },
    [busqueda]
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs
          title="Gestión de Pre-Órdenes"
          breadcrumbItem="Listado de Pre-Órdenes"
        />
        <Row>
          <Col lg={12}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <Button color="primary" onClick={toggleFiltros}>
                <FontAwesomeIcon icon={faFilter} />{" "}
                {isFilterOpen ? "Ocultar Filtros" : "Mostrar Filtros"}
              </Button>
              <Link
                to="/PreOrdenesSeleccionarCliente"
                className="btn btn-primary"
              >
                <i className="fas fa-plus"></i> Agregar Pre-Orden
              </Link>
            </div>
            <Collapse isOpen={isFilterOpen}>
              <Card>
                <CardBody>
                  <h5>Busqueda</h5>
                  <Row>
                    <Col md={3}>
                      <Input
                        type="text"
                        name="cliente"
                        value={filtros.cliente}
                        onChange={handleFiltroChange}
                        placeholder="Nombre del cliente"
                      />
                    </Col>
                    <Col md={3}>
                      <Input
                        type="text"
                        name="numeroSeguimiento"
                        value={filtros.numeroSeguimiento}
                        onChange={handleFiltroChange}
                        placeholder="Número de seguimiento"
                      />
                    </Col>
                    <Col md={2}>
                      <Input
                        type="date"
                        name="fechaDesde"
                        value={filtros.fechaDesde}
                        onChange={handleFiltroChange}
                      />
                    </Col>
                    <Col md={2}>
                      <Input
                        type="date"
                        name="fechaHasta"
                        value={filtros.fechaHasta}
                        onChange={handleFiltroChange}
                      />
                    </Col>
                  </Row>
                  <Row className="mt-3">
                    <Col>
                      <Button
                        color="secondary"
                        onClick={() =>
                          setFiltros({
                            cliente: "",
                            numeroSeguimiento: "",
                            estado: "",
                            fechaDesde: "",
                            fechaHasta: "",
                          })
                        }
                      >
                        Limpiar filtros
                      </Button>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Collapse>
          </Col>
        </Row>
        <br />
        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                {loading ? (
                  <p>Cargando órdenes...</p>
                ) : (
                  <TablaOrdenes
                    ordenes={ordenesFiltradas.slice(
                      (currentPage - 1) * ITEMS_PER_PAGE,
                      currentPage * ITEMS_PER_PAGE
                    )}
                    cancelarOrden={iniciarCancelarOrden}
                    navegarAEditar={navegarAEditar}
                    verDetallesOrden={verDetallesOrden}
                    actualizarOrden={actualizarOrdenLocal}
                    procesarPago={handleProcesarPago}
                    onOrdenar={handleOrdenar}
                    ordenamiento={ordenamiento}
                  />
                )}
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
              totalItemsCount={totalItems}
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
