import React, { useEffect, useState, useCallback } from "react";
import { Card, CardBody, Col, Row, Badge, Spinner, Table } from "reactstrap";
import { Link, useParams, useNavigate } from "react-router-dom";
import Breadcrumbs from "../components/Traslados/Common/Breadcrumbs";
import axios from "axios";
import AuthService from "../services/authService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function DetallesTraslados() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [traslado, setTraslado] = useState(null);
  const [paquetes, setPaquetes] = useState([]);
  const [bodegas, setBodegas] = useState({});
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

        if (responseData.status === "Token is Invalid") {
          console.error("Token is invalid. Logging out...");
          AuthService.logout();
          navigate("/login");
          return;
        }
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Error al verificar el estado del usuario:", error);
      toast.error("Error al verificar el estado del usuario");
    }
  }, [navigate]);

  useEffect(() => {
    verificarEstadoUsuarioLogueado();
    const interval = setInterval(() => {
      verificarEstadoUsuarioLogueado();
    }, 30000);
    return () => clearInterval(interval);
  }, [verificarEstadoUsuarioLogueado]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = AuthService.getCurrentUser();
        if (!token) {
          throw new Error("No se encontró el token de autenticación");
        }

        const [trasladoResponse, paquetesResponse, bodegasResponse] = await Promise.all([
          axios.get(`${API_URL}/traslados/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/paquete`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/bodegas`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (trasladoResponse.data && trasladoResponse.data.id_traslado) {
          setTraslado(trasladoResponse.data);
        } else {
          throw new Error("No se encontraron datos para este traslado.");
        }

        setPaquetes(paquetesResponse.data.data || []);

        const bodegasMap = {};
        bodegasResponse.data.bodegas.forEach(bodega => {
          bodegasMap[bodega.id] = bodega;
        });
        setBodegas(bodegasMap);
      } catch (error) {
        console.error("Error al obtener los datos:", error);
        setError(error.message || "Error al obtener los datos. Por favor, intente nuevamente.");
        toast.error("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="page-content">
        <Spinner color="primary" />
        <p>Cargando detalles del traslado...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-content">
        <p>Error: {error}</p>
        <Link to="/GestionTraslados" className="btn btn-secondary btn-regresar">
          <i className="fas fa-arrow-left"></i> Regresar
        </Link>
      </div>
    );
  }

  if (!traslado) {
    return (
      <div className="page-content">
        <p>No se encontraron detalles para este traslado.</p>
        <Link to="/GestionTraslados" className="btn btn-secondary btn-regresar">
          <i className="fas fa-arrow-left"></i> Regresar
        </Link>
      </div>
    );
  }

  const paquetesDelTraslado = paquetes.filter(paquete => 
    traslado.paquetes && traslado.paquetes.some(p => p.id_paquete === paquete.id)
  );

  return (
    <div className="page-content">
      <Breadcrumbs title="Gestión de Traslados" breadcrumbItem="Detalles de Traslado" />
      <Card>
        <CardBody>
          <h5 className="card-title">Detalles del Traslado</h5>
          <Row>
            <Col sm="12">
              <div className="table-responsive">
                <table className="table table-bordered">
                  <tbody>
                    <tr>
                      <th scope="row" style={{ width: '200px', whiteSpace: 'nowrap' }}>ID:</th>
                      <td>
                        <Badge color="primary">{traslado.id_traslado}</Badge>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">Número de Traslado:</th>
                      <td>{traslado.numero_traslado || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th scope="row">Bodega de Origen:</th>
                      <td>
                        {bodegas[traslado.bodega_origen] 
                          ? `${bodegas[traslado.bodega_origen].nombre} (${bodegas[traslado.bodega_origen].tipo_bodega})` 
                          : 'N/A'}
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">Bodega de Destino:</th>
                      <td>
                        {bodegas[traslado.bodega_destino] 
                          ? `${bodegas[traslado.bodega_destino].nombre} (${bodegas[traslado.bodega_destino].tipo_bodega})` 
                          : 'N/A'}
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">Fecha de Traslado:</th>
                      <td>{traslado.fecha_traslado ? new Date(traslado.fecha_traslado).toLocaleDateString('es-ES') : 'N/A'}</td>
                    </tr>
                    <tr>
                      <th scope="row">Estado:</th>
                      <td>
                        <Badge color={traslado.estado === "Pendiente" ? "warning" : "success"}>
                          {traslado.estado}
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">Cantidad de Paquetes:</th>
                      <td>{paquetesDelTraslado.length}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Col>
          </Row>
          <h5 className="card-title mt-4">Paquetes en el Traslado</h5>
          <Row>
            <Col sm="12">
              <Table striped responsive>
                <thead>
                  <tr>
                    <th>ID Paquete</th>
                    <th>UUID</th>
                    <th>Tipo de Paquete</th>
                    <th>Tamaño de Paquete</th>
                    <th>Empaque</th>
                    <th>Peso</th>
                    <th>Estado</th>
                    <th>Fecha de Envío</th>
                    <th>Fecha de Entrega Estimada</th>
                    <th>Descripción del Contenido</th>
                  </tr>
                </thead>
                <tbody>
                  {paquetesDelTraslado.length > 0 ? (
                    paquetesDelTraslado.map((paquete) => (
                      <tr key={paquete.id}>
                        <td>{paquete.id}</td>
                        <td>{paquete.uuid}</td>
                        <td>{paquete.tipo_paquete}</td>
                        <td>{paquete.tamano_paquete}</td>
                        <td>{paquete.empaque}</td>
                        <td>{paquete.peso}</td>
                        <td>{paquete.estado_paquete}</td>
                        <td>{paquete.fecha_envio ? new Date(paquete.fecha_envio).toLocaleDateString('es-ES') : 'N/A'}</td>
                        <td>{paquete.fecha_entrega_estimada ? new Date(paquete.fecha_entrega_estimada).toLocaleDateString('es-ES') : 'N/A'}</td>
                        <td>{paquete.descripcion_contenido || 'Sin descripción'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="text-center">No hay paquetes asociados a este traslado</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Col>
          </Row>
          <div className="d-flex justify-content-between mt-4">
            <Link to="/GestionTraslados" className="btn btn-secondary btn-regresar">
              <i className="fas fa-arrow-left"></i> Regresar
            </Link>
          </div>
        </CardBody>
      </Card>
      <ToastContainer />
    </div>
  );
}