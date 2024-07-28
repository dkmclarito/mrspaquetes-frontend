import React from "react";
import PropTypes from "prop-types";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

const ModalConfirmarEliminarVehiculo = ({
  isOpen,
  toggle,
  onConfirm,
  entityType = "vehículo",  // Default to "vehículo"
  entityName,
  customMessage
}) => (
  <Modal isOpen={isOpen} toggle={toggle}>
    <ModalHeader toggle={toggle}>Confirmar Eliminación</ModalHeader>
    <ModalBody>
      {customMessage || `¿Estás seguro de que deseas eliminar ${entityType ? `este ${entityType.toLowerCase()}` : "este elemento"}${entityName ? `: ${entityName}` : ""}?`}
    </ModalBody>
    <ModalFooter>
      <Button color="danger" onClick={onConfirm}>Eliminar</Button>
      <Button color="secondary" onClick={toggle}>Cancelar</Button>
    </ModalFooter>
  </Modal>
);

ModalConfirmarEliminarVehiculo.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  entityType: PropTypes.string, // Tipo de entidad (por ejemplo, "Modelo", "Marca", "Vehículo")
  entityName: PropTypes.string, // Nombre específico del elemento a eliminar
  customMessage: PropTypes.string, // Mensaje personalizado para la confirmación
};

export default ModalConfirmarEliminarVehiculo;
