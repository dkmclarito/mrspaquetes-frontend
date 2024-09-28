import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Card, CardBody, Table, Button } from "reactstrap";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faPlay,
  faStop,
  faCreditCard,
  faTag,
} from "@fortawesome/free-solid-svg-icons";

const API_URL = import.meta.env.VITE_API_URL;

const DetallesRutaRecoleccion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ruta, setRuta] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState({});

  const fetchRutaDetails = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/rutas-recolecciones/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const rutaConPaquetes = {
        ...response.data,
        ordenes_recolecciones: await Promise.all(
          response.data.ordenes_recolecciones.map(async (orden) => {
            const detallesOrden = await axios.get(
              `${API_URL}/ordenes/${orden.id_orden}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            return {
              ...orden,
              paquetes: detallesOrden.data.detalles,
              puedeIniciar: orden.estado !== 0 && !orden.recoleccion_iniciada,
              puedeFinalizar:
                orden.estado !== 0 &&
                orden.recoleccion_iniciada &&
                !orden.recoleccion_finalizada,
              estado_pago: detallesOrden.data.estado_pago,
            };
          })
        ),
      };

      setRuta(rutaConPaquetes);
    } catch (error) {
      console.error("Error al cargar los detalles de la ruta:", error);
      toast.error("Error al cargar los detalles de la ruta");
    }
  }, [id]);

  useEffect(() => {
    fetchRutaDetails();
  }, [fetchRutaDetails]);

  const toggleOrder = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const getEstadoPaquete = (idEstado) => {
    const estados = {
      1: "En Recepción",
      2: "En Bodega",
      3: "En Espera de Recolección",
      4: "En Tránsito",
      5: "En Ruta de Entrega",
      6: "Reprogramado",
      7: "Recibido en Destino",
      8: "Entregado",
      9: "En Proceso de Retorno",
      10: "Devuelto",
      11: "Dañado",
      12: "Perdido",
      13: "Cancelado",
      14: "En espera de ubicación",
      15: "Recolectado",
    };
    return estados[idEstado] || "Desconocido";
  };

  const obtenerNombreEstado = (id) => {
    const estados = {
      1: "Activo",
      2: "Inactivo",
      3: "En Proceso",
      0: "Recolectada",
      5: "Cancelado",
    };
    return estados[id] || "Estado desconocido";
  };

  const getTotalPaquetes = () => {
    return ruta.ordenes_recolecciones.reduce(
      (total, orden) => total + orden.paquetes.length,
      0
    );
  };

  const iniciarRecoleccionOrden = async (ordenId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/orden-recoleccion/asignar-recoleccion/${ordenId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Recolección iniciada para la orden");
      await fetchRutaDetails();
    } catch (error) {
      console.error("Error al iniciar la recolección de la orden:", error);
      toast.error("Error al iniciar la recolección de la orden");
    }
  };

  const finalizarRecoleccionOrden = async (ordenId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/orden-recoleccion/finalizar-orden-recoleccion/${ordenId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Recolección finalizada para la orden");
      await fetchRutaDetails();
    } catch (error) {
      console.error("Error al finalizar la recolección de la orden:", error);
      toast.error("Error al finalizar la recolección de la orden");
    }
  };

  const procesarPagoOrden = async (ordenId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/ordenes/${ordenId}/procesar-pago`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Pago procesado con éxito");
      await fetchRutaDetails();
    } catch (error) {
      console.error("Error al procesar el pago de la orden:", error);
      toast.error("Error al procesar el pago de la orden");
    }
  };

  const generarVineta = async (ordenId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/ordenes/${ordenId}/vineta?format=json`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "json",
        }
      );

      if (response.data.success) {
        // Crear un Blob con el PDF en base64
        const byteCharacters = atob(response.data.data.pdf_base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });

        // Crear un URL para el Blob
        const fileURL = URL.createObjectURL(blob);

        // Crear un enlace temporal y hacer clic en él para descargar
        const link = document.createElement("a");
        link.href = fileURL;
        link.download = response.data.data.filename;
        link.click();

        // Liberar el URL del objeto
        URL.revokeObjectURL(fileURL);

        toast.success("Viñeta generada exitosamente");
      } else {
        toast.error("Error al generar la viñeta");
      }
    } catch (error) {
      console.error("Error al generar viñeta:", error);
      toast.error("Error al generar viñeta");
    }
  };

  if (!ruta) {
    return <div>Cargando...</div>;
  }

  return (
    <Container fluid className=" ">
      <h2 className="mb-4">Detalles de Ruta de Recolección</h2>
      <Card className=" mb-4">
        <CardBody>
          <Row>
            <Col md={6}>
              <h4>Información General</h4>
              <Table borderless className="">
                <tbody>
                  <tr>
                    <th scope="row">Código de Ruta:</th>
                    <td>{ruta.nombre}</td>
                  </tr>
                  <tr>
                    <th scope="row">Vehículo:</th>
                    <td>
                      {ruta.vehiculo?.placa} - {ruta.vehiculo?.modelo}
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Fecha de Asignación:</th>
                    <td>
                      {new Date(ruta.fecha_asignacion).toLocaleDateString()}
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Col>
            <Col md={6}>
              <Table borderless className=" mt-4">
                <tbody>
                  <tr>
                    <th scope="row">Estado:</th>
                    <td>{obtenerNombreEstado(ruta.estado)}</td>
                  </tr>
                  <tr>
                    <th scope="row">Total de Órdenes:</th>
                    <td>{ruta.ordenes_recolecciones?.length || 0}</td>
                  </tr>
                  <tr>
                    <th scope="row">Total de Paquetes a Recolectar:</th>
                    <td>{getTotalPaquetes()}</td>
                  </tr>
                </tbody>
              </Table>
            </Col>
          </Row>
        </CardBody>
      </Card>

      <Card className="">
        <CardBody>
          <h4 className="mb-4">Órdenes de Recolección Asociadas</h4>
          {ruta.ordenes_recolecciones.map((orden, index) => (
            <div key={orden.id} className="mb-4">
              <Table
                responsive
                className="table-centered table-nowrap mb-2 bg-dark"
              >
                <thead>
                  <tr>
                    <th>ID Orden</th>
                    <th>Código Único</th>
                    <th>Orden de recoleccion</th>
                    <th>Destino</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{orden.id}</td>
                    <td>{orden.codigo_unico_recoleccion}</td>
                    <td>{orden.prioridad}</td>
                    <td>{orden.destino}</td>
                    <td>{obtenerNombreEstado(orden.estado)}</td>
                    <td>
                      <Button
                        className="btn-sm btn-icon btn-direcciones me-2"
                        onClick={() => toggleOrder(orden.id)}
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </Button>
                      <Button
                        className="btn-sm btn-icon btn-success me-2"
                        onClick={() => iniciarRecoleccionOrden(orden.id)}
                        disabled={!orden.puedeIniciar}
                      >
                        <FontAwesomeIcon icon={faPlay} />
                      </Button>
                      <Button
                        className="btn-sm btn-icon btn-danger me-2"
                        onClick={() => finalizarRecoleccionOrden(orden.id)}
                        disabled={!orden.puedeFinalizar}
                      >
                        <FontAwesomeIcon icon={faStop} />
                      </Button>
                      <Button
                        className="me-2 btn-icon btn-editar"
                        onClick={() => procesarPagoOrden(orden.id_orden)}
                        disabled={orden.estado_pago !== "pendiente"}
                      >
                        <FontAwesomeIcon icon={faCreditCard} />
                      </Button>
                      <Button
                        className="btn-sm me-2 btn-icon btn-regresar2"
                        onClick={() => generarVineta(orden.id_orden)}
                      >
                        <FontAwesomeIcon icon={faTag} />
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </Table>
              {expandedOrders[orden.id] && (
                <Table bordered className="mb-0 bg-dark">
                  <thead>
                    <tr>
                      <th>ID Paquete</th>
                      <th>Descripción</th>
                      <th>Peso</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orden.paquetes.map((paquete) => (
                      <tr key={paquete.id}>
                        <td>{paquete.id_paquete}</td>
                        <td>{paquete.descripcion}</td>
                        <td>{paquete.peso} kg</td>
                        <td>{getEstadoPaquete(paquete.id_estado_paquetes)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
              <hr className="bg-light" />
            </div>
          ))}

          <div className="mt-4">
            <Button
              className="btn-regresar ml-2"
              onClick={() => navigate("/gestion-ordenes-recoleccion")}
            >
              Volver al Listado
            </Button>
          </div>
        </CardBody>
      </Card>
    </Container>
  );
};

export default DetallesRutaRecoleccion;
