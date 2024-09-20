import React from "react";
import PropTypes from "prop-types";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

const ModalConfirmarEliminar = ({
  confirmarEliminar,
  confirmarEliminarUsuario,
  setConfirmarEliminar
}) => (
  <Modal isOpen={confirmarEliminar} toggle={() => setConfirmarEliminar(false)}>
    <ModalHeader toggle={() => setConfirmarEliminar(false)}>Confirmar Eliminación</ModalHeader>
    <ModalBody>
      ¿Estás seguro de que deseas eliminar este rol?
    </ModalBody>
    <ModalFooter>
      <Button color="danger" onClick={confirmarEliminarUsuario}>Eliminar</Button>
      <Button color="secondary" onClick={() => setConfirmarEliminar(false)}>Cancelar</Button>
    </ModalFooter>
  </Modal>
);

ModalConfirmarEliminar.propTypes = {
  confirmarEliminar: PropTypes.bool.isRequired,
  confirmarEliminarUsuario: PropTypes.func.isRequired,
  setConfirmarEliminar: PropTypes.func.isRequired,
};

export default ModalConfirmarEliminar;
