import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

const ModalConfirmarEliminarUbicacion = ({ confirmarEliminar, confirmarEliminarUbicacion, setConfirmarEliminar }) => {
  const handleToggle = useCallback(() => {
    setConfirmarEliminar(false);
  }, [setConfirmarEliminar]);

  return (
    <Modal isOpen={confirmarEliminar} toggle={handleToggle}>
      <ModalHeader toggle={handleToggle}>Confirmar Eliminación</ModalHeader>
      <ModalBody>
        ¿Estás seguro de que deseas remover el paquete de su ubicacion?
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={confirmarEliminarUbicacion} aria-label="Eliminar ubicacion">Eliminar</Button>
        <Button color="secondary" onClick={handleToggle} aria-label="Cancelar">Cancelar</Button>
      </ModalFooter>
    </Modal>
  );
};

ModalConfirmarEliminarUbicacion.propTypes = {
  confirmarEliminar: PropTypes.bool.isRequired,
  confirmarEliminarUbicacion: PropTypes.func.isRequired,
  setConfirmarEliminar: PropTypes.func.isRequired,
};

export default ModalConfirmarEliminarUbicacion;
