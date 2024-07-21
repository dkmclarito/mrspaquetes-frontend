import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import "/src/styles/Empleados.css";

const ModalConfirmarEliminar = ({
  confirmarEliminar,
  confirmarEliminarEmpleado,
  setConfirmarEliminar
}) => (
  <Modal show={confirmarEliminar} onHide={() => setConfirmarEliminar(false)} className="modal-confirmar-eliminar">
    <Modal.Header closeButton>
      <Modal.Title>Confirmar Eliminación</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      ¿Estás seguro de que deseas eliminar este empleado?
    </Modal.Body>
    <Modal.Footer>
      <Button variant="danger" onClick={confirmarEliminarEmpleado} className="btn-eliminar">Eliminar</Button>
      <Button variant="secondary" onClick={() => setConfirmarEliminar(false)} className="btn-cancelar">Cancelar</Button>
    </Modal.Footer>
  </Modal>
);

export default ModalConfirmarEliminar;
