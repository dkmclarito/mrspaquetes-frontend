import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input, FormGroup, Label } from 'reactstrap';

const ModalEditarRol = ({ mostrar, toggle, role, onConfirm }) => {
  const [roleName, setRoleName] = useState('');

  useEffect(() => {
    if (mostrar && role) {
      setRoleName(role.name); // Inicializa el roleName cuando el modal se abre y role está disponible
    }
  }, [mostrar, role]);

  const handleSave = () => {
    onConfirm(roleName);
    toggle(); // Cierra el modal después de guardar
  };

  const handleCancel = (e) => {
    e.preventDefault(); // Previene cualquier comportamiento predeterminado del botón
    setRoleName(role ? role.name : ''); // Restaura el nombre original al cancelar
    toggle(); // Cierra el modal
  };

  return (
    <Modal isOpen={mostrar} toggle={toggle}>
      <ModalHeader toggle={toggle}>Editar Rol</ModalHeader>
      <ModalBody>
        <FormGroup>
          <Label for="roleName">Nombre del Rol</Label>
          <Input
            type="text"
            id="roleName"
            value={roleName}
            onChange={e => setRoleName(e.target.value)}
          />
        </FormGroup>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleSave}>Guardar</Button>{' '}
        <Button color="secondary" onClick={handleCancel}>Cancelar</Button>
      </ModalFooter>
    </Modal>
  );
};

export default ModalEditarRol;

