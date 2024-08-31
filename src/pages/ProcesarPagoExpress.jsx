import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, CardBody, Table, Button } from 'reactstrap';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthService from '../services/authService';

const API_URL = import.meta.env.VITE_API_URL;

export default function ProcesarPagoExpress() {
  const { idCliente } = useParams();
  const navigate = useNavigate();
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("Fetching orders for client ID:", idCliente);
    const fetchPendingOrders = async () => {
      try {
        const token = AuthService.getCurrentUser();
        if (!token) {
          throw new Error("Token de autenticación no disponible.");
        }

        const response = await axios.get(`${API_URL}/ordenes`, {
          params: {
            id_cliente: idCliente,
            estado_pago: 'pendiente'
          },
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log("Datos de la respuesta:", response.data);

        const orders = response.data.data || [];
        setPendingOrders(orders);
        setError(null);
      } catch (error) {
        console.error("Error al obtener órdenes pendientes:", error);
        setError(`Error al obtener órdenes pendientes: ${error.response?.data?.message || error.message}`);
        toast.error(`Error al obtener órdenes pendientes: ${error.response?.data?.message || error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingOrders();
  }, [idCliente]);

  const handleProcessPayment = async (orderId) => {
    try {
      const token = AuthService.getCurrentUser();
      if (!token) {
        throw new Error("Token de autenticación no disponible.");
      }

      const response = await axios.post(`${API_URL}/ordenes/${orderId}/procesar-pago`, {}, {
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        }
      });

      console.log("Respuesta del procesamiento de pago:", response.data);
      toast.success("Pago procesado con éxito. Se ha enviado un comprobante al correo del cliente.");

      // Llamar a la función para generar la viñeta
      await generateVineta(orderId);

      // Elimina la orden procesada de la lista
      setPendingOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
    } catch (error) {
      console.error("Error al procesar el pago:", error);
      toast.error(`Error al procesar el pago: ${error.response?.data?.message || error.message}`);
    }
  };

  const generateVineta = async (orderId) => {
    try {
      const token = AuthService.getCurrentUser();
      if (!token) {
        throw new Error("Token de autenticación no disponible.");
      }
  
      const response = await axios.get(`${API_URL}/ordenes/${orderId}/vineta`, {
        params: { format: 'json' },
        headers: { Authorization: `Bearer ${token}` }
      });
  
      console.log("Datos de la viñeta:", response.data);
  
      const { pdf_base64 } = response.data.data;
  
      // Convertir base64 a un archivo PDF
      const byteCharacters = atob(pdf_base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
  
      // Crear un blob con el archivo PDF
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
  
      // Crear un enlace de descarga y hacer clic en él para descargar el archivo
      const link = document.createElement('a');
      link.href = url;
      link.download = 'viñeta.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
      // Liberar el objeto URL creado
      URL.revokeObjectURL(url);
  
      toast.success("Viñeta generada y descargada con éxito.");
    } catch (error) {
      console.error("Error al generar la viñeta:", error);
      toast.error(`Error al generar la viñeta: ${error.response?.data?.message || error.message}`);
    }
  };
  

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="page-content">
      <Container fluid>
        <ToastContainer />
        <h1 className="text-center mb-4">Procesar Pago express</h1>
        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <h4 className="card-title mb-4">Órdenes Pendientes de Pago</h4>
                {pendingOrders.length === 0 ? (
                  <p>No hay órdenes pendientes de pago para este cliente.</p>
                ) : (
                  <Table responsive>
                    <thead>
                      <tr>
                        <th>ID Orden</th>
                        <th>Fecha</th>
                        <th>Total a Pagar</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingOrders.map((order) => (
                        <tr key={order.id}>
                          <td>{order.id}</td>
                          <td>{new Date(order.created_at).toLocaleDateString()}</td>
                          <td>${order.total_pagar}</td>
                          <td>
                            <Button color="primary" onClick={() => handleProcessPayment(order.id)}>
                              Procesar Pago
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row className="mt-3">
          <Col>
            <Button color="secondary" onClick={() => navigate('/GestionOrdenesExpress')}>
              Volver a Gestión de Órdenes
            </Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

