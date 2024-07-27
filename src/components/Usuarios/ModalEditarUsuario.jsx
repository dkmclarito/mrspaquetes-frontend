import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input, Button } from "reactstrap";

const ModalEditarUsuario = ({
  modalEditar,
  usuarioEditado,
  setUsuarioEditado,
  guardarCambiosUsuario,
  setModalEditar,
  clientes,
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

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net|edu|gov|mil|info|biz|co|us|ca)$/;
    return re.test(email);
  };

  const handleGuardarCambios = () => {
    // Restablecer el mensaje de error en cada intento de guardado
    setError(null);
  
    if (!usuarioEditado.name) {
      setError(<span><br />El nombre no puede estar vacío</span>);
      return;
    }
  
    if (!validateEmail(usuarioEditado.email)) {
      setError(<span><br />El correo electrónico es inválido</span>);
      return;
    }
  
    if (usuarioEditado.type === "") {
      setError(<span><br />Debe seleccionar un tipo de usuario</span>);
      return;
    }
  
    if (usuarioEditado.type === "1" && !usuarioEditado.id_cliente) {
      setError(<span><br />Debe seleccionar un cliente</span>);
      return;
    }
  
    if (usuarioEditado.type === "0" && !usuarioEditado.id_empleado) {
      setError(<span><br />Debe seleccionar un empleado</span>);
      return;
    }
  
    // Verifica si los campos de contraseña deben evaluarse
    if (mostrarCamposContrasena) {
      // Si los campos de contraseña están vacíos
      if (!password || !confirmPassword) {
        setError(<span><br />Ambos campos de contraseña son requeridos</span>);
        return;
      }
  
      // Verificar si las contraseñas coinciden
      if (password !== confirmPassword) {
        setError(<span><br />Las contraseñas no coinciden</span>);
        return;
      }
  
      // Verifica la fuerza de la contraseña
      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{5,}$/.test(password)) {
        setError(<span><br />La contraseña debe contener al menos una letra minúscula, una letra mayúscula, un número y tener al menos 5 caracteres.</span>);
        return;
      }
    }
  
    // Preparar datos del usuario para guardarlos
    const usuarioActualizado = {
      ...usuarioEditado,
      password: mostrarCamposContrasena ? password : undefined,
      password_confirmation: mostrarCamposContrasena ? confirmPassword : undefined,
      id_empleado: usuarioEditado.type === "0" ? usuarioEditado.id_empleado : null,
      id_cliente: usuarioEditado.type === "1" ? usuarioEditado.id_cliente : null
    };
  
    guardarCambiosUsuario(usuarioActualizado);
  };
  
  

  const handleTipoUsuarioChange = (e) => {
    const nuevoTipo = e.target.value;
    setUsuarioEditado(prevState => ({
      ...prevState,
      type: nuevoTipo,
      id_cliente: nuevoTipo === "1" ? prevState.id_cliente : null,
      id_empleado: nuevoTipo === "0" ? prevState.id_empleado : null,
      role_id: nuevoTipo === "1" ? "2" : nuevoTipo === "0" ? "1" : prevState.role_id
    }));
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
            onChange={(e) => setUsuarioEditado(prevState => ({ ...prevState, name: e.target.value }))}
            required
          />
        </FormGroup>
        <FormGroup>
          <Label for="email">Email</Label>
          <Input
            type="email"
            id="email"
            value={usuarioEditado ? usuarioEditado.email : ""}
            onChange={(e) => setUsuarioEditado(prevState => ({ ...prevState, email: e.target.value }))}
            required
          />
        </FormGroup>
        <FormGroup>
          <Label for="tipoUsuario">Tipo de Usuario</Label>
          <Input
            type="select"
            id="tipoUsuario"
            value={usuarioEditado ? usuarioEditado.type : ""}
            onChange={handleTipoUsuarioChange}
            required
          >
            <option value="">Seleccione un tipo</option>
            <option value="0">Empleado</option>
            <option value="1">Cliente</option>
          </Input>
        </FormGroup>
        {usuarioEditado && usuarioEditado.type === "1" && (
          <>
            <FormGroup>
              <Label for="cliente">Cliente</Label>
              <Input
                type="select"
                id="cliente"
                value={usuarioEditado.id_cliente || ""}
                onChange={(e) => setUsuarioEditado(prevState => ({ ...prevState, id_cliente: e.target.value }))}
              >
                <option value="">Seleccione un cliente</option>
                {clientes.map(cliente => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre} {cliente.apellido}
                  </option>
                ))}
              </Input>
            </FormGroup>
            <FormGroup>
              <Label for="role">Rol</Label>
              <Input
                type="select"
                id="role"
                value={usuarioEditado.role_id || ""}
                onChange={(e) => setUsuarioEditado(prevState => ({ ...prevState, role_id: e.target.value }))}
              >
                <option value="2">Cliente</option>
              </Input>
            </FormGroup>
          </>
        )}
        {usuarioEditado && usuarioEditado.type === "0" && (
          <>
            <FormGroup>
              <Label for="empleado">Empleado</Label>
              <Input
                type="select"
                id="empleado"
                value={usuarioEditado.id_empleado || ""}
                onChange={(e) => setUsuarioEditado(prevState => ({ ...prevState, id_empleado: e.target.value }))}
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
              <Label for="role">Rol</Label>
              <Input
                type="select"
                id="role"
                value={usuarioEditado.role_id || ""}
                onChange={(e) => setUsuarioEditado(prevState => ({ ...prevState, role_id: e.target.value }))}
              >
                <option value="1">Administrador</option>
                <option value="3">Conductor</option>
                <option value="4">Básico</option>
              </Input>
            </FormGroup>
          </>
        )}
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
        {error && <p className="text-danger" style={{ color: "white" }}>{error}</p>}
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
  clientes: PropTypes.array.isRequired,
  empleados: PropTypes.array.isRequired
};

export default ModalEditarUsuario;
