import React, { useState, useEffect } from "react";
import { Card, CardBody, Col, Row, Container, Form, FormGroup, Label, Input, Button, Alert } from "reactstrap";
import AuthService from "../services/authService";
import { Link } from 'react-router-dom';
import "../styles/usuarios.css";
import Breadcrumbs from "../components/Usuarios/Common/Breadcrumbs";
import axios from "axios";

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

  const token = AuthService.getCurrentUser();

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
      setErrorMensaje("El campo 'Nombre' es obligatorio y debe ser un nombre válido. Evite nombres como 'XXX' o 'PPP'.");
      return;
    }
    if (!email || !validateEmail(email)) {
      setAlertaError(true);
      setErrorMensaje("El campo 'Correo Electrónico' es obligatorio y debe tener un formato válido (ejemplo: usuario@dominio.com).");
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

    console.log("Datos del usuario que se enviarán:", usuarioData);

    try {
      const response = await fetch(`${API_URL}/auth/store`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(usuarioData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Error HTTP ${response.status} - ${response.statusText}: ${JSON.stringify(errorData)}`);
        setErrorMensaje(`Error al agregar el usuario: ${errorData.error || response.statusText}`);
        throw new Error(`Error HTTP ${response.status} - ${response.statusText}: ${JSON.stringify(errorData)}`);
      }

      await response.json();
      setAlertaExito(true);
      
      setNombre("");
      setEmail("");
      setPassword("");
      setRol(""); 
      setClienteId(""); 
      setEmpleadoId(""); 
      setTipoUsuario(""); 

      setAlertaError(false);
    } catch (error) {
      console.error("Error al agregar usuario:", error);
      setAlertaError(true);

      // Verifica si el error está relacionado con el correo electrónico ya registrado
      if (error.message.includes('correo electrónico ya está registrado')) {
        setErrorMensaje("El correo electrónico ya está registrado.");
      } else {
       // setErrorMensaje("No se pudo agregar el usuario. Inténtelo de nuevo más tarde.");
        setErrorMensaje("El correo electrónico ya está registrado.");
      }
    }
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
                      {tipoUsuario === "cliente" ? (
                        <option value="2">Cliente</option>
                      ) : (
                        <>
                          <option value="1">Administrador</option>
                          <option value="3">Conductor</option>
                          <option value="4">Básico</option>
                        </>
                      )}
                    </Input>
                  </FormGroup>
                </Col>
                {tipoUsuario === "empleado" ? (
                  <Col md="6">
                    <FormGroup>
                      <Label for="empleado">Empleado</Label>
                      <Input
                        type="select"
                        id="empleado"
                        value={empleadoId}
                        onChange={(e) => setEmpleadoId(e.target.value)}
                        required
                      >
                        <option value="">Selecciona un empleado</option>
                        {empleadosDropdown.map((empleado) => (
                          <option key={empleado.id} value={empleado.id}>
                            {empleado.nombres} {empleado.apellidos}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                  </Col>
                ) : (
                  <Col md="6">
                    <FormGroup>
                      <Label for="cliente">Cliente</Label>
                      <Input
                        type="select"
                        id="cliente"
                        value={clienteId}
                        onChange={(e) => setClienteId(e.target.value)}
                        required
                      >
                        <option value="">Selecciona un cliente</option>
                        {clientesDropdown.map((cliente) => (
                          <option key={cliente.id} value={cliente.id}>
                            {cliente.nombre} {cliente.apellido}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                  </Col>
                )}
                <Col md="12">
                  <Button type="submit" color="primary" className="me-2">Registrar</Button>
                  <Link to="/GestionUsuarios">
                    <Button color="secondary">Ver Usuarios</Button>
                  </Link>
                </Col>
              </Row>
            </Form>
          </CardBody>
        </Card>
      </Container>
    </div>
  );
};

export default AgregarUsuario;
