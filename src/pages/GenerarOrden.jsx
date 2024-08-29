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
    id_cliente: idCliente,
    nombre_contacto: '',
    telefono: '',
    id_direccion: '',
    id_tipo_pago: '1',
    id_estado_paquete: '',
    total_pagar: '',
    costo_adicional: '0.00',
    concepto: '',
    tipo_documento: 'consumidor_final',
    detalles: []
  });

  useEffect(() => {
    const fetchClienteData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/clientes/${idCliente}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCliente(response.data.cliente);
        
        const selectedAddress = JSON.parse(localStorage.getItem('selectedAddress') || '{}');
        
        setFormData(prevState => ({
          ...prevState,
          nombre_contacto: `${response.data.cliente.nombre} ${response.data.cliente.apellido}`,
          telefono: response.data.cliente.telefono || '',
          id_direccion: selectedAddress.id || '',
          total_pagar: location.state?.totalPrice.toFixed(2) || '0.00',
          detalles: location.state?.detalles || [],
          ...location.state?.commonData
        }));
      } catch (error) {
        console.error("Error al obtener datos del cliente:", error);
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
      
      // Format detalles
      const formattedDetalles = formData.detalles.map(detalle => ({
        id_tipo_paquete: Number(detalle.id_tipo_paquete),
        id_empaque: Number(detalle.id_empaque),
        peso: Number(detalle.peso),
        id_estado_paquete: Number(detalle.id_estado_paquete),
        fecha_envio: detalle.fecha_envio + "T00:00:00",
        fecha_entrega_estimada: detalle.fecha_entrega_estimada + "T00:00:00",
        fecha_entrega: detalle.fecha_entrega + "T00:00:00",
        descripcion_contenido: detalle.descripcion, // Assuming 'descripcion' is used for 'descripcion_contenido'
        id_tipo_entrega: Number(detalle.id_tipo_entrega),
        id_direccion: Number(formData.id_direccion),
        instrucciones_entrega: detalle.instrucciones_entrega,
        descripcion: detalle.descripcion,
        precio: Number(detalle.precio)
      }));

      const orderData = {
        id_cliente: Number(formData.id_cliente),
        nombre_contacto: formData.nombre_contacto,
        telefono: formData.telefono,
        id_direccion: Number(formData.id_direccion),
        id_tipo_pago: Number(formData.id_tipo_pago),
        id_estado_paquetes: Number(formData.id_estado_paquete),
        total_pagar: Number(formData.total_pagar),
        costo_adicional: Number(formData.costo_adicional),
        concepto: formData.concepto || "Envío de paquetes",
        tipo_documento: formData.tipo_documento,
        detalles: formattedDetalles
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
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(`Error al registrar la orden: ${error.response.data.message}`);
      } else {
        toast.error("Error al registrar la orden");
      }
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
                <h4 className="card-title mb-4">Generando orden para: {cliente.nombre} {cliente.apellido}</h4>
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <Label for="nombre_contacto">Nombre de Contacto</Label>
                        <Input
                          type="text"
                          name="nombre_contacto"
                          id="nombre_contacto"
                          value={formData.nombre_contacto}
                          onChange={handleInputChange}
                          required
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label for="telefono">Teléfono</Label>
                        <Input
                          type="text"
                          name="telefono"
                          id="telefono"
                          value={formData.telefono}
                          onChange={handleInputChange}
                          required
                        />
                      </FormGroup>
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
                    </Col>
                    <Col md={6}>
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
                        <Label for="concepto">Concepto</Label>
                        <Input
                          type="text"
                          name="concepto"
                          id="concepto"
                          value={formData.concepto}
                          onChange={handleInputChange}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <FormGroup>
                    <Label for="tipo_documento">Tipo de Documento</Label>
                    <Input
                      type="select"
                      name="tipo_documento"
                      id="tipo_documento"
                      value={formData.tipo_documento}
                      onChange={handleInputChange}
                    >
                      <option value="consumidor_final">Consumidor Final</option>
                      <option value="credito_fiscal">Crédito Fiscal</option>
                    </Input>
                  </FormGroup>
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
}