import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

const ModalConfirmarEliminarModelo = ({ confirmarEliminar, confirmarEliminarModelo, setConfirmarEliminar }) => {
  const handleToggle = useCallback(() => {
    setConfirmarEliminar(false);
  }, [setConfirmarEliminar]);

  return (
    <Modal isOpen={confirmarEliminar} toggle={handleToggle}>
      <ModalHeader toggle={handleToggle}>Confirmar Eliminación</ModalHeader>
      <ModalBody>
        ¿Estás seguro de que deseas eliminar este modelo?
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={confirmarEliminarModelo} aria-label="Eliminar modelo">Eliminar</Button>
        <Button color="secondary" onClick={handleToggle} aria-label="Cancelar">Cancelar</Button>
      </ModalFooter>
    </Modal>
  );
};

ModalConfirmarEliminarModelo.propTypes = {
  confirmarEliminar: PropTypes.bool.isRequired,
  confirmarEliminarModelo: PropTypes.func.isRequired,
  setConfirmarEliminar: PropTypes.func.isRequired,
};

export default ModalConfirmarEliminarModelo;
