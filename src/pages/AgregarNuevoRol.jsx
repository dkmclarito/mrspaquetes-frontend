import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, CardBody, Form, FormGroup, Label, Input, Button, Alert } from "reactstrap";
import Breadcrumbs from "../components/RolesPermisos/Common/Breadcrumbs";
import AuthService from "../services/authService";

const API_URL = import.meta.env.VITE_API_URL;

const AgregarNuevoRol = () => {
  const [name, setName] = useState("");
  const [alertaExito, setAlertaExito] = useState(false);
  const [alertaError, setAlertaError] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState("");
  const navigate = useNavigate();

  const token = AuthService.getCurrentUser();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newRole = {
      name,
      guard_name: "web",
    };

    try {
      const response = await axios.post(`${API_URL}/roles`, newRole, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        setAlertaExito(true);
        setTimeout(() => {
          navigate("/GestionRolesPermisos");
        }, 3000); // Redirigir después de 3 segundos
      }
    } catch (error) {
      setErrorMensaje("Error al agregar el rol. Inténtelo de nuevo.");
      setAlertaError(true);
      console.error("Error al agregar rol:", error);
    }
  };

  return (
    <Container fluid>
      <Breadcrumbs title="Roles y Permisos" breadcrumbItem="Agregar Nuevo Rol" />
      <Row>
        <Col lg={12}>
          <Card>
            <CardBody>
              <h4 className="mb-4">Agregar Nuevo Rol</h4>
              {alertaExito && <Alert color="success">Rol agregado exitosamente.</Alert>}
              {alertaError && <Alert color="danger">{errorMensaje}</Alert>}
              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label for="name">Nombre del Rol</Label>
                  <Input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </FormGroup>
                <Button type="submit" color="primary">Agregar Rol</Button>
                <Button className="ms-2 btn-custom-red" onClick={() => navigate("/GestionRolesPermisos")}>
                  Cancelar
                </Button>
              </Form>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AgregarNuevoRol;
