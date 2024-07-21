import React from "react";
import PropTypes from "prop-types";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

const ModalConfirmarEliminar = ({
  confirmarEliminar,
  confirmarEliminarCliente,
  setConfirmarEliminar
}) => (
  <Modal isOpen={confirmarEliminar} toggle={() => setConfirmarEliminar(false)}>
    <ModalHeader toggle={() => setConfirmarEliminar(false)}>Confirmar Eliminación</ModalHeader>
    <ModalBody>
      ¿Estás seguro de que deseas eliminar este cliente?
    </ModalBody>
    <ModalFooter>
      <Button color="danger" onClick={confirmarEliminarCliente}>Eliminar</Button>
      <Button color="secondary" onClick={() => setConfirmarEliminar(false)}>Cancelar</Button>
    </ModalFooter>
  </Modal>
);

ModalConfirmarEliminar.propTypes = {
  confirmarEliminar: PropTypes.bool.isRequired,
  confirmarEliminarCliente: PropTypes.func.isRequired,
  setConfirmarEliminar: PropTypes.func.isRequired,
};

export default ModalConfirmarEliminar;
