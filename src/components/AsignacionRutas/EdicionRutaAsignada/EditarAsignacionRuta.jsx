import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, CardBody, Nav, NavItem } from 'reactstrap';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import ResumenAsignacion from './ResumenAsignacion';
import EditarPaquetesAsignacion from './EditarPaquetesAsignacion';
import { useParams, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

export default function EditarAsignacionRuta() {
  const [asignacion, setAsignacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seccionActual, setSeccionActual] = useState("resumen");
  const { codigo_unico_asignacion } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAsignacion();
  }, [codigo_unico_asignacion]);

  const fetchAsignacion = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/asignacionrutas/${codigo_unico_asignacion}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Asignacion data fetched:", response.data);
      setAsignacion(response.data.asignacionRuta);
    } catch (error) {
      console.error("Error al cargar la asignación:", error);
      setError("Error al cargar los datos de la asignación");
      toast.error("Error al cargar los datos de la asignación");
    } finally {
      setLoading(false);
    }
  };

  const actualizarAsignacion = (datosActualizados) => {
    setAsignacion((prevAsignacion) => ({
      ...prevAsignacion,
      ...datosActualizados,
    }));
  };

  const handleRegresar = () => {
    navigate('/GestionAsignarRutas');
  };

  const renderSeccion = () => {
    switch (seccionActual) {
      case "resumen":
        return <ResumenAsignacion asignacion={asignacion} />;
      case "paquetes":
        return <EditarPaquetesAsignacion asignacion={asignacion} actualizarAsignacion={actualizarAsignacion} />;
      default:
        return <ResumenAsignacion asignacion={asignacion} />;
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!asignacion) return <div>No se encontró la asignación</div>;

  return (
    <Container fluid className="page-content">
      <ToastContainer />
      <Card className="mb-4">
        <CardBody>
          <Row className="mb-3 align-items-center">
            <Col>
              <h1 className="mb-0">Editar Asignación de Ruta #{asignacion.codigo_unico_asignacion}</h1>
            </Col>
            <Col xs="auto">
              <Button color="secondary" onClick={handleRegresar}>
                Volver a la lista de Asignaciones
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
                Resumen de Asignación
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
