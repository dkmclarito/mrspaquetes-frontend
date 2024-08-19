import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input, Button } from "reactstrap";
import axios from "axios";
import AuthService from "../../services/authService";

const API_URL = import.meta.env.VITE_API_URL;

const ModalEditarUsuario = ({
  modalEditar,
  usuarioEditado,
  setUsuarioEditado,
  guardarCambiosUsuario,
  setModalEditar,
  empleados
}) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [mostrarCamposContrasena, setMostrarCamposContrasena] = useState(false);

  useEffect(() => {
    if (modalEditar && usuarioEditado) {
      setPassword("");
      setConfirmPassword("");
      setError(null);
      setMostrarCamposContrasena(false);
    }
  }, [modalEditar, usuarioEditado]);

  const handleGuardarCambios = async () => {
    setError(null);

    if (!usuarioEditado.email) {
      setError("El correo electrónico es obligatorio.");
      return;
    }

    if (mostrarCamposContrasena && (password !== confirmPassword)) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    const usuarioActualizado = {
      ...usuarioEditado,
      password: mostrarCamposContrasena ? password : undefined,
      password_confirmation: mostrarCamposContrasena ? confirmPassword : undefined
    };

    try {
      const token = AuthService.getCurrentUser();
      const data = {
        email: usuarioActualizado.email,
        role_id: parseInt(usuarioActualizado.role_id, 10),
        id_empleado: parseInt(usuarioActualizado.id_empleado, 10),
        status: usuarioActualizado.status // Asegúrate de incluir el estado en la actualización
      };

      if (usuarioActualizado.password) {
        data.password = usuarioActualizado.password;
      }

      const response = await axios.put(`${API_URL}/auth/update/${usuarioActualizado.id}`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        guardarCambiosUsuario(usuarioActualizado);
        setModalEditar(false);
        setUsuarioEditado(null);
        window.location.reload();  // Recarga la página para reflejar los cambios
      } else {
        setError("Error al actualizar usuario");
      }
    } catch (error) {
      if (error.response && error.response.status === 422) {
        const errors = error.response.data.errors || error.response.data;

        if (errors.email) {
          setError("El correo electrónico ya está registrado.");
        } else if (errors.role_id) {
          setError("El rol es obligatorio.");
        } else if (errors.id_empleado) {
          setError("El empleado es obligatorio.");
        } else {
          setError("Error al actualizar usuario.");
        }
      } else {
        console.error("Error al actualizar usuario:", error);
        setError("No se pudo actualizar el usuario. Inténtelo de nuevo más tarde.");
      }
    }
  };

  return (
    <Modal isOpen={modalEditar} toggle={() => setModalEditar(false)}>
      <ModalHeader toggle={() => setModalEditar(false)}>Editar Usuario</ModalHeader>
      <ModalBody>
        <FormGroup>
          <Label for="email">Correo Electrónico</Label>
          <Input
            type="email"
            id="email"
            value={usuarioEditado ? usuarioEditado.email : ""}
            onChange={(e) => setUsuarioEditado(prevState => ({ ...prevState, email: e.target.value }))}
            required
          />
        </FormGroup>
        <FormGroup>
          <Label for="empleadoId">Empleado</Label>
          <Input
            type="select"
            id="empleadoId"
            value={usuarioEditado ? usuarioEditado.id_empleado : ""}
            onChange={(e) => setUsuarioEditado(prevState => ({ ...prevState, id_empleado: e.target.value }))}
            required
          >
            <option value="">Seleccione un empleado</option>
            {empleados.map(empleado => (
              <option key={empleado.id} value={empleado.id}>
                {empleado.nombres} {empleado.apellidos}
              </option>
            ))}
          </Input>
        </FormGroup>
        <FormGroup>
          <Label for="rol">Rol</Label>
          <Input
            type="select"
            id="rol"
            value={usuarioEditado ? usuarioEditado.role_id : ""}
            onChange={(e) => setUsuarioEditado(prevState => ({ ...prevState, role_id: e.target.value }))}
            required
          >
            <option value="">Selecciona un rol</option>
            <option value="1">Administrador</option>
            <option value="3">Conductor</option>
            <option value="4">Básico</option>
          </Input>
        </FormGroup>
        <FormGroup>
          <Label for="status">Estado</Label>
          <Input
            type="select"
            id="status"
            value={usuarioEditado ? usuarioEditado.status : ""}
            onChange={(e) => setUsuarioEditado(prevState => ({ ...prevState, status: e.target.value }))}
            required
          >
            <option value="1">Activo</option>
            <option value="0">Inactivo</option>
          </Input>
        </FormGroup>
        {!mostrarCamposContrasena && (
          <Button color="secondary" onClick={() => setMostrarCamposContrasena(true)}>Modificar Contraseña</Button>
        )}
        {mostrarCamposContrasena && (
          <>
            <FormGroup>
              <Label for="password">Nueva Contraseña</Label>
              <Input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label for="confirmPassword">Confirmar Contraseña</Label>
              <Input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </FormGroup>
          </>
        )}
        {error && <p className="text-danger">{error}</p>}
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleGuardarCambios}>Guardar Cambios</Button>
        <Button color="secondary" onClick={() => setModalEditar(false)}>Cancelar</Button>
      </ModalFooter>
    </Modal>
  );
};

ModalEditarUsuario.propTypes = {
  modalEditar: PropTypes.bool.isRequired,
  usuarioEditado: PropTypes.object,
  setUsuarioEditado: PropTypes.func.isRequired,
  guardarCambiosUsuario: PropTypes.func.isRequired,
  setModalEditar: PropTypes.func.isRequired,
  empleados: PropTypes.array.isRequired
};

export default ModalEditarUsuario;
