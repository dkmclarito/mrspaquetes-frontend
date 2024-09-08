import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faPencilAlt, faEye } from "@fortawesome/free-solid-svg-icons";
import AuthService from "../services/authService";
import Breadcrumbs from "../components/Rutas/Common/Breadcrumbs";

const API_URL = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 7;

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

  const toggle = () => setModal(!modal);

  const handleInputChange = (e) => {
    setNuevaOrden({ ...nuevaOrden, [e.target.name]: e.target.value });
  };

  const crearOrdenRecoleccion = async () => {
    try {
      const token = AuthService.getCurrentUser();
      const ordenData = {
        id_ruta_recoleccion: parseInt(nuevaOrden.id_ruta_recoleccion),
        id_orden: parseInt(nuevaOrden.id_orden),
        estado: parseInt(nuevaOrden.estado),
      };
      await axios.post(`${API_URL}/orden-recoleccion`, ordenData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      cargarOrdenesRecoleccion();
      toggle();
      setNuevaOrden({
        id_ruta_recoleccion: "",
        id_orden: "",
        estado: "",
      });
    } catch (error) {
      console.error("Error al crear orden de recolección:", error);
      if (error.response && error.response.data && error.response.data.errors) {
        const errorMessages = Object.values(error.response.data.errors)
          .flat()
          .join(", ");
        setError(`Error al crear orden de recolección: ${errorMessages}`);
      } else {
        setError(
          "Error al crear orden de recolección. Por favor, intente de nuevo."
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
      setEditModal(true);
    } catch (error) {
      console.error("Error al cargar los datos de la orden:", error);
      setError(
        "Error al cargar los datos de la orden. Por favor, intente de nuevo."
      );
    }
  };

  const eliminarOrden = (id) => {
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

      // Verificar si la página actual queda vacía
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

  const handleEditInputChange = (e) => {
    setOrdenEditando({ ...ordenEditando, [e.target.name]: e.target.value });
  };

  const actualizarOrdenRecoleccion = async () => {
    try {
      const token = AuthService.getCurrentUser();
      const ordenData = {
        id_ruta_recoleccion: parseInt(ordenEditando.id_ruta_recoleccion),
        id_orden: parseInt(ordenEditando.id_orden),
        estado: parseInt(ordenEditando.estado),
      };
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
      cargarOrdenesRecoleccion();
      setEditModal(false);
    } catch (error) {
      console.error("Error al actualizar orden de recolección:", error);
      setError(
        "Error al actualizar orden de recolección. Por favor, intente de nuevo."
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
              <Button color="primary" onClick={toggle}>
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
                <Table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Ruta de Recolección</th>
                      <th>Orden</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordenesRecoleccionFiltradas.map((orden) => (
                      <tr key={orden.id}>
                        <td>{orden.id}</td>
                        <td>{orden.id_ruta_recoleccion}</td>
                        <td>{getOrdenInfo(orden.id_orden)}</td>
                        <td>{getEstadoTexto(orden.estado)}</td>
                        <td>
                          <div className="button-container">
                            <Button
                              className="me-2 btn-icon btn-danger"
                              onClick={() => eliminarOrden(orden.id)}
                              aria-label="Eliminar Orden de Recolección"
                            >
                              <FontAwesomeIcon icon={faTimes} />
                            </Button>
                            <Button
                              className="me-2 btn-icon btn-editar"
                              onClick={() => handleEdit(orden.id)}
                              aria-label="Editar Orden de Recolección"
                            >
                              <FontAwesomeIcon icon={faPencilAlt} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
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

        <Modal isOpen={modal} toggle={toggle}>
          <ModalHeader toggle={toggle}>
            Crear Nueva Orden de Recolección
          </ModalHeader>
          <ModalBody>
            <Form>
              <FormGroup>
                <Label for="id_ruta_recoleccion">Ruta de Recolección</Label>
                <Input
                  type="select"
                  name="id_ruta_recoleccion"
                  id="id_ruta_recoleccion"
                  onChange={handleInputChange}
                  value={nuevaOrden.id_ruta_recoleccion}
                >
                  <option value="">Seleccione una ruta de recolección</option>
                  {rutasRecoleccion.map((ruta) => (
                    <option key={ruta.id} value={ruta.id}>
                      {ruta.ruta ? ruta.ruta.nombre : `Ruta ${ruta.id}`}
                    </option>
                  ))}
                </Input>
              </FormGroup>
              <FormGroup>
                <Label for="id_orden">Orden</Label>
                <Input
                  type="select"
                  name="id_orden"
                  id="id_orden"
                  onChange={handleInputChange}
                  value={nuevaOrden.id_orden}
                >
                  <option value="">Seleccione una orden</option>
                  {ordenes.map((orden) => (
                    <option key={orden.id} value={orden.id}>
                      {`${orden.numero_seguimiento || "N/A"} - ${orden.cliente?.nombre || "N/A"} ${orden.cliente?.apellido || ""}`}
                    </option>
                  ))}
                </Input>
              </FormGroup>
              <FormGroup>
                <Label for="estado">Estado</Label>
                <Input
                  type="select"
                  name="estado"
                  id="estado"
                  onChange={handleInputChange}
                  value={nuevaOrden.estado}
                >
                  <option value="">Seleccione un estado</option>
                  <option value="1">Pendiente</option>
                  <option value="2">En Proceso</option>
                  <option value="3">Completada</option>
                </Input>
              </FormGroup>
            </Form>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={crearOrdenRecoleccion}>
              Crear
            </Button>
            <Button color="secondary" onClick={toggle}>
              Cancelar
            </Button>
          </ModalFooter>
        </Modal>

        <Modal isOpen={editModal} toggle={() => setEditModal(!editModal)}>
          <ModalHeader toggle={() => setEditModal(!editModal)}>
            Editar Orden de Recolección
          </ModalHeader>
          <ModalBody>
            <Form>
              <FormGroup>
                <Label for="id_ruta_recoleccion">Ruta de Recolección</Label>
                <Input
                  type="select"
                  name="id_ruta_recoleccion"
                  id="id_ruta_recoleccion"
                  onChange={handleEditInputChange}
                  value={ordenEditando?.id_ruta_recoleccion || ""}
                >
                  <option value="">Seleccione una ruta de recolección</option>
                  {rutasRecoleccion.map((ruta) => (
                    <option key={ruta.id} value={ruta.id}>
                      {ruta.ruta ? ruta.ruta.nombre : `Ruta ${ruta.id}`}
                    </option>
                  ))}
                </Input>
              </FormGroup>
              <FormGroup>
                <Label for="id_orden">Orden</Label>
                <Input
                  type="select"
                  name="id_orden"
                  id="id_orden"
                  onChange={handleEditInputChange}
                  value={ordenEditando?.id_orden || ""}
                >
                  <option value="">Seleccione una orden</option>
                  {ordenes.map((orden) => (
                    <option key={orden.id} value={orden.id}>
                      {`${orden.numero_seguimiento || "N/A"} - ${orden.cliente?.nombre || "N/A"} ${orden.cliente?.apellido || ""}`}
                    </option>
                  ))}
                </Input>
              </FormGroup>
              <FormGroup>
                <Label for="estado">Estado</Label>
                <Input
                  type="select"
                  name="estado"
                  id="estado"
                  onChange={handleEditInputChange}
                  value={ordenEditando?.estado || ""}
                >
                  <option value="">Seleccione un estado</option>
                  <option value="1">Pendiente</option>
                  <option value="2">En Proceso</option>
                  <option value="3">Completada</option>
                </Input>
              </FormGroup>
            </Form>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={actualizarOrdenRecoleccion}>
              Actualizar
            </Button>
            <Button color="secondary" onClick={() => setEditModal(!editModal)}>
              Cancelar
            </Button>
          </ModalFooter>
        </Modal>
        <Modal
          isOpen={confirmarEliminar}
          toggle={() => setConfirmarEliminar(!confirmarEliminar)}
        >
          <ModalHeader toggle={() => setConfirmarEliminar(!confirmarEliminar)}>
            Confirmar Eliminación
          </ModalHeader>
          <ModalBody>
            ¿Está seguro de que desea eliminar esta orden de recolección?
          </ModalBody>
          <ModalFooter>
            <Button color="danger" onClick={confirmarEliminarOrden}>
              Eliminar
            </Button>{" "}
            <Button
              color="secondary"
              onClick={() => setConfirmarEliminar(!confirmarEliminar)}
            >
              Cancelar
            </Button>
          </ModalFooter>
        </Modal>
      </Container>
    </div>
  );
};

export default OrdenesRecoleccion;
