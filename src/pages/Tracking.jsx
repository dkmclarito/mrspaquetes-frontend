import React, { useState } from 'react';
import { Container, Row, Col, Card, CardBody, Input, Button, Table } from 'reactstrap';
import { Package, Truck, Warehouse, Home, Calendar, RotateCcw, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import "../styles/Tracking.css";

const API_URL = import.meta.env.VITE_API_URL;

const packageStates = [
  { id: 4, state: 'En Almacén', icon: <Warehouse size={24} />, description: 'El paquete se encuentra en el almacén' },
  { id: 5, state: 'En Espera de Recolección', icon: <Package size={24} />, description: 'El paquete está listo para ser recolectado' },
  { id: 1, state: 'En Tránsito', icon: <Truck size={24} />, description: 'El paquete está en tránsito' },
  { id: 2, state: 'En Ruta de Entrega', icon: <Truck size={24} />, description: 'El paquete está en camino para su entrega' },
  { id: 3, state: 'Recibido en Destino', icon: <Home size={24} />, description: 'El paquete ha llegado a su destino final' },
  { id: 11, state: 'Entregado', icon: <CheckCircle size={24} />, description: 'El paquete ha sido entregado' },
  { id: 6, state: 'Reprogramado', icon: <Calendar size={24} />, description: 'La entrega del paquete ha sido reprogramada' },
  { id: 7, state: 'En Proceso de Retorno', icon: <RotateCcw size={24} />, description: 'El paquete está siendo devuelto al remitente' },
  { id: 8, state: 'Devuelto', icon: <RotateCcw size={24} />, description: 'El paquete ha sido devuelto' },
  { id: 9, state: 'Dañado', icon: <AlertTriangle size={24} />, description: 'El paquete ha sido reportado como dañado' },
  { id: 10, state: 'Perdido', icon: <AlertTriangle size={24} />, description: 'El paquete está perdido' },
  { id: 12, state: 'Cancelado', icon: <XCircle size={24} />, description: 'El envío del paquete ha sido cancelado' },
];

const TrackingPage = () => {
  const [numeroSeguimiento, setNumeroSeguimiento] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [historial, setHistorial] = useState([]);

  const handleInputChange = (e) => {
    setNumeroSeguimiento(e.target.value);
  };

  const fetchTrackingData = async () => {
    if (!numeroSeguimiento.trim()) {
      setError('Por favor, ingrese un número de seguimiento.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/seguimiento-orden`,
        {
          params: { numero_seguimiento: numeroSeguimiento },
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.data.id) {
        setTrackingData(response.data);
        fetchHistorial(response.data.numero_seguimiento);
      } else {
        setError('No se encontraron datos de seguimiento para este número.');
      }
    } catch (error) {
      console.error('Error fetching tracking data:', error);
      setError('No se pudo obtener la información de seguimiento. Por favor, intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistorial = async (numeroSeguimiento) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/historial/${numeroSeguimiento}`,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        setHistorial(response.data);
      }
    } catch (error) {
      console.error('Error fetching historial:', error);
    }
  };

  const renderTimeline = () => {
    if (!historial || historial.length === 0) {
      return null;
    }

    const uniqueStates = historial.map(item => item.estado_paquete).reduce((acc, state) => {
      if (!acc.find(s => s.id === state.id)) {
        acc.push(state);
      }
      return acc;
    }, []);

    return (
      <div className="timeline mt-4">
        {uniqueStates.map((state, index) => {
          const historialItem = historial.find(item => item.estado_paquete.id === state.id);
          const isPast = historialItem && new Date(historialItem.fecha_hora) < new Date();
          const isCurrent = state.id === trackingData?.orden?.id_estado_paquetes;
          const statusClass = isPast ? 'completed' : (isCurrent ? 'current' : 'future');
          const packageState = packageStates.find(s => s.id === state.id);
          return (
            <div key={state.id} className={`timeline-item ${statusClass}`}>
              <div className="timeline-badge">
                {React.cloneElement(packageState?.icon || <Package size={24} />, { className: 'timeline-icon' })}
              </div>
              <div className={`timeline-content ${isCurrent ? 'current-state' : ''}`}>
                <h5 className="timeline-title">{state.nombre}</h5>
                <p className="timeline-description">{packageState?.description || state.descripcion}</p>
                {historialItem && (
                  <small className="timeline-date">
                    {new Date(historialItem.fecha_hora).toLocaleString()}
                  </small>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="tracking-page">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} md={10} lg={8}>
            <Card className="tracking-card">
              <CardBody>
                <h2 className="text-center mb-4">Rastrear Paquete</h2>
                <Row className="mb-4">
                  <Col>
                    <div className="input-group">
                      <Input
                        type="text"
                        value={numeroSeguimiento}
                        onChange={handleInputChange}
                        placeholder="Ingrese el número de seguimiento"
                        className="form-control-lg"
                      />
                      <div className="input-group-append">
                        <Button color="primary" size="lg" onClick={fetchTrackingData} disabled={loading}>
                          {loading ? 'Cargando...' : 'Rastrear'}
                        </Button>
                      </div>
                    </div>
                  </Col>
                </Row>
                {error && <div className="alert alert-danger mt-3">{error}</div>}
                {trackingData && (
                  <div className="mt-4">
                    <h3 className="text-center mb-4">
                      Número de Seguimiento: {trackingData.numero_seguimiento}
                    </h3>
                    {renderTimeline()}
                    <Card className="mt-5 details-card">
                      <CardBody>
                        <h4 className="card-title mb-4">Detalles del Envío</h4>
                        {trackingData.orden && (
                          <Table responsive bordered hover className="shipping-details">
                            <tbody>
                              <tr>
                                <th>Cliente ID</th>
                                <td>{trackingData.orden.id_cliente}</td>
                                <th>Total a Pagar</th>
                                <td>${trackingData.orden.total_pagar}</td>
                              </tr>
                              <tr>
                                <th>Dirección ID</th>
                                <td>{trackingData.orden.id_direccion}</td>
                                <th>Costo Adicional</th>
                                <td>${trackingData.orden.costo_adicional}</td>
                              </tr>
                              <tr>
                                <th>Tipo de Pago</th>
                                <td>{trackingData.orden.id_tipo_pago}</td>
                                <th>Tipo de Documento</th>
                                <td>{trackingData.orden.tipo_documento}</td>
                              </tr>
                              <tr>
                                <th>Concepto</th>
                                <td colSpan="3">{trackingData.orden?.concepto}</td>
                              </tr>
                            </tbody>
                          </Table>
                        )}
                      </CardBody>
                    </Card>
                    {trackingData.paquetes && trackingData.paquetes.length > 0 && (
                      <div className="mt-5">
                        <h4 className="mb-4">Paquetes</h4>
                        {trackingData.paquetes.map((paquete, index) => (
                          <Card key={index} className="mb-3 package-card">
                            <CardBody>
                              <Table responsive bordered hover className="package-details">
                                <tbody>
                                  <tr>
                                    <th>Paquete ID</th>
                                    <td>{paquete.id_paquete}</td>
                                    <th>Descripción</th>
                                    <td>{paquete.descripcion}</td>
                                  </tr>
                                  <tr>
                                    <th>Referencia</th>
                                    <td>{paquete.referencia}</td>
                                    <th>Cantidad</th>
                                    <td>{paquete.cantidad}</td>
                                  </tr>
                                  <tr>
                                    <th>Peso</th>
                                    <td colSpan="3">{paquete.peso} kg</td>
                                  </tr>
                                </tbody>
                              </Table>
                            </CardBody>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default TrackingPage;