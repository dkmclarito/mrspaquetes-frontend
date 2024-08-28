import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Container,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  FormFeedback,
  Row,
  Col,
  CardHeader
} from "reactstrap";
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';

export default function DatosPaquete() {
  const { idCliente } = useParams();
  const [cliente, setCliente] = useState(null);
  const [tiposPaquete, setTiposPaquete] = useState([]);
  const [empaques, setEmpaques] = useState([]);
  const [estadosPaquete, setEstadosPaquete] = useState([]);
  const [detalles, setDetalles] = useState([{
    id_tipo_paquete: '',
    id_empaque: '',
    peso: '',
    id_estado_paquete: '',
    fecha_envio: '',
    fecha_entrega_estimada: '',
    fecha_entrega: '',
    descripcion_contenido: '',
    id_tipo_entrega: '',
    instrucciones_entrega: '',
    descripcion: '',
    precio: '',
  }]);
  const [errors, setErrors] = useState({
    detalles: []
  });

  const token = localStorage.getItem('token');
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clienteRes, tiposPaqueteRes, empaquesRes, estadosPaqueteRes] = await Promise.all([
          axios.get(`${API_URL}/clientes/${idCliente}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/dropdown/get_tipo_paquete`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/dropdown/get_empaques`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/dropdown/get_estado_paquete`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        setCliente(clienteRes.data.cliente || {});
        setTiposPaquete(tiposPaqueteRes.data.tipo_paquete || []);
        setEmpaques(empaquesRes.data.empaques || []);
        setEstadosPaquete(estadosPaqueteRes.data.estado_paquetes || []);

      } catch (error) {
        console.error("Error al obtener los datos:", error);
        toast.error('Error al obtener los datos');
      }
    };

    fetchData();
  }, [idCliente, token, API_URL]);

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'peso':
      case 'precio':
        if (isNaN(value) || value < 0) {
          error = 'El valor debe ser un número positivo.';
        }
        break;

      case 'id_tipo_paquete':
      case 'id_empaque':
      case 'id_estado_paquete':
      case 'id_tipo_entrega':
        if (!value) {
          error = 'Debe seleccionar una opción.';
        }
        break;

      case 'descripcion_contenido':
      case 'instrucciones_entrega':
      case 'descripcion':
        if (!value.trim()) {
          error = 'Debe rellenar este campo.';
        }
        break;

      case 'fecha_envio':
      case 'fecha_entrega_estimada':
      case 'fecha_entrega':
        if (!value) {
          error = 'Debe seleccionar una fecha.';
        }
        break;

      default:
        break;
    }

    return error;
  };

  const handleChangeDetalle = (index, e) => {
    const { name, value } = e.target;
    const updatedDetalles = [...detalles];
    updatedDetalles[index] = { ...updatedDetalles[index], [name]: value };
    setDetalles(updatedDetalles);
    
    const error = validateField(name, value);
    setErrors(prev => {
      const newDetallesErrors = [...(prev.detalles || [])];
      newDetallesErrors[index] = { ...newDetallesErrors[index], [name]: error };
      return { ...prev, detalles: newDetallesErrors };
    });
  };

  const agregarDetalle = () => {
    setDetalles([...detalles, {
      id_tipo_paquete: '',
      id_empaque: '',
      peso: '',
      id_estado_paquete: '',
      fecha_envio: '',
      fecha_entrega_estimada: '',
      fecha_entrega: '',
      descripcion_contenido: '',
      id_tipo_entrega: '',
      instrucciones_entrega: '',
      descripcion: '',
      precio: '',
    }]);
    setErrors(prev => ({
      ...prev,
      detalles: [...prev.detalles, {}]
    }));
  };

  const removerDetalle = (index) => {
    setDetalles(detalles.filter((_, idx) => idx !== index));
    setErrors(prev => ({
      ...prev,
      detalles: prev.detalles.filter((_, idx) => idx !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    let valid = true;
    let errorsTemp = { ...errors };
  
    // Validate detalles fields
    errorsTemp.detalles = detalles.map(detalle => {
      const detalleErrors = {};
      Object.keys(detalle).forEach(key => {
        const error = validateField(key, detalle[key]);
        if (error) {
          detalleErrors[key] = error;
          valid = false;
        } else {
          detalleErrors[key] = '';
        }
      });
      return detalleErrors;
    });
  
    setErrors(errorsTemp);
  
    if (!valid) {
      toast.error("Por favor, corrija los errores en el formulario antes de enviar.");
      return;
    }
  
    // Calculate total price
    const totalPrice = detalles.reduce((sum, detalle) => sum + parseFloat(detalle.precio || 0), 0);

    // Navigate to GenerarOrden page with data
    navigate(`/GenerarOrden/${idCliente}`, { 
        state: { 
          detalles: detalles,
          totalPrice: totalPrice
        } 
      });
  };

  return (
    <Container fluid>
      <ToastContainer />
      <Card>
        <CardHeader>
          <h4>Agregar datos de los Paquetes</h4>
          {cliente && (
            <h5>Cliente: {cliente.nombre} {cliente.apellido}</h5>
          )}
        </CardHeader>
        <CardBody>
          <Form onSubmit={handleSubmit}>
            {detalles.map((detalle, index) => (
              <Card key={index} className="mb-3">
                <CardBody>
                  <Row>
                    <Col md={4}>
                      <FormGroup>
                        <Label for={`id_tipo_paquete_${index}`}>Tipo de Paquete</Label>
                        <Input
                          type="select"
                          name="id_tipo_paquete"
                          id={`id_tipo_paquete_${index}`}
                          value={detalle.id_tipo_paquete}
                          onChange={(e) => handleChangeDetalle(index, e)}
                          invalid={!!(errors.detalles[index] && errors.detalles[index].id_tipo_paquete)}
                        >
                          <option value="">Seleccione un tipo de paquete</option>
                          {tiposPaquete.map(tipo => (
                            <option key={tipo.id} value={tipo.id}>
                              {tipo.nombre}
                            </option>
                          ))}
                        </Input>
                        {errors.detalles[index]?.id_tipo_paquete && <FormFeedback>{errors.detalles[index].id_tipo_paquete}</FormFeedback>}
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup>
                        <Label for={`id_empaque_${index}`}>Empaque</Label>
                        <Input
                          type="select"
                          name="id_empaque"
                          id={`id_empaque_${index}`}
                          value={detalle.id_empaque}
                          onChange={(e) => handleChangeDetalle(index, e)}
                          invalid={!!(errors.detalles[index] && errors.detalles[index].id_empaque)}
                        >
                          <option value="">Seleccione un empaque</option>
                          {empaques.map(empaque => (
                            <option key={empaque.id} value={empaque.id}>
                              {empaque.empaquetado}
                            </option>
                          ))}
                        </Input>
                        {errors.detalles[index]?.id_empaque && <FormFeedback>{errors.detalles[index].id_empaque}</FormFeedback>}
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup>
                        <Label for={`peso_${index}`}>Peso</Label>
                        <Input
                          type="number"
                          name="peso"
                          id={`peso_${index}`}
                          value={detalle.peso}
                          onChange={(e) => handleChangeDetalle(index, e)}
                          invalid={!!(errors.detalles[index] && errors.detalles[index].peso)}
                        />
                        {errors.detalles[index]?.peso && <FormFeedback>{errors.detalles[index].peso}</FormFeedback>}
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={4}>
                      <FormGroup>
                        <Label for={`id_estado_paquete_${index}`}>Estado del Paquete</Label>
                        <Input
                          type="select"
                          name="id_estado_paquete"
                          id={`id_estado_paquete_${index}`}
                          value={detalle.id_estado_paquete}
                          onChange={(e) => handleChangeDetalle(index, e)}
                          invalid={!!(errors.detalles[index] && errors.detalles[index].id_estado_paquete)}
                        >
                          <option value="">Seleccione un estado</option>
                          {estadosPaquete.map(estado => (
                            <option key={estado.id} value={estado.id}>
                              {estado.nombre}
                            </option>
                          ))}
                        </Input>
                        {errors.detalles[index]?.id_estado_paquete && <FormFeedback>{errors.detalles[index].id_estado_paquete}</FormFeedback>}
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup>
                        <Label for={`fecha_envio_${index}`}>Fecha de Envío</Label>
                        <Input
                          type="date"
                          name="fecha_envio"
                          id={`fecha_envio_${index}`}
                          value={detalle.fecha_envio}
                          onChange={(e) => handleChangeDetalle(index, e)}
                          invalid={!!(errors.detalles[index] && errors.detalles[index].fecha_envio)}
                        />
                        {errors.detalles[index]?.fecha_envio && <FormFeedback>{errors.detalles[index].fecha_envio}</FormFeedback>}
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup>
                        <Label for={`fecha_entrega_estimada_${index}`}>Fecha de Entrega Estimada</Label>
                        <Input
                          type="date"
                          name="fecha_entrega_estimada"
                          id={`fecha_entrega_estimada_${index}`}
                          value={detalle.fecha_entrega_estimada}
                          onChange={(e) => handleChangeDetalle(index, e)}
                          invalid={!!(errors.detalles[index] && errors.detalles[index].fecha_entrega_estimada)}
                        />
                        {errors.detalles[index]?.fecha_entrega_estimada && <FormFeedback>{errors.detalles[index].fecha_entrega_estimada}</FormFeedback>}
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={4}>
                      <FormGroup>
                        <Label for={`fecha_entrega_${index}`}>Fecha de Entrega</Label>
                        <Input
                          type="date"
                          name="fecha_entrega"
                          id={`fecha_entrega_${index}`}
                          value={detalle.fecha_entrega}
                          onChange={(e) => handleChangeDetalle(index, e)}
                          invalid={!!(errors.detalles[index] && errors.detalles[index].fecha_entrega)}
                        />
                        {errors.detalles[index]?.fecha_entrega && <FormFeedback>{errors.detalles[index].fecha_entrega}</FormFeedback>}
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup>
                        <Label for={`descripcion_contenido_${index}`}>Descripción del Contenido</Label>
                        <Input
                          type="text"
                          name="descripcion_contenido"
                          id={`descripcion_contenido_${index}`}
                          value={detalle.descripcion_contenido}
                          onChange={(e) => handleChangeDetalle(index, e)}
                          invalid={!!(errors.detalles[index] && errors.detalles[index].descripcion_contenido)}
                        />
                        {errors.detalles[index]?.descripcion_contenido && <FormFeedback>{errors.detalles[index].descripcion_contenido}</FormFeedback>}
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup>
                        <Label for={`id_tipo_entrega_${index}`}>Tipo de Entrega</Label>
                        <Input
                          type="select"
                          name="id_tipo_entrega"
                          id={`id_tipo_entrega_${index}`}
                          value={detalle.id_tipo_entrega}
                          onChange={(e) => handleChangeDetalle(index, e)}
                          invalid={!!(errors.detalles[index] && errors.detalles[index].id_tipo_entrega)}
                        >
                          <option value="">Seleccione un tipo de entrega</option>
                          <option value="1">Entrega Normal</option>
                          <option value="2">Entrega Express</option>
                        </Input>
                        {errors.detalles[index]?.id_tipo_entrega && <FormFeedback>{errors.detalles[index].id_tipo_entrega}</FormFeedback>}
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={4}>
                      <FormGroup>
                        <Label for={`instrucciones_entrega_${index}`}>Instrucciones de Entrega</Label>
                        <Input
                          type="text"
                          name="instrucciones_entrega"
                          id={`instrucciones_entrega_${index}`}
                          value={detalle.instrucciones_entrega}
                          onChange={(e) => handleChangeDetalle(index, e)}
                          invalid={!!(errors.detalles[index] && errors.detalles[index].instrucciones_entrega)}
                        />
                        {errors.detalles[index]?.instrucciones_entrega && <FormFeedback>{errors.detalles[index].instrucciones_entrega}</FormFeedback>}
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup>
                        <Label for={`descripcion_${index}`}>Descripción</Label>
                        <Input
                          type="text"
                          name="descripcion"
                          id={`descripcion_${index}`}
                          value={detalle.descripcion}
                          onChange={(e) => handleChangeDetalle(index, e)}
                          invalid={!!(errors.detalles[index] && errors.detalles[index].descripcion)}
                        />
                        {errors.detalles[index]?.descripcion && <FormFeedback>{errors.detalles[index].descripcion}</FormFeedback>}
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup>
                        <Label for={`precio_${index}`}>Precio</Label>
                        <Input
                          type="number"
                          name="precio"
                          id={`precio_${index}`}
                          value={detalle.precio}
                          onChange={(e) => handleChangeDetalle(index, e)}
                          invalid={!!(errors.detalles[index] && errors.detalles[index].precio)}
                        />
                        {errors.detalles[index]?.precio && <FormFeedback>{errors.detalles[index].precio}</FormFeedback>}
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col className="d-flex justify-content-start">
                      <Button color="danger" onClick={() => removerDetalle(index)}>
                        Eliminar Detalle
                      </Button>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            ))}
            <Row className="mb-3">
              <Col className="d-flex justify-content-start">
                <Button color="primary" onClick={agregarDetalle}>
                  Agregar Detalle
                </Button>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col className="d-flex justify-content-start">
                <Button color="success" type="submit">
                  Guardar Paquetes
                </Button>
              </Col>
            </Row>
          </Form>
        </CardBody>
      </Card>
    </Container>
  );
}