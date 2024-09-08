import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Input,
  Row,
  Col,
  Card,
  CardBody,
  Container,
  Pagination,
  PaginationItem,
  PaginationLink,
} from "reactstrap";
import { toast } from "react-toastify";
import AuthService from "../services/authService";
import Breadcrumbs from "../components/Rutas/Common/Breadcrumbs";
import OrdenForm from "../components/Rutas/OrdenForm";
import OrdenTable from "../components/Rutas/OrdenTable";
import ConfirmModal from "../components/Rutas/ConfirmModal";

const API_URL = import.meta.env.VITE_API_URL;

const OrdenesRecoleccion = () => {
  const [ordenesRecoleccion, setOrdenesRecoleccion] = useState([]);
  const [ordenesRecoleccionFiltradas, setOrdenesRecoleccionFiltradas] =
    useState([]);
  const [modal, setModal] = useState(false);
  const [nuevaOrden, setNuevaOrden] = useState({
    id_ruta_recoleccion: "",
    id_orden: "",
    estado: "",
  });
  const [rutasRecoleccion, setRutasRecoleccion] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModal, setEditModal] = useState(false);
  const [ordenEditando, setOrdenEditando] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [ordenAEliminar, setOrdenAEliminar] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    cargarOrdenesRecoleccion();
    cargarRutasRecoleccion();
    cargarOrdenes();
  }, [currentPage]);

  useEffect(() => {
    filtrarOrdenes();
  }, [searchTerm, ordenesRecoleccion, ordenes]);

  const cargarOrdenesRecoleccion = async () => {
    try {
      setLoading(true);
      const token = AuthService.getCurrentUser();
      const response = await axios.get(
        `${API_URL}/orden-recoleccion?page=${currentPage}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setOrdenesRecoleccion(response.data.data || []);
      setOrdenesRecoleccionFiltradas(response.data.data || []);
      setTotalPages(response.data.last_page || 1);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar órdenes de recolección:", error);
      setError(
        "Error al cargar órdenes de recolección. Por favor, intente de nuevo más tarde."
      );
      setLoading(false);
    }
  };

  const cargarRutasRecoleccion = async () => {
    try {
      const token = AuthService.getCurrentUser();
      const response = await axios.get(`${API_URL}/rutas-recolecciones`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRutasRecoleccion(response.data.data || []);
    } catch (error) {
      console.error("Error al cargar rutas de recolección:", error);
    }
  };

  const cargarOrdenes = async () => {
    try {
      const token = AuthService.getCurrentUser();
      const response = await axios.get(`${API_URL}/ordenes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrdenes(response.data.data || []);
    } catch (error) {
      console.error("Error al cargar órdenes:", error);
    }
  };

  const getEstadoTexto = (estado) => {
    switch (estado) {
      case 1:
        return "Pendiente";
      case 2:
        return "En Proceso";
      case 3:
        return "Completada";
      default:
        return "Desconocido";
    }
  };

  const getOrdenInfo = (idOrden) => {
    const orden = ordenes.find((o) => o.id === idOrden);
    if (orden) {
      return `${orden.numero_seguimiento || "N/A"} - ${orden.cliente?.nombre || "N/A"} ${orden.cliente?.apellido || ""}`;
    }
    return "Información no disponible";
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filtrarOrdenes = () => {
    if (!searchTerm.trim()) {
      setOrdenesRecoleccionFiltradas(ordenesRecoleccion);
    } else {
      const ordenesFiltered = ordenesRecoleccion.filter((orden) => {
        const ordenInfo = getOrdenInfo(orden.id_orden);
        const searchString = searchTerm.toLowerCase();
        return (
          orden.id.toString().includes(searchString) ||
          ordenInfo.toLowerCase().includes(searchString) ||
          getEstadoTexto(orden.estado).toLowerCase().includes(searchString)
        );
      });
      setOrdenesRecoleccionFiltradas(ordenesFiltered);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevaOrden((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const token = AuthService.getCurrentUser();
      const ordenData = {
        id_ruta_recoleccion: parseInt(nuevaOrden.id_ruta_recoleccion),
        id_orden: parseInt(nuevaOrden.id_orden),
        estado: parseInt(nuevaOrden.estado),
      };

      if (ordenEditando) {
        await axios.put(
          `${API_URL}/orden-recoleccion/${ordenEditando.id}`,
          ordenData,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success("Orden de recolección actualizada con éxito");
      } else {
        await axios.post(`${API_URL}/orden-recoleccion`, ordenData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success("Orden de recolección creada con éxito");
      }

      cargarOrdenesRecoleccion();
      setModal(false);
      setEditModal(false);
      setNuevaOrden({
        id_ruta_recoleccion: "",
        id_orden: "",
        estado: "",
      });
    } catch (error) {
      console.error("Error al procesar orden de recolección:", error);
      if (error.response && error.response.data && error.response.data.errors) {
        const errorMessages = Object.values(error.response.data.errors)
          .flat()
          .join(", ");
        setError(`Error al procesar orden de recolección: ${errorMessages}`);
      } else {
        setError(
          "Error al procesar orden de recolección. Por favor, intente de nuevo."
        );
      }
    }
  };

  const handleEdit = async (id) => {
    try {
      const token = AuthService.getCurrentUser();
      const response = await axios.get(`${API_URL}/orden-recoleccion/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrdenEditando(response.data);
      setNuevaOrden(response.data);
      setEditModal(true);
    } catch (error) {
      console.error("Error al cargar los datos de la orden:", error);
      setError(
        "Error al cargar los datos de la orden. Por favor, intente de nuevo."
      );
    }
  };

  const handleDelete = (id) => {
    setOrdenAEliminar(id);
    setConfirmarEliminar(true);
  };

  const confirmarEliminarOrden = async () => {
    try {
      const token = AuthService.getCurrentUser();
      await axios.delete(`${API_URL}/orden-recoleccion/${ordenAEliminar}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Orden de recolección eliminada con éxito");

      if (ordenesRecoleccion.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        cargarOrdenesRecoleccion();
      }

      setConfirmarEliminar(false);
      setOrdenAEliminar(null);
    } catch (error) {
      console.error("Error al eliminar orden de recolección:", error);
      toast.error(
        "Error al eliminar la orden de recolección. Por favor, intente de nuevo."
      );
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return <div>Cargando órdenes de recolección...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs
          title="Gestión de Rutas"
          breadcrumbItem="Órdenes de Recolección"
        />
        <Row>
          <Col lg={12}>
            <div style={{ marginTop: "10px", marginBottom: "10px" }}>
              <Input
                type="text"
                placeholder="Buscar por ID, orden o estado"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button color="primary" onClick={() => setModal(true)}>
                <i className="fas fa-plus"></i> Crear Orden de Recolección
              </Button>
            </div>
          </Col>
        </Row>
        <br />
        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <OrdenTable
                  ordenes={ordenesRecoleccionFiltradas}
                  getOrdenInfo={getOrdenInfo}
                  getEstadoTexto={getEstadoTexto}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                />
                <Pagination>
                  <PaginationItem disabled={currentPage === 1}>
                    <PaginationLink
                      previous
                      onClick={() => handlePageChange(currentPage - 1)}
                    />
                  </PaginationItem>
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i} active={i + 1 === currentPage}>
                      <PaginationLink onClick={() => handlePageChange(i + 1)}>
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem disabled={currentPage === totalPages}>
                    <PaginationLink
                      next
                      onClick={() => handlePageChange(currentPage + 1)}
                    />
                  </PaginationItem>
                </Pagination>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Modal isOpen={modal || editModal} toggle={() => setModal(false)}>
          <ModalHeader toggle={() => setModal(false)}>
            {editModal
              ? "Editar Orden de Recolección"
              : "Crear Nueva Orden de Recolección"}
          </ModalHeader>
          <ModalBody>
            <OrdenForm
              orden={nuevaOrden}
              rutasRecoleccion={rutasRecoleccion}
              ordenes={ordenes}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              isEditing={!!ordenEditando}
            />
          </ModalBody>
        </Modal>

        <ConfirmModal
          isOpen={confirmarEliminar}
          toggle={() => setConfirmarEliminar(false)}
          onConfirm={confirmarEliminarOrden}
          title="Confirmar Eliminación"
          body="¿Está seguro de que desea eliminar esta orden de recolección?"
        />
      </Container>
    </div>
  );
};

export default OrdenesRecoleccion;
