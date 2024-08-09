import React, { useState, useEffect } from "react";
import { Card, CardBody, Col, Row, Container, Form, FormGroup, Label, Input, Button, Alert } from "reactstrap";
import Breadcrumbs from "../components/Clientes/Common/Breadcrumbs";
import AuthService from "../services/authService";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../styles/Clientes.css";

const API_URL = import.meta.env.VITE_API_URL;

const AgregarVehiculo = () => {
  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [estados, setEstados] = useState([]);
  const [marcaSeleccionada, setMarcaSeleccionada] = useState("");
  const [modeloSeleccionado, setModeloSeleccionado] = useState("");
  const [empleadoConductor, setEmpleadoConductor] = useState("");
  const [empleadoApoyo, setEmpleadoApoyo] = useState("");
  const [placa, setPlaca] = useState("");
  const [capacidadCarga, setCapacidadCarga] = useState("");
  const [idEstado, setIdEstado] = useState("");
  const [anio, setAnio] = useState("");
  const [color, setColor] = useState("");
  const [alertaExito, setAlertaExito] = useState(false);
  const [alertaError, setAlertaError] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState("");

  const navigate = useNavigate();
  const token = AuthService.getCurrentUser();

  useEffect(() => {
    const fetchMarcas = async () => {
      try {
        const response = await axios.get(`${API_URL}/dropdown/get_marcas`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setMarcas(response.data.marcas || []);
      } catch (error) {
        console.error("Error al obtener las marcas:", error);
      }
    };

    fetchMarcas();
  }, [token]);

  useEffect(() => {
    const fetchModelos = async () => {
      try {
        const response = await axios.get(`${API_URL}/dropdown/get_modelos`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setModelos(response.data.modelos || []);
      } catch (error) {
        console.error("Error al obtener los modelos:", error);
      }
    };

    fetchModelos();
  }, [token]);

  useEffect(() => {
    const fetchEmpleados = async () => {
      try {
        const response = await axios.get(`${API_URL}/dropdown/get_empleados`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setEmpleados(response.data.empleados || []);
      } catch (error) {
        console.error("Error al obtener los empleados:", error);
      }
    };

    fetchEmpleados();
  }, [token]);

  useEffect(() => {
    const fetchEstados = async () => {
      try {
        const response = await axios.get(`${API_URL}/dropdown/get_estado_vehiculos`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log("Estados recibidos:", response.data);
        // Asegúrate de acceder correctamente a la propiedad estado_vehiculos
        setEstados(response.data.estado_vehiculos || []);
      } catch (error) {
        console.error("Error al obtener los estados:", error);
      }
    };

    fetchEstados();
  }, [token]);


  const handleMarcaChange = (e) => {
    setMarcaSeleccionada(e.target.value);
    setModeloSeleccionado(""); // Reset modeloSeleccionado when marca changes
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Eliminar ' T' de capacidadCarga si existe
    let cleanedCapacidadCarga = capacidadCarga;
    if (cleanedCapacidadCarga.endsWith(' T')) {
        cleanedCapacidadCarga = cleanedCapacidadCarga.slice(0, -2); // Elimina los últimos 2 caracteres
    }

    const vehiculoData = {
        id_marca: marcaSeleccionada,
        id_modelo: modeloSeleccionado,
        placa,
        capacidad_carga: cleanedCapacidadCarga, // Usar el valor limpiado
        id_estado: idEstado,
        year_fabricacion: anio,
        id_empleado_conductor: empleadoConductor,
        id_empleado_apoyo: empleadoApoyo
    };

    try {
        const response = await axios.post(`${API_URL}/vehiculo`, vehiculoData, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            }
        });

        console.log("Vehículo registrado:", response.data);
        setAlertaExito(true);
        setTimeout(() => navigate('/GestionVehiculos'), 2000);
        resetForm();
        setAlertaError(false);
    } catch (error) {
        console.error("Error de solicitud:", error.response);
        handleError(error);
    }
};

  const resetForm = () => {
    setMarcaSeleccionada("");
    setModeloSeleccionado("");
    setEmpleadoConductor("");
    setEmpleadoApoyo("");
    setPlaca("");
    setCapacidadCarga("");
    setIdEstado("");
    setAnio("");
  };

  const handleError = (error) => {
    if (error.response && error.response.data) {
      const errorData = error.response.data.error;
      let errorMessage = "Error al agregar el vehículo.";

      if (errorData) {
        if (errorData.id_marca) {
          errorMessage = "Error en la marca seleccionada.";
        } else if (errorData.id_modelo) {
          errorMessage = "Error en el modelo seleccionado.";
        } else if (errorData.placa) {
          errorMessage = "La placa ya está registrada.";
        } else if (errorData.capacidad_carga) {
          errorMessage = "Error en la capacidad de carga.";
        } else if (errorData.id_estado) {
          errorMessage = "Error en el estado del vehículo.";
        } else if (errorData.year_fabricacion) {
          errorMessage = "Error en el año de fabricación.";
        } else {
          errorMessage = errorData.message || errorMessage;
        }
      } else {
        errorMessage = error.response.data.message || errorMessage;
      }

      setAlertaExito(false);
      setAlertaError(true);
      setErrorMensaje(errorMessage);
    } else {
      setAlertaExito(false);
      setAlertaError(true);
      setErrorMensaje("Hubo un error al procesar la solicitud. Por favor, inténtalo de nuevo.");
    }
  };

  const toggleAlertas = () => {
    setAlertaExito(false);
    setAlertaError(false);
    setErrorMensaje("");
  };

  return (
    <Container fluid>
      <Breadcrumbs title="Vehículos" breadcrumbItem="Agregar Vehículo" />
      <Row>
        <Col xl="12">
          <Card>
            <CardBody>
              <Form onSubmit={handleSubmit}>
                <Row form>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="marca">Marca</Label>
                      <Input type="select" name="marca" id="marca" value={marcaSeleccionada} onChange={handleMarcaChange} required>
                        <option value="">Seleccione Marca</option>
                        {marcas.map((marca) => (
                          <option key={marca.id} value={marca.id}>
                            {marca.nombre}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="modelo">Modelo</Label>
                      <Input type="select" name="modelo" id="modelo" value={modeloSeleccionado} onChange={(e) => setModeloSeleccionado(e.target.value)} required>
                        <option value="">Seleccione Modelo</option>
                        {modelos.map((modelo) => (
                          <option key={modelo.id} value={modelo.id}>
                            {modelo.nombre}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                  </Col>
                </Row>
                <Row form>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="conductor">Conductor</Label>
                      <Input type="select" name="conductor" id="conductor" value={empleadoConductor} onChange={(e) => setEmpleadoConductor(e.target.value)} required>
                        <option value="">Seleccione Conductor</option>
                        {empleados
                          .filter((empleado) => empleado.id_cargo === 1) // Filtra empleados con id_cargo 1 para conductores
                          .map((empleado) => (
                            <option key={empleado.id} value={empleado.id}>
                              {empleado.nombres} {empleado.apellidos}
                            </option>
                          ))}
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="apoyo">Apoyo</Label>
                      <Input type="select" name="apoyo" id="apoyo" value={empleadoApoyo} onChange={(e) => setEmpleadoApoyo(e.target.value)} required>
                        <option value="">Seleccione Apoyo</option>
                        {empleados
                          .filter((empleado) => empleado.id_cargo === 2) // Filtra empleados con id_cargo 2 para apoyo
                          .map((empleado) => (
                            <option key={empleado.id} value={empleado.id}>
                              {empleado.nombres} {empleado.apellidos}
                            </option>
                          ))}
                      </Input>
                    </FormGroup>
                  </Col>
                </Row>
                <Row form>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="placa">Placa</Label>
                      <Input type="text" name="placa" id="placa" value={placa} onChange={(e) => setPlaca(e.target.value)} required />
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="anio">Año de Fabricación</Label>
                      <Input type="number" name="anio" id="anio" value={anio} onChange={(e) => setAnio(e.target.value)} min="1900" max="2099" step="1" required />
                    </FormGroup>
                  </Col>
                </Row>
                <Row form>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="estado">Estado</Label>
                      <Input type="select" name="estado" id="estado" value={idEstado} onChange={(e) => setIdEstado(e.target.value)} required>
                        <option value="">Seleccione Estado</option>
                        {estados.map((estado) => (
                          <option key={estado.id} value={estado.id}>
                            {estado.estado}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                        <FormGroup>
                          <Label for="capacidadCarga">Capacidad de Carga</Label>
                          <Input type="number" name="capacidadCarga" id="capacidadCarga" value={capacidadCarga} onChange={(e) => setCapacidadCarga(e.target.value)} required />
                        </FormGroup>
                      </Col>
                </Row>
                <Button type="submit" color="primary">Agregar Vehículo</Button>
                <Button color="secondary" className="ms-2" onClick={() => window.location.href = '/GestionVehiculos'}>
                  Salir
                </Button>
              </Form>
              {alertaExito && (
                <Alert color="success" isOpen={alertaExito} toggle={toggleAlertas}>
                  Vehículo agregado con éxito.
                </Alert>
              )}
              {alertaError && (
                <Alert color="danger" isOpen={alertaError} toggle={toggleAlertas}>
                  {errorMensaje}
                </Alert>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AgregarVehiculo;
