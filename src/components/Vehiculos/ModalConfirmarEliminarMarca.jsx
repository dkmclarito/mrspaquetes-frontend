import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

const ModalConfirmarEliminarMarca = ({ confirmarEliminar, confirmarEliminarMarca, setConfirmarEliminar }) => {
  const handleToggle = useCallback(() => {
    setConfirmarEliminar(false);
  }, [setConfirmarEliminar]);

  return (
    <Modal isOpen={confirmarEliminar} toggle={handleToggle}>
      <ModalHeader toggle={handleToggle}>Confirmar Eliminación</ModalHeader>
      <ModalBody>
        ¿Estás seguro de que deseas eliminar esta marca?
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={confirmarEliminarMarca} aria-label="Eliminar marca">Eliminar</Button>
        <Button color="secondary" onClick={handleToggle} aria-label="Cancelar">Cancelar</Button>
      </ModalFooter>
    </Modal>
  );
};

ModalConfirmarEliminarMarca.propTypes = {
  confirmarEliminar: PropTypes.bool.isRequired,
  confirmarEliminarMarca: PropTypes.func.isRequired,
  setConfirmarEliminar: PropTypes.func.isRequired,
};

export default ModalConfirmarEliminarMarca;
