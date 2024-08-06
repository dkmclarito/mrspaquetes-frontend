import React, { useState, useEffect } from "react";
import { Card, CardBody, Container, Form, FormGroup, Label, Input, Button, FormFeedback, Row, Col } from "reactstrap";
import Breadcrumbs from "../components/Paquetes/Common/Breadcrumbs";
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import "../styles/Paquetes.css";

const AgregarPaquete = () => {
  const [tiposPaquete, setTiposPaquete] = useState([]);
  const [empaques, setEmpaques] = useState([]);
  const [estadosPaquete, setEstadosPaquete] = useState([]);
  const [nuevoPaquete, setNuevoPaquete] = useState({
    id_tipo_paquete: '',
    id_empaque: '',
    peso: '',
    id_estado_paquete: '',
    fecha_envio: '',
    fecha_entrega_estimada: '',
    descripcion_contenido: ''
  });

  const [errors, setErrors] = useState({
    peso: '',
    fecha_envio: '',
    fecha_entrega_estimada: '',
    id_tipo_paquete: '',
    id_empaque: '',
    id_estado_paquete: '',
    descripcion_contenido: ''
  });

  const token = localStorage.getItem('token');
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return { year, month, day };
  };

  const { year: currentYear, month: currentMonth, day: currentDay } = getCurrentDate();

  useEffect(() => {
    setNuevoPaquete(prev => ({
      ...prev,
      fecha_envio: `${currentYear}-${currentMonth}-${currentDay}`,
      fecha_entrega_estimada: `${currentYear}-${currentMonth}-${currentDay}`
    }));
  }, [currentDay, currentMonth, currentYear]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [tiposPaqueteRes, empaquesRes, estadosPaqueteRes] = await Promise.all([
          fetch(`${API_URL}/dropdown/get_tipo_paquete`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/dropdown/get_empaques`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/dropdown/get_estado_paquete`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (!tiposPaqueteRes.ok || !empaquesRes.ok || !estadosPaqueteRes.ok) {
          throw new Error('Error en la respuesta del servidor');
        }

        const tiposPaqueteData = await tiposPaqueteRes.json();
        const empaquesData = await empaquesRes.json();
        const estadosPaqueteData = await estadosPaqueteRes.json();

        setTiposPaquete(tiposPaqueteData.tipo_paquete || []);
        setEmpaques(empaquesData.empaques || []);
        setEstadosPaquete(estadosPaqueteData.estado_paquetes || []);
        
      } catch (error) {
        console.error("Error al obtener los datos del dropdown:", error);
        toast.error('Error al obtener los datos del dropdown');
      }
    };

    fetchDropdownData();
  }, [token, API_URL]);

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'peso':
        const pesoPattern = /^\d{1,6}(,\d{3})*(\.\d{0,2})?$/;
        if (!pesoPattern.test(value)) {
          error = 'Formato de peso inválido.';
        }
        break;

      case 'fecha_envio':
      case 'fecha_entrega_estimada':
        const [year, month, day] = value.split('-').map(Number);
        if (month < 1 || month > 12) {
          error = 'El mes debe estar entre 1 y 12.';
        } else if (day < 1 || day > 31) {
          error = 'El día debe estar entre 1 y 31.';
        } else if (name === 'fecha_envio' && new Date(value) > new Date()) {
          error = 'La fecha de envío no puede ser futura.';
        } else if (name === 'fecha_entrega_estimada' && new Date(value) < new Date(nuevoPaquete.fecha_envio)) {
          error = 'La fecha de entrega estimada no puede ser anterior a la fecha de envío.';
        }
        break;

      case 'id_tipo_paquete':
      case 'id_empaque':
      case 'id_estado_paquete':
        if (!value) {
          error = 'Debe seleccionar una opción.';
        }
        break;

      case 'descripcion_contenido':
        if (!value.trim()) {
          error = 'Debe rellenar este campo.';
        }
        break;

      default:
        break;
    }

    return error;
  };

  const formatPeso = (value) => {
    let [integerPart, decimalPart] = value.replace(/,/g, '').split('.');

    if (integerPart.length > 3) {
      integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    return decimalPart !== undefined ? `${integerPart}.${decimalPart}` : integerPart;
  };

  const handlePesoChange = (e) => {
    const { value } = e.target;
    const validChars = value.replace(/[^0-9.,]/g, '');
    let [integerPart, decimalPart] = validChars.split('.');
    
    integerPart = integerPart.slice(0, 7);
    
    if (decimalPart) {
      decimalPart = decimalPart.slice(0, 2);
    }

    const formattedPeso = formatPeso(integerPart + (decimalPart !== undefined ? '.' + decimalPart : ''));

    setNuevoPaquete(prev => ({
      ...prev,
      peso: formattedPeso
    }));

    const error = validateField('peso', formattedPeso);
    setErrors(prev => ({
      ...prev,
      peso: error
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name !== 'peso') {
      setNuevoPaquete(prev => ({
        ...prev,
        [name]: value
      }));
    }

    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let valid = true;
    let errorsTemp = { ...errors };

    Object.keys(nuevoPaquete).forEach(key => {
      const error = validateField(key, nuevoPaquete[key]);
      if (error) {
        errorsTemp[key] = error;
        valid = false;
      }
    });

    setErrors(errorsTemp);

    if (!valid) {
      toast.error("Por favor, corrija los errores en el formulario antes de enviar.", {
        position: "bottom-right",
        autoClose: 1000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/paquete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(nuevoPaquete),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = `Error: ${errorData?.message || response.statusText}`;
        throw new Error(errorMessage);
      }

      console.log('Paquete registrado exitosamente');

      toast.success('¡Paquete registrado con éxito!', {
        position: "bottom-right",
        autoClose: 300,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });

      setTimeout(() => {
        navigate('/GestionPaquetes');
      }, 1000);

    } catch (error) {
      console.error('Error al registrar el paquete:', error);
      toast.error(`Error al registrar el paquete: ${error.message}`, {
        position: "bottom-right",
        autoClose: 1000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });
    }
  };
  return (
    <Container fluid>
      <Breadcrumbs title="Registrar Paquete" breadcrumbItem="Nuevo Paquete" />
      <Card>
        <CardBody>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="id_tipo_paquete">Tipo de Paquete</Label>
                  <Input
                    type="select"
                    name="id_tipo_paquete"
                    id="id_tipo_paquete"
                    value={nuevoPaquete.id_tipo_paquete}
                    onChange={handleChange}
                    invalid={!!errors.id_tipo_paquete}
                  >
                    <option value="">Seleccione</option>
                    {tiposPaquete.map(tipo => (
                      <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                    ))}
                  </Input>
                  <FormFeedback>{errors.id_tipo_paquete}</FormFeedback>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label for="id_empaque">Empaque</Label>
                  <Input
                    type="select"
                    name="id_empaque"
                    id="id_empaque"
                    value={nuevoPaquete.id_empaque}
                    onChange={handleChange}
                    invalid={!!errors.id_empaque}
                  >
                    <option value="">Seleccione</option>
                    {empaques.map(empaque => (
                      <option key={empaque.id} value={empaque.id}>{empaque.empaquetado}</option>
                    ))}
                  </Input>
                  <FormFeedback>{errors.id_empaque}</FormFeedback>
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="peso">Peso (Libras)</Label>
                  <Input
                    type="text"
                    name="peso"
                    id="peso"
                    value={nuevoPaquete.peso}
                    onChange={handlePesoChange}
                    invalid={!!errors.peso}
                  />
                  <FormFeedback>{errors.peso}</FormFeedback>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label for="id_estado_paquete">Estado del Paquete</Label>
                  <Input
                    type="select"
                    name="id_estado_paquete"
                    id="id_estado_paquete"
                    value={nuevoPaquete.id_estado_paquete}
                    onChange={handleChange}
                    invalid={!!errors.id_estado_paquete}
                  >
                    <option value="">Seleccione</option>
                    {estadosPaquete.map(estado => (
                      <option key={estado.id} value={estado.id}>{estado.nombre}</option>
                    ))}
                  </Input>
                  <FormFeedback>{errors.id_estado_paquete}</FormFeedback>
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="fecha_envio">Fecha de Envío</Label>
                  <Input
                    type="date"
                    name="fecha_envio"
                    id="fecha_envio"
                    value={nuevoPaquete.fecha_envio}
                    onChange={handleChange}
                    min={`${currentYear}-01-01`}
                    max={`${currentYear}-12-31`}
                    invalid={!!errors.fecha_envio}
                  />
                  <FormFeedback>{errors.fecha_envio}</FormFeedback>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label for="fecha_entrega_estimada">Fecha de Entrega Estimada</Label>
                  <Input
                    type="date"
                    name="fecha_entrega_estimada"
                    id="fecha_entrega_estimada"
                    value={nuevoPaquete.fecha_entrega_estimada}
                    onChange={handleChange}
                    min={`${currentYear}-01-01`}
                    max={`${currentYear}-12-31`}
                    invalid={!!errors.fecha_entrega_estimada}
                  />
                  <FormFeedback>{errors.fecha_entrega_estimada}</FormFeedback>
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <FormGroup>
                  <Label for="descripcion_contenido">Descripción del Contenido</Label>
                  <Input
                    type="textarea"
                    name="descripcion_contenido"
                    id="descripcion_contenido"
                    value={nuevoPaquete.descripcion_contenido}
                    onChange={handleChange}
                    invalid={!!errors.descripcion_contenido}
                  />
                  <FormFeedback>{errors.descripcion_contenido}</FormFeedback>
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md="12">
                <Button color="primary" type="submit">
                  Registrar
                </Button>
                <Button color="secondary" className="ms-2" onClick={() => navigate('/GestionPaquetes')}>
                  Salir
                </Button>
              </Col>
            </Row>
          </Form>
        </CardBody>
      </Card>
      <ToastContainer />
    </Container>
  );
};

export default AgregarPaquete;
