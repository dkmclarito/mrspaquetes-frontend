import React, { useCallback } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

const ModalConfirmarEliminar = ({
  confirmarEliminar,
  confirmarEliminarCliente,
  setConfirmarEliminar
}) => {
  // Use callback to avoid unnecessary re-renders
  const handleToggle = useCallback(() => {
    setConfirmarEliminar(false);
  }, [setConfirmarEliminar]);

  return (
    <Modal isOpen={confirmarEliminar} toggle={handleToggle}>
      <ModalHeader toggle={handleToggle}>Confirmar Eliminación</ModalHeader>
      <ModalBody>
        ¿Estás seguro de que deseas eliminar este cliente?
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={confirmarEliminarCliente} aria-label="Eliminar cliente">Eliminar</Button>
        <Button color="secondary" onClick={handleToggle} aria-label="Cancelar">Cancelar</Button>
      </ModalFooter>
    </Modal>
  );
};

export default ModalConfirmarEliminar;
