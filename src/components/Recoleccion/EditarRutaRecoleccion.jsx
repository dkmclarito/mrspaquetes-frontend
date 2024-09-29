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
  const [capacidadVehiculo, setCapacidadVehiculo] = useState(0);
  const [totalPaquetes, setTotalPaquetes] = useState(0);
  const navigate = useNavigate();

  const fetchAllData = async (url, token) => {
    let allData = [];
    let currentPage = 1;
    let hasNextPage = true;

    while (hasNextPage) {
      try {
        const response = await axios.get(url, {
          params: { page: currentPage },
          headers: { Authorization: `Bearer ${token}` },
        });

        allData = [...allData, ...response.data.data];

        if (response.data.next_page_url) {
          currentPage++;
        } else {
          hasNextPage = false;
        }
      } catch (error) {
        console.error(
          `Error al obtener datos de la página ${currentPage}:`,
          error
        );
        hasNextPage = false;
      }
    }

    return allData;
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const [rutaRes, vehiculosRes] = await Promise.all([
        axios.get(`${API_URL}/rutas-recolecciones/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/dropdown/get_vehiculos`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const allOrdenes = await fetchAllData(`${API_URL}/ordenes`, token);
      const allOrdenesRecoleccion = await fetchAllData(
        `${API_URL}/orden-recoleccion`,
        token
      );

      console.log("Datos de la ruta recibidos:", rutaRes.data);
      console.log("Todas las órdenes de recolección:", allOrdenesRecoleccion);

      setFormData({
        id_vehiculo: rutaRes.data.id_vehiculo,
        fecha_asignacion: rutaRes.data.fecha_asignacion,
      });
      setVehiculos(vehiculosRes.data.vehiculos || []);

      const vehiculoSeleccionado = vehiculosRes.data.vehiculos.find(
        (v) => v.id === rutaRes.data.id_vehiculo
      );
      setCapacidadVehiculo(
        vehiculoSeleccionado ? vehiculoSeleccionado.capacidad_carga : 0
      );

      const ordenesAsignadasOrdenadas = [
        ...rutaRes.data.ordenes_recolecciones,
      ].sort((a, b) => a.prioridad - b.prioridad);

      const ordenesDetalladas = await Promise.all(
        ordenesAsignadasOrdenadas.map(async (orden) => {
          const ordenCompleta = allOrdenes.find((o) => o.id === orden.id_orden);
          return {
            ...orden,
            cliente: ordenCompleta?.cliente,
            numero_seguimiento: ordenCompleta?.numero_seguimiento,
            paquetes: ordenCompleta?.detalles || [],
          };
        })
      );

      console.log("Órdenes detalladas:", ordenesDetalladas);
      setOrdenesAsignadas(ordenesDetalladas);

      const totalPaquetesAsignados = ordenesDetalladas.reduce(
        (total, orden) => total + orden.paquetes.length,
        0
      );
      setTotalPaquetes(totalPaquetesAsignados);

      const todasOrdenesAsignadasIds = new Set(
        allOrdenesRecoleccion.flatMap((or) => or.id_orden)
      );

      const preordenesFiltradas = allOrdenes.filter((p) => {
        return (
          p.tipo_orden === "preorden" &&
          p.detalles &&
          p.detalles.every((d) => d.tipo_entrega === "Entrega Normal") &&
          p.detalles.some((d) => d.id_estado_paquetes === 3) &&
          !todasOrdenesAsignadasIds.has(p.id)
        );
      });

      console.log("Preórdenes filtradas:", preordenesFiltradas);
      setPreordenesDisponibles(preordenesFiltradas);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      if (error.response) {
        console.error("Respuesta del servidor:", error.response.data);
      }
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
    if (name === "id_vehiculo") {
      const vehiculoSeleccionado = vehiculos.find(
        (v) => v.id === parseInt(value)
      );
      setCapacidadVehiculo(
        vehiculoSeleccionado ? vehiculoSeleccionado.capacidad_carga : 0
      );
    }
  };

  const handlePreordenToggle = (preordenId) => {
    const preorden = preordenesDisponibles.find((p) => p.id === preordenId);
    const cantidadPaquetes = preorden?.detalles?.length || 0;

    setPreordenesSeleccionadas((prev) => {
      if (prev.includes(preordenId)) {
        // Si la preorden ya está seleccionada, la quitamos
        setTotalPaquetes(totalPaquetes - cantidadPaquetes);
        return prev.filter((id) => id !== preordenId);
      } else {
        // Si la preorden no está seleccionada, verificamos si hay capacidad
        const nuevoTotal = totalPaquetes + cantidadPaquetes;
        if (nuevoTotal > capacidadVehiculo) {
          toast.warning(
            "No hay suficiente capacidad en el vehículo para esta orden."
          );
          return prev; // No se añade la preorden
        }
        // Si hay capacidad, añadimos la preorden
        setTotalPaquetes(nuevoTotal);
        return [...prev, preordenId];
      }
    });
  };

  const handlePrioridadChange = (ordenId, nuevaPrioridad) => {
    setOrdenesAsignadas((prevOrdenes) =>
      prevOrdenes
        .map((orden) =>
          orden.id === ordenId
            ? { ...orden, prioridad: parseInt(nuevaPrioridad) }
            : orden
        )
        .sort((a, b) => a.prioridad - b.prioridad)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (totalPaquetes > capacidadVehiculo) {
      toast.warning("La cantidad de paquetes excede la capacidad del vehículo");
    }
    try {
      const token = localStorage.getItem("token");

      const todasLasOrdenes = [
        ...ordenesAsignadas.map((orden) => ({
          id: orden.id_orden,
          prioridad: orden.prioridad,
        })),
        ...preordenesSeleccionadas.map((id, index) => ({
          id: id,
          prioridad: ordenesAsignadas.length + index + 1,
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
      fetchData();
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
                        {vehiculo.placa} - {vehiculo.capacidad_carga}{" "}
                        {"Paquetes"}
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
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4>Órdenes Asignadas a esta Ruta</h4>
                  <h5>Paquetes: {totalPaquetes}</h5>
                </div>
                <Table>
                  <thead>
                    <tr>
                      <th>Número de seguimiento</th>
                      <th>Cliente</th>
                      <th>Dirección de Recolección</th>
                      <th>Estado</th>
                      <th>Orden de recolección</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordenesAsignadas.map((orden) => (
                      <tr key={orden.id}>
                        <td>{orden.numero_seguimiento}</td>
                        <td>
                          {orden.cliente
                            ? `${orden.cliente.nombre} ${orden.cliente.apellido}`
                            : "N/A"}
                        </td>
                        <td>{orden.destino || "N/A"}</td>
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
                {preordenesDisponibles.length > 0 ? (
                  <Table>
                    <thead>
                      <tr>
                        <th>Seleccionar</th>
                        <th>Número de seguimiento</th>
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
                          <td>{preorden.numero_seguimiento}</td>
                          <td>
                            {preorden.cliente?.nombre}{" "}
                            {preorden.cliente?.apellido}
                          </td>
                          <td>{preorden.direccion_emisor?.direccion}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <p>No hay preórdenes disponibles para agregar.</p>
                )}
              </Col>
            </Row>
            <Button color="primary" type="submit">
              Actualizar Ruta
            </Button>
            <Button
              onClick={() => navigate("/gestion-ordenes-recoleccion")}
              className="ml-2 btn-regresar"
            >
              Volver a Gestión de Recolección
            </Button>
          </Form>
        </CardBody>
      </Card>
    </Container>
  );
};

export default EditarRutaRecoleccion;
