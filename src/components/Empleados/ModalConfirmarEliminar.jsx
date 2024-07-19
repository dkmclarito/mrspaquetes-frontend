import React from "react";
import PropTypes from "prop-types";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

const ModalConfirmarEliminar = ({
  confirmarEliminar,
  confirmarEliminarEmpleado,
  setConfirmarEliminar
}) => (
  <Modal isOpen={confirmarEliminar} toggle={() => setConfirmarEliminar(false)}>
    <ModalHeader toggle={() => setConfirmarEliminar(false)}>Confirmar Eliminación</ModalHeader>
    <ModalBody>
      ¿Estás seguro de que deseas eliminar este empleado?
    </ModalBody>
    <ModalFooter>
      <Button color="danger" onClick={confirmarEliminarEmpleado}>Eliminar</Button>
      <Button color="secondary" onClick={() => setConfirmarEliminar(false)}>Cancelar</Button>
    </ModalFooter>
  </Modal>
);

ModalConfirmarEliminar.propTypes = {
  confirmarEliminar: PropTypes.bool.isRequired,
  confirmarEliminarEmpleado: PropTypes.func.isRequired,
  setConfirmarEliminar: PropTypes.func.isRequired,
};

export default ModalConfirmarEliminar;
