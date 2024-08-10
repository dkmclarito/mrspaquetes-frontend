import React, { useState, useEffect } from "react";
import { Card, CardBody, Col, Row, Container, Form, FormGroup, Label, Input, Button, Alert } from "reactstrap";
import AuthService from "../services/authService";
import { Link } from 'react-router-dom';
import "../styles/usuarios.css";
import Breadcrumbs from "../components/Usuarios/Common/Breadcrumbs";
import axios from "axios";
import Select from 'react-select';

const API_URL = import.meta.env.VITE_API_URL;

const AgregarUsuario = () => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [empleadoId, setEmpleadoId] = useState("");
  const [clientesDropdown, setClientesDropdown] = useState([]);
  const [empleadosDropdown, setEmpleadosDropdown] = useState([]);
  const [alertaExito, setAlertaExito] = useState(false);
  const [alertaError, setAlertaError] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);

  const token = AuthService.getCurrentUser();

  useEffect(() => {
    const darkModePreference = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkModePreference);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let response;
        if (tipoUsuario === "empleado") {
          response = await axios.get(`${API_URL}/empleados`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setEmpleadosDropdown(response.data?.empleados || []);
        } else if (tipoUsuario === "cliente") {
          response = await axios.get(`${API_URL}/clientes`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setClientesDropdown(response.data?.data || response.data || []);
        }
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };

    fetchData();
  }, [tipoUsuario, token]);

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net|edu|gov|mil|info|biz|co|us|ca)$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    const re = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[A-Z]).{5,}$/;
    return re.test(password);
  };

  const validateNombre = (nombre) => {
    const re = /^[A-Za-záéíóúÁÉÍÓÚñÑ\s]{2,}$/;
    return re.test(nombre);
  };

  const checkEmailExists = async (email) => {
    try {
      const response = await axios.get(`${API_URL}/auth/get_users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Buscar en la lista de usuarios si el email ya está registrado
      return response.data.some(user => user.email === email);
    } catch (error) {
      console.error("Error al verificar el correo electrónico:", error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const tipoUsuarioInt = tipoUsuario === "cliente" ? 1 : tipoUsuario === "empleado" ? 0 : null;

    if (!nombre || !validateNombre(nombre)) {
      setAlertaError(true);
      setErrorMensaje("El campo 'Nombre' es obligatorio y debe ser un nombre válido.");
      return;
    }
    if (!email || !validateEmail(email)) {
      setAlertaError(true);
      setErrorMensaje("El campo 'Correo Electrónico' es obligatorio y debe tener un formato válido.");
      return;
    }
    if (await checkEmailExists(email)) {
      setAlertaError(true);
      setErrorMensaje("El correo electrónico ya está registrado.");
      return;
    }
    if (!password || !validatePassword(password)) {
      setAlertaError(true);
      setErrorMensaje("La contraseña debe tener al menos 5 caracteres, incluir letras, números y una letra mayúscula.");
      return;
    }
    if (!rol) {
      setAlertaError(true);
      setErrorMensaje("El campo 'Rol' es obligatorio.");
      return;
    }
    if (tipoUsuarioInt === null) {
      setAlertaError(true);
      setErrorMensaje("El campo 'Tipo de Usuario' es obligatorio.");
      return;
    }
    if (tipoUsuarioInt === 0 && !empleadoId) {
      setAlertaError(true);
      setErrorMensaje("Debe seleccionar un empleado.");
      return;
    }
    if (tipoUsuarioInt === 1 && !clienteId) {
      setAlertaError(true);
      setErrorMensaje("Debe seleccionar un cliente.");
      return;
    }

    const usuarioData = {
      name: nombre,
      email: email,
      password: password,
      role_id: parseInt(rol, 10),
      type: tipoUsuarioInt,
      id_empleado: tipoUsuarioInt === 0 ? parseInt(empleadoId, 10) : null,
      id_cliente: tipoUsuarioInt === 1 ? parseInt(clienteId, 10) : null,
    };

    try {
      const response = await axios.post(`${API_URL}/auth/store`, usuarioData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      });

      if (response.status === 200) {
        setAlertaExito(true);
        // Reset form after successful submission
        setNombre("");
        setEmail("");
        setPassword("");
        setRol("");
        setClienteId("");
        setEmpleadoId("");
        setTipoUsuario("");
        setAlertaError(false);
      } else {
        throw new Error(`Error HTTP ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error al agregar usuario:", error);
      setAlertaError(true);
      setErrorMensaje("No se pudo agregar el usuario. Inténtelo de nuevo más tarde.");
    }
  };

  // Estilos manuales DrakMode
  const customSelectStyles = {    
    container: (provided) => ({
      ...provided,
      width: '100%',
    }),
    control: (provided) => ({
      ...provided,
      backgroundColor: isDarkMode ? '#444' : '#fff',
      color: isDarkMode ? '#fff' : '#000',
      border: isDarkMode ? '1px solid #444' : '1px solid #ced4da',
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: isDarkMode ? '#333' : '#fff',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: isDarkMode ? (state.isSelected ? '#555' : '#444') : (state.isSelected ? '#f1f1f1' : '#fff'),
      color: isDarkMode ? '#fff' : '#000',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: isDarkMode ? '#fff' : '#000',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: isDarkMode ? '#fff' : '#6c757d',
    }),
  };

  return (
    <div>
      <Container fluid>
        <Breadcrumbs title="Gestión de Usuarios" breadcrumbItem="Agregar Usuario" />
        <Card>
          <CardBody>
            <h5 className="mb-4">Agregar Usuario</h5>
            {alertaExito && <Alert color="success">Usuario agregado exitosamente!</Alert>}
            {alertaError && <Alert color="danger">{errorMensaje}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md="6">
                  <FormGroup>
                    <Label for="nombre">Nombre</Label>
                    <Input
                      type="text"
                      id="nombre"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      required
                    />
                  </FormGroup>
                </Col>
                <Col md="6">
                  <FormGroup>
                    <Label for="email">Correo Electrónico</Label>
                    <Input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </FormGroup>
                </Col>
                <Col md="6">
                  <FormGroup>
                    <Label for="password">Contraseña</Label>
                    <Input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </FormGroup>
                </Col>

                <Col md="6">
                  <FormGroup>
                    <Label for="tipoUsuario">Tipo de Usuario</Label>
                    <Input
                      type="select"
                      id="tipoUsuario"
                      value={tipoUsuario}
                      onChange={(e) => setTipoUsuario(e.target.value)}
                      required
                    >
                      <option value="">Selecciona un tipo</option>
                      <option value="empleado">Empleado</option>
                      <option value="cliente">Cliente</option>
                    </Input>
                  </FormGroup>
                </Col>
                <Col md="6">
                  <FormGroup>
                    <Label for="rol">Rol</Label>
                    <Input
                      type="select"
                      id="rol"
                      value={rol}
                      onChange={(e) => setRol(e.target.value)}
                      required
                      disabled={!tipoUsuario}
                    >
                      <option value="">Selecciona un rol</option>
                      {tipoUsuario === "cliente" && <option value="2">Cliente</option>}
                      {tipoUsuario === "empleado" && (
                        <>
                          <option value="1">Administrador</option>
                          <option value="3">Conductor</option>
                          <option value="4">Básico</option>
                        </>
                      )}
                    </Input>
                  </FormGroup>
                </Col>
                {tipoUsuario === "cliente" && (
                  <Col md="6">
                    <FormGroup>
                      <Label for="clienteId">Cliente</Label>
                      <Select
                        id="clienteId"
                        styles={customSelectStyles}
                        options={clientesDropdown.map(cliente => ({ value: cliente.id, label: `${cliente.nombre} ${cliente.apellido}` }))}
                        onChange={selectedOption => setClienteId(selectedOption ? selectedOption.value : "")}
                        isSearchable
                        placeholder="Seleccione un cliente..."
                      />
                    </FormGroup>
                  </Col>
                )}
                {tipoUsuario === "empleado" && (
                  <Col md="6">
                    <FormGroup>
                      <Label for="empleadoId">Empleado</Label>
                      <Select
                        id="empleadoId"
                        styles={customSelectStyles}
                        options={empleadosDropdown.map(empleado => ({ value: empleado.id, label: `${empleado.nombres} ${empleado.apellidos}` }))}
                        onChange={selectedOption => setEmpleadoId(selectedOption ? selectedOption.value : "")}
                        isSearchable
                        placeholder="Seleccione un empleado..."
                      />
                    </FormGroup>
                  </Col>
                )}
              </Row>
              <Button type="submit" color="primary">Agregar Usuario</Button>
              <Button color="secondary" className="ms-2" onClick={() => window.location.href = '/GestionUsuarios'}>
                Salir
              </Button>

            </Form>

          </CardBody>
        </Card>
      </Container>
      <br /><br /><br /><br />
    </div>
  );
};

export default AgregarUsuario;
