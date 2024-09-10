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
  Table,
} from "reactstrap";
import Breadcrumbs from "../components/AsignacionRutas/Common/Breadcrumbs";
import AuthService from "../services/authService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export default function AsignarRutas() {
  const [formData, setFormData] = useState({
    id_ruta: "",
    id_vehiculo: "",
    fecha: "",
  });
  const [errors, setErrors] = useState({});
  const [rutas, setRutas] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [paquetesSeleccionados, setPaquetesSeleccionados] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem('token') || AuthService.getToken?.() || '';

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        toast.error("No se encontró token de autenticación");
        return;
      }
      
      try {
        const [rutasRes, vehiculosRes] = await Promise.all([
          axios.get(`${API_URL}/dropdown/get_rutas`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/dropdown/get_vehiculos`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setRutas(rutasRes.data.rutas || []);
        setVehiculos(vehiculosRes.data.vehiculos || []);

        // Retrieve selected packages from localStorage
        const selectedPackages = JSON.parse(localStorage.getItem('paquetesParaAsignar') || '[]');
        console.log("Paquetes seleccionados desde localStorage:", selectedPackages);
        setPaquetesSeleccionados(selectedPackages);
      } catch (error) {
        console.error("Error al obtener datos:", error.response ? error.response.data : error.message);
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
    if (!formData.id_ruta) newErrors.id_ruta = "La ruta es requerida";
    if (!formData.id_vehiculo) newErrors.id_vehiculo = "El vehículo es requerido";
    if (!formData.fecha) newErrors.fecha = "La fecha es requerida";
    if (paquetesSeleccionados.length === 0) newErrors.paquetes = "Debe seleccionar al menos un paquete";
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
      const response = await axios.post(`${API_URL}/asignar-paquetes-ruta`, {
        id_ruta: formData.id_ruta,
        id_vehiculo: formData.id_vehiculo,
        fecha: formData.fecha,
        id_paquete: paquetesSeleccionados.map(p => p.id_paquete)
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        toast.success('Paquetes asignados exitosamente');
        localStorage.removeItem('paquetesParaAsignar'); 
        navigate('/GestionAsignarRutas');
      }
    } catch (error) {
      console.error("Error al asignar paquetes a la ruta:", error.response ? error.response.data : error.message);
      toast.error('Error del servidor al asignar paquetes a la ruta');
    }
  };

  const formatTamanoPaquete = (string) => {
    if (!string) return 'Desconocido';
    const replacements = {
      'pequeno': 'Pequeño',
      'mediano': 'Mediano',
      'grande': 'Grande'
    };
    return replacements[string.toLowerCase()] || string;
  };

  const contarPaquetesPorTamaño = () => {
    console.log("Paquetes a contar:", paquetesSeleccionados);
    const conteo = paquetesSeleccionados.reduce((acc, paquete) => {
      const tamano = formatTamanoPaquete(paquete.tamano_paquete);
      acc[tamano] = (acc[tamano] || 0) + 1;
      return acc;
    }, {});

    console.log("Conteo final:", conteo);
    return conteo;
  };

  const conteoPaquetes = contarPaquetesPorTamaño();

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
                            min={new Date().toISOString().split('T')[0]}
                            max={`${new Date().getFullYear()}-12-31`}
                          />
                          <FormFeedback>{errors.fecha}</FormFeedback>
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={12}>
                        <FormGroup>
                          <Label>Detalle de Paquetes Seleccionados</Label>
                          {paquetesSeleccionados.length > 0 ? (
                            <Table
                              bordered
                              responsive
                              size="sm"
                              className="mt-3"
                              style={{ width: '30%', marginLeft: '0' }} 
                            >
                              <thead>
                                <tr>
                                  <th style={{ padding: '0.25rem', fontSize: '1rem' }}>Tamaño</th> 
                                  <th style={{ padding: '0.25rem', fontSize: '1rem' }}>Cantidad</th> 
                                </tr>
                              </thead>
                              <tbody>
                                {Object.entries(conteoPaquetes).map(([tamano, cantidad]) => (
                                  <tr key={tamano}>
                                    <td style={{ padding: '0.25rem', fontSize: '1rem' }}>{tamano}</td> 
                                    <td style={{ padding: '0.25rem', fontSize: '1rem' }}>{cantidad}</td> 
                                  </tr>
                                ))}
                                <tr>
                                  <td style={{ padding: '0.25rem', fontSize: '1rem' }}><strong>Total</strong></td> 
                                  <td style={{ padding: '0.25rem', fontSize: '1rem' }}><strong>{paquetesSeleccionados.length}</strong></td>
                                </tr>
                              </tbody>
                            </Table>
                          ) : (
                            <p>No hay paquetes seleccionados</p>
                          )}
                          {errors.paquetes && <div className="text-danger">{errors.paquetes}</div>}
                        </FormGroup>
                      </Col>
                    </Row>
                    <Button color="primary" type="submit">
                      Asignar Paquetes
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
}
