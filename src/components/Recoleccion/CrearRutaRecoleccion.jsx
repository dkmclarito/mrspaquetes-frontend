import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Table,
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";

const API_URL = import.meta.env.VITE_API_URL;

const CrearRutaRecoleccion = () => {
  const [formData, setFormData] = useState({
    id_vehiculo: "",
    fecha_asignacion: "",
  });
  const [vehiculos, setVehiculos] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [ordenesSeleccionadas, setOrdenesSeleccionadas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [vehiculosRes, ordenesRes, ordenesRecoleccionRes] =
          await Promise.all([
            axios.get(`${API_URL}/dropdown/get_vehiculos`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${API_URL}/ordenes?tipo_orden=preorden`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${API_URL}/orden-recoleccion`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);
        setVehiculos(vehiculosRes.data.vehiculos || []);

        // Obtener IDs de órdenes ya asignadas a órdenes de recolección
        const ordenesAsignadas = new Set(
          ordenesRecoleccionRes.data.data.map((or) => or.id_orden)
        );

        // Filtrar órdenes que son pre-órdenes normales, están en estado de espera de recolección y no están asignadas
        const ordenesFiltradas = ordenesRes.data.data.filter(
          (orden) =>
            orden.tipo_orden === "preorden" &&
            orden.detalles.every(
              (detalle) => detalle.tipo_entrega === "Entrega Normal"
            ) &&
            orden.detalles.some(
              (detalle) => detalle.id_estado_paquetes === 3
            ) &&
            !ordenesAsignadas.has(orden.id)
        );
        setOrdenes(ordenesFiltradas);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        toast.error("Error al cargar los datos necesarios");
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleOrdenToggle = (ordenId) => {
    setOrdenesSeleccionadas((prev) =>
      prev.some((orden) => orden.id === ordenId)
        ? prev.filter((orden) => orden.id !== ordenId)
        : [...prev, { id: ordenId, prioridad: prev.length + 1 }]
    );
  };

  const handlePrioridadChange = (ordenId, prioridad) => {
    setOrdenesSeleccionadas((prev) =>
      prev.map((orden) =>
        orden.id === ordenId
          ? { ...orden, prioridad: parseInt(prioridad) }
          : orden
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.id_vehiculo ||
      !formData.fecha_asignacion ||
      ordenesSeleccionadas.length === 0
    ) {
      toast.error(
        "Por favor, complete todos los campos y seleccione al menos una orden."
      );
      return;
    }
    try {
      const token = localStorage.getItem("token");

      const dataToSend = {
        ...formData,
        ordenes: ordenesSeleccionadas,
      };

      console.log("Datos a enviar:", dataToSend);

      const response = await axios.post(
        `${API_URL}/orden-recoleccion`,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Respuesta del servidor:", response.data);
      toast.success("Ruta de recolección creada con éxito");
      navigate("/gestion-ordenes-recoleccion");
    } catch (error) {
      console.error("Error completo:", error);
      let errorMessage = "Error desconocido al crear la ruta de recolección";

      if (error.response) {
        console.error("Datos del error:", error.response.data);
        console.error("Estado del error:", error.response.status);
        console.error("Cabeceras del error:", error.response.headers);

        errorMessage =
          error.response.data.message ||
          `Error del servidor: ${error.response.status}`;
        if (error.response.data.errors) {
          errorMessage += ` - ${JSON.stringify(error.response.data.errors)}`;
        }
      } else if (error.request) {
        console.error("Error de red:", error.request);
        errorMessage = "Error de red. Por favor, verifica tu conexión.";
      } else {
        console.error("Error de configuración:", error.message);
        errorMessage =
          "Error al procesar la solicitud. Por favor, intenta de nuevo.";
      }

      toast.error(errorMessage, { autoClose: false });
    }
  };

  const verDetallesOrden = (idOrden) => {
    navigate(`/VerDetallesOrden/${idOrden}`);
  };
  const handleExit = () => {    
    navigate("/gestion-ordenes-recoleccion");
  };

  return (
    <Container>
      <h2 className="mb-4">Crear Nueva Ruta de Recolección</h2>
      <Card>
        <CardBody>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="id_vehiculo">Vehículo</Label>
                  <Input
                    type="select"
                    name="id_vehiculo"
                    id="id_vehiculo"
                    value={formData.id_vehiculo}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccione un vehículo</option>
                    {vehiculos.map((vehiculo) => (
                      <option key={vehiculo.id} value={vehiculo.id}>
                        {vehiculo.placa} - {vehiculo.modelo}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label for="fecha_asignacion">Fecha de Asignación</Label>
                  <Input
                    type="date"
                    name="fecha_asignacion"
                    id="fecha_asignacion"
                    value={formData.fecha_asignacion}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <h4>Seleccionar Órdenes para Recolección</h4>
                <Table responsive striped>
                  <thead>
                    <tr>
                      <th>Seleccionar</th>
                      <th>Número de Seguimiento</th>
                      <th>Cliente</th>
                      <th>Dirección de Recolección</th>
                      <th>Orden de recolección</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordenes.map((orden) => (
                      <tr key={orden.id}>
                        <td>
                          <Input
                            type="checkbox"
                            checked={ordenesSeleccionadas.some(
                              (o) => o.id === orden.id
                            )}
                            onChange={() => handleOrdenToggle(orden.id)}
                          />
                        </td>
                        <td>{orden.numero_seguimiento}</td>
                        <td>{`${orden.cliente.nombre} ${orden.cliente.apellido}`}</td>
                        <td>{orden.direccion_emisor?.direccion || "N/A"}</td>
                        <td>
                          <Input
                            type="number"
                            min="1"
                            value={
                              ordenesSeleccionadas.find(
                                (o) => o.id === orden.id
                              )?.prioridad || ""
                            }
                            onChange={(e) =>
                              handlePrioridadChange(orden.id, e.target.value)
                            }
                            disabled={
                              !ordenesSeleccionadas.some(
                                (o) => o.id === orden.id
                              )
                            }
                          />
                        </td>
                        <td>
                          <Button
                            className="btn-sm btn-icon btn-success"
                            onClick={() => verDetallesOrden(orden.id)}
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Col>
            </Row>
            <Button color="primary" type="submit">
              Crear Ruta y Asignar Órdenes
            </Button>
            <Button className="ms-2 btn-custom-red" onClick={handleExit}>
              Cancelar
            </Button>
          </Form>
        </CardBody>
      </Card>
    </Container>
  );
};

export default CrearRutaRecoleccion;
