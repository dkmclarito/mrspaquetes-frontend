import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

const AsignarRecoleccionModal = ({ isOpen, toggle, onConfirm }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Confirmar Asignación</ModalHeader>
      <ModalBody>
        ¿Está seguro de que desea asignar las órdenes seleccionadas a la ruta de
        recolección?
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

export default AsignarRecoleccionModal;
