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
  const [loading, setLoading] = useState(true);
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

  const fetchOrdenes = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const [allOrdenes, allOrdenesRecoleccion] = await Promise.all([
        fetchAllData(`${API_URL}/ordenes`, token),
        fetchAllData(`${API_URL}/orden-recoleccion`, token),
      ]);

      console.log("Todas las órdenes:", allOrdenes);
      console.log("Todas las órdenes de recolección:", allOrdenesRecoleccion);

      // Obtener todos los IDs de órdenes ya asignadas a cualquier ruta de recolección
      const ordenesAsignadasIds = new Set(
        allOrdenesRecoleccion.flatMap((or) => or.id_orden)
      );

      // Filtrar preórdenes disponibles
      const preordenesFiltradas = allOrdenes.filter(
        (orden) =>
          orden.tipo_orden === "preorden" &&
          orden.detalles &&
          orden.detalles.every(
            (detalle) => detalle.tipo_entrega === "Entrega Normal"
          ) &&
          orden.detalles.some((detalle) => detalle.id_estado_paquetes === 3) &&
          !ordenesAsignadasIds.has(orden.id)
      );

      console.log("Preórdenes filtradas:", preordenesFiltradas);
      setOrdenes(preordenesFiltradas);
    } catch (error) {
      console.error("Error al obtener órdenes:", error);
      toast.error("Error al cargar las órdenes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [vehiculosRes] = await Promise.all([
          axios.get(`${API_URL}/dropdown/get_vehiculos`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setVehiculos(vehiculosRes.data.vehiculos || []);

        await fetchOrdenes();
      } catch (error) {
        console.error("Error al cargar datos:", error);
        toast.error("Error al cargar los datos necesarios");
      }
    };
    fetchData();
  }, [fetchOrdenes]);

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
                {loading ? (
                  <p>Cargando órdenes...</p>
                ) : (
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
                )}
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
