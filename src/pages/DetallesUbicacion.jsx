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
        console.log(1)
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
                      <th scope="row" style={{ width: '180px', whiteSpace: 'wrap' }}>ID:</th>
                      <td style={{ width: '18px', whiteSpace: 'wrap' }}>
                        <Badge color="primary"> {ubicacion.id} </Badge>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">Numero de orden:</th>
                      <td>{ubicacion.numero_orden || 'N/A'}</td>
                    </tr>
                    
                    <tr>
                      <th scope="row">Código QR del Paquete:</th>
                      <td>{ubicacion.qr_paquete || 'N/A'}</td>
                    </tr>
                    
                    <tr>
                      <th scope="row">Descripción del Paquete:</th>
                      <td>{ubicacion.descripcion_paquete || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th scope="row">Ubicacion:</th>
                      <td>{ubicacion.nomenclatura_ubicacion || 'N/A'}</td>
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
