import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Row,
  Col,
  Container,
  FormFeedback,
  Table
} from 'reactstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL;

const EditarAsignacionRuta = ({ asignacion, actualizarAsignacion, onAsignacionActualizada }) => {
  const [formData, setFormData] = useState({
    codigo_unico_asignacion: '',
    id_ruta: '',
    id_vehiculo: '',
    fecha: '',
    id_estado: '',
    paquetes: []
  });
  const [rutas, setRutas] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [paquetesDisponibles, setPaquetesDisponibles] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (asignacion) {
      setFormData({
        codigo_unico_asignacion: asignacion.codigo_unico_asignacion || '',
        id_ruta: asignacion.id_ruta || '',
        id_vehiculo: asignacion.id_vehiculo || '',
        fecha: asignacion.fecha ? new Date(asignacion.fecha).toISOString().split('T')[0] : '',
        id_estado: asignacion.id_estado || '',
        paquetes: asignacion.paquetes || []
      });
    }
    fetchDropdownData();
  }, [asignacion]);

  const fetchDropdownData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [rutasRes, vehiculosRes, estadosRes, paquetesRes] = await Promise.all([
        axios.get(`${API_URL}/dropdown/get_rutas`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/dropdown/get_vehiculos`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/dropdown/get_estado_rutas`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/dropdown/get_paquetes_sin_asignar`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setRutas(rutasRes.data.rutas || []);
      setVehiculos(vehiculosRes.data.vehiculos || []);
      setEstados(estadosRes.data.estado_rutas || []);
      setPaquetesDisponibles(paquetesRes.data.paquetes || []);
    } catch (error) {
      console.error("Error al obtener datos:", error);
      toast.error("Error al cargar los datos necesarios");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handlePaqueteChange = (index, e) => {
    const { name, value } = e.target;
    const updatedPaquetes = [...formData.paquetes];
    updatedPaquetes[index] = { ...updatedPaquetes[index], [name]: value };
    setFormData(prev => ({ ...prev, paquetes: updatedPaquetes }));
  };

  const agregarPaquete = () => {
    setFormData(prev => ({
      ...prev,
      paquetes: [...prev.paquetes, { id: '', prioridad: 1 }]
    }));
  };

  const removerPaquete = (index) => {
    const updatedPaquetes = formData.paquetes.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, paquetes: updatedPaquetes }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.id_ruta) newErrors.id_ruta = "La ruta es requerida";
    if (!formData.id_vehiculo) newErrors.id_vehiculo = "El vehículo es requerido";
    if (!formData.fecha) newErrors.fecha = "La fecha es requerida";
    if (!formData.id_estado) newErrors.id_estado = "El estado es requerido";
    if (formData.paquetes.length === 0) newErrors.paquetes = "Debe asignar al menos un paquete";
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
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/asignacionrutas/${asignacion.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Asignación de ruta actualizada con éxito");
      actualizarAsignacion(response.data);
      if (onAsignacionActualizada) {
        onAsignacionActualizada();
      }
    } catch (error) {
      console.error("Error al actualizar la asignación de ruta:", error);
      toast.error("Error al actualizar la asignación de ruta");
    }
  };

  return (
    <Container fluid>
      <Card>
        <CardHeader>
          <h3>Editar Asignación de Ruta</h3>
        </CardHeader>
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
                    readOnly
                  />
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
                    {rutas.map(ruta => (
                      <option key={ruta.id} value={ruta.id}>{ruta.nombre}</option>
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
                    {vehiculos.map(vehiculo => (
                      <option key={vehiculo.id} value={vehiculo.id}>{vehiculo.placa}</option>
                    ))}
                  </Input>
                  <FormFeedback>{errors.id_vehiculo}</FormFeedback>
                </FormGroup>
              </Col>
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
            </Row>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="id_estado">Estado</Label>
                  <Input
                    type="select"
                    name="id_estado"
                    id="id_estado"
                    value={formData.id_estado}
                    onChange={handleInputChange}
                    invalid={!!errors.id_estado}
                  >
                    <option value="">Seleccione un estado</option>
                    {estados.map(estado => (
                      <option key={estado.id} value={estado.id}>{estado.estado}</option>
                    ))}
                  </Input>
                  <FormFeedback>{errors.id_estado}</FormFeedback>
                </FormGroup>
              </Col>
            </Row>
            <h4 className="mt-4">Paquetes Asignados</h4>
            <Table>
              <thead>
                <tr>
                  <th>Paquete</th>
                  <th>Prioridad</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {formData.paquetes.map((paquete, index) => (
                  <tr key={index}>
                    <td>
                      <Input
                        type="select"
                        name="id"
                        value={paquete.id}
                        onChange={(e) => handlePaqueteChange(index, e)}
                      >
                        <option value="">Seleccione un paquete</option>
                        {paquetesDisponibles.map(p => (
                          <option key={p.id} value={p.id}>{p.asignacion}</option>
                        ))}
                      </Input>
                    </td>
                    <td>
                      <Input
                        type="number"
                        name="prioridad"
                        value={paquete.prioridad}
                        onChange={(e) => handlePaqueteChange(index, e)}
                      />
                    </td>
                    <td>
                      <Button color="danger" onClick={() => removerPaquete(index)}>Eliminar</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Button color="primary" onClick={agregarPaquete}>Agregar Paquete</Button>
            {errors.paquetes && <div className="text-danger mt-2">{errors.paquetes}</div>}
            <div className="mt-4">
              <Button color="success" type="submit">Guardar Cambios</Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </Container>
  );
};

export default EditarAsignacionRuta;