import React, { useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Input,
  Button,
} from 'reactstrap';
import axios from 'axios';
import AuthService from '../../services/authService';
import DetailsCard from './DetailsCard';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { NavLink } from 'react-router-dom';


const API_URL = import.meta.env.VITE_API_URL;

const TrackingPaquetes = () => {
  const [orden, setOrden] = useState(null);
  const [numeroSeguimiento, setNumeroSeguimientp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSeguimientoOrden = async () => {
    setLoading(true);
    try {
      const token = AuthService.getCurrentUser();
      const response = await axios.get(`${API_URL}/seguimiento-orden`, { 
        headers: { 'Authorization': `Bearer ${token}` },
        params: { numero_tracking: numeroSeguimiento }
      });
  
      if (response.data.hasOwnProperty('id')) {
        setOrden(response.data);
        toast.success('Orden encontrada!');
      } else {
        toast.error('No se encontró ninguna orden!');
      }
    } catch (error) {
      console.error(error);
      const errorMessage = error.response ? error.response.data.message : 'Error al obtener la orden!';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTracking = (id, numeroSeguimiento) => {
    dispatch(trackingSuccess({
      tracking: {
        id: id,
        numeroSeguimiento: numeroSeguimiento,
      },
    }));
  };
  return (
    <div className="page-content">      
      <Container fluid className="mt-4">
        <Row>
          <Col md="12" class="center-block">
            <Card>
              <CardBody>
                <CardTitle tag="h5">Buscar Orden</CardTitle>
                <Input
                  type="text"
                  placeholder="Número de rastreo"
                  value={numeroSeguimiento}
                  onChange={(e) => setNumeroSeguimientp(e.target.value)}
                />
                <br />
                <Button color="primary" onClick={handleSeguimientoOrden} disabled={loading}>
                  {loading ? 'Cargando...' : 'Buscar Orden'}
                </Button>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {orden && (
          <Row className="mt-4">
            <Col md="12">
              <DetailsCard
                title={`Orden: ${orden.numero_seguimiento}`}
                description={[
                  { 'key': "Concepto", 'value': orden.concepto },
                  { 'key': "Pago", 'value': orden.estado_pago },
                  { 'key': "Monto", 'value': orden.total_pagar },
                ]}
                typeCard="info"
              />
              {orden.paquetes.length > 0 && (
                <>
                  <h5>Paquetes</h5>
                  {orden.paquetes.map((paquete, index) => (
                     <NavLink 
                     key={index} 
                     to={`/PaquetesTrackingScreen/${paquete.id}`}
                     onClick={() => handleTracking(paquete.id, orden.numero_seguimiento)}
                     style={{ textDecoration: 'none' }}
                   >
                     <DetailsCard
                       title={`Descripción: ${paquete.descripcion_contenido}`}
                       description={[
                         { 'key': 'Fecha estimada de entrega', 'value': paquete.fecha_entrega_estimada },
                         { 'key': 'Peso', 'value': paquete.peso },
                       ]}
                       typeCard={index % 2 === 0 ? "primary" : "success"}
                     />
                   </NavLink>
                   ))}
                </>
              )}
            </Col>
          </Row>
        )}
      </Container>
      <ToastContainer />
    </div>
  );
};

export default TrackingPaquetes;
