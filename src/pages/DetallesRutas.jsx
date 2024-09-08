import React, { useEffect, useState, useCallback } from "react";
import { Card, CardBody, Col, Row, Badge, Spinner } from "reactstrap";
import { Link, useParams } from "react-router-dom";
import Breadcrumbs from "../components/Rutas/Common/Breadcrumbs";
import axios from "axios";
import AuthService from "../services/authService";

const API_URL = import.meta.env.VITE_API_URL;

const DetallesRutas = () => {
  const { id } = useParams();
  const [ruta, setRuta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const verificarEstadoUsuarioLogueado = useCallback(async () => {
    try {
      const token = AuthService.getCurrentUser();
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
    const fetchRutaDetails = async () => {
      setLoading(true);
      try {
        const token = AuthService.getCurrentUser();
        const response = await axios.get(`${API_URL}/rutas/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Datos de la ruta recibidos:", response.data);
        setRuta(response.data.ruta);
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener los detalles de la ruta:", error);
        setError("Error al obtener los detalles de la ruta. Por favor, intente nuevamente.");
        setLoading(false);
      }
    };

    fetchRutaDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="page-content">
        <Spinner color="primary" />
        <p>Cargando detalles de la ruta...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-content">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!ruta) {
    return <p>No se encontraron detalles para esta ruta.</p>;
  }

  // Verifica los datos recibidos en ruta
  console.log("Detalles de la ruta:", ruta);

  const getEstadoLabel = (estado) => {
    console.log("Estado recibido:", estado);
    return estado === 'Activo' ? "Activo" : "Inactivo";
  };

  const getEstadoColor = (estado) => {
    console.log("Estado recibido para color:", estado);
    return estado === 'Activo' ? "success" : "danger";
  };

  return (
    <div className="page-content">
      <Breadcrumbs title="Gestión de Rutas" breadcrumbItem="Datos de Ruta" />
      <Card>
        <CardBody>
          <h5 className="card-title">Detalles de la Ruta</h5>
          <Row>
            <Col sm="12">
              <div className="table-responsive">
                <table className="table table-bordered">
                  <tbody>
                    <tr>
                      <th scope="row" style={{ width: '200px', whiteSpace: 'nowrap' }}>ID:</th>
                      <td>
                        <Badge color="primary">{ruta.id}</Badge>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">Destino:</th>
                      <td>{ruta.destino || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th scope="row">Nombre:</th>
                      <td>{ruta.nombre || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th scope="row">Bodega:</th>
                      <td>{ruta.bodega || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th scope="row">Estado:</th>
                      <td>
                        <Badge color={getEstadoColor(ruta.estado)}>
                          {getEstadoLabel(ruta.estado)}
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">Fecha Programada:</th>
                      <td>{ruta.fecha_programada ? new Date(ruta.fecha_programada).toLocaleDateString('es-ES') : 'N/A'}</td>
                    </tr>
                    <tr>
                      <th scope="row">Fecha de Creación:</th>
                      <td>{ruta.created_at ? new Date(ruta.created_at).toLocaleString('es-ES') : 'N/A'}</td>
                    </tr>
                    <tr>
                      <th scope="row">Fecha de Actualización:</th>
                      <td>{ruta.updated_at ? new Date(ruta.updated_at).toLocaleString('es-ES') : 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Col>
          </Row>
          <div className="d-flex justify-content-between mt-4">
            <Link to="/GestionRutas" className="btn btn-secondary btn-regresar">
              <i className="fas fa-arrow-left"></i> Regresar
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default DetallesRutas;
