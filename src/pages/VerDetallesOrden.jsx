import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardBody, Col, Row, Table, Badge } from "reactstrap";
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
                          Número de Seguimiento:
                        </th>
                        <td>{orden.numero_seguimiento}</td>
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
                        <td>{orden.direccion_emisor?.direccion}</td>
                      </tr>
                      <tr>
                        <th scope="row">Contacto:</th>
                        <td>{orden.direccion_emisor?.nombre_contacto}</td>
                      </tr>
                      <tr>
                        <th scope="row">Teléfono:</th>
                        <td>{orden.direccion_emisor?.telefono}</td>
                      </tr>
                      <tr>
                        <th scope="row">Ubicación:</th>
                        <td>
                          {orden.direccion_emisor?.id_municipio},{" "}
                          {orden.direccion_emisor?.id_departamento}
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">Referencia:</th>
                        <td>{orden.direccion_emisor?.referencia}</td>
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
                    <th>Peso</th>
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
            <Link to={determinarRutaVolver()} className="btn btn-primary">
              Volver a la lista de{" "}
              {orden.tipo_orden === "preorden" ? "pre-órdenes" : "órdenes"}
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default VerDetallesOrden;
