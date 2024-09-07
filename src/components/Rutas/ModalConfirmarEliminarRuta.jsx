import React from "react";
import PropTypes from "prop-types";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

const ModalConfirmarEliminarRuta = ({ confirmarEliminar, confirmarEliminarRuta, setConfirmarEliminar }) => {
  return (
    <Modal isOpen={confirmarEliminar} toggle={() => setConfirmarEliminar(false)}>
      <ModalHeader toggle={() => setConfirmarEliminar(false)}>Confirmar Eliminación</ModalHeader>
      <ModalBody>
        ¿Estás seguro de que deseas eliminar esta ruta?
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={confirmarEliminarRuta}>Eliminar</Button>
        <Button color="secondary" onClick={() => setConfirmarEliminar(false)}>Cancelar</Button>
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