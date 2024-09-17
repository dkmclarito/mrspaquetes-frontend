import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  ListGroup,
  ListGroupItem,
  Table,
  Button,
} from "reactstrap";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

const ResumenOrden = ({ orden, actualizarOrden }) => {
  const [direccionRecoleccion, setDireccionRecoleccion] = useState(null);

  useEffect(() => {
    if (orden.tipo_orden === "preorden" && orden.direccion_recoleccion) {
      fetchDireccionRecoleccion();
    }
  }, [orden]);

  const fetchDireccionRecoleccion = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/direcciones/${orden.direccion_recoleccion}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDireccionRecoleccion(response.data);
    } catch (error) {
      console.error("Error al cargar la dirección de recolección:", error);
      toast.error("Error al cargar la dirección de recolección");
    }
  };

  const calcularTotalPaquetes = () => {
    return (
      orden.detalles?.reduce(
        (total, detalle) => total + parseFloat(detalle.precio || 0),
        0
      ) || 0
    );
  };

  const totalPaquetes = calcularTotalPaquetes();
  const costoAdicional = parseFloat(orden.costo_adicional || 0);
  const totalOrden = parseFloat(orden.total_pagar || 0);
  const tipoOrden = orden.tipo_orden === "preorden" ? "Pre-Orden" : "Orden";

  const handleProcesarPago = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/ordenes/${orden.id}/procesar-pago`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Pago procesado con éxito");
      actualizarOrden({ ...orden, estado_pago: "pagado" });
    } catch (error) {
      console.error("Error al procesar el pago:", error);
      toast.error("Error al procesar el pago");
    }
  };

  // Función de ayuda para renderizar de forma segura
  const renderSafely = (value) => {
    if (typeof value === "object" && value !== null) {
      return JSON.stringify(value);
    }
    return value || "";
  };

  return (
    <Card>
      <CardBody>
        <h2>Resumen de la {tipoOrden}</h2>
        <ListGroup>
          <ListGroupItem>
            <strong>Número de Seguimiento:</strong>{" "}
            {renderSafely(orden.numero_seguimiento)}
          </ListGroupItem>
          <ListGroupItem>
            <strong>Cliente:</strong>{" "}
            {renderSafely(orden.direccion_emisor?.nombre_cliente)}{" "}
            {renderSafely(orden.direccion_emisor?.apellido_cliente)}
          </ListGroupItem>
          <ListGroupItem>
            <strong>Tipo de Pago:</strong>{" "}
            {orden.id_tipo_pago === 1 ? "Efectivo" : "Tarjeta"}
          </ListGroupItem>
          <ListGroupItem>
            <strong>Total Paquetes:</strong> ${totalPaquetes.toFixed(2)}
          </ListGroupItem>
          <ListGroupItem>
            <strong>Costo Adicional:</strong> ${costoAdicional.toFixed(2)}
          </ListGroupItem>
          <ListGroupItem>
            <strong>Total a Pagar:</strong> ${totalOrden.toFixed(2)}
          </ListGroupItem>
          <ListGroupItem>
            <strong>Estado de Pago:</strong> {renderSafely(orden.estado_pago)}
            {tipoOrden === "Orden" && orden.estado_pago !== "pagado" && (
              <Button
                color="success"
                size="sm"
                className="ml-2"
                onClick={handleProcesarPago}
              >
                Procesar Pago
              </Button>
            )}
          </ListGroupItem>
          <ListGroupItem>
            <strong>Concepto:</strong> {renderSafely(orden.concepto)}
          </ListGroupItem>
          <ListGroupItem>
            <strong>Tipo de Documento:</strong>{" "}
            {renderSafely(orden.tipo_documento)}
          </ListGroupItem>
        </ListGroup>

        <h3 className="mt-4">Detalles de Paquetes</h3>
        <Table>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Tamaño</th>
              <th>Peso</th>
              <th>Estado</th>
              <th>Fecha Envío</th>
              <th>Fecha Entrega Est.</th>
              <th>Precio</th>
            </tr>
          </thead>
          <tbody>
            {orden.detalles?.map((detalle, index) => (
              <tr key={index}>
                <td>{renderSafely(detalle.id_tipo_paquete)}</td>
                <td>
                  {detalle.id_tamano_paquete === 1
                    ? "Pequeño"
                    : detalle.id_tamano_paquete === 2
                      ? "Mediano"
                      : "Grande"}
                </td>
                <td>{renderSafely(detalle.peso)} kg</td>
                <td>{renderSafely(detalle.id_estado_paquetes)}</td>
                <td>
                  {detalle.fecha_envio
                    ? new Date(detalle.fecha_envio).toLocaleDateString()
                    : ""}
                </td>
                <td>
                  {detalle.fecha_entrega_estimada
                    ? new Date(
                        detalle.fecha_entrega_estimada
                      ).toLocaleDateString()
                    : ""}
                </td>
                <td>${parseFloat(detalle.precio || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </Table>

        <h3 className="mt-4">Dirección de Entrega</h3>
        <ListGroup>
          <ListGroupItem>
            <strong>Contacto:</strong>{" "}
            {renderSafely(orden.direccion_emisor?.nombre_contacto)}
          </ListGroupItem>
          <ListGroupItem>
            <strong>Teléfono:</strong>{" "}
            {renderSafely(orden.direccion_emisor?.telefono)}
          </ListGroupItem>
          <ListGroupItem>
            <strong>Dirección:</strong>{" "}
            {renderSafely(orden.direccion_emisor?.direccion)}
          </ListGroupItem>
          <ListGroupItem>
            <strong>Referencia:</strong>{" "}
            {renderSafely(orden.direccion_emisor?.referencia) ||
              "No especificada"}
          </ListGroupItem>
        </ListGroup>

        {orden.tipo_orden === "preorden" && direccionRecoleccion && (
          <>
            <h3 className="mt-4">Dirección de Recolección</h3>
            <ListGroup>
              <ListGroupItem>
                <strong>Contacto:</strong>{" "}
                {renderSafely(direccionRecoleccion.direccion.nombre_contacto)}
              </ListGroupItem>
              <ListGroupItem>
                <strong>Teléfono:</strong>{" "}
                {renderSafely(direccionRecoleccion.direccion.telefono)}
              </ListGroupItem>
              <ListGroupItem>
                <strong>Dirección:</strong>{" "}
                {renderSafely(direccionRecoleccion.direccion.direccion)}
              </ListGroupItem>
              <ListGroupItem>
                <strong>Referencia:</strong>{" "}
                {renderSafely(direccionRecoleccion.direccion.referencia) ||
                  "No especificada"}
              </ListGroupItem>
            </ListGroup>
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default ResumenOrden;
