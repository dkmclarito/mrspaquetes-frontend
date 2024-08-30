import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';

const ModalEditarRuta = ({
  modalEditar,
  rutaEditada,
  setRutaEditada,
  guardarCambiosRuta,
  setModalEditar,
  destinos,
  bodegas,
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setRutaEditada({ ...rutaEditada, [name]: value });
  };

  return (
    <Modal show={modalEditar} onHide={() => setModalEditar(false)} size="md">
      <Modal.Header closeButton>
        <Modal.Title>Editar Ruta</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {rutaEditada ? (
          <Form>
            <Form.Group as={Row} controlId="nombre">
              <Form.Label column sm={12}>Nombre</Form.Label>
              <Col sm={12}>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={rutaEditada.nombre || ""}
                  onChange={handleChange}
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row} controlId="id_destino">
              <Form.Label column sm={12}>Destino</Form.Label>
              <Col sm={12}>
                <Form.Control
                  as="select"
                  name="id_destino"
                  value={rutaEditada.id_destino || ""}
                  onChange={handleChange}
                >
                  <option value="">Seleccione un destino</option>
                  {destinos.map((dest) => (
                    <option key={dest.id} value={dest.id}>
                      {dest.nombre}
                    </option>
                  ))}
                </Form.Control>
              </Col>
            </Form.Group>

            <Form.Group as={Row} controlId="id_bodega">
              <Form.Label column sm={12}>Bodega</Form.Label>
              <Col sm={12}>
                <Form.Control
                  as="select"
                  name="id_bodega"
                  value={rutaEditada.id_bodega || ""}
                  onChange={handleChange}
                >
                  <option value="">Seleccione una bodega</option>
                  {bodegas.map((bod) => (
                    <option key={bod.id} value={bod.id}>
                      {bod.nombre}
                    </option>
                  ))}
                </Form.Control>
              </Col>
            </Form.Group>

            <Form.Group as={Row} controlId="estado">
              <Form.Label column sm={12}>Estado</Form.Label>
              <Col sm={12}>
                <Form.Control
                  type="text"
                  name="estado"
                  value={rutaEditada.estado || ""}
                  onChange={handleChange}
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row} controlId="distancia_km">
              <Form.Label column sm={12}>Distancia (Km)</Form.Label>
              <Col sm={12}>
                <Form.Control
                  type="number"
                  name="distancia_km"
                  value={rutaEditada.distancia_km || ""}
                  onChange={handleChange}
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row} controlId="duracion_aproximada">
              <Form.Label column sm={12}>Duración Aproximada</Form.Label>
              <Col sm={12}>
                <Form.Control
                  type="text"
                  name="duracion_aproximada"
                  value={rutaEditada.duracion_aproximada || ""}
                  onChange={handleChange}
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row} controlId="fecha_programada">
              <Form.Label column sm={12}>Fecha Programada</Form.Label>
              <Col sm={12}>
                <Form.Control
                  type="date"
                  name="fecha_programada"
                  value={rutaEditada.fecha_programada || ""}
                  onChange={handleChange}
                />
              </Col>
            </Form.Group>
          </Form>
        ) : (
          <p>Seleccione una ruta para editar.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="primary"
          onClick={guardarCambiosRuta}
          disabled={!rutaEditada.nombre}
        >
          Guardar
        </Button>
        <Button variant="secondary" onClick={() => setModalEditar(false)}>
          Cancelar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

ModalEditarRuta.propTypes = {
  modalEditar: PropTypes.bool.isRequired,
  rutaEditada: PropTypes.object,
  setRutaEditada: PropTypes.func.isRequired,
  guardarCambiosRuta: PropTypes.func.isRequired,
  setModalEditar: PropTypes.func.isRequired,
  destinos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      nombre: PropTypes.string.isRequired,
    })
  ).isRequired,
  bodegas: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      nombre: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default ModalEditarRuta;
