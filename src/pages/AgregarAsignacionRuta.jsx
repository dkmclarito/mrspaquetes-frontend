import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Col,
  Row,
  Container,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  FormFeedback,
} from "reactstrap";
import Breadcrumbs from "../components/Common/Breadcrumbs";
import AuthService from "../services/authService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const AsignarRutas = () => {
  const [formData, setFormData] = useState({
    codigo_unico_asignacion: "",
    id_ruta: "",
    id_vehiculo: "",
    id_paquete: "",
    fecha: "",
    id_estado: "1"
  });
  const [errors, setErrors] = useState({});
  const [rutas, setRutas] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [paquetes, setPaquetes] = useState([]);
  const [estados, setEstados] = useState([]);
  const navigate = useNavigate();
  
  const token = localStorage.getItem('token') || AuthService.getToken?.() || '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rutasRes, vehiculosRes, paquetesRes, estadosRes] = await Promise.all([
          axios.get(`${API_URL}/rutas`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/vehiculos`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/paquetes`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/estados`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        setRutas(rutasRes.data.rutas || []);
        setVehiculos(vehiculosRes.data.vehiculos || []);
        setPaquetes(paquetesRes.data.paquetes || []);
        setEstados(estadosRes.data.estados || []);
      } catch (error) {
        console.error("Error al obtener datos:", error);
        toast.error("Error al cargar los datos necesarios");
      }
    };

    fetchData();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.codigo_unico_asignacion) newErrors.codigo_unico_asignacion = "El código es requerido";
    if (!formData.id_ruta) newErrors.id_ruta = "La ruta es requerida";
    if (!formData.id_vehiculo) newErrors.id_vehiculo = "El vehículo es requerido";
    if (!formData.id_paquete) newErrors.id_paquete = "El paquete es requerido";
    if (!formData.fecha) newErrors.fecha = "La fecha es requerida";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/asignacionrutas`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 201) {
        toast.success('Asignación de ruta agregada con éxito');
        navigate('/GestionAsignarRutas');
      }
    } catch (error) {
      console.error("Error al crear la asignación de ruta:", error);
      toast.error('Error del servidor al crear la asignación de ruta');
    }
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Asignar Ruta" breadcrumbItem="Asignar Ruta" />
          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col md={6}>
                        <FormGroup>
                          <Label for="codigo_unico_asignacion">Código de Asignación</Label>
                          <Input
                            type="text"
                            name="codigo_unico_asignacion"
                            id="codigo_unico_asignacion"
                            value={formData.codigo_unico_asignacion}
                            onChange={handleInputChange}
                            invalid={!!errors.codigo_unico_asignacion}
                          />
                          <FormFeedback>{errors.codigo_unico_asignacion}</FormFeedback>
                        </FormGroup>
                      </Col>
                      <Col md={6}>
                        <FormGroup>
                          <Label for="id_ruta">Ruta</Label>
                          <Input
                            type="select"
                            name="id_ruta"
                            id="id_ruta"
                            value={formData.id_ruta}
                            onChange={handleInputChange}
                            invalid={!!errors.id_ruta}
                          >
                            <option value="">Seleccione una ruta</option>
                            {rutas.map((ruta) => (
                              <option key={ruta.id} value={ruta.id}>
                                {ruta.nombre}
                              </option>
                            ))}
                          </Input>
                          <FormFeedback>{errors.id_ruta}</FormFeedback>
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <FormGroup>
                          <Label for="id_vehiculo">Vehículo</Label>
                          <Input
                            type="select"
                            name="id_vehiculo"
                            id="id_vehiculo"
                            value={formData.id_vehiculo}
                            onChange={handleInputChange}
                            invalid={!!errors.id_vehiculo}
                          >
                            <option value="">Seleccione un vehículo</option>
                            {vehiculos.map((vehiculo) => (
                              <option key={vehiculo.id} value={vehiculo.id}>
                                {vehiculo.placa}
                              </option>
                            ))}
                          </Input>
                          <FormFeedback>{errors.id_vehiculo}</FormFeedback>
                        </FormGroup>
                      </Col>
                      <Col md={6}>
                        <FormGroup>
                          <Label for="id_paquete">Paquete</Label>
                          <Input
                            type="select"
                            name="id_paquete"
                            id="id_paquete"
                            value={formData.id_paquete}
                            onChange={handleInputChange}
                            invalid={!!errors.id_paquete}
                          >
                            <option value="">Seleccione un paquete</option>
                            {paquetes.map((paquete) => (
                              <option key={paquete.id} value={paquete.id}>
                                {paquete.codigo_unico}
                              </option>
                            ))}
                          </Input>
                          <FormFeedback>{errors.id_paquete}</FormFeedback>
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <FormGroup>
                          <Label for="fecha">Fecha</Label>
                          <Input
                            type="date"
                            name="fecha"
                            id="fecha"
                            value={formData.fecha}
                            onChange={handleInputChange}
                            invalid={!!errors.fecha}
                          />
                          <FormFeedback>{errors.fecha}</FormFeedback>
                        </FormGroup>
                      </Col>
                      <Col md={6}>
                        <FormGroup>
                          <Label for="id_estado">Estado</Label>
                          <Input
                            type="select"
                            name="id_estado"
                            id="id_estado"
                            value={formData.id_estado}
                            onChange={handleInputChange}
                          >
                            {estados.map((estado) => (
                              <option key={estado.id} value={estado.id}>
                                {estado.nombre}
                              </option>
                            ))}
                          </Input>
                        </FormGroup>
                      </Col>
                    </Row>
                    <Button color="primary" type="submit">
                      Registrar
                    </Button>
                    <Button className="ms-2" color="secondary" onClick={() => navigate('/GestionAsignarRutas')}>
                      Cancelar
                    </Button>
                  </Form>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default AsignarRutas;