import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, CardBody, Badge, Button } from 'reactstrap';
import AuthService from '../services/authService';
import Breadcrumbs from '../components/Usuarios/Common/Breadcrumbs';

const API_URL = import.meta.env.VITE_API_URL;

const DataIncidencia = () => {
  const { idIncidencia } = useParams();  // Obtiene el ID de la incidencia desde la URL
  const [incidencia, setIncidencia] = useState(null);
  
  const token = AuthService.getCurrentUser();

  // Verificar el estado del usuario logueado
  const verificarEstadoUsuarioLogueado = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (userId && token) {
        const response = await axios.get(`${API_URL}/auth/show/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.status === "Token is Invalid") {
          console.error("Token is invalid. Logging out...");
          AuthService.logout();
          window.location.href = "/login";
          return;
        }
      }
    } catch (error) {
      console.error("Error al verificar el estado del usuario:", error);
    }
  }, [token]);

  // Cargar los datos de la incidencia
  const fetchIncidencia = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/incidencias/${idIncidencia}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        setIncidencia(response.data);
      } else {
        console.error("Incidencia no encontrada");
      }
    } catch (error) {
      console.error("Error al obtener los datos de la incidencia:", error);
    }
  }, [idIncidencia, token]);

  useEffect(() => {
    verificarEstadoUsuarioLogueado();
    fetchIncidencia();
  }, [verificarEstadoUsuarioLogueado, fetchIncidencia]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Gestión de Incidencias" breadcrumbItem="Detalles de la Incidencia" />
        <Card>
          <CardBody>
            <h5 className="card-title">Detalles de la Incidencia</h5>
            {incidencia ? (
              <Row>
                <Col sm="12">
                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <tbody>
                        <tr>
                          <th scope="row" style={{ width: '200px', whiteSpace: 'nowrap' }}>ID:</th>
                          <td>
                            <Badge color="primary">{incidencia.id}</Badge>
                          </td>
                        </tr>
                        <tr>
                          <th scope="row">Paquete ID:</th>
                          <td>{incidencia.id_paquete|| 'N/A'}</td>
                        </tr>
                        <tr>
                          <th scope="row">Descripción del Paquete:</th>
                          <td>{incidencia.paquete_descripcion || 'N/A'}</td>
                        </tr>
                        <tr>
                          <th scope="row">Fecha y Hora:</th>
                          <td>{formatDate(incidencia.fecha_hora)}</td>
                        </tr>
                        <tr>
                          <th scope="row">Tipo de Incidencia:</th>
                          <td>{incidencia.tipo_incidencia || 'N/A'}</td>
                        </tr>
                        <tr>
                          <th scope="row">Descripción de la Incidencia:</th>
                          <td>{incidencia.descripcion || 'N/A'}</td>
                        </tr>
                        <tr>
                          <th scope="row">Estado:</th>
                          <td>
                            <Badge color={incidencia.estado === 'Cerrada' ? 'success' : 'warning'}>
                              {incidencia.estado}
                            </Badge>
                          </td>
                        </tr>
                        <tr>
                          <th scope="row">Fecha de Resolución:</th>
                          <td>{incidencia.fecha_resolucion ? formatDate(incidencia.fecha_resolucion) : 'Pendiente'}</td>
                        </tr>
                        <tr>
                          <th scope="row">Usuario que Reporta:</th>
                          <td>{incidencia.usuario_reporta || 'N/A'}</td>
                        </tr>
                        <tr>
                          <th scope="row">Usuario Asignado:</th>
                          <td>{incidencia.usuario_asignado || 'No asignado'}</td>
                        </tr>
                        <tr>
                          <th scope="row">Solución:</th>
                          <td>{incidencia.solucion || 'Sin solución'}</td>
                        </tr>
                        <tr>
                          <th scope="row">Fecha de Creación:</th>
                          <td>{formatDate(incidencia.created_at)}</td>
                        </tr>
                        <tr>
                          <th scope="row">Última Actualización:</th>
                          <td>{formatDate(incidencia.updated_at)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Col>
              </Row>
            ) : (
              <p>No se encontraron datos de la incidencia.</p>
            )}
            <div className="d-flex justify-content-between mt-4">
              <Link to="/GestionIncidencias" className="btn btn-secondary btn-regresar">
                <i className="fas fa-arrow-left"></i> Regresar
              </Link>
            </div>
          </CardBody>
        </Card>
      </Container>
    </div>
  );
};

export default DataIncidencia;
