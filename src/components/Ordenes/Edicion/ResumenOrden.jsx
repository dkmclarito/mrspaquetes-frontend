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
  const totalOrden = totalPaquetes + costoAdicional;

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
            <strong>Total Paquetes:</strong> ${totalPaquetes.toFixed(2)}
          </ListGroupItem>
          <ListGroupItem>
            <strong>Costo Adicional:</strong> ${costoAdicional.toFixed(2)}
          </ListGroupItem>
          <ListGroupItem>
            <strong>Total a Pagar:</strong> ${totalOrden.toFixed(2)}
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
                <td>
                  {detalle.tipo_paquete ||
                    detalle.paquete?.tipo_paquete ||
                    "N/A"}
                </td>
                <td>{detalle.peso || detalle.paquete?.peso || "N/A"}</td>
                <td>
                  {detalle.estado_paquete ||
                    detalle.paquete?.estado_paquete ||
                    "N/A"}
                </td>
                <td>
                  {detalle.fecha_envio || detalle.paquete?.fecha_envio || "N/A"}
                </td>
                <td>
                  {detalle.fecha_entrega_estimada ||
                    detalle.paquete?.fecha_entrega_estimada ||
                    "N/A"}
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
