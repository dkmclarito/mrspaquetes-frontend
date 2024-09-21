import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, CardBody, Nav, NavItem } from 'reactstrap';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import ResumenTraslados from '../EditarTraslados/ResumenTraslados';
import EditarPaquetesTraslados from '../EditarTraslados/EditarPaquetesTraslados';
import { useParams, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

export default function EditarTraslados() {
  const [traslado, setTraslado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seccionActual, setSeccionActual] = useState("resumen");
  const { id } = useParams();  // Changed from id_traslado to id
  const navigate = useNavigate();

  console.log("ID from useParams:", id);  // Debug log

  useEffect(() => {
    if (id) {
      fetchTraslado();
    } else {
      setError("ID de traslado no proporcionado");
      setLoading(false);
    }
  }, [id]);

  const fetchTraslado = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      console.log("Fetching traslado with ID:", id);  // Debug log
      const response = await axios.get(`${API_URL}/traslados/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Traslado data fetched:", response.data);
      setTraslado(response.data);  // Changed from response.data.traslado to response.data
    } catch (error) {
      console.error("Error al cargar el traslado:", error);
      setError("Error al cargar los datos del traslado");
      toast.error("Error al cargar los datos del traslado");
    } finally {
      setLoading(false);
    }
  };

  const actualizarTraslado = (datosActualizados) => {
    setTraslado((prevTraslado) => ({
      ...prevTraslado,
      ...datosActualizados,
    }));
  };

  const handleRegresar = () => {
    navigate('/GestionTraslados');
  };

  const renderSeccion = () => {
    switch (seccionActual) {
      case "resumen":
        return <ResumenTraslados traslado={traslado} />;
      case "paquetes":
        return <EditarPaquetesTraslados traslado={traslado} actualizarTraslado={actualizarTraslado} />;
      default:
        return <ResumenTraslados traslado={traslado} />;
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!traslado) return <div>No se encontró el traslado</div>;

  return (
    <Container fluid className="page-content">
      <ToastContainer />
      <Card className="mb-4">
        <CardBody>
          <Row className="mb-3 align-items-center">
            <Col>
              <h1 className="mb-0">Editar Traslado #{traslado.numero_traslado}</h1>
            </Col>
            <Col xs="auto">
              <Button color="secondary" onClick={handleRegresar}>
                Volver a la lista de Traslados
              </Button>
            </Col>
          </Row>
          <Nav tabs className="mb-3">
            <NavItem>
              <Button
                color={seccionActual === "resumen" ? "primary" : "light"}
                onClick={() => setSeccionActual("resumen")}
                className="me-2"
              >
                Resumen de Traslado
              </Button>
            </NavItem>
            <NavItem>
              <Button
                color={seccionActual === "paquetes" ? "primary" : "light"}
                onClick={() => setSeccionActual("paquetes")}
              >
                Paquetes
              </Button>
            </NavItem>
          </Nav>
          {renderSeccion()}
        </CardBody>
      </Card>
    </Container>
  );
}