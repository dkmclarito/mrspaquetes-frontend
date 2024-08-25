import React from 'react';
import { Container, Row, Col, Alert } from 'reactstrap';

const GestionRutas = () => {
  return (
    <Container className="text-center mt-5">
      <Row>
        <Col>
          <Alert color="success" className='alert'>
            <h4 className="alert-heading">Rutas en Desarrollo</h4>
            <p className='alert-heading'>
              Esta sección está actualmente en desarrollo. Por favor, vuelve más tarde para más actualizaciones.
            </p>
          </Alert>
        </Col>
      </Row>
    </Container>
  );
};

export default GestionRutas;
