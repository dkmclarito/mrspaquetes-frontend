import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

const ModalConfirmarEliminarBodega = ({ confirmarEliminar, confirmarEliminarBodega, setConfirmarEliminar }) => {
  const handleToggle = useCallback(() => {
    setConfirmarEliminar(false);
  }, [setConfirmarEliminar]);

  return (
    <Modal isOpen={confirmarEliminar} toggle={handleToggle}>
      <ModalHeader toggle={handleToggle}>Confirmar Eliminación</ModalHeader>
      <ModalBody>
        ¿Estás seguro de que deseas eliminar esta bodega?
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={confirmarEliminarBodega} aria-label="Eliminar bodega">Eliminar</Button>
        <Button color="secondary" onClick={handleToggle} aria-label="Cancelar">Cancelar</Button>
      </ModalFooter>
    </Modal>
  );
};

ModalConfirmarEliminarBodega.propTypes = {
  confirmarEliminar: PropTypes.bool.isRequired,
  confirmarEliminarBodega: PropTypes.func.isRequired,
  setConfirmarEliminar: PropTypes.func.isRequired,
};

export default ModalConfirmarEliminarBodega;
