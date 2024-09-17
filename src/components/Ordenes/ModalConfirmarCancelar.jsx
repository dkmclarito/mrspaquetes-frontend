import React, { useCallback } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

const ModalConfirmarCancelar = ({
  isOpen,
  toggle,
  ordenId,
  confirmarCancelar,
}) => {
  // Use callback to avoid unnecessary re-renders
  const handleToggle = useCallback(() => {
    toggle();
  }, [toggle]);

  return (
    <Modal isOpen={isOpen} toggle={handleToggle}>
      <ModalHeader toggle={handleToggle}>Confirmar Cancelación</ModalHeader>
      <ModalBody>
        <p>¿Está seguro de que desea cancelar esta orden?</p>
        <p>Esta acción no se puede deshacer.</p>
      </ModalBody>
      <ModalFooter>
        <Button
          color="danger"
          onClick={() => confirmarCancelar(ordenId)}
          aria-label="Cancelar orden"
        >
          Eliminar
        </Button>
        <Button
          color="secondary"
          onClick={handleToggle}
          aria-label="Cerrar modal"
        >
          Cancelar
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ModalConfirmarCancelar;
