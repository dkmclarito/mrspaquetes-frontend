import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

const ModalConfirmarEliminarRuta = ({ confirmarEliminar, confirmarEliminarRuta, setConfirmarEliminar }) => {
  const handleToggle = useCallback(() => {
    setConfirmarEliminar(false);
  }, [setConfirmarEliminar]);

  return (
    <Modal isOpen={confirmarEliminar} toggle={handleToggle}>
      <ModalHeader toggle={handleToggle}>Confirmar Eliminación</ModalHeader>
      <ModalBody>
        ¿Estás seguro de que deseas eliminar esta ruta?
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={confirmarEliminarRuta} aria-label="Eliminar ruta">Eliminar</Button>
        <Button color="secondary" onClick={handleToggle} aria-label="Cancelar">Cancelar</Button>
      </ModalFooter>
    </Modal>
  );
};

ModalConfirmarEliminarRuta.propTypes = {
  confirmarEliminar: PropTypes.bool.isRequired,
  confirmarEliminarRuta: PropTypes.func.isRequired,
  setConfirmarEliminar: PropTypes.func.isRequired,
};

export default ModalConfirmarEliminarRuta;
