import React, { useState } from 'react';
import { Container, Row, Col, Card, CardBody, Input, Button } from 'reactstrap';
import { Package, Truck, Warehouse, ArrowLeft, ArrowRight, RotateCcw, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import "../styles/TrackingPaquetes.css";

const API_URL = import.meta.env.VITE_API_URL;

const packageStates = {
  'En Recepción': { icon: <Package size={24} />, description: 'El paquete ha sido recibido' },
  'En Almacén': { icon: <Warehouse size={24} />, description: 'El paquete se encuentra en el almacén' },
  'Asignado a Ruta': { icon: <ArrowRight size={24} />, description: 'El paquete ha sido asignado a una ruta' },
  'En Traslado': { icon: <Truck size={24} />, description: 'El paquete está en tránsito' },
  'Devuelto a Bodega': { icon: <ArrowLeft size={24} />, description: 'El paquete ha sido devuelto a la bodega' },
  'Recolectado': { icon: <Package size={24} />, description: 'El paquete ha sido recolectado' },
  'Desconocido': { icon: <AlertTriangle size={24} />, description: 'Estado del paquete desconocido' }
};

const TrackingPaquetes = () => {
  document.title = "Tracking | Paquetes";
  const [trackingId, setTrackingId] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setTrackingId(e.target.value);
  };

  const fetchTrackingData = async () => {
    if (!trackingId.trim()) {
      setError('Por favor, ingrese un número de seguimiento.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/paquete/tracking-paquete/${trackingId}`, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.length > 0) {
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
    if (!trackingData || trackingData.length === 0) {
      return null;
    }

    return (
      <div className="timeline mt-4">
        {trackingData.map((item, index) => {
          const stateInfo = packageStates[item.estado] || packageStates['Desconocido'];
          return (
            <div key={index} className="timeline-item">
              <div className="timeline-badge">
                {React.cloneElement(stateInfo.icon, { className: 'timeline-icon' })}
              </div>
              <div className="timeline-content">
                <h5 className="timeline-title">{item.estado}</h5>
                <p className="timeline-description">{stateInfo.description}</p>
                <small className="timeline-date">
                  {new Date(item.fecha_movimiento).toLocaleString()}
                </small>
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
                        value={trackingId}
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
                      Número de Seguimiento: {trackingData[0].numero_ingreso}
                    </h3>
                    {renderTimeline()}
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

export default TrackingPaquetes;