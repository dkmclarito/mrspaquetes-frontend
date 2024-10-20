import React, { useState } from 'react';
import { Container, Row, Col, Card, CardBody, Input, Button } from 'reactstrap';
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

  const renderTimeline = () => {
    if (!trackingData || !trackingData.paquetes || trackingData.paquetes.length === 0) {
      return null;
    }

    const currentStateId = trackingData.paquetes[0].id_estado_paquetes;

    return (
      <div className="timeline mt-4">
        {packageStates.map((state, index) => {
          const isPast = state.id < currentStateId;
          const isCurrent = state.id === currentStateId;
          const statusClass = isPast ? 'completed' : (isCurrent ? 'current' : 'future');
          return (
            <div key={state.id} className={`timeline-item ${statusClass}`}>
              <div className="timeline-icon">
                {React.cloneElement(state.icon, { className: statusClass })}
              </div>
              <div className="timeline-content">
                <h6 className="mb-0">{state.state}</h6>
                <p className="text-muted small mb-0">{state.description}</p>
                {isCurrent && (
                  <small className="text-success">
                    Actualizado: {new Date(trackingData.updated_at).toLocaleString()}
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
    <div className="page-content">
      <Container fluid>
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
                        <Row>
                          <Col md={6}>
                            <p><strong>Cliente ID:</strong> {trackingData.id_cliente}</p>
                            <p><strong>Dirección ID:</strong> {trackingData.id_direccion}</p>
                            <p><strong>Tipo de Pago:</strong> {trackingData.id_tipo_pago}</p>
                          </Col>
                          <Col md={6}>
                            <p><strong>Total a Pagar:</strong> ${trackingData.total_pagar}</p>
                            <p><strong>Costo Adicional:</strong> ${trackingData.costo_adicional}</p>
                            <p><strong>Tipo de Documento:</strong> {trackingData.tipo_documento}</p>
                          </Col>
                        </Row>
                        <p><strong>Concepto:</strong> {trackingData.concepto}</p>
                      </CardBody>
                    </Card>
                    {trackingData.paquetes && trackingData.paquetes.length > 0 && (
                      <div className="mt-5">
                        <h4 className="mb-4">Paquetes</h4>
                        {trackingData.paquetes.map((paquete, index) => (
                          <Card key={index} className="mb-3 package-card">
                            <CardBody>
                              <h5 className="card-title">Paquete {index + 1}</h5>
                              <Row>
                                <Col md={4}>
                                  <p><strong>Tipo de Paquete:</strong> {paquete.id_tipo_paquete}</p>
                                  <p><strong>Empaque:</strong> {paquete.id_empaque}</p>
                                </Col>
                                <Col md={4}>
                                  <p><strong>Peso(Libras):</strong> {paquete.peso} kg</p>
                                  <p><strong>Precio:</strong> ${paquete.precio}</p>
                                </Col>
                                <Col md={4}>
                                  <p><strong>Descripción:</strong> {paquete.descripcion || 'N/A'}</p>
                                </Col>
                              </Row>
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