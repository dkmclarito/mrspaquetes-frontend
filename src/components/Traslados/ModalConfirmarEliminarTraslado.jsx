import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import axios from 'axios';
import AuthService from "/src/services/authService";
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL;

const ModalConfirmarEliminarTraslado = ({ isOpen, toggle, trasladoId, onTrasladoEliminado }) => {
  const [isLoading, setIsLoading] = useState(false);

  const eliminarTraslado = async () => {
    setIsLoading(true);
    try {
      const token = AuthService.getCurrentUser();
      const response = await axios.delete(`${API_URL}/traslados/${trasladoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.message) {
        toast.success(response.data.message);
        onTrasladoEliminado();
        toggle();
      } else {
        throw new Error('Respuesta inesperada del servidor');
      }
    } catch (error) {
      console.error('Error al eliminar el traslado:', error);
      toast.error(error.response?.data?.message || 'Error al eliminar el traslado');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Confirmar Eliminación</ModalHeader>
      <ModalBody>
        ¿Está seguro que desea pasar a inactivo este traslado? Esta acción no se puede deshacer.
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>Cancelar</Button>
        <Button color="danger" onClick={eliminarTraslado} disabled={isLoading}>
          {isLoading ? 'Eliminando...' : 'Eliminar'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ModalConfirmarEliminarTraslado;