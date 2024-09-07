import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import "/src/styles/Empleados.css";
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const ModalEditarAsignacionRuta = ({ isOpen, toggle, asignacion, guardarCambios }) => {
  const [formData, setFormData] = useState({
    codigo_unico_asignacion: "",
    id_ruta: "",
    id_vehiculo: "",
    id_paquete: "",
    fecha: "",
    id_estado: ""
  });
  const [rutas, setRutas] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [paquetes, setPaquetes] = useState([]);
  const [estados, setEstados] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (asignacion) {
      setFormData({
        ...asignacion,
        fecha: asignacion.fecha.split('T')[0] // Formatear la fecha
      });
    }
  }, [asignacion]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
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
      }
    };

    fetchData();
  }, []);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    guardarCambios(formData);
  };

  return (
    <Modal show={isOpen} onHide={toggle} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Editar Asignación de Ruta</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Código de Asignación</Form.Label>
                <Form.Control
                  type="text"
                  name="codigo_unico_asignacion"
                  value={formData.codigo_unico_asignacion}
                  onChange={handleInputChange}
                  isInvalid={!!errors.codigo_unico_asignacion}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.codigo_unico_asignacion}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Ruta</Form.Label>
                <Form.Control
                  as="select"
                  name="id_ruta"
                  value={formData.id_ruta}
                  onChange={handleInputChange}
                  isInvalid={!!errors.id_ruta}
                >
                  <option value="">Seleccione una ruta</option>
                  {rutas.map((ruta) => (
                    <option key={ruta.id} value={ruta.id}>
                      {ruta.nombre}
                    </option>
                  ))}
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                  {errors.id_ruta}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Vehículo</Form.Label>
                <Form.Control
                  as="select"
                  name="id_vehiculo"
                  value={formData.id_vehiculo}
                  onChange={handleInputChange}
                  isInvalid={!!errors.id_vehiculo}
                >
                  <option value="">Seleccione un vehículo</option>
                  {vehiculos.map((vehiculo) => (
                    <option key={vehiculo.id} value={vehiculo.id}>
                      {vehiculo.placa}
                    </option>
                  ))}
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                  {errors.id_vehiculo}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Paquete</Form.Label>
                <Form.Control
                  as="select"
                  name="id_paquete"
                  value={formData.id_paquete}
                  onChange={handleInputChange}
                  isInvalid={!!errors.id_paquete}
                >
                  <option value="">Seleccione un paquete</option>
                  {paquetes.map((paquete) => (
                    <option key={paquete.id} value={paquete.id}>
                      {paquete.codigo_unico}
                    </option>
                  ))}
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                  {errors.id_paquete}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Fecha</Form.Label>
                <Form.Control
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleInputChange}
                  isInvalid={!!errors.fecha}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.fecha}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Estado</Form.Label>
                <Form.Control
                  as="select"
                  name="id_estado"
                  value={formData.id_estado}
                  onChange={handleInputChange}
                >
                  {estados.map((estado) => (
                    <option key={estado.id} value={estado.id}>
                      {estado.nombre}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={toggle}>Cancelar</Button>
        <Button variant="primary" onClick={handleSubmit}>Guardar Cambios</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEditarAsignacionRuta;