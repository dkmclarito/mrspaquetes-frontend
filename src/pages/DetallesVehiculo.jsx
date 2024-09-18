import React, { useEffect, useState, useCallback } from "react";
import { Card, CardBody, Col, Row, Badge } from "reactstrap";
import { Link, useParams } from "react-router-dom";
import Breadcrumbs from "../components/Usuarios/Common/Breadcrumbs";
import axios from "axios";
import AuthService from "../services/authService";

const API_URL = import.meta.env.VITE_API_URL;

const DetallesVehiculo = () => {
  const { id } = useParams();
  const [vehiculo, setVehiculo] = useState(null);

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

        const vehiculoResponse = await axios.get(`${API_URL}/vehiculo/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const vehiculoData = vehiculoResponse.data;
        setVehiculo(vehiculoData);
      } catch (error) {
        console.error("Error al obtener los datos del vehículo:", error);
      }
    };

    fetchData();
  }, [id]);

  if (!vehiculo) {
    return <p>Cargando...</p>;
  }

  return (
    <div className="page-content">
      <Breadcrumbs title="Gestión de Vehículos" breadcrumbItem="Datos del Vehículo" />
      <Card>
        <CardBody>
          <h5 className="card-title">Detalles del Vehículo</h5>
          <Row>
            <Col sm="6">
              <div className="table-responsive">
                <table className="table table-bordered">
                  <tbody>
                    <tr>
                      <th scope="row" style={{ width: "150px", whiteSpace: "nowrap" }}>ID:</th>
                      <td>
                        <Badge color="primary">{vehiculo.id}</Badge>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">Conductor:</th>
                      <td>{vehiculo.conductor || "N/A"}</td>
                    </tr>
                    <tr>
                      <th scope="row">Apoyo:</th>
                      <td>{vehiculo.apoyo || "N/A"}</td>
                    </tr>
                    <tr>
                      <th scope="row">Placa:</th>
                      <td>{vehiculo.placa || "N/A"}</td>
                    </tr>
                    <tr>
                      <th scope="row">Capacidad de Carga:</th>
                      <td>{vehiculo.capacidad_carga || "N/A"}</td>
                    </tr>
                    <tr>
                      <th scope="row">Bodega:</th>
                      <td>{vehiculo.bodega || "N/A"}</td>
                    </tr>
                    <tr>
                      <th scope="row">Estado:</th>
                      <td>{vehiculo.estado || "N/A"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Col>
            <Col sm="6">
              <div className="table-responsive">
                <table className="table table-bordered">
                  <tbody>
                    <tr>
                      <th scope="row">Marca:</th>
                      <td>{vehiculo.marca || "N/A"}</td>
                    </tr>
                    <tr>
                      <th scope="row">Modelo:</th>
                      <td>{vehiculo.modelo || "N/A"}</td>
                    </tr>
                    <tr>
                      <th scope="row">Año de Fabricación:</th>
                      <td>{vehiculo.year_fabricacion || "N/A"}</td>
                    </tr>
                    <tr>
                      <th scope="row">Tipo:</th>
                      <td>{vehiculo.tipo || "N/A"}</td>
                    </tr>
                    <tr>
                      <th scope="row">Fecha de Creación:</th>
                      <td>{new Date(vehiculo.created_at).toLocaleString() || "N/A"}</td>
                    </tr>
                    <tr>
                      <th scope="row">Última Actualización:</th>
                      <td>{new Date(vehiculo.updated_at).toLocaleString() || "N/A"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Col>
          </Row>
          <div className="d-flex justify-content-between mt-4">
            <Link to="/GestionVehiculos" className="btn btn-secondary btn-regresar">
              <i className="fas fa-arrow-left"></i> Regresar
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default DetallesVehiculo;
