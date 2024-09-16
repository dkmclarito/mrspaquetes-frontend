import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { toast } from 'react-toastify';

const ModalConfirmarEliminar = ({ isOpen, toggle, confirmarEliminar }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmarEliminar = async () => {
    setIsDeleting(true);
    try {
      await confirmarEliminar();
      toast.success('Elemento eliminado con éxito.');
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error('Error al eliminar el elemento. Por favor, inténtelo de nuevo.');
    } finally {
      setIsDeleting(false);
      toggle(); // Cierra el modal después de la eliminación
    }
  };

  return (
    <Modal show={isOpen} onHide={toggle} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirmar Eliminación</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        ¿Estás seguro de que deseas desactivar esta asignación de ruta?
      </Modal.Body>
      <Modal.Footer>
        <Button 
          variant="danger" 
          onClick={handleConfirmarEliminar} 
          disabled={isDeleting}
        >
          {isDeleting ? 'Desactivando...' : 'Desactivar'}
        </Button>
        <Button 
          variant="secondary" 
          onClick={toggle}
        >
          Cancelar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// Definir prop types para asegurarse de que las props sean correctas
ModalConfirmarEliminar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  confirmarEliminar: PropTypes.func.isRequired
};

export default ModalConfirmarEliminar;
