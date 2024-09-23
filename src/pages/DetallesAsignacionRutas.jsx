import React, { useEffect, useState, useCallback } from "react";
import { Card, CardBody, Col, Row, Badge, Spinner, Table, Button } from "reactstrap";
import { Link, useParams } from "react-router-dom";
import Breadcrumbs from "../components/AsignacionRutas/Common/Breadcrumbs";
import axios from "axios";
import AuthService from "../services/authService";

const API_URL = import.meta.env.VITE_API_URL;

export default function DetallesAsignacionRutas() {
  const { id } = useParams();
  const [asignacion, setAsignacion] = useState(null);
  const [paquetes, setPaquetes] = useState([]);
  const [vehiculo, setVehiculo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const verificarEstadoUsuarioLogueado = useCallback(async () => {
    try {
      const token = AuthService.getCurrentUser();
      console.log("Token del usuario:", token);
      const userId = localStorage.getItem("userId");
      if (userId && token) {
        const response = await fetch(`${API_URL}/auth/show/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const responseData = await response.json();
        console.log("Respuesta de verificación de usuario:", responseData);

        if (responseData.status === "Token is Invalid") {
          console.error("Token is invalid. Logging out...");
          AuthService.logout();
          window.location.href = "/login";
          return;
        }
      }
    } catch (error) {
      console.error("Error al verificar el estado del usuario:", error);
    }
  }, []);

  useEffect(() => {
    verificarEstadoUsuarioLogueado();
    const interval = setInterval(() => {
      verificarEstadoUsuarioLogueado();
    }, 30000);
    return () => clearInterval(interval);
  }, [verificarEstadoUsuarioLogueado]);

  useEffect(() => {
    const fetchAsignacionDetails = async () => {
      setLoading(true);
      try {
        const token = AuthService.getCurrentUser();
        console.log("Token para solicitudes:", token);

        const [asignacionResponse, allAsignacionesResponse, paquetesResponse, vehiculosResponse] = await Promise.all([
          axios.get(`${API_URL}/asignacionrutas/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/asignacionrutas`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/paquete`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/vehiculo`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        console.log("Datos de la asignación recibidos:", asignacionResponse.data);
        console.log("Todas las asignaciones:", allAsignacionesResponse.data);
        console.log("Datos de los paquetes:", paquetesResponse.data);
        console.log("Datos de los vehículos:", vehiculosResponse.data);

        const asignacionData = asignacionResponse.data.asignacionRuta;
        setAsignacion(asignacionData);

        const allAsignaciones = allAsignacionesResponse.data.asignacionrutas.data;
        const paquetesData = paquetesResponse.data.data;
        const vehiculosData = vehiculosResponse.data.data;

        // Crea un mapa para buscar los tipos de paquetes fácilmente
        const paquetesMap = new Map(paquetesData.map(p => [p.id, p.tipo_paquete]));

        const paquetesAsignados = allAsignaciones
          .filter(a => a.codigo_unico_asignacion === asignacionData.codigo_unico_asignacion)
          .map(a => ({
            tipo: paquetesMap.get(a.id_paquete) || 'Desconocido',
            prioridad: a.prioridad
          }));

        setPaquetes(paquetesAsignados);

        // Buscar el vehículo asignado
        const vehiculoAsignado = vehiculosData.find(v => v.id === asignacionData.id_vehiculo);
        if (vehiculoAsignado) {
          setVehiculo(vehiculoAsignado);
          console.log("Vehículo asignado:", vehiculoAsignado);
        } else {
          console.log("No se encontró el vehículo asignado");
          setVehiculo(null);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error al obtener los detalles de la asignación:", error);
        setError("Error al obtener los detalles de la asignación. Por favor, intente nuevamente.");
        setLoading(false);
      }
    };

    fetchAsignacionDetails();
  }, [id]);

  if (loading) {
    console.log("Cargando detalles...");
    return (
      <div className="page-content">
        <Spinner color="primary" />
        <p>Cargando detalles de la asignación...</p>
      </div>
    );
  }

  if (error) {
    console.log("Error:", error);
    return (
      <div className="page-content">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!asignacion) {
    console.log("No se encontraron detalles para la asignación.");
    return <p>No se encontraron detalles para esta asignación.</p>;
  }

  const getEstadoLabel = (estado) => {
    return estado === 1 ? "Activo" : "Inactivo";
  };

  const getEstadoColor = (estado) => {
    return estado === 1 ? "success" : "danger";
  };

  return (
    <div className="page-content">
      <Breadcrumbs title="Gestión de Asignación de Rutas de Entrega" breadcrumbItem="Detalles de Asignación" />
      <Card>
        <CardBody>
          <h5 className="card-title">Detalles de la Asignación de Ruta</h5>
          <Row>
            <Col sm="12">
              <div className="table-responsive">
                <table className="table table-bordered">
                  <tbody>
                    <tr>
                      <th scope="row" style={{ width: '200px', whiteSpace: 'nowrap' }}>ID:</th>
                      <td>
                        <Badge color="primary">{asignacion.id}</Badge>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">Código Único de Asignación:</th>
                      <td>{asignacion.codigo_unico_asignacion || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th scope="row">ID de Ruta:</th>
                      <td>{asignacion.id_ruta || 'N/A'}</td>
                    </tr>
                    <tr>
                     <th scope="row">Detalles Vehículo:</th>
                        <td>
                          {vehiculo ? (
                            `${vehiculo.placa} - ${vehiculo.marca} ${vehiculo.modelo}`
                          ) : 'N/A'}
                        </td>
                      </tr>
                      <tr>
                      <th scope="row">Fecha:</th>
                      <td>{asignacion.fecha ? new Date(asignacion.fecha).toLocaleDateString('es-ES') : 'N/A'}</td>
                    </tr>
                    <tr>
                      <th scope="row">Estado:</th>
                      <td>
                        <Badge color={getEstadoColor(asignacion.id_estado)}>
                          {getEstadoLabel(asignacion.id_estado)}
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">Fecha de Creación:</th>
                      <td>{asignacion.created_at ? new Date(asignacion.created_at).toLocaleString('es-ES') : 'N/A'}</td>
                    </tr>
                    <tr>
                      <th scope="row">Fecha de Actualización:</th>
                      <td>{asignacion.updated_at ? new Date(asignacion.updated_at).toLocaleString('es-ES') : 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Col>
          </Row>
          <h5 className="card-title mt-4">Paquetes Asignados</h5>
          <Row>
            <Col sm="12">
              <Table striped responsive>
                <thead>
                  <tr>
                    <th>Tipo de Paquete</th>
                    <th>Prioridad</th>
                  </tr>
                </thead>
                <tbody>
                  {paquetes.map((paquete, index) => (
                    <tr key={index}>
                      <td>{paquete.tipo}</td>
                      <td>{paquete.prioridad}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>
          </Row>
          <div className="d-flex justify-content-between mt-4">
            <Link to="/GestionAsignarRutas" className="btn btn-secondary btn-regresar">
              <i className="fas fa-arrow-left"></i> Regresar
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}