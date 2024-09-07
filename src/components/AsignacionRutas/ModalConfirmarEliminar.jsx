import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import "/src/styles/Empleados.css";

const ModalConfirmarEliminar = ({
  isOpen,
  toggle,
  confirmarEliminar
}) => (
  <Modal show={isOpen} onHide={toggle} className="modal-confirmar-eliminar">
    <Modal.Header closeButton>
      <Modal.Title>Confirmar Eliminación</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      ¿Estás seguro de que deseas eliminar esta asignación de ruta?
    </Modal.Body>
    <Modal.Footer>
      <Button variant="danger" onClick={confirmarEliminar} className="btn-eliminar">Eliminar</Button>
      <Button variant="secondary" onClick={toggle} className="btn-cancelar">Cancelar</Button>
    </Modal.Footer>
  </Modal>
);

export default ModalConfirmarEliminar;