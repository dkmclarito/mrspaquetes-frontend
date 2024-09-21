import React from "react";
import { Modal, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";

const ModalConfirmarCancelar = ({
  isOpen,
  toggle,
  ordenId,
  confirmarCancelar,
}) => {
  return (
    <Modal show={isOpen} onHide={toggle} className="modal-confirmar-cancelar">
      <Modal.Header closeButton>
        <Modal.Title>Confirmar Cancelación</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>¿Está seguro de que desea cancelar esta orden?</p>
        <p>Esta acción no se puede deshacer.</p>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="danger"
          onClick={() => confirmarCancelar(ordenId)}
          className="btn-eliminar"
        >
          <FontAwesomeIcon icon={faTimes} className="me-2" />
          Eliminar
        </Button>
        <Button variant="secondary" onClick={toggle} className="btn-cancelar">
          Cancelar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalConfirmarCancelar;
