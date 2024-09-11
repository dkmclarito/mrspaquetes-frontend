import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';

const ModalEditarUbicacion = ({
  modalEditar,
  ubicacionEditada,
  setUbicacionEditada,
  guardarCambiosUbicacion,
  setModalEditar,
}) => {
  const [estado, setEstado] = useState(ubicacionEditada.estado || false);

  useEffect(() => {
    if (ubicacionEditada) {
      setEstado(ubicacionEditada.estado || false);
    }
  }, [ubicacionEditada]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUbicacionEditada({ ...ubicacionEditada, [name]: value });
  };

  const handleEstadoChange = (e) => {
    setEstado(e.target.checked);
    setUbicacionEditada({ ...ubicacionEditada, estado: e.target.checked });
  };

  return (
    <Modal show={modalEditar} onHide={() => setModalEditar(false)} size="md">
      <Modal.Header closeButton>
        <Modal.Title>Editar Ubicación</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {ubicacionEditada ? (
          <Form>
            <Form.Group as={Row} controlId="id_ubicacion">
              <Form.Label column sm={12}>ID de Ubicación</Form.Label>
              <Col sm={12}>
                <Form.Control
                  type="text"
                  name="id_ubicacion"
                  value={ubicacionEditada.id || ""}
                  onChange={handleChange}
                  readOnly
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row} controlId="estado">
              <Form.Label column sm={12}>Estado</Form.Label>
              <Col sm={12}>
                <Form.Check
                  type="checkbox"
                  name="estado"
                  checked={estado}
                  onChange={handleEstadoChange}
                />
              </Col>
            </Form.Group>
          </Form>
        ) : (
          <p>Seleccione una ubicación para editar.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="primary"
          onClick={guardarCambiosUbicacion}
          disabled={ubicacionEditada.id === undefined}
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

ModalEditarUbicacion.propTypes = {
  modalEditar: PropTypes.bool.isRequired,
  UbicacionEditado: PropTypes.object,
  setUbicacionEditada: PropTypes.func.isRequired,
  guardarCambiosUbicacion: PropTypes.func.isRequired,
  setModalEditar: PropTypes.func.isRequired,
};


export default ModalEditarUbicacion;
