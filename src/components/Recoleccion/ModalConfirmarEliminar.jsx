import React from "react";
import PropTypes from "prop-types";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

const ModalConfirmarEliminar = ({ isOpen, toggle, confirmarEliminar }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Confirmar Eliminación</ModalHeader>
      <ModalBody>
        ¿Estás seguro de que deseas eliminar esta ruta de recolección?
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={confirmarEliminar}>
          Eliminar
        </Button>
        <Button color="secondary" onClick={toggle}>
          Cancelar
        </Button>
      </ModalFooter>
    </Modal>
  );
};

ModalConfirmarEliminar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  confirmarEliminar: PropTypes.func.isRequired,
};

export default ModalConfirmarEliminar;
