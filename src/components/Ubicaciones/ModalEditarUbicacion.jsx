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
  const [estado, setEstado] = useState(ubicacionEditada?.estado ?? 1); // Estado por defecto en 1

  useEffect(() => {
    if (ubicacionEditada) {
      setEstado(ubicacionEditada.estado ?? 1); // Asegurarse de que el estado esté actualizado
    }
  }, [ubicacionEditada]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUbicacionEditada({ ...ubicacionEditada, [name]: value });
  };

  const handleEstadoChange = (e) => {
    setEstado(e.target.checked ? 1 : 0); // Convertir checkbox a 1 o 0
    setUbicacionEditada({ ...ubicacionEditada, estado: e.target.checked ? 1 : 0 });
  };

  return (
    <Modal show={modalEditar} onHide={() => setModalEditar(false)} size="md">
      <Modal.Header closeButton>
        <Modal.Title>Editar Ubicación</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {ubicacionEditada ? (
          <Form>
            <Form.Group as={Row} controlId="nombre_ubicacion">
              <Form.Label column sm={12}>Paquete</Form.Label>
              <Col sm={12}>
                <Form.Control
                  type="text"
                  name="ubicacion"
                  value={ubicacionEditada.qr_paquete || ""}
                  onChange={handleChange}
                />
              </Col>
            </Form.Group>
            <Form.Group as={Row} controlId="nombre_ubicacion">
              <Form.Label column sm={12}>Nombre de Ubicación</Form.Label>
              <Col sm={12}>
                <Form.Control
                  type="text"
                  name="codigo_nomenclatura_ubicacion"
                  value={ubicacionEditada.codigo_nomenclatura_ubicacion || ""}
                  onChange={handleChange}
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
          disabled={!ubicacionEditada}
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
  ubicacionEditada: PropTypes.object,
  setUbicacionEditada: PropTypes.func.isRequired,
  guardarCambiosUbicacion: PropTypes.func.isRequired,
  setModalEditar: PropTypes.func.isRequired,
};

export default ModalEditarUbicacion;
