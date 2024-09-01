import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Card, CardBody, Col, Row, Badge, Table } from "reactstrap";
import Breadcrumbs from "../components/Empleados/Common/Breadcrumbs";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

const VerDetallesOrden = () => {
  const { id } = useParams();
  const [orden, setOrden] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchOrden = async () => {
      try {
        setCargando(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/ordenes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrden(response.data);
      } catch (error) {
        console.error("Error al cargar la orden:", error);
        toast.error("Error al cargar los datos de la orden");
      } finally {
        setCargando(false);
      }
    };

    fetchOrden();
  }, [id]);

  if (cargando) {
    return <p>Cargando...</p>;
  }

  if (!orden) {
    return <p>No se encontró la orden.</p>;
  }

  return (
    <div className="page-content">
      <Breadcrumbs
        title="Gestión de Órdenes"
        breadcrumbItem="Detalles de Orden"
      />
      <Card>
        <CardBody>
          <h4 className="card-title mb-4">Detalles de la Orden #{orden.id}</h4>
          <Row>
            <Col md={6}>
              <Table bordered>
                <tbody>
                  <tr>
                    <th>ID Cliente</th>
                    <td>{orden.id_cliente}</td>
                  </tr>
                  <tr>
                    <th>Número de Seguimiento</th>
                    <td>{orden.numero_seguimiento}</td>
                  </tr>
                  <tr>
                    <th>Tipo de Pago</th>
                    <td>{orden.id_tipo_pago}</td>
                  </tr>
                  <tr>
                    <th>Total a Pagar</th>
                    <td>${orden.total_pagar}</td>
                  </tr>
                </tbody>
              </Table>
            </Col>
            <Col md={6}>
              <Table bordered>
                <tbody>
                  <tr>
                    <th>Costo Adicional</th>
                    <td>${orden.costo_adicional}</td>
                  </tr>
                  <tr>
                    <th>Concepto</th>
                    <td>{orden.concepto}</td>
                  </tr>
                  <tr>
                    <th>ID Dirección</th>
                    <td>{orden.id_direccion}</td>
                  </tr>
                  <tr>
                    <th>Estado pago</th>
                    <td>{orden.estado_pago}</td>
                  </tr>
                </tbody>
              </Table>
            </Col>
          </Row>

          <h5 className="mt-4">Dirección del Emisor</h5>
          {orden.direccion_emisor && (
            <Card className="mt-3">
              <CardBody>
                <p>
                  <strong>Dirección:</strong> {orden.direccion_emisor.direccion}
                </p>
                <p>
                  <strong>Cliente:</strong>{" "}
                  {orden.direccion_emisor.nombre_cliente}{" "}
                  {orden.direccion_emisor.apellido_cliente}
                </p>
                <p>
                  <strong>Contacto:</strong>{" "}
                  {orden.direccion_emisor.nombre_contacto}
                </p>
                <p>
                  <strong>Teléfono:</strong> {orden.direccion_emisor.telefono}
                </p>
                <p>
                  <strong>Departamento:</strong>{" "}
                  {orden.direccion_emisor.id_departamento}
                </p>
                <p>
                  <strong>Municipio:</strong>{" "}
                  {orden.direccion_emisor.id_municipio}
                </p>
                <p>
                  <strong>Referencia:</strong>{" "}
                  {orden.direccion_emisor.referencia}
                </p>
              </CardBody>
            </Card>
          )}

          <h5 className="mt-4">Detalles de los Paquetes</h5>
          {orden.detalles.map((detalle, index) => (
            <Card key={index} className="mt-3">
              <CardBody>
                <h6>Paquete {index + 1}</h6>
                <Row>
                  <Col md={6}>
                    <p>
                      <strong>ID Paquete:</strong> {detalle.id_paquete}
                    </p>
                    <p>
                      <strong>Tipo de Entrega:</strong> {detalle.tipo_entrega}
                    </p>
                    <p>
                      <strong>Estado del Paquete:</strong>{" "}
                      {detalle.id_estado_paquetes}
                    </p>
                    <p>
                      <strong>Validación de Entrega:</strong>{" "}
                      {detalle.validacion_entrega ? "Sí" : "No"}
                    </p>
                  </Col>
                  <Col md={6}>
                    <p>
                      <strong>Descripción:</strong> {detalle.descripcion}
                    </p>
                    <p>
                      <strong>Precio:</strong> ${detalle.precio}
                    </p>
                    <p>
                      <strong>Tipo de Paquete:</strong> {detalle.tipo_paquete}
                    </p>
                    <p>
                      <strong>Tipo de Caja:</strong> {detalle.tipo_caja}
                    </p>
                    <p>
                      <strong>Peso:</strong> {detalle.peso} lb
                    </p>
                    <p>
                      <strong>Estado del Paquete:</strong>{" "}
                      {detalle.id_estado_paquetes}
                    </p>
                  </Col>
                </Row>
                <h6 className="mt-3">Datos de Entrega</h6>
                <p>
                  <strong>Recibe:</strong> {detalle.recibe}
                </p>
                <p>
                  <strong>Teléfono:</strong> {detalle.telefono}
                </p>
                <p>
                  <strong>Dirección:</strong> {detalle.direccion},{" "}
                  {detalle.municipio}, {detalle.departamento}
                </p>
              </CardBody>
            </Card>
          ))}

          <Link to="/GestionOrdenes" className="btn btn-secondary mt-4">
            Volver a la lista de órdenes
          </Link>
        </CardBody>
      </Card>
    </div>
  );
};

export default VerDetallesOrden;
