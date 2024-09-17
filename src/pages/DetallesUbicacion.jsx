import React, { useEffect, useState, useCallback } from "react";
import { Card, CardBody, Col, Row, Badge } from "reactstrap";
import { Link, useParams } from "react-router-dom";
import Breadcrumbs from "../components/Usuarios/Common/Breadcrumbs";
import axios from "axios";
import AuthService from "../services/authService";

const API_URL = import.meta.env.VITE_API_URL;

const DetallesUbicacion = () => {
  const { id } = useParams(); 
  const [ubicacion, setUbicacion] = useState(null);

  // Verificar el estado del usuario logueado
  const verificarEstadoUsuarioLogueado = useCallback(async () => {
    try {
      const token = AuthService.getCurrentUser();
      const userId = localStorage.getItem("userId");
      if (userId && token) {
        const response = await fetch(`${API_URL}/auth/show/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const responseData = await response.json();

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
    const fetchData = async () => {
      try {
        const token = AuthService.getCurrentUser();
        const response = await axios.get(`${API_URL}/ubicaciones-paquetes/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUbicacion(response.data);
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };

    fetchData();
  }, [id]);

  if (!ubicacion) {
    return <p>Cargando...</p>;
  }

  return (
    <div className="page-content">
      <Breadcrumbs title="Gestión de Ubicaciones" breadcrumbItem="Detalles de la Ubicación" />        
      <Card>
        <CardBody>
          <h5 className="card-title">Detalles de la Ubicación</h5>
          <Row>
            <Col sm="12">
              <div className="table-responsive">
                <table className="table table-bordered">
                  <tbody>
                    <tr>
                      <th scope="row" style={{ width: '150px', whiteSpace: 'nowrap' }}>ID:</th>
                      <td>
                        <Badge color="primary"> {ubicacion.id} </Badge>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">Paquete:</th>
                      <td>{ubicacion.paquete || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th scope="row">ID Paquete:</th>
                      <td>{ubicacion.id_paquete || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th scope="row">Ubicación:</th>
                      <td>{ubicacion.ubicacion || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th scope="row">ID Ubicación:</th>
                      <td>{ubicacion.id_ubicacion || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th scope="row">Estado:</th>
                      <td>{ubicacion.estado === 1 ? 'Activo' : 'Inactivo'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Col>
          </Row>
          <div className="d-flex justify-content-between mt-4">
            <Link to="/GestionUbicacion" className="btn btn-secondary btn-regresar">
              <i className="fas fa-arrow-left"></i> Regresar
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default DetallesUbicacion;
