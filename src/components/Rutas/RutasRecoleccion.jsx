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
  Pagination,
  PaginationItem,
  PaginationLink,
} from "reactstrap";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faPencilAlt, faEye } from "@fortawesome/free-solid-svg-icons";
import AuthService from "../../services/authService";

const API_URL = import.meta.env.VITE_API_URL;

const RutasRecoleccion = () => {
  const [rutasRecoleccion, setRutasRecoleccion] = useState([]);
  const [modal, setModal] = useState(false);
  const [nuevaRuta, setNuevaRuta] = useState({
    id_ruta: "",
    id_vehiculo: "",
    fecha_asignacion: "",
  });
  const [rutasDropdown, setRutasDropdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [vehiculos, setVehiculos] = useState([]);
  const [vehiculosDetalle, setVehiculosDetalle] = useState({});
  const [editModal, setEditModal] = useState(false);
  const [rutaEditando, setRutaEditando] = useState(null);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [rutaAEliminar, setRutaAEliminar] = useState(null);

  useEffect(() => {
    cargarRutasRecoleccion();
    cargarRutasDropdown();
    cargarVehiculos();
  }, [currentPage]);

  const cargarRutasRecoleccion = async () => {
    try {
      setLoading(true);
      const token = AuthService.getCurrentUser();
      const response = await axios.get(
        `${API_URL}/rutas-recolecciones?page=${currentPage}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRutasRecoleccion(response.data.data);
      setTotalPages(response.data.last_page);
      cargarDetallesVehiculos(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar rutas de recolección:", error);
      setError(
        "Error al cargar rutas de recolección. Por favor, intente de nuevo más tarde."
      );
      setLoading(false);
    }
  };

  const cargarDetallesVehiculos = async (rutas) => {
    const token = AuthService.getCurrentUser();
    const vehiculosIds = rutas
      .map((ruta) => ruta.id_vehiculo)
      .filter((id, index, self) => self.indexOf(id) === index);

    const detallesPromises = vehiculosIds.map((id) =>
      axios.get(`${API_URL}/vehiculo/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    );

    try {
      const resultados = await Promise.all(detallesPromises);
      const nuevosDetalles = {};
      resultados.forEach((res, index) => {
        nuevosDetalles[vehiculosIds[index]] = res.data;
      });
      setVehiculosDetalle((prevDetalles) => ({
        ...prevDetalles,
        ...nuevosDetalles,
      }));
    } catch (error) {
      console.error("Error al cargar detalles de vehículos:", error);
    }
  };

  const cargarRutasDropdown = async () => {
    try {
      const token = AuthService.getCurrentUser();
      const response = await axios.get(`${API_URL}/dropdown/get_rutas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRutasDropdown(response.data.rutas || []);
    } catch (error) {
      console.error("Error al cargar rutas para el dropdown:", error);
    }
  };

  const cargarVehiculos = async () => {
    try {
      const token = AuthService.getCurrentUser();
      const response = await axios.get(`${API_URL}/vehiculo`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVehiculos(response.data.data || []);
    } catch (error) {
      console.error("Error al cargar vehículos:", error);
    }
  };

  const toggle = () => setModal(!modal);

  const handleInputChange = (e) => {
    setNuevaRuta({ ...nuevaRuta, [e.target.name]: e.target.value });
  };

  const crearRutaRecoleccion = async () => {
    try {
      const token = AuthService.getCurrentUser();
      await axios.post(`${API_URL}/rutas-recolecciones`, nuevaRuta, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Ruta de recolección creada con éxito");
      // Recargar la página y redirigir a la pestaña de rutas de recolección
      window.location.href = "/GestionRutas?tab=2";
    } catch (error) {
      console.error("Error al crear ruta de recolección:", error);
      toast.error(
        "Error al crear ruta de recolección. Por favor, intente de nuevo."
      );
    }
  };

  const formatVehicleInfo = (vehicle) => {
    const marca = vehicle.marca || "N/A";
    const modelo = vehicle.modelo || "N/A";
    const capacidadCarga = vehicle.capacidad_carga || "N/A";
    const placa = vehicle.placa || "N/A";
    const conductor = vehicle.conductor || "N/A";

    return `${marca} ${modelo} - Carga: ${capacidadCarga} - Placa: ${placa} - Conductor: ${conductor}`;
  };

  const formatVehicleInfoForTable = (vehicleId) => {
    const vehicleDetails = vehiculosDetalle[vehicleId];
    if (!vehicleDetails) return "Cargando...";

    const marca = vehicleDetails.marca || "N/A";
    const modelo = vehicleDetails.modelo || "N/A";
    const capacidadCarga = vehicleDetails.capacidad_carga || "N/A";
    const placa = vehicleDetails.placa || "N/A";
    const conductor = vehicleDetails.conductor || "N/A";

    return `${marca} ${modelo} - Carga: ${capacidadCarga} - Placa: ${placa} - Conductor: ${conductor}`;
  };

  const handleEdit = async (id) => {
    try {
      const token = AuthService.getCurrentUser();
      const response = await axios.get(`${API_URL}/rutas-recolecciones/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRutaEditando(response.data);
      setEditModal(true);
    } catch (error) {
      console.error("Error al cargar los datos de la ruta:", error);
      setError(
        "Error al cargar los datos de la ruta. Por favor, intente de nuevo."
      );
    }
  };

  const eliminarRuta = (id) => {
    setRutaAEliminar(id);
    setConfirmarEliminar(true);
  };

  const confirmarEliminarRuta = async () => {
    try {
      const token = AuthService.getCurrentUser();
      await axios.delete(`${API_URL}/rutas-recolecciones/${rutaAEliminar}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Ruta de recolección eliminada con éxito");

      // Verificar si la página actual queda vacía
      if (rutasRecoleccion.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        cargarRutasRecoleccion();
      }

      setConfirmarEliminar(false);
      setRutaAEliminar(null);
    } catch (error) {
      console.error("Error al eliminar ruta de recolección:", error);
      toast.error(
        "Error al eliminar la ruta de recolección. Por favor, intente de nuevo."
      );
    }
  };

  const handleEditInputChange = (e) => {
    setRutaEditando({ ...rutaEditando, [e.target.name]: e.target.value });
  };

  const actualizarRutaRecoleccion = async () => {
    try {
      const token = AuthService.getCurrentUser();
      await axios.put(
        `${API_URL}/rutas-recolecciones/${rutaEditando.id}`,
        {
          id_ruta: rutaEditando.id_ruta,
          id_vehiculo: rutaEditando.id_vehiculo,
          fecha_asignacion: rutaEditando.fecha_asignacion,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      cargarRutasRecoleccion();
      setEditModal(false);
    } catch (error) {
      console.error("Error al actualizar ruta de recolección:", error);
      setError(
        "Error al actualizar ruta de recolección. Por favor, intente de nuevo."
      );
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return <div>Cargando rutas de recolección...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div>
      <Row>
        <Col lg={12}>
          <div
            style={{
              marginTop: "10px",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button color="primary" onClick={toggle}>
              <i className="fas fa-plus"></i> Crear Ruta de Recolección
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
                    <th>Ruta</th>
                    <th>Vehículo</th>
                    <th>Fecha Asignación</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rutasRecoleccion.map((ruta) => (
                    <tr key={ruta.id}>
                      <td>{ruta.id}</td>
                      <td>{ruta.ruta ? ruta.ruta.nombre : "N/A"}</td>
                      <td>{formatVehicleInfoForTable(ruta.id_vehiculo)}</td>
                      <td>{ruta.fecha_asignacion}</td>
                      <td>
                        <div className="button-container">
                          <Button
                            className="me-2 btn-icon btn-danger"
                            onClick={() => eliminarRuta(ruta.id)}
                            aria-label="Eliminar Ruta de Recolección"
                          >
                            <FontAwesomeIcon icon={faTimes} />
                          </Button>
                          <Button
                            className="me-2 btn-icon btn-editar"
                            onClick={() => handleEdit(ruta.id)}
                            aria-label="Editar Ruta de Recolección"
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

      <Modal isOpen={modal} toggle={toggle} size="lg">
        <ModalHeader toggle={toggle}>
          Crear Nueva Ruta de Recolección
        </ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="id_ruta">Ruta</Label>
              <Input
                type="select"
                name="id_ruta"
                id="id_ruta"
                onChange={handleInputChange}
                value={nuevaRuta.id_ruta}
              >
                <option value="">Seleccione una ruta</option>
                {rutasDropdown.map((ruta) => (
                  <option key={ruta.id} value={ruta.id}>
                    {ruta.nombre}
                  </option>
                ))}
              </Input>
            </FormGroup>
            <FormGroup>
              <Label for="id_vehiculo">Vehículo</Label>
              <Input
                type="select"
                name="id_vehiculo"
                id="id_vehiculo"
                onChange={handleInputChange}
                value={nuevaRuta.id_vehiculo}
              >
                <option value="">Seleccione un vehículo</option>
                {vehiculos.map((vehiculo) => (
                  <option key={vehiculo.id} value={vehiculo.id}>
                    {formatVehicleInfo(vehiculo)}
                  </option>
                ))}
              </Input>
            </FormGroup>
            <FormGroup>
              <Label for="fecha_asignacion">Fecha Asignación</Label>
              <Input
                type="date"
                name="fecha_asignacion"
                id="fecha_asignacion"
                onChange={handleInputChange}
                value={nuevaRuta.fecha_asignacion}
              />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={crearRutaRecoleccion}>
            Crear
          </Button>
          <Button color="secondary" onClick={toggle}>
            Cancelar
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={editModal}
        toggle={() => setEditModal(!editModal)}
        size="lg"
      >
        <ModalHeader toggle={() => setEditModal(!editModal)}>
          Editar Ruta de Recolección
        </ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="id_ruta">Ruta</Label>
              <Input
                type="select"
                name="id_ruta"
                id="id_ruta"
                onChange={handleEditInputChange}
                value={rutaEditando?.id_ruta || ""}
              >
                <option value="">Seleccione una ruta</option>
                {rutasDropdown.map((ruta) => (
                  <option key={ruta.id} value={ruta.id}>
                    {ruta.nombre}
                  </option>
                ))}
              </Input>
            </FormGroup>
            <FormGroup>
              <Label for="id_vehiculo">Vehículo</Label>
              <Input
                type="select"
                name="id_vehiculo"
                id="id_vehiculo"
                onChange={handleEditInputChange}
                value={rutaEditando?.id_vehiculo || ""}
              >
                <option value="">Seleccione un vehículo</option>
                {vehiculos.map((vehiculo) => (
                  <option key={vehiculo.id} value={vehiculo.id}>
                    {formatVehicleInfo(vehiculo)}
                  </option>
                ))}
              </Input>
            </FormGroup>
            <FormGroup>
              <Label for="fecha_asignacion">Fecha Asignación</Label>
              <Input
                type="date"
                name="fecha_asignacion"
                id="fecha_asignacion"
                onChange={handleEditInputChange}
                value={rutaEditando?.fecha_asignacion || ""}
              />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={actualizarRutaRecoleccion}>
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
          ¿Está seguro de que desea eliminar esta ruta de recolección?
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={confirmarEliminarRuta}>
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
    </div>
  );
};

export default RutasRecoleccion;
