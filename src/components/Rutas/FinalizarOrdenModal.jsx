import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

const FinalizarOrdenModal = ({ isOpen, toggle, onConfirm }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Confirmar Finalización</ModalHeader>
      <ModalBody>
        ¿Está seguro de que desea finalizar esta orden de recolección? Esta
        acción no se puede deshacer.
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={onConfirm}>
          Confirmar
        </Button>{" "}
        <Button color="secondary" onClick={toggle}>
          Cancelar
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default FinalizarOrdenModal;
