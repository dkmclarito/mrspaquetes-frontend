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
  Alert,
} from "reactstrap";
import Breadcrumbs from "../components/AsignacionRutas/Common/Breadcrumbs";
import AuthService from "../services/authService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const PACKAGE_SIZES = {
  SMALL: 'Pequeño',
  MEDIUM: 'Mediano',
  LARGE: 'Grande'
};

const SIZE_EQUIVALENTS = {
  [PACKAGE_SIZES.SMALL]: 1,
  [PACKAGE_SIZES.MEDIUM]: 2,
  [PACKAGE_SIZES.LARGE]: 4
};

export default function AsignarRutas() {
  const [formData, setFormData] = useState({
    id_vehiculo: "",
    fecha: "",
    fecha_programada: "",
  });
  const [errors, setErrors] = useState({});
  const [vehiculos, setVehiculos] = useState([]);
  const [paquetesSeleccionados, setPaquetesSeleccionados] = useState([]);
  const [capacidadExcedida, setCapacidadExcedida] = useState(false);
  const [excesoPaquetes, setExcesoPaquetes] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token') || AuthService.getToken?.() || '';

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        toast.error("No se encontró token de autenticación");
        return;
      }
      
      try {
        const vehiculosRes = await axios.get(`${API_URL}/dropdown/get_vehiculos`, { headers: { Authorization: `Bearer ${token}` } });
        setVehiculos(vehiculosRes.data.vehiculos || []);

        const selectedPackages = JSON.parse(localStorage.getItem('paquetesParaAsignar') || '[]');
        console.log("Paquetes seleccionados desde localStorage:", selectedPackages);
        setPaquetesSeleccionados(selectedPackages.map((paquete, index) => ({
          ...paquete,
          prioridad: (index + 1).toString() // Set initial priority from 1 to n
        })));
      } catch (error) {
        console.error("Error al obtener datos:", error.response ? error.response.data : error.message);
        toast.error("Error al cargar los datos necesarios");
      }
    };

    fetchData();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
      fecha_programada: name === 'fecha' ? value : prevData.fecha_programada
    }));
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
    if (name === 'id_vehiculo') {
      checkVehicleCapacity(value);
    }
  };

  const handlePaqueteChange = (index, field, value) => {
    const updatedPaquetes = [...paquetesSeleccionados];
    if (field === 'prioridad') {
      const numValue = parseInt(value, 10);
      if (numValue < 1 || numValue > paquetesSeleccionados.length) {
        return; // Ignore invalid values
      }
      updatedPaquetes[index][field] = numValue.toString();
    } else {
      updatedPaquetes[index][field] = value;
    }
    setPaquetesSeleccionados(updatedPaquetes);
    checkVehicleCapacity(formData.id_vehiculo);
  };

  const checkVehicleCapacity = (vehicleId) => {
    const selectedVehicle = vehiculos.find(v => v.id.toString() === vehicleId);
    if (!selectedVehicle) return;

    const vehicleCapacity = selectedVehicle.capacidad || 40;
    const totalEquivalentPackages = paquetesSeleccionados.reduce((total, paquete) => {
      return total + SIZE_EQUIVALENTS[formatTamanoPaquete(paquete.tamano_paquete)];
    }, 0);

    if (totalEquivalentPackages > vehicleCapacity) {
      setCapacidadExcedida(true);
      setExcesoPaquetes(totalEquivalentPackages - vehicleCapacity);
    } else {
      setCapacidadExcedida(false);
      setExcesoPaquetes(0);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.id_vehiculo) newErrors.id_vehiculo = "El vehículo es requerido";
    if (!formData.fecha) newErrors.fecha = "La fecha es requerida";
    if (paquetesSeleccionados.length === 0) newErrors.paquetes = "Debe seleccionar al menos un paquete";
    if (capacidadExcedida) newErrors.capacidad = "La capacidad del vehículo ha sido excedida";

    // Validación de prioridades
    const prioridades = new Set();
    paquetesSeleccionados.forEach((paquete, index) => {
      const prioridadNum = parseInt(paquete.prioridad, 10);
      if (!prioridadNum || prioridadNum < 1 || prioridadNum > paquetesSeleccionados.length) {
        newErrors[`prioridad_${index}`] = `La prioridad debe ser un número entre 1 y ${paquetesSeleccionados.length}`;
      } else if (prioridades.has(prioridadNum)) {
        newErrors[`prioridad_${index}`] = "La prioridad no puede repetirse";
      } else {
        prioridades.add(prioridadNum);
      }
    });

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        id_bodega: 1,
        fecha_programada: formData.fecha_programada,
        id_vehiculo: parseInt(formData.id_vehiculo),
        paquetes: paquetesSeleccionados.map(p => ({
          id: p.id_paquete,
          prioridad: parseInt(p.prioridad)
        }))
      };

      console.log('Sending request with payload:', payload);

      const response = await axios.post(`${API_URL}/asignacionrutas`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      console.log('Response:', response);

      if (response.status === 200 || response.status === 201) {
        toast.success('Paquetes asignados exitosamente');
        localStorage.removeItem('paquetesParaAsignar');
        navigate('/GestionAsignarRutas');
      } else {
        throw new Error('Respuesta inesperada del servidor');
      }
    } catch (error) {
      console.error("Full error object:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error status:", error.response.status);
        console.error("Error headers:", error.response.headers);
        
        if (error.response.status === 400) {
          toast.error('Error de validación: Verifique los datos ingresados');
        } else if (error.response.status === 401) {
          toast.error('Sesión expirada. Por favor, inicie sesión nuevamente');
        } else if (error.response.status === 500) {
          toast.error('Error del servidor. Por favor, intente más tarde');
        } else {
          toast.error(`Error: ${error.response.data.message || 'Ocurrió un error al asignar paquetes a la ruta'}`);
        }
      } else if (error.request) {
        console.error("No response received:", error.request);
        toast.error('No se recibió respuesta del servidor. Verifique su conexión');
      } else {
        console.error("Error setting up request:", error.message);
        toast.error('Error al preparar la solicitud');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTamanoPaquete = (string) => {
    if (!string) return 'Desconocido';
    const replacements = {
      'pequeno': PACKAGE_SIZES.SMALL,
      'mediano': PACKAGE_SIZES.MEDIUM,
      'grande': PACKAGE_SIZES.LARGE
    };
    return replacements[string.toLowerCase()] || string;
  };

  const handleRemovePaquete = (id_paquete) => {
    const updatedPaquetes = paquetesSeleccionados.filter(p => p.id_paquete !== id_paquete);
    // Reassign priorities after removal
    const reassignedPaquetes = updatedPaquetes.map((p, index) => ({
      ...p,
      prioridad: (index + 1).toString()
    }));
    setPaquetesSeleccionados(reassignedPaquetes);
    localStorage.setItem('paquetesParaAsignar', JSON.stringify(reassignedPaquetes));
    checkVehicleCapacity(formData.id_vehiculo);
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
                                {vehiculo.placa} - Capacidad: {vehiculo.capacidad || 40} paquetes pequeños
                              </option>
                            ))}
                          </Input>
                          <FormFeedback>{errors.id_vehiculo}</FormFeedback>
                        </FormGroup>
                      </Col>
                      <Col md={6}>
                        <FormGroup>
                          <Label for="fecha">Fecha Programada</Label>
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
                    {capacidadExcedida && (
                      <Alert color="danger">
                        La capacidad del vehículo ha sido excedida por {excesoPaquetes} paquetes pequeños equivalentes.
                      </Alert>
                    )}
                    <Row>
                      <Col md={12}>
                        <FormGroup>
                          <Label>Detalle de Paquetes Seleccionados</Label>
                          {paquetesSeleccionados.length > 0 ? (
                            <Table responsive bordered>
                              <thead>
                                <tr>
                                  <th>ID Paquete</th>
                                  <th>Tamaño</th>
                                  <th>Dirección</th>
                                  <th>Departamento</th>
                                  <th>Municipio</th>
                                  <th>Prioridad</th>
                                  <th>Acciones</th>
                                </tr>
                              </thead>
                              <tbody>
                                {paquetesSeleccionados.map((paquete, index) => (
                                  <tr key={paquete.id_paquete}>
                                    <td>{paquete.id_paquete}</td>
                                    <td>{formatTamanoPaquete(paquete.tamano_paquete)}</td>
                                    <td>{paquete.direccion}</td>
                                    <td>{paquete.departamento}</td>
                                    <td>{paquete.municipio}</td>
                                    <td>
                                      <Input
                                        type="number"
                                        value={paquete.prioridad}
                                        onChange={(e) => handlePaqueteChange(index, 'prioridad', e.target.value)}
                                        min="1"
                                        max={paquetesSeleccionados.length}
                                        invalid={!!errors[`prioridad_${index}`]}
                                      />
                                      <FormFeedback>{errors[`prioridad_${index}`]}</FormFeedback>
                                    </td>
                                    <td>
                                      <Button color="danger" size="sm" onClick={() => handleRemovePaquete(paquete.id_paquete)}>
                                        Quitar
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          ) : (
                            <p>No hay paquetes seleccionados</p>
                          )}
                          {errors.paquetes && <div className="text-danger">{errors.paquetes}</div>}
                        </FormGroup>
                      </Col>
                    </Row>
                    <Button color="primary" type="submit" disabled={isSubmitting || capacidadExcedida}>
                      {isSubmitting ? 'Asignando...' : 'Asignar Paquetes'}
                    </Button>
                    <Button className="ms-2" color="secondary" onClick={() => navigate('/SeleccionarPaquetes')} disabled={isSubmitting}>
                      Regresar a Selección de Paquetes
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