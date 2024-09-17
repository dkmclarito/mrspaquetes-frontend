import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Card, CardBody, Button } from "reactstrap";
import axios from "axios";
import { toast } from "react-toastify";
import RutaTable from "../components/Rutas/RutaTable";
import OrdenTable from "../components/Rutas/OrdenTable";
import AsignarPreordenesModal from "../components/Rutas/AsignarPreordenesModal";
import FinalizarOrdenModal from "../components/Rutas/FinalizarOrdenModal";

const API_URL = import.meta.env.VITE_API_URL;

const GestionOrdenesRecoleccion = () => {
  const [rutasRecoleccion, setRutasRecoleccion] = useState([]);
  const [ordenesAsignadas, setOrdenesAsignadas] = useState([]);
  const [rutaSeleccionada, setRutaSeleccionada] = useState(null);
  const [modalAsignarPreordenes, setModalAsignarPreordenes] = useState(false);
  const [modalFinalizar, setModalFinalizar] = useState(false);
  const [ordenAFinalizar, setOrdenAFinalizar] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRutasRecoleccion = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/rutas-recolecciones`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Datos recibidos de rutas de recolección:", response.data);
      setRutasRecoleccion(response.data.data || []);
    } catch (error) {
      console.error("Error al obtener rutas de recolección:", error);
      toast.error("Error al cargar las rutas de recolección");
    }
  }, []);

  const fetchOrdenesAsignadas = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/orden-recoleccion`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Datos recibidos de órdenes asignadas:", response.data);
      setOrdenesAsignadas(response.data.data || []);
    } catch (error) {
      console.error("Error al obtener órdenes asignadas:", error);
      toast.error("Error al cargar las órdenes asignadas");
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchRutasRecoleccion(), fetchOrdenesAsignadas()]);
      setLoading(false);
    };
    fetchData();
  }, [fetchRutasRecoleccion, fetchOrdenesAsignadas]);

  const handleSeleccionRuta = (ruta) => {
    console.log("Ruta seleccionada:", ruta);
    setRutaSeleccionada(ruta);
  };

  const handleAsignarPreordenes = () => {
    if (!rutaSeleccionada) {
      toast.warn("Seleccione una ruta primero");
      return;
    }
    setModalAsignarPreordenes(true);
  };

  const confirmarAsignacion = async (preordenesSeleccionadas) => {
    if (!rutaSeleccionada) {
      toast.error("No se ha seleccionado una ruta de recolección");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      console.log("Ruta seleccionada para asignación:", rutaSeleccionada);
      console.log("Preórdenes seleccionadas:", preordenesSeleccionadas);

      // Paso 1: Crear órdenes de recolección
      const ordenesRecoleccion = await Promise.all(
        preordenesSeleccionadas.map(async (preorden) => {
          const dataToSend = {
            id_ruta_recoleccion: rutaSeleccionada.id,
            fecha_asignacion: rutaSeleccionada.fecha_asignacion,
            id_vehiculo: rutaSeleccionada.id_vehiculo,
            ordenes: [{ id: preorden.id }],
          };
          console.log(
            "Datos a enviar para crear orden de recolección:",
            dataToSend
          );

          try {
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
            console.log(
              "Respuesta de crear orden de recolección:",
              response.data
            );
            return response.data;
          } catch (error) {
            console.error(
              "Error al crear orden de recolección:",
              error.response?.data || error.message
            );
            throw error;
          }
        })
      );

      // Paso 2: Asignar las órdenes de recolección a la ruta
      const dataToAssign = {
        ordenes_recoleccion: ordenesRecoleccion.map((orden) => orden.id),
      };
      console.log("Datos a enviar para asignar órdenes a ruta:", dataToAssign);

      await axios.post(
        `${API_URL}/rutas-recolecciones/${rutaSeleccionada.id}/asignar-ordenes`,
        dataToAssign,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Órdenes asignadas con éxito");
      fetchOrdenesAsignadas();
    } catch (error) {
      console.error("Error al asignar órdenes:", error);
      if (error.response) {
        console.error("Datos del error:", error.response.data);
        console.error("Estado del error:", error.response.status);
        console.error("Cabeceras del error:", error.response.headers);

        if (error.response.data && error.response.data.errors) {
          const errorMessages = Object.values(error.response.data.errors)
            .flat()
            .join(", ");
          toast.error(`Error al asignar las órdenes: ${errorMessages}`);
        } else {
          toast.error(
            `Error al asignar las órdenes: ${error.response.data.message || "Error desconocido"}`
          );
        }
      } else if (error.request) {
        console.error("Error de red:", error.request);
        toast.error("Error de red. Por favor, verifica tu conexión.");
      } else {
        console.error("Error:", error.message);
        toast.error(
          "Error al procesar la solicitud. Por favor, intenta de nuevo."
        );
      }
    }
  };

  const handleFinalizarOrden = (orden) => {
    setOrdenAFinalizar(orden);
    setModalFinalizar(true);
  };

  const confirmarFinalizarOrden = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/orden-recoleccion/finalizar-orden-recoleccion/${ordenAFinalizar.id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Orden finalizada con éxito");
      setModalFinalizar(false);
      fetchOrdenesAsignadas();
    } catch (error) {
      console.error("Error al finalizar la orden:", error);
      toast.error("Error al finalizar la orden");
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <Container fluid>
      <h2 className="mb-4 titulo-pasos">Gestión de Órdenes de Recolección</h2>
      <Row>
        <Col md={6}>
          <Card>
            <CardBody>
              <h4>Rutas de Recolección</h4>
              <RutaTable
                rutas={rutasRecoleccion}
                onSelectRuta={handleSeleccionRuta}
                rutaSeleccionada={rutaSeleccionada}
              />
              <Button
                color="primary"
                onClick={handleAsignarPreordenes}
                disabled={!rutaSeleccionada}
                className="mt-3"
              >
                Asignar Preórdenes a Ruta
              </Button>
            </CardBody>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <CardBody>
              <h4>Órdenes de Recolección Asignadas</h4>
              <OrdenTable
                ordenes={ordenesAsignadas}
                onFinalizarOrden={handleFinalizarOrden}
                tipo="asignada"
              />
            </CardBody>
          </Card>
        </Col>
      </Row>
      <AsignarPreordenesModal
        isOpen={modalAsignarPreordenes}
        toggle={() => setModalAsignarPreordenes(!modalAsignarPreordenes)}
        rutaSeleccionada={rutaSeleccionada}
        onAsignarOrdenes={confirmarAsignacion}
      />
      <FinalizarOrdenModal
        isOpen={modalFinalizar}
        toggle={() => setModalFinalizar(!modalFinalizar)}
        onConfirm={confirmarFinalizarOrden}
      />
    </Container>
  );
};

export default GestionOrdenesRecoleccion;
