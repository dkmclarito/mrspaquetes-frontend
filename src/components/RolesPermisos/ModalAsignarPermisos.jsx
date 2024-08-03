import React, { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, FormGroup, Label, Input, Form } from "reactstrap";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const ModalAsignarPermisos = ({ isOpen, toggle, rol }) => {
  const [permisos, setPermisos] = useState([]);
  const [permisosSeleccionados, setPermisosSeleccionados] = useState([]);

  useEffect(() => {
    const fetchPermisos = async () => {
      const response = await axios.get(`${API_URL}/permissions`); // Asegúrate de tener una ruta para obtener permisos
      setPermisos(response.data);
      const permisosDelRol = rol.permissions.map(p => p.id); // Asumiendo que `rol.permissions` contiene los permisos actuales
      setPermisosSeleccionados(permisosDelRol);
    };

    if (rol) {
      fetchPermisos();
    }
  }, [rol]);

  const handleCheckboxChange = (permisoId) => {
    const newSelection = permisosSeleccionados.includes(permisoId)
      ? permisosSeleccionados.filter(id => id !== permisoId)
      : [...permisosSeleccionados, permisoId];
    setPermisosSeleccionados(newSelection);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/roles/assign_permissions_role/${rol.id}`, {
        permissions: permisosSeleccionados
      });
      toggle(); // Cierra el modal
    } catch (error) {
      console.error('Error al asignar permisos:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Asignar Permisos a Rol: {rol.name}</ModalHeader>
      <Form onSubmit={handleSubmit}>
        <ModalBody>
          {permisos.map(permiso => (
            <FormGroup check key={permiso.id}>
              <Label check>
                <Input
                  type="checkbox"
                  checked={permisosSeleccionados.includes(permiso.id)}
                  onChange={() => handleCheckboxChange(permiso.id)}
                />{' '}
                {permiso.name}
              </Label>
            </FormGroup>
          ))}
        </ModalBody>
        <ModalFooter>
          <Button type="submit" color="primary">Guardar Cambios</Button>
          <Button color="secondary" onClick={toggle}>Cancelar</Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default ModalAsignarPermisos;
