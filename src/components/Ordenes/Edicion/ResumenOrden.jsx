import React from "react";
import { Card, CardBody, ListGroup, ListGroupItem, Table } from "reactstrap";

const ResumenOrden = ({ orden }) => {
  if (!orden) {
    return <div>Cargando...</div>;
  }

  const calcularTotalPaquetes = () => {
    return orden.detalles.reduce(
      (total, detalle) => total + parseFloat(detalle.precio || 0),
      0
    );
  };

  const totalPaquetes = calcularTotalPaquetes();
  const costoAdicional = parseFloat(orden.costo_adicional || 0);
  const totalOrden = parseFloat(orden.total_pagar);

  return (
    <Card>
      <CardBody>
        <h2>Resumen de la Orden</h2>
        <ListGroup>
          <ListGroupItem>
            <strong>Número de Seguimiento:</strong> {orden.numero_seguimiento}
          </ListGroupItem>
          <ListGroupItem>
            <strong>Cliente:</strong> {orden.direccion_emisor.nombre_cliente}{" "}
            {orden.direccion_emisor.apellido_cliente}
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
            <strong>Estado de Pago:</strong> {orden.estado_pago}
          </ListGroupItem>
          <ListGroupItem>
            <strong>Concepto:</strong> {orden.concepto}
          </ListGroupItem>
        </ListGroup>
        <h3 className="mt-4">Detalles de Paquetes</h3>
        <Table>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Peso</th>
              <th>Estado</th>
              <th>Fecha Envío</th>
              <th>Fecha Entrega Est.</th>
              <th>Precio</th>
            </tr>
          </thead>
          <tbody>
            {orden.detalles.map((detalle, index) => (
              <tr key={index}>
                <td>{detalle.descripcion_contenido || "N/A"}</td>
                <td>{detalle.peso ? `${detalle.peso} lb` : "N/A"}</td>
                <td>{detalle.id_estado_paquete === 2 ? "En Bodega" : "N/A"}</td>
                <td>{new Date(detalle.fecha_envio).toLocaleDateString()}</td>
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
  );
};

export default ResumenOrden;
