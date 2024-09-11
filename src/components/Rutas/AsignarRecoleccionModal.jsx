import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

const AsignarRecoleccionModal = ({ isOpen, toggle, onConfirm }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>
        Confirmar Asignación de Recolección
      </ModalHeader>
      <ModalBody>
        ¿Está seguro de que desea asignar esta orden para recolección? Esto
        cambiará el estado de la orden y no se podrá modificar después.
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={onConfirm}>
          Asignar
        </Button>{" "}
        <Button color="secondary" onClick={toggle}>
          Cancelar
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AsignarRecoleccionModal;
