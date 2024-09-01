import React from "react";
import { Card, CardBody, ListGroup, ListGroupItem, Table } from "reactstrap";

const ResumenOrden = ({ orden }) => {
  if (!orden) {
    return <div>Cargando...</div>;
  }

  return (
    <Card>
      <CardBody>
        <h2>Resumen de la Orden</h2>
        <ListGroup>
          <ListGroupItem>
            <strong>ID de la Orden:</strong> {orden.id}
          </ListGroupItem>
          <ListGroupItem>
            <strong>Cliente:</strong> {orden.id_cliente}
          </ListGroupItem>
          <ListGroupItem>
            <strong>Total a Pagar:</strong> ${orden.total_pagar}
          </ListGroupItem>
          <ListGroupItem>
            <strong>Costo Adicional:</strong> ${orden.costo_adicional}
          </ListGroupItem>
          <ListGroupItem>
            <strong>Estado:</strong> {orden.id_estado_paquetes}
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
                <td>{detalle.id_tipo_paquete}</td>
                <td>{detalle.peso}</td>
                <td>{detalle.id_estado_paquete}</td>
                <td>{detalle.fecha_envio}</td>
                <td>{detalle.fecha_entrega_estimada}</td>
                <td>${detalle.precio}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </CardBody>
    </Card>
  );
};

export default ResumenOrden;
