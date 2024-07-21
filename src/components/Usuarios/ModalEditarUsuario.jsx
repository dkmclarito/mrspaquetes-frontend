import React, { useState } from "react";
import PropTypes from "prop-types";
import { Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input, Button } from "reactstrap";

const ModalEditarUsuario = ({
  modalEditar,
  usuarioEditado,
  setUsuarioEditado,
  guardarCambiosUsuario,
  setModalEditar
}) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleGuardarCambios = () => {
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    const usuarioActualizado = {
      ...usuarioEditado,
      password: password || undefined, // Solo incluir la contraseña si no está vacía
      password_confirmation: confirmPassword || undefined // Solo incluir la confirmación si no está vacía
    };

    guardarCambiosUsuario(usuarioActualizado);
    setError("");
  };

  return (
    <Modal isOpen={modalEditar} toggle={() => setModalEditar(false)}>
      <ModalHeader toggle={() => setModalEditar(false)}>Editar Usuario</ModalHeader>
      <ModalBody>
        <FormGroup>
          <Label for="nombre">Nombre</Label>
          <Input
            type="text"
            id="nombre"
            value={usuarioEditado ? usuarioEditado.name : ""}
            onChange={(e) => setUsuarioEditado({ ...usuarioEditado, name: e.target.value })}
          />
        </FormGroup>
        <FormGroup>
          <Label for="email">Email</Label>
          <Input
            type="email"
            id="email"
            value={usuarioEditado ? usuarioEditado.email : ""}
            onChange={(e) => setUsuarioEditado({ ...usuarioEditado, email: e.target.value })}
          />
        </FormGroup>
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
};

export default ModalEditarUsuario;
