import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input, Button } from "reactstrap";
import axios from "axios";
import AuthService from "../../services/authService";

const API_URL = import.meta.env.VITE_API_URL;

const ModalAgregarEmpleado = ({ isOpen, toggle, onEmpleadoAsignado, usuario }) => {
  const [empleadosDropdown, setEmpleadosDropdown] = useState([]);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState("");
  const [errorEmpleado, setErrorEmpleado] = useState(null);

  useEffect(() => {
    const fetchEmpleados = async () => {
      try {
        const token = AuthService.getCurrentUser();
        const response = await axios.get(`${API_URL}/empleados`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data) {
          setEmpleadosDropdown(response.data.empleados || []);
        }
      } catch (error) {
        console.error("Error al obtener empleados:", error);
      }
    };

    if (isOpen) {
      fetchEmpleados();
      setEmpleadoSeleccionado("");
      setErrorEmpleado(null);
    }
  }, [isOpen]);

  const handleAsignarEmpleado = async () => {
    if (!empleadoSeleccionado) {
      setErrorEmpleado("Debe seleccionar un empleado.");
      return;
    }

    // Verificar si el empleado ya está asociado a otro usuario en el frontend
    try {
      const token = AuthService.getCurrentUser();
      const usuarioResponse = await axios.get(`${API_URL}/auth/get_users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const empleadoYaAsignado = usuarioResponse.data.users.some(
        (user) => user.id_empleado === parseInt(empleadoSeleccionado, 10)
      );

      if (empleadoYaAsignado) {
        setErrorEmpleado("El empleado seleccionado ya tiene un usuario asociado. Seleccione un empleado diferente.");
        return;
      }

      // Si el empleado no está asignado, proceder con la asignación
      const response = await axios.put(
        `${API_URL}/auth/update/${usuario.id}`,
        {
          email: usuario.email,
          id_empleado: parseInt(empleadoSeleccionado, 10),
          role_id: usuario.role_id,
          status: usuario.status,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        const nuevoEmpleado = empleadosDropdown.find(e => e.id === parseInt(empleadoSeleccionado, 10));
        onEmpleadoAsignado(nuevoEmpleado);  // Notificar al componente padre
      } else {
        setErrorEmpleado("Error al asignar el empleado.");
      }
    } catch (error) {
      console.error("Error al asignar el empleado:", error);
      setErrorEmpleado("No se pudo asignar el empleado. Inténtelo de nuevo más tarde.");
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Asignar Empleado</ModalHeader>
      <ModalBody>
        <FormGroup>
          <Label for="empleado">Seleccione un Empleado</Label>
          <Input
            type="select"
            id="empleado"
            value={empleadoSeleccionado}
            onChange={(e) => setEmpleadoSeleccionado(e.target.value)}
            required
          >
            <option value="">Seleccione un empleado</option>
            {empleadosDropdown.map((empleado) => (
              <option key={empleado.id} value={empleado.id}>
                {empleado.nombres} {empleado.apellidos}
              </option>
            ))}
          </Input>
          {errorEmpleado && <p className="text-white">{errorEmpleado}</p>}
        </FormGroup>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleAsignarEmpleado}>
          Asignar Empleado
        </Button>
        <Button color="secondary" onClick={toggle}>
          Cancelar
        </Button>
      </ModalFooter>
    </Modal>
  );
};

ModalAgregarEmpleado.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  onEmpleadoAsignado: PropTypes.func.isRequired,
  usuario: PropTypes.object.isRequired,
};

export default ModalAgregarEmpleado;