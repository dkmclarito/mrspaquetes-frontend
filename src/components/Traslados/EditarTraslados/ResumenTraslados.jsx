import React from 'react';
import { Card, CardBody, ListGroup, ListGroupItem } from 'reactstrap';

const ResumenTraslado = ({ traslado }) => {
  console.log("Traslado data in ResumenTraslado:", traslado);  // Debug log

  if (!traslado) {
    return <div>No hay datos disponibles para el traslado</div>;
  }

  return (
    <Card>
      <CardBody>
        <h2>Resumen del Traslado</h2>
        <ListGroup>
          <ListGroupItem>
            <strong>Número de Traslado:</strong> {traslado.numero_traslado || 'N/A'}
          </ListGroupItem>
          <ListGroupItem>
            <strong>Bodega de Origen:</strong> {traslado.bodega_origen || 'N/A'}
          </ListGroupItem>
          <ListGroupItem>
            <strong>Bodega de Destino:</strong> {traslado.bodega_destino || 'N/A'}
          </ListGroupItem>
          <ListGroupItem>
            <strong>Fecha de Traslado:</strong> {traslado.fecha_traslado || 'N/A'}
          </ListGroupItem>
          <ListGroupItem>
            <strong>Estado:</strong> {traslado.estado || 'N/A'}
          </ListGroupItem>
          <ListGroupItem>
            <strong>Total de Paquetes:</strong> {traslado.paquetes ? traslado.paquetes.length : 'N/A'}
          </ListGroupItem>
        </ListGroup>
      </CardBody>
    </Card>
  );
};

export default ResumenTraslado;