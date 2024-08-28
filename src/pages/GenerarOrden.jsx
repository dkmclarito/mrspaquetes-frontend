import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Container, Row, Col, Card, CardBody, Form, FormGroup, Label, Input, Button } from 'reactstrap';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import Breadcrumbs from "../components/Empleados/Common/Breadcrumbs";

const API_URL = import.meta.env.VITE_API_URL;

export default function GenerarOrden() {
  const location = useLocation();
  const navigate = useNavigate();
  const { idCliente } = useParams();
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    id_tipo_pago: '1',
    total_pagar: '',
    costo_adicional: '',
    concept: '',
  });

  useEffect(() => {
    const fetchClienteData = async () => {
      console.log("Iniciando fetchClienteData");
      console.log("idCliente:", idCliente);
      console.log("API_URL:", API_URL);
      try {
        const token = localStorage.getItem('token');
        console.log("Token:", token);
        console.log("Haciendo solicitud a:", `${API_URL}/clientes/${idCliente}`);
        const response = await axios.get(`${API_URL}/clientes/${idCliente}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Respuesta recibida:", response.data);
        setCliente(response.data.cliente);
        if (location.state && location.state.totalPrice) {
          setFormData(prevState => ({
            ...prevState,
            total_pagar: location.state.totalPrice.toFixed(2)
          }));
        }
      } catch (error) {
        console.error("Error completo:", error);
        if (error.response) {
          console.error("Datos de la respuesta de error:", error.response.data);
          console.error("Estado de la respuesta de error:", error.response.status);
          console.error("Cabeceras de la respuesta de error:", error.response.headers);
        } else if (error.request) {
          console.error("La solicitud fue hecha pero no se recibió respuesta", error.request);
        } else {
          console.error("Error al configurar la solicitud", error.message);
        }
        toast.error("Error al obtener datos del cliente");
      } finally {
        setLoading(false);
      }
    };

    fetchClienteData();
  }, [idCliente, location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const orderData = {
        ...formData,
        id_cliente: idCliente,
        detalles: location.state?.detalles || []
      };
      console.log("Datos enviados a la API:", orderData);
      await axios.post(`${API_URL}/ordenes`, orderData, {
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        }
      });
      toast.success("Orden registrada con éxito");
      navigate('/GestionOrdenes');
    } catch (error) {
      console.error("Error al registrar la orden:", error);
      toast.error("Error al registrar la orden");
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!cliente) {
    return <div>No se pudo cargar la información del cliente.</div>;
  }

  return (
    <div className="page-content">
      <Container fluid>
        <ToastContainer />
        <Breadcrumbs title="Generar Orden" breadcrumbItem="Detalles de Pago" />
        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <h4 className="card-title mb-4">Generando orden de: {cliente.nombre} {cliente.apellido}</h4>
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md="6">
                      <FormGroup>
                        <Label for="id_tipo_pago">Tipo de Pago</Label>
                        <Input
                          type="select"
                          name="id_tipo_pago"
                          id="id_tipo_pago"
                          value={formData.id_tipo_pago}
                          onChange={handleInputChange}
                        >
                          <option value="1">Efectivo</option>
                          <option value="2">Tarjeta</option>
                        </Input>
                      </FormGroup>
                      <FormGroup>
                        <Label for="total_pagar">Total a Pagar</Label>
                        <Input
                          type="number"
                          name="total_pagar"
                          id="total_pagar"
                          value={formData.total_pagar}
                          onChange={handleInputChange}
                          required
                        />
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <Label for="costo_adicional">Costo Adicional</Label>
                        <Input
                          type="number"
                          name="costo_adicional"
                          id="costo_adicional"
                          value={formData.costo_adicional}
                          onChange={handleInputChange}
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label for="concept">Concepto</Label>
                        <Input
                          type="text"
                          name="concept"
                          id="concept"
                          value={formData.concept}
                          onChange={handleInputChange}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Button color="primary" type="submit">
                    Registrar Orden
                  </Button>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};