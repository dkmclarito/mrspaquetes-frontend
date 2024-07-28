import React, { useState, useEffect } from "react";
import { Card, CardBody, Col, Row, Container, Form, FormGroup, Label, Input, Button, Alert } from "reactstrap";
import AuthService from "../services/authService";
import Breadcrumbs from "../components/Usuarios/Common/Breadcrumbs";
import axios from "axios";
import Select from 'react-select';

const API_URL = import.meta.env.VITE_API_URL;

const AgregarRolesPermisos = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [nombreRol, setNombreRol] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [permisos, setPermisos] = useState([]);
  const [permisosSeleccionados, setPermisosSeleccionados] = useState([]);
  const [alertaExito, setAlertaExito] = useState(false);
  const [alertaError, setAlertaError] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState("");

  const token = AuthService.getCurrentUser();

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await axios.get(`${API_URL}/auth/get_users`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        // Verificar la estructura de los datos
        console.log('Usuarios:', response.data.users); 
        setUsuarios(Array.isArray(response.data.users) ? response.data.users : []);
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
        setUsuarios([]); // Asegúrate de que el estado usuarios sea un array en caso de error
      }
    };

    const fetchPermisos = async () => {
      try {
        const response = await axios.get(`${API_URL}/permission`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setPermisos(response.data || []);
      } catch (error) {
        console.error("Error al obtener permisos:", error);
      }
    };

    fetchUsuarios();
    fetchPermisos();
  }, [token]);

  useEffect(() => {
    if (selectedUser) {
      const userType = selectedUser.type;

      if (userType === 1) {
        setRoles([
          { id: 1, name: "Administrador" },
          { id: 3, name: "Conductor" },
          { id: 4, name: "Básico" }
        ]);
      } else if (userType === 2) {
        setRoles([{ id: 2, name: "Cliente" }]);
      }
    } else {
      setRoles([]);
    }
  }, [selectedUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombreRol) {
      setAlertaError(true);
      setErrorMensaje("El campo 'Nombre del Rol' es obligatorio.");
      return;
    }
    if (permisosSeleccionados.length === 0) {
      setAlertaError(true);
      setErrorMensaje("Debe seleccionar al menos un permiso.");
      return;
    }

    const roleData = {
      name: nombreRol,
      description: descripcion,
      permissions: permisosSeleccionados
    };

    try {
      const response = await axios.post(`${API_URL}/roles`, roleData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 201) {
        setAlertaExito(true);
        setNombreRol("");
        setDescripcion("");
        setPermisosSeleccionados([]);
        setAlertaError(false);
      } else {
        throw new Error("Error al agregar el rol");
      }
    } catch (error) {
      console.error("Error al agregar el rol:", error);
      setAlertaError(true);
      setErrorMensaje("No se pudo agregar el rol. Inténtelo de nuevo más tarde.");
    }
  };

  const handlePermissionChange = (e) => {
    const { value, checked } = e.target;
    setPermisosSeleccionados(prevState => {
      if (checked) {
        return [...prevState, value];
      } else {
        return prevState.filter(permission => permission !== value);
      }
    });
  };

  const handleUserChange = (selectedOption) => {
    setSelectedUser(selectedOption);
  };

  return (
    <div>
      <Container fluid>
        <Breadcrumbs title="Gestión de Roles y Permisos" breadcrumbItem="Agregar Rol" />
        <Card>
          <CardBody>
            <h5 className="mb-4">Agregar Rol</h5>
            {alertaExito && <Alert color="success">Rol agregado exitosamente!</Alert>}
            {alertaError && <Alert color="danger">{errorMensaje}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md="6">
                  <FormGroup>
                    <Label for="usuario">Usuario</Label>
                    <Select
                      id="usuario"
                      options={usuarios.map(user => ({
                        value: user.id,
                        label: user.name
                      }))}
                      onChange={handleUserChange}
                      placeholder="Selecciona un usuario"
                    />
                  </FormGroup>
                </Col>
                <Col md="6">
                  <FormGroup>
                    <Label for="roles">Roles</Label>
                    <Input type="select" id="roles" disabled={!selectedUser}>
                      {roles.map((rol) => (
                        <option key={rol.id} value={rol.id}>
                          {rol.name}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>
                <Col md="12">
                  <FormGroup>
                    <Label for="permisos">Permisos</Label>
                    {permisos.map((permiso) => (
                      <FormGroup key={permiso.id}>
                        <Input
                          type="checkbox"
                          id={`permiso-${permiso.id}`}
                          value={permiso.id}
                          checked={permisosSeleccionados.includes(permiso.id.toString())}
                          onChange={handlePermissionChange}
                        />
                        <Label for={`permiso-${permiso.id}`} className="ms-2">{permiso.name}</Label>
                      </FormGroup>
                    ))}
                  </FormGroup>
                </Col>
                <Col md="12">
                  <FormGroup>
                    <Label for="descripcion">Descripción</Label>
                    <Input
                      type="text"
                      id="descripcion"
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Button type="submit" color="primary">Agregar Rol</Button>
              <Button color="secondary" className="ms-2" onClick={() => window.location.href = '/GestionRoles'}>
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

export default AgregarRolesPermisos;
