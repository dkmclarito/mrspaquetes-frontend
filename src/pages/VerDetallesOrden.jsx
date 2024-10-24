import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardBody, Col, Row, Table, Badge, Button } from "reactstrap";
import Breadcrumbs from "../components/Empleados/Common/Breadcrumbs";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

const VerDetallesOrden = () => {
  const { id } = useParams();
  const [orden, setOrden] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [tiposPaquete, setTiposPaquete] = useState([]);
  const [tiposCaja, setTiposCaja] = useState([]);
  const [estadosPaquete, setEstadosPaquete] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setCargando(true);
        const token = localStorage.getItem("token");
        const [ordenRes, tiposPaqueteRes, tiposCajaRes, estadosPaqueteRes] =
          await Promise.all([
            axios.get(`${API_URL}/ordenes/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${API_URL}/dropdown/get_tipo_paquete`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${API_URL}/dropdown/get_empaques`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${API_URL}/dropdown/get_estado_paquete`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

        setOrden(ordenRes.data);
        setTiposPaquete(tiposPaqueteRes.data.tipo_paquete || []);
        setTiposCaja(tiposCajaRes.data.empaques || []);
        setEstadosPaquete(estadosPaqueteRes.data.estado_paquetes || []);

        console.log("Datos de la orden:", ordenRes.data);
        console.log("Tipos de paquete:", tiposPaqueteRes.data.tipo_paquete);
        console.log("Tipos de caja:", tiposCajaRes.data.empaques);
        console.log(
          "Estados de paquete:",
          estadosPaqueteRes.data.estado_paquetes
        );
      } catch (error) {
        console.error("Error al cargar los datos:", error);
        toast.error("Error al cargar los datos de la orden");
      } finally {
        setCargando(false);
      }
    };

    fetchData();
  }, [id]);

  const determinarRutaVolver = () => {
    if (!orden) return "/GestionOrdenes";
    const esPreOrden = orden.tipo_orden === "preorden";
    const esExpress = orden.detalles.some(
      (detalle) => detalle.tipo_entrega === "Entrega Express"
    );
    if (esPreOrden) {
      return esExpress ? "/GestionPreOrdenesExpress" : "/GestionPreOrdenes";
    } else {
      return esExpress ? "/GestionOrdenesExpress" : "/GestionOrdenes";
    }
  };

  const obtenerDireccionEntrega = (orden) => {
    if (orden && orden.detalles && orden.detalles.length > 0) {
      const primerDetalle = orden.detalles[0];
      return {
        direccion: primerDetalle.direccion,
        nombre_contacto: primerDetalle.recibe,
        telefono: primerDetalle.telefono,
        departamento: primerDetalle.departamento,
        municipio: primerDetalle.municipio,
        instrucciones_entrega: primerDetalle.instrucciones_entrega,
      };
    }
    return null;
  };

  const obtenerNumeroSeguimientoOTracking = (orden) => {
    const tieneEntregaExpress = orden.detalles.some(
      (detalle) => detalle.tipo_entrega === "Entrega Express"
    );

    if (tieneEntregaExpress) {
      return {
        titulo: "Número de Seguimiento",
        numero: orden.numero_seguimiento || "N/A",
      };
    } else {
      return {
        titulo: "Número de Tracking",
        numero: orden.numero_tracking || "N/A",
      };
    }
  };

  const obtenerTipoPago = (id) => {
    switch (id) {
      case 1:
        return "Efectivo";
      case 2:
        return "Tarjeta";
      default:
        return "Desconocido";
    }
  };

  const obtenerNombreTipoPaquete = (id) => {
    const tipoPaquete = tiposPaquete.find((tipo) => tipo.id === id);
    return tipoPaquete ? tipoPaquete.nombre : "N/A";
  };

  const obtenerNombreTipoCaja = (id) => {
    const tipoCaja = tiposCaja.find((caja) => caja.id === id);
    return tipoCaja ? tipoCaja.empaquetado : "N/A";
  };

  const obtenerEstadoPaquete = (id) => {
    const estado = estadosPaquete.find((estado) => estado.id === id);
    return estado ? estado.nombre : "N/A";
  };

  const obtenerColorEstado = (id) => {
    switch (id) {
      case 1:
        return "primary";
      case 2:
        return "info";
      case 3:
        return "warning";
      case 4:
        return "success";
      default:
        return "secondary";
    }
  };

  const obtenerColorEstadoPago = (estado) => {
    return estado.toLowerCase() === "pagado" ? "success" : "warning";
  };

  const reenviarComprobante = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/ordenes/reenviar_comprobante/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(response.data.message);
    } catch (error) {
      console.error("Error al reenviar comprobante:", error);
      toast.error("Error al reenviar comprobante");
    }
  };

  const generarVineta = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/ordenes/${id}/vineta?format=json`,
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

  if (cargando)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status"></div>
      </div>
    );
  if (!orden)
    return (
      <div className="alert alert-danger mt-5">No se encontró la orden.</div>
    );

  const totalPaquetes = orden.detalles.reduce(
    (total, detalle) => total + parseFloat(detalle.precio || 0),
    0
  );
  const costoAdicional = parseFloat(orden.costo_adicional || 0);
  const totalOrden = parseFloat(orden.total_pagar);
  const direccionEntrega = obtenerDireccionEntrega(orden);
  const { titulo: tituloNumero, numero: numeroMostrado } =
    obtenerNumeroSeguimientoOTracking(orden);

  const ordenPagada = orden.estado_pago.toLowerCase() === "pagado";

  return (
    <div className="page-content">
      <Breadcrumbs
        title={`Gestión de ${orden.tipo_orden === "preorden" ? "Pre-Órdenes" : "Órdenes"}`}
        breadcrumbItem="Detalles de Orden"
      />
      <Card>
        <CardBody>
          <h4 className="card-title mb-4">
            {orden.tipo_orden === "preorden" ? "Pre-Orden" : "Orden"} #
            {orden.id}
          </h4>

          <Row>
            <Col md={6}>
              <Card className="mb-3">
                <CardBody>
                  <h5 className="card-title mb-3">Información General</h5>
                  <Table borderless className="mb-0">
                    <tbody>
                      <tr>
                        <th scope="row" style={{ width: "40%" }}>
                          {tituloNumero}:
                        </th>
                        <td>{numeroMostrado}</td>
                      </tr>
                      <tr>
                        <th scope="row">Cliente:</th>
                        <td>
                          {orden.direccion_emisor?.nombre_cliente}{" "}
                          {orden.direccion_emisor?.apellido_cliente}
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">Estado de Pago:</th>
                        <td>
                          <Badge
                            color={obtenerColorEstadoPago(orden.estado_pago)}
                          >
                            {orden.estado_pago}
                          </Badge>
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">Tipo de Pago:</th>
                        <td>{obtenerTipoPago(orden.id_tipo_pago)}</td>
                      </tr>
                      <tr>
                        <th scope="row">Concepto:</th>
                        <td>{orden.concepto}</td>
                      </tr>
                    </tbody>
                  </Table>
                </CardBody>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="mb-3">
                <CardBody>
                  <h5 className="card-title mb-3">Información de Entrega</h5>
                  <Table borderless className="mb-0">
                    <tbody>
                      <tr>
                        <th scope="row" style={{ width: "30%" }}>
                          Dirección:
                        </th>
                        <td>{direccionEntrega?.direccion || "N/A"}</td>
                      </tr>
                      <tr>
                        <th scope="row">Contacto:</th>
                        <td>{direccionEntrega?.nombre_contacto || "N/A"}</td>
                      </tr>
                      <tr>
                        <th scope="row">Teléfono:</th>
                        <td>{direccionEntrega?.telefono || "N/A"}</td>
                      </tr>
                      <tr>
                        <th scope="row">Ubicación:</th>
                        <td>
                          {direccionEntrega?.municipio},{" "}
                          {direccionEntrega?.departamento}
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">Instrucciones:</th>
                        <td>
                          {direccionEntrega?.instrucciones_entrega || "N/A"}
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Card className="mb-3">
            <CardBody>
              <h5 className="card-title mb-3">Detalles de los Paquetes</h5>
              <Table responsive bordered hover>
                <thead className="table-light">
                  <tr>
                    <th>Descripción</th>
                    <th>Tipo de Paquete</th>
                    <th>Tipo de Caja</th>
                    <th>Peso(Libras)</th>
                    <th>Estado</th>
                    <th>Tipo de Entrega</th>
                    <th>Fecha Envío</th>
                    <th>Fecha Entrega Est.</th>
                    <th>Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {orden.detalles.map((detalle, index) => (
                    <tr key={index}>
                      <td>{detalle.descripcion_contenido || "N/A"}</td>
                      <td>
                        {obtenerNombreTipoPaquete(detalle.id_tipo_paquete)}
                      </td>
                      <td>{obtenerNombreTipoCaja(detalle.tipo_caja)}</td>
                      <td>{detalle.peso ? `${detalle.peso} lb` : "N/A"}</td>
                      <td>
                        <Badge
                          color={obtenerColorEstado(detalle.id_estado_paquete)}
                        >
                          {obtenerEstadoPaquete(detalle.id_estado_paquetes)}
                        </Badge>
                      </td>
                      <td>
                        {detalle.id_tipo_entrega === 1 ? "Normal" : "Express"}
                      </td>
                      <td>
                        {new Date(detalle.fecha_envio).toLocaleDateString()}
                      </td>
                      <td>
                        {new Date(
                          detalle.fecha_entrega_estimada
                        ).toLocaleDateString()}
                      </td>
                      <td>${parseFloat(detalle.precio || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </CardBody>
          </Card>

          <Row>
            <Col md={6} className="ml-auto">
              <Card>
                <CardBody>
                  <h5 className="card-title mb-3">Resumen de Costos</h5>
                  <Table borderless>
                    <tbody>
                      <tr>
                        <th scope="row">Total Paquetes:</th>
                        <td className="text-right">
                          ${totalPaquetes.toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">Costo Adicional:</th>
                        <td className="text-right">
                          ${costoAdicional.toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">Total a Pagar:</th>
                        <td className="text-right">
                          <strong>${totalOrden.toFixed(2)}</strong>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <div className="text-center mt-4">
            <Link to={determinarRutaVolver()} className="btn btn-primary me-2">
              Volver a la lista de{" "}
              {orden.tipo_orden === "preorden" ? "pre-órdenes" : "órdenes"}
            </Link>
            {ordenPagada && (
              <>
                <Button
                  color="success"
                  className="me-2"
                  onClick={reenviarComprobante}
                >
                  Reenviar Comprobante
                </Button>
                <Button color="info" onClick={generarVineta}>
                  Generar Viñeta
                </Button>
              </>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default VerDetallesOrden;
