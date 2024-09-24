import React, { useState, useEffect, useCallback } from "react";
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
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

const EditarRutaRecoleccion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id_vehiculo: "",
    fecha_asignacion: "",
  });
  const [vehiculos, setVehiculos] = useState([]);
  const [ordenesAsignadas, setOrdenesAsignadas] = useState([]);
  const [preordenesDisponibles, setPreordenesDisponibles] = useState([]);
  const [preordenesSeleccionadas, setPreordenesSeleccionadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const [rutaRes, vehiculosRes, preordenesRes, ordenesRecoleccionRes] =
        await Promise.all([
          axios.get(`${API_URL}/rutas-recolecciones/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
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

      console.log("Datos de la ruta recibidos:", rutaRes.data);

      setFormData({
        id_vehiculo: rutaRes.data.id_vehiculo,
        fecha_asignacion: rutaRes.data.fecha_asignacion,
      });
      setVehiculos(vehiculosRes.data.vehiculos || []);

      // Obtener detalles completos de las órdenes y clientes
      const ordenesDetalladas = await Promise.all(
        rutaRes.data.ordenes_recolecciones.map(async (orden) => {
          const ordenDetalle = await axios.get(
            `${API_URL}/orden-recoleccion/${orden.id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const clienteDetalle = await axios.get(
            `${API_URL}/clientes/${ordenDetalle.data.orden.id_cliente}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          return {
            ...ordenDetalle.data,
            cliente: clienteDetalle.data,
            prioridad: orden.prioridad,
          };
        })
      );

      console.log("Órdenes detalladas:", ordenesDetalladas);
      setOrdenesAsignadas(ordenesDetalladas);

      // Obtener todos los IDs de órdenes ya asignadas a cualquier ruta de recolección
      const todasOrdenesAsignadasIds = new Set(
        ordenesRecoleccionRes.data.data.map((or) => or.id_orden)
      );

      // Filtrar preórdenes disponibles (no asignadas a ninguna ruta, en estado de espera y de tipo entrega normal)
      const preordenesFiltradas = preordenesRes.data.data.filter(
        (p) =>
          p.tipo_orden === "preorden" &&
          p.detalles.every((d) => d.tipo_entrega === "Entrega Normal") &&
          p.detalles.some((d) => d.id_estado_paquetes === 3) &&
          !todasOrdenesAsignadasIds.has(p.id)
      );
      setPreordenesDisponibles(preordenesFiltradas);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setError("Error al cargar los datos de la ruta");
      toast.error("Error al cargar los datos de la ruta");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePreordenToggle = (preordenId) => {
    setPreordenesSeleccionadas((prev) =>
      prev.includes(preordenId)
        ? prev.filter((id) => id !== preordenId)
        : [...prev, preordenId]
    );
  };

  const handlePrioridadChange = (ordenId, nuevaPrioridad) => {
    setOrdenesAsignadas((prevOrdenes) =>
      prevOrdenes.map((orden) =>
        orden.id === ordenId
          ? { ...orden, prioridad: parseInt(nuevaPrioridad) }
          : orden
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      // Combinar órdenes existentes y nuevas
      const todasLasOrdenes = [
        ...ordenesAsignadas.map((orden) => ({
          id: orden.id_orden,
          prioridad: orden.prioridad,
        })),
        ...preordenesSeleccionadas.map((id, index) => ({
          id: id,
          prioridad: ordenesAsignadas.length + index + 1, // Asignar prioridades a las nuevas órdenes
        })),
      ];

      const dataToSend = {
        fecha_asignacion: formData.fecha_asignacion,
        id_vehiculo: parseInt(formData.id_vehiculo),
        ordenes: todasLasOrdenes,
      };

      console.log("Datos a enviar:", dataToSend);

      const response = await axios.put(
        `${API_URL}/orden-recoleccion/${id}`,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Respuesta del servidor:", response.data);

      toast.success("Ruta de recolección actualizada con éxito");
      navigate("/gestion-ordenes-recoleccion");
    } catch (error) {
      console.error("Error al actualizar la ruta:", error);
      if (error.response) {
        console.error("Respuesta del servidor:", error.response.data);
      }
      toast.error("Error al actualizar la ruta de recolección");
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Container>
      <h2 className="mb-4">Editar Ruta de Recolección</h2>
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
                <h4>Órdenes Asignadas a esta Ruta</h4>
                <Table>
                  <thead>
                    <tr>
                      <th>ID Orden</th>
                      <th>Cliente</th>
                      <th>Dirección de Recolección</th>
                      <th>Estado</th>
                      <th>Orden de recoleccion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordenesAsignadas.map((orden) => (
                      <tr key={orden.id}>
                        <td>{orden.id_orden}</td>
                        <td>
                          {orden.cliente?.cliente
                            ? `${orden.cliente.cliente.nombre} ${orden.cliente.cliente.apellido}`
                            : "N/A"}
                        </td>
                        <td>
                          {orden.destino ||
                            orden.detalleOrden?.direccion_emisor?.direccion ||
                            "N/A"}
                        </td>
                        <td>{orden.estado === 1 ? "Activo" : "Inactivo"}</td>
                        <td>
                          <Input
                            type="number"
                            value={orden.prioridad}
                            onChange={(e) =>
                              handlePrioridadChange(orden.id, e.target.value)
                            }
                            min="1"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <h4>Agregar Nuevas Preórdenes</h4>
                <Table>
                  <thead>
                    <tr>
                      <th>Seleccionar</th>
                      <th>ID Preorden</th>
                      <th>Cliente</th>
                      <th>Dirección de Recolección</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preordenesDisponibles.map((preorden) => (
                      <tr key={preorden.id}>
                        <td>
                          <Input
                            type="checkbox"
                            checked={preordenesSeleccionadas.includes(
                              preorden.id
                            )}
                            onChange={() => handlePreordenToggle(preorden.id)}
                          />
                        </td>
                        <td>{preorden.id}</td>
                        <td>
                          {preorden.cliente?.nombre}{" "}
                          {preorden.cliente?.apellido}
                        </td>
                        <td>{preorden.direccion_emisor?.direccion}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Col>
            </Row>
            <Button color="primary" type="submit">
              Actualizar Ruta y Agregar Preórdenes
            </Button>
            <Button
              color="secondary"
              onClick={() => navigate("/gestion-ordenes-recoleccion")}
              className="ml-2"
            >
              Volver a Gestión de Órdenes de Recolección
            </Button>
          </Form>
        </CardBody>
      </Card>
    </Container>
  );
};

export default EditarRutaRecoleccion;
