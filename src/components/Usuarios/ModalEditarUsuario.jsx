import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input, Button } from "reactstrap";

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

  const handleGuardarCambios = () => {
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

    guardarCambiosUsuario(usuarioActualizado);
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
