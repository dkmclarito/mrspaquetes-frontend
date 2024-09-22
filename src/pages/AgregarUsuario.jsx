import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Card, CardBody, Col, Row, Container, Form, FormGroup, Label, Input, Button, Alert, InputGroup, InputGroupText } from "reactstrap";
import { BiShow, BiHide } from "react-icons/bi";
import AuthService from "../services/authService";
import { useNavigate } from "react-router-dom";
import "../styles/usuarios.css";
import Breadcrumbs from "../components/Usuarios/Common/Breadcrumbs";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

const API_URL = import.meta.env.VITE_API_URL;

const AgregarUsuario = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("");
  const [alertaExito, setAlertaExito] = useState(false);
  const [alertaError, setAlertaError] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]); // Estado para almacenar los roles obtenidos de la API
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const token = AuthService.getCurrentUser();
  const navigate = useNavigate();

  const verificarEstadoUsuarioLogueado = useCallback(async () => {
    try {
      const token = AuthService.getCurrentUser();
      const userId = localStorage.getItem("userId");
      if (userId && token) {
        const response = await fetch(`${API_URL}/auth/show/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const responseData = await response.json();

        if (responseData.status === "Token is Invalid") {
          console.error("Token is invalid. Logging out...");
          AuthService.logout();
          window.location.href = "/login";
          return;
        }
      }
    } catch (error) {
      console.error("Error al verificar el estado del usuario:", error);
    }
  }, []);

  useEffect(() => {
    verificarEstadoUsuarioLogueado();

    const interval = setInterval(() => {
      verificarEstadoUsuarioLogueado();
    }, 30000);

    return () => clearInterval(interval);
  }, [verificarEstadoUsuarioLogueado]);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
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

    const fetchRoles = async () => { // Nueva función para obtener los roles desde la API
      try {
        const response = await axios.get(`${API_URL}/roles`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.data && Array.isArray(response.data)) {
          // Filtrar para no mostrar el rol con id 2 (cliente)
          const rolesFiltrados = response.data.filter(role => role.id !== 2);
          setRoles(rolesFiltrados); // Guardar los roles filtrados en el estado
        }
      } catch (error) {
        console.error("Error al obtener roles:", error);
      }
    };

    fetchUsuarios();
    fetchRoles(); // Llamada a la función para obtener los roles
  }, [token]);

  const displayAlert = (type, message) => {
    setErrorMensaje(message);
    if (type === "success") {
      setAlertaExito(true);
      setTimeout(() => {
        setAlertaExito(false);
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

  const handleSuccessAlert = (id) => {
    confirmAlert({
      title: 'Usuario agregado exitosamente!',
      message: '¿Desea agregar la información del empleado ahora?',
      buttons: [
        {
          label: 'Sí, crear ahora',
          onClick: () => navigate(`/AgregarEmpleado/${id}`)
        },
        {
          label: 'Agregar más tarde',
          onClick: () => navigate('/GestionUsuarios')
        }
      ]
    });
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
    if (!rol) {
      displayAlert("error", "Todos los campos son obligatorios.");
      return;
    }

    // Verificar si el correo ya está registrado
    const emailExistente = usuarios.find(user => user.email === email);
    if (emailExistente) {
      displayAlert("error", "El correo electrónico ya está registrado.");
      return;
    }

    const usuarioData = {
      email,
      password,
      role_id: parseInt(rol, 10),
      id_empleado: null, // Enviar el id_empleado como null
    };

    try {
      const response = await axios.post(`${API_URL}/auth/store`, usuarioData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      });

      if (response.status === 200) {
        // Realizar una nueva llamada para obtener el usuario recién creado
        const fetchUserResponse = await axios.get(`${API_URL}/auth/get_users`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (fetchUserResponse.data && Array.isArray(fetchUserResponse.data.users)) {
          const newUser = fetchUserResponse.data.users.find(user => user.email === email);
          if (newUser) {
            setEmail("");
            setPassword("");
            setRol("");
            displayAlert("success", "Usuario agregado exitosamente!");
            handleSuccessAlert(newUser.id); // Utiliza el ID del usuario recién creado
          } else {
            throw new Error("No se pudo encontrar el usuario recién creado.");
          }
        } else {
          throw new Error("Error al buscar el usuario recién creado.");
        }
      } else {
        throw new Error("Error en la creación del usuario.");
      }
    } catch (error) {
      displayAlert("error", "No se pudo agregar el usuario. Inténtelo de nuevo más tarde.");
      console.error("Error al agregar usuario:", error);
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
                  <InputGroup>
                    <Input
                      type={mostrarPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <InputGroupText onClick={() => setMostrarPassword(!mostrarPassword)}>
                      {mostrarPassword ? <BiHide /> : <BiShow />}
                    </InputGroupText>
                  </InputGroup>
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
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </Input>
                </FormGroup>
              </Col>
            </Row>
            <Button type="submit" color="primary">Agregar Usuario</Button>
            <Button className="ms-2 btn-custom-red" onClick={() => window.location.href = '/GestionUsuarios'}>
              Salir
            </Button>
          </Form>
        </CardBody>
      </Card>
    </Container>
  );
};

export default AgregarUsuario;
