import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

const FinalizarOrdenModal = ({ isOpen, toggle, onConfirm }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Confirmar Finalización de Orden</ModalHeader>
      <ModalBody>
        ¿Está seguro de que desea finalizar esta orden de recolección? Esta
        acción no se puede deshacer.
      </ModalBody>
      <ModalFooter>
        <Button color="success" onClick={onConfirm}>
          Finalizar
        </Button>{" "}
        <Button color="secondary" onClick={toggle}>
          Cancelar
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default FinalizarOrdenModal;
