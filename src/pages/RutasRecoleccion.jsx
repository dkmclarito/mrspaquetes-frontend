import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
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
import RutaForm from "../components/Rutas/RutaForm";
import RutaTable from "../components/Rutas/RutaTable";
import ConfirmModal from "../components/Rutas/ConfirmModal";

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
    const { name, value } = e.target;
    setNuevaRuta((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const token = AuthService.getCurrentUser();
      if (rutaEditando) {
        await axios.put(
          `${API_URL}/rutas-recolecciones/${rutaEditando.id}`,
          nuevaRuta,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success("Ruta de recolección actualizada con éxito");
      } else {
        await axios.post(`${API_URL}/rutas-recolecciones`, nuevaRuta, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success("Ruta de recolección creada con éxito");
      }
      cargarRutasRecoleccion();
      setModal(false);
      setEditModal(false);
      setNuevaRuta({
        id_ruta: "",
        id_vehiculo: "",
        fecha_asignacion: "",
      });
    } catch (error) {
      console.error("Error al procesar ruta de recolección:", error);
      toast.error(
        "Error al procesar ruta de recolección. Por favor, intente de nuevo."
      );
    }
  };

  const handleEdit = async (id) => {
    try {
      const token = AuthService.getCurrentUser();
      const response = await axios.get(`${API_URL}/rutas-recolecciones/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRutaEditando(response.data);
      setNuevaRuta(response.data);
      setEditModal(true);
    } catch (error) {
      console.error("Error al cargar los datos de la ruta:", error);
      setError(
        "Error al cargar los datos de la ruta. Por favor, intente de nuevo."
      );
    }
  };

  const handleDelete = (id) => {
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

  if (loading) {
    return <div>Cargando rutas de recolección...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs
          title="Gestión de Rutas"
          breadcrumbItem="Rutas de Recolección"
        />
        <Row>
          <Col lg={12}>
            <div
              style={{
                marginTop: "10px",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button color="primary" onClick={() => setModal(true)}>
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
                <RutaTable
                  rutas={rutasRecoleccion}
                  vehiculosDetalle={vehiculosDetalle}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                />
                <Pagination>
                  <PaginationItem disabled={currentPage === 1}>
                    <PaginationLink
                      previous
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                    />
                  </PaginationItem>
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i} active={i + 1 === currentPage}>
                      <PaginationLink onClick={() => setCurrentPage(i + 1)}>
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem disabled={currentPage === totalPages}>
                    <PaginationLink
                      next
                      onClick={() => setCurrentPage((prev) => prev + 1)}
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
              ? "Editar Ruta de Recolección"
              : "Crear Nueva Ruta de Recolección"}
          </ModalHeader>
          <ModalBody>
            <RutaForm
              ruta={nuevaRuta}
              rutasDropdown={rutasDropdown}
              vehiculos={vehiculos}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              isEditing={!!rutaEditando}
            />
          </ModalBody>
        </Modal>

        <ConfirmModal
          isOpen={confirmarEliminar}
          toggle={() => setConfirmarEliminar(false)}
          onConfirm={confirmarEliminarRuta}
          title="Confirmar Eliminación"
          body="¿Está seguro de que desea eliminar esta ruta de recolección?"
        />
      </Container>
    </div>
  );
};

export default RutasRecoleccion;
