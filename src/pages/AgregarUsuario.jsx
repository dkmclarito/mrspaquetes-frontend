import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardBody, Col, Row, Container, Form, FormGroup, Label, Input, Button, Alert } from "reactstrap";
import AuthService from "../services/authService";
import { useNavigate } from "react-router-dom";  // Importa useNavigate
import "../styles/usuarios.css";
import Breadcrumbs from "../components/Usuarios/Common/Breadcrumbs";
import Select from 'react-select';

const API_URL = import.meta.env.VITE_API_URL;

const AgregarUsuario = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("");
  const [empleadoId, setEmpleadoId] = useState("");
  const [empleadosDropdown, setEmpleadosDropdown] = useState([]);
  const [alertaExito, setAlertaExito] = useState(false);
  const [alertaError, setAlertaError] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState("");

  const token = AuthService.getCurrentUser();
  const navigate = useNavigate();  // Usa useNavigate para la redirección

  useEffect(() => {
    const fetchEmpleados = async () => {
      try {
        const response = await axios.get(`${API_URL}/empleados`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.data) {
          setEmpleadosDropdown(response.data.empleados || []);
        }
      } catch (error) {
        console.error("Error al obtener empleados:", error);
      }
    };

    fetchEmpleados();
  }, [token]);

  const displayAlert = (type, message) => {
    setErrorMensaje(message);
    if (type === "success") {
      setAlertaExito(true);
      setTimeout(() => {
        setAlertaExito(false);
        navigate('/GestionUsuarios');  // Redirige a GestionUsuarios después de 5 segundos
      }, 3000);
    } else if (type === "error") {
      setAlertaError(true);
      setTimeout(() => {
        setAlertaError(false);
      }, 5000);
    }
  };

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net|edu|gov|mil|info|biz|co|us|ca)$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    const re = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[A-Z]).{5,}$/;
    return re.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !validateEmail(email)) {
      displayAlert("error", "El correo electrónico debe ser válido.");
      return;
    }
    if (!password || !validatePassword(password)) {
      displayAlert("error", "La contraseña debe tener al menos 5 caracteres, incluyendo una mayúscula, una minúscula y un número.");
      return;
    }
    if (!rol || !empleadoId) {
      displayAlert("error", "Todos los campos son obligatorios.");
      return;
    }

    const usuarioData = {
      email,
      password,
      role_id: parseInt(rol, 10),
      //type: 0, // Tipo empleado
      id_empleado: parseInt(empleadoId, 10),
    };

    try {
      const response = await axios.post(`${API_URL}/auth/store`, usuarioData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      });

      if (response.status === 200) {
        setEmail("");
        setPassword("");
        setRol("");
        setEmpleadoId("");
        displayAlert("success", "Usuario agregado exitosamente!");
      }
    } catch (error) {
      if (error.response && error.response.status === 422) {
        const errors = error.response.data.errors || error.response.data;
    
        if (errors.email) {
          displayAlert("error", "El correo electrónico ya está registrado.");
        } else {
          displayAlert("error", "El correo electrónico ya está registrado."); //err message
        }
      } else {
        console.error("Error al agregar usuario:", error);
        displayAlert("error", "No se pudo agregar el usuario. Inténtelo de nuevo más tarde.");
      }
    }    
  };

  return (
    <Container fluid>
      <Breadcrumbs title="Gestión de Usuarios" breadcrumbItem="Agregar Usuario" />
      <Card>
        <CardBody>
          <h5 className="mb-4">Agregar Usuario</h5>
          {alertaExito && <Alert color="success">{errorMensaje}</Alert>}
          {alertaError && <Alert color="danger">{errorMensaje}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Row>
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
                  <Label for="rol">Rol</Label>
                  <Input
                    type="select"
                    id="rol"
                    value={rol}
                    onChange={(e) => setRol(e.target.value)}
                    required
                  >
                    <option value="">Selecciona un rol</option>
                    <option value="1">Administrador</option>
                    <option value="3">Conductor</option>
                    <option value="4">Básico</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label for="empleadoId">Empleado</Label>
                  <Select
                    id="empleadoId"
                    options={empleadosDropdown.map(empleado => ({ value: empleado.id, label: `${empleado.nombres} ${empleado.apellidos}` }))}
                    onChange={selectedOption => setEmpleadoId(selectedOption ? selectedOption.value : "")}
                    isSearchable
                    placeholder="Seleccione un empleado..."
                  />
                </FormGroup>
              </Col>
            </Row>
            <Button type="submit" color="primary">Agregar Usuario</Button>
            <Button color="secondary" className="ms-2" onClick={() => window.location.href = '/GestionUsuarios'}>
              Salir
            </Button>
          </Form>
        </CardBody>
      </Card>
    </Container>
  );
};

export default AgregarUsuario;