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
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from 'axios';
import Breadcrumbs from "../components/Empleados/Common/Breadcrumbs";

const API_URL = import.meta.env.VITE_API_URL;

export default function Component() {
  const { idCliente } = useParams();
  const location = useLocation();
  const [cliente, setCliente] = useState(null);
  const [estadosPaquete, setEstadosPaquete] = useState([]);
  const [detalles, setDetalles] = useState([]);
  const [errors, setErrors] = useState({
    detalles: []
  });

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clienteRes, estadosPaqueteRes] = await Promise.all([
          axios.get(`${API_URL}/clientes/${idCliente}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/dropdown/get_estado_paquete`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        setCliente(clienteRes.data.cliente || {});
        setEstadosPaquete(estadosPaqueteRes.data.estado_paquetes || []);

        if (location.state && location.state.detalles) {
          setDetalles(location.state.detalles.map(detalle => ({
            ...detalle,
            id_estado_paquete: '',
            fecha_envio: '',
            fecha_entrega_estimada: '',
            fecha_entrega: '',
            id_tipo_entrega: '',
            instrucciones_entrega: '',
          })));
        }

      } catch (error) {
        console.error("Error al obtener los datos:", error);
        toast.error('Error al obtener los datos');
      }
    };

    fetchData();
  }, [idCliente, token, location.state]);

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'id_estado_paquete':
      case 'id_tipo_entrega':
        if (!value) {
          error = 'Debe seleccionar una opción.';
        }
        break;

      case 'fecha_envio':
      case 'fecha_entrega_estimada':
      case 'fecha_entrega':
        if (!value) {
          error = 'Debe seleccionar una fecha.';
        }
        break;

      case 'instrucciones_entrega':
        if (!value.trim()) {
          error = 'Debe rellenar este campo.';
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
    navigate(`/GenerarOrdenExpress/${idCliente}`, { 
        state: { 
          detalles: detalles,
          totalPrice: totalPrice
        } 
      });
  };

  return (
    <Container fluid className="page-content">
      <ToastContainer />
      <Breadcrumbs title="Generar Orden" breadcrumbItem="Detalles de la Orden express" />
      <Card>
        <CardHeader>
          <h4>Detalles de la Orden</h4>
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
                  </Row>
                </CardBody>
              </Card>
            ))}
            <Button color="success" type="submit" className="ml-2">
              Continuar a Generar Orden
            </Button>
          </Form>
        </CardBody>
      </Card>
    </Container>
  );
}