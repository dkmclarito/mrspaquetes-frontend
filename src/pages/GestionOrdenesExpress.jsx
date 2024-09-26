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
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import Breadcrumbs from "../components/Empleados/Common/Breadcrumbs";
import TablaOrdenes from "../components/Ordenes/TablaOrdenes";
import Pagination from "react-js-pagination";
import { toast } from "react-toastify";
import ModalConfirmarCancelar from "../components/Ordenes/ModalConfirmarCancelar";

const API_URL = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 7;

export default function GestionOrdenesExpress() {
  const [ordenes, setOrdenes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalCancelar, setModalCancelar] = useState(false);
  const [ordenACancelar, setOrdenACancelar] = useState(null);
  const [modalFinalizar, setModalFinalizar] = useState(false);
  const [ordenAFinalizar, setOrdenAFinalizar] = useState(null);
  const [numeroSeguimiento, setNumeroSeguimiento] = useState("");
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  const navigate = useNavigate();

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

        const ordenesExpress = response.data.data.filter(
          (orden) =>
            orden.tipo_orden === "orden" &&
            orden.detalles.every(
              (detalle) => detalle.tipo_entrega === "Entrega Express"
            )
        );

        allOrdenes = [...allOrdenes, ...ordenesExpress];

        if (response.data.next_page_url) {
          currentPage++;
        } else {
          hasNextPage = false;
        }
      }

      console.log("Total de órdenes normales filtradas:", allOrdenes.length);
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
    fetchOrdenes();
  }, []);

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

  const toggleModalFinalizar = () => {
    setModalFinalizar(!modalFinalizar);
  };

  const iniciarFinalizarOrden = (orden) => {
    setOrdenAFinalizar(orden);
    setNumeroSeguimiento(orden.numero_seguimiento || "");
    toggleModalFinalizar();
  };

  const confirmarFinalizarOrden = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/finalizar-orden`,
        { numero_seguimiento: numeroSeguimiento },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        const { orden } = response.data;
        toast.success(response.data.message || "Orden finalizada con éxito");
        actualizarOrdenLocal(ordenAFinalizar.id, {
          estado: "Completada",
          finished: 1,
          fecha_entrega: orden.fecha_entrega,
        });
        toggleModalFinalizar();
        fetchOrdenes(); // Actualizar la lista de órdenes
      }
    } catch (error) {
      console.error("Error al finalizar la orden:", error);

      if (error.response) {
        const errorMessage = error.response.data.message;
        switch (error.response.status) {
          case 400:
            toast.error(errorMessage || "Error al finalizar la orden");
            break;
          case 404:
            toast.error("Orden no encontrada.");
            break;
          case 403:
            toast.error("No tienes permiso para finalizar esta orden.");
            break;
          default:
            toast.error(
              "Error al finalizar la orden. Por favor, intente de nuevo."
            );
        }
      } else if (error.request) {
        toast.error(
          "No se recibió respuesta del servidor. Por favor, intente de nuevo."
        );
      } else {
        toast.error(
          "Error al preparar la solicitud. Por favor, intente de nuevo."
        );
      }
    }
  };

  const handleProcesarPago = useCallback(
    (idCliente) => {
      if (!idCliente) {
        console.error("Error: ID del cliente no disponible");
        toast.error("Error: Información del cliente no disponible");
        return;
      }
      navigate(`/procesarpagoexpress/${idCliente}`);
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
          title="Gestión de Órdenes Express"
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
                  to="/OrdenesSeleccionarClienteExpress"
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
                {loading ? (
                  <p>Cargando órdenes...</p>
                ) : (
                  <TablaOrdenes
                    ordenes={paginatedOrdenes}
                    cancelarOrden={iniciarCancelarOrden}
                    navegarAEditar={navegarAEditar}
                    verDetallesOrden={verDetallesOrden}
                    actualizarOrden={actualizarOrdenLocal}
                    procesarPago={handleProcesarPago}
                    finalizarOrden={iniciarFinalizarOrden}
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
      <Modal isOpen={modalFinalizar} toggle={toggleModalFinalizar}>
        <ModalHeader toggle={toggleModalFinalizar}>
          Finalizar Orden Express
        </ModalHeader>
        <ModalBody>
          <p>¿Está seguro que desea finalizar la orden express?</p>
          <p>Número de Seguimiento: {numeroSeguimiento}</p>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleModalFinalizar}>
            Cancelar
          </Button>
          <Button color="primary" onClick={confirmarFinalizarOrden}>
            Finalizar Orden
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
