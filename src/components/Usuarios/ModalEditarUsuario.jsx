import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input, Button, InputGroup, InputGroupText } from "reactstrap";
import axios from "axios";
import { BiShow, BiHide } from "react-icons/bi"; // Importamos los íconos de ojo
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
  const [errorEmail, setErrorEmail] = useState(null);
  const [errorPassword, setErrorPassword] = useState(null);
  const [errorEmpleado, setErrorEmpleado] = useState(null);
  const [errorRol, setErrorRol] = useState(null);
  const [errorStatus, setErrorStatus] = useState(null);
  const [errorGeneral, setErrorGeneral] = useState(null);
  const [mostrarCamposContrasena, setMostrarCamposContrasena] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const token = AuthService.getCurrentUser();
        const response = await axios.get(`${API_URL}/auth/get_users`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.data && Array.isArray(response.data.users)) {
          setUsuarios(response.data.users);
        }
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
      }
    };

    if (modalEditar) {
      fetchUsuarios();
      setPassword("");
      setConfirmPassword("");
      setErrorEmail(null);
      setErrorPassword(null);
      setErrorEmpleado(null);
      setErrorRol(null);
      setErrorStatus(null);
      setErrorGeneral(null);
      setMostrarCamposContrasena(false);
    }
  }, [modalEditar]);

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net|edu|gov|mil|info|biz|co|us|ca)$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    const re = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[A-Z]).{5,}$/;
    return re.test(password);
  };

  const handleGuardarCambios = async () => {
    // Limpiar errores previos
    setErrorEmail(null);
    setErrorPassword(null);
    setErrorEmpleado(null);
    setErrorRol(null);
    setErrorStatus(null);
    setErrorGeneral(null);

    if (!usuarioEditado.email || !validateEmail(usuarioEditado.email)) {
      setErrorEmail("El correo electrónico debe ser válido y contener un dominio conocido.");
      return;
    }

    if (mostrarCamposContrasena && !validatePassword(password)) {
      setErrorPassword("La contraseña debe tener al menos 5 caracteres, incluyendo una mayúscula, una minúscula y un número.");
      return;
    }

    if (mostrarCamposContrasena && (password !== confirmPassword)) {
      setErrorPassword("Las contraseñas no coinciden.");
      return;
    }

    if (!usuarioEditado.id_empleado) {
      setErrorEmpleado("El empleado es obligatorio.");
      return;
    }

    if (!usuarioEditado.role_id) {
      setErrorRol("El rol es obligatorio.");
      return;
    }

    if (usuarioEditado.status === null || usuarioEditado.status === undefined) {
      setErrorStatus("El estado es obligatorio.");
      return;
    }

    const emailExistente = usuarios.find(user => user.email === usuarioEditado.email && user.id !== usuarioEditado.id);
    if (emailExistente) {
      setErrorEmail("El correo electrónico ya está registrado por otro usuario.");
      return;
    }

    const empleadoExistente = usuarios.find(user => user.id_empleado === parseInt(usuarioEditado.id_empleado, 10) && user.id !== usuarioEditado.id);
    if (empleadoExistente) {
      setErrorEmpleado("El empleado seleccionado ya tiene un usuario asociado. Seleccione un empleado diferente.");
      return;
    }

    const usuarioActualizado = {
      ...usuarioEditado,
      password: mostrarCamposContrasena ? password : usuarioEditado.password,
      password_confirmation: mostrarCamposContrasena ? confirmPassword : usuarioEditado.password
    };

    try {
      const token = AuthService.getCurrentUser();
      const data = {
        email: usuarioActualizado.email,
        password: usuarioActualizado.password,
        role_id: parseInt(usuarioActualizado.role_id, 10),
        id_empleado: parseInt(usuarioActualizado.id_empleado, 10),
        status: usuarioActualizado.status
      };

      console.log("Datos enviados:", data);

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
        setErrorGeneral("Error al actualizar usuario");
      }
    } catch (error) {
      if (error.response && error.response.status === 422) {
        const errors = error.response.data.errors || error.response.data;
        console.log("Detalles del error:", errors);

        if (errors.email) {
          setErrorEmail("El correo electrónico ya está registrado.");
        } else if (errors.role_id) {
          setErrorRol("El rol es obligatorio.");
        } else if (errors.id_empleado && errors.id_empleado[0] === "Este empleado ya tiene su usuario.") {
          setErrorEmpleado("El empleado seleccionado ya tiene un usuario asociado. Seleccione un empleado diferente.");
        } else {
          setErrorGeneral("Error al actualizar usuario.");
        }
      } else {
        console.error("Error al actualizar usuario:", error);
        setErrorGeneral("No se pudo actualizar el usuario. Inténtelo de nuevo más tarde.");
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
          {errorEmail && <p className="text-white">{errorEmail}</p>}
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
          {errorEmpleado && <p className="text-white">{errorEmpleado}</p>}
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
          {errorRol && <p className="text-white">{errorRol}</p>}
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
          {errorStatus && <p className="text-white">{errorStatus}</p>}
        </FormGroup>
        {!mostrarCamposContrasena && (
          <Button color="secondary" onClick={() => setMostrarCamposContrasena(true)}>Modificar Contraseña</Button>
        )}
        {mostrarCamposContrasena && (
          <>
            <FormGroup>
              <Label for="password">Nueva Contraseña</Label>
              <InputGroup>
                <Input
                  type={mostrarPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <InputGroupText onClick={() => setMostrarPassword(!mostrarPassword)}>
                  {mostrarPassword ? <BiHide /> : <BiShow />}
                </InputGroupText>
              </InputGroup>
            </FormGroup>
            <FormGroup>
              <Label for="confirmPassword">Confirmar Contraseña</Label>
              <InputGroup>
                <Input
                  type={mostrarConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <InputGroupText onClick={() => setMostrarConfirmPassword(!mostrarConfirmPassword)}>
                  {mostrarConfirmPassword ? <BiHide /> : <BiShow />}
                </InputGroupText>
              </InputGroup>
              {errorPassword && <p className="text-white">{errorPassword}</p>}
            </FormGroup>
          </>
        )}
        {errorGeneral && <p className="text-white">{errorGeneral}</p>}
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
