import React, { useState } from "react";
import { Card, CardBody, Col, Row, Container, Form, FormGroup, Label, Input, Button, Alert } from "reactstrap";
import AuthService from "../services/authService";
import { Link } from 'react-router-dom';
import "../styles/usuarios.css";
import Breadcrumbs from "../components/Usuarios/Common/Breadcrumbs";

const AgregarUsuario = () => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(1); // Default to 'active'
  const [alertaExito, setAlertaExito] = useState(false);
  const [alertaError, setAlertaError] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState("");

  const token = AuthService.getCurrentUser();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const usuarioData = {
      name: nombre,
      email: email,
      password: password,
      status: status,
    };

    fetch("http://127.0.0.1:8000/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Uso de backticks para template literal
      },
      body: JSON.stringify(usuarioData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error HTTP ${response.status} - ${response.statusText}`); // Uso de backticks para template literal
        }
        return response.json();
      })
      .then(() => {
        setAlertaExito(true);
        setNombre("");
        setEmail("");
        setPassword("");
        setStatus(1); // Reset to default 'active'
        setAlertaError(false);
      })
      .catch((error) => {
        console.error("Error al agregar usuario:", error);
        setAlertaError(true);
        setErrorMensaje("No se pudo agregar el usuario. Inténtelo de nuevo más tarde.");
      });
  };

  return (
    <div>
      <Breadcrumbs />
      <Container className="mt-5">
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
                    <Label for="status">Estado</Label>
                    <Input
                      type="select"
                      id="status"
                      value={status}
                      onChange={(e) => setStatus(Number(e.target.value))}
                      required
                    >
                      <option value={1}>Activo</option>
                      <option value={0}>Inactivo</option>
                    </Input>
                  </FormGroup>
                </Col>
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
