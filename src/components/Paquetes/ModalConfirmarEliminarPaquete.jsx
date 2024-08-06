import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import "/src/styles/Paquetes.css";

const ModalConfirmarEliminarPaquete = ({
  isOpen,
  toggle,
  onConfirm,
  paquete
}) => (
  <Modal show={isOpen} onHide={toggle} className="modal-confirmar-eliminar-paquete">
    <Modal.Header closeButton>
      <Modal.Title>Confirmar Eliminación</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      ¿Estás seguro de que deseas eliminar el registro del paquete?
    </Modal.Body>
    <Modal.Footer>
      <Button variant="danger" onClick={onConfirm} className="btn-eliminar-paquete">Eliminar</Button>
      <Button variant="secondary" onClick={toggle} className="btn-cancelar-paquete">Cancelar</Button>
    </Modal.Footer>
  </Modal>
);

export default ModalConfirmarEliminarPaquete;
