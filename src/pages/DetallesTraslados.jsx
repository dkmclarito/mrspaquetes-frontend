import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardBody,
  Col,
  Row,
  Badge,
  Spinner,
  Table,
  Button,
} from "reactstrap";
import { Link, useParams, useNavigate } from "react-router-dom";
import Breadcrumbs from "../components/Traslados/Common/Breadcrumbs";
import axios from "axios";
import AuthService from "../services/authService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = import.meta.env.VITE_API_URL;

const TAMANO_PAQUETE = {
  pequeno: "Pequeño",
  mediano: "Mediano",
  grande: "Grande"
};

export default function DetallesTraslados() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [traslado, setTraslado] = useState(null);
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

        const trasladoResponse = await axios.get(`${API_URL}/traslados/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (trasladoResponse.data && trasladoResponse.data.id_traslado) {
          setTraslado(trasladoResponse.data);
        } else {
          throw new Error("No se encontraron datos para este traslado.");
        }
      } catch (error) {
        console.error("Error al obtener los datos:", error);
        setError(
          error.message ||
            "Error al obtener los datos. Por favor, intente nuevamente."
        );
        toast.error("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const finalizarTraslado = async () => {
    try {
      const token = AuthService.getCurrentUser();
      await axios.post(
        `${API_URL}/finalizar-traslado`,
        { id_traslado: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Traslado finalizado con éxito");
      setTraslado((prevTraslado) => ({
        ...prevTraslado,
        estado: "Completado",
      }));
    } catch (error) {
      console.error("Error al finalizar el traslado:", error);
      toast.error(
        error.response?.data?.message || "Error al finalizar el traslado"
      );
    }
  };

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

  return (
    <div className="page-content">
      <Breadcrumbs
        title="Gestión de Traslados"
        breadcrumbItem="Detalles de Traslado"
      />
      <Card>
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="card-title mb-0">Detalles del Traslado</h5>
            {traslado &&
              traslado.estado !== "Completado" &&
              traslado.estado !== "Cancelado" && (
                <Button color="primary" onClick={finalizarTraslado}>
                  Finalizar Traslado
                </Button>
              )}
          </div>
          <Row>
            <Col sm="12">
              <div className="table-responsive">
                <table className="table table-bordered">
                  <tbody>
                    <tr>
                      <th
                        scope="row"
                        style={{ width: "200px", whiteSpace: "nowrap" }}
                      >
                        ID:
                      </th>
                      <td>
                        <Badge color="primary">{traslado.id_traslado}</Badge>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">Número de Traslado:</th>
                      <td>{traslado.numero_traslado || "N/A"}</td>
                    </tr>
                    <tr>
                      <th scope="row">Bodega de Origen:</th>
                      <td>{traslado.bodega_origen || "N/A"}</td>
                    </tr>
                    <tr>
                      <th scope="row">Bodega de Destino:</th>
                      <td>{traslado.bodega_destino || "N/A"}</td>
                    </tr>
                    <tr>
                      <th scope="row">Fecha de Traslado:</th>
                      <td>
                        {traslado.fecha_traslado
                          ? new Date(traslado.fecha_traslado).toLocaleDateString("es-ES")
                          : "N/A"}
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">Estado:</th>
                      <td>
                        <Badge
                          color={
                            traslado.estado === "Pendiente"
                              ? "warning"
                              : "success"
                          }
                        >
                          {traslado.estado}
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">Cantidad de Paquetes:</th>
                      <td>{traslado.total_paquetes}</td>
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
                    <th>UUID</th>
                    <th>Tipo de Paquete</th>
                    <th>Tamaño de Paquete</th>
                    <th>Descripción del Contenido</th>
                  </tr>
                </thead>
                <tbody>
                  {traslado.paquetes && traslado.paquetes.length > 0 ? (
                    traslado.paquetes.map((paquete) => (
                      <tr key={paquete.uuid}>
                        <td>{paquete.uuid}</td>
                        <td>{paquete.tipo_paquete}</td>
                        <td>{TAMANO_PAQUETE[paquete.tamano_paquete] || paquete.tamano_paquete}</td>
                        <td>{paquete.descripcion_contenido || "Sin descripción"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center">
                        No hay paquetes asociados a este traslado
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Col>
          </Row>
          <div className="d-flex justify-content-between mt-4">
            <Link
              to="/GestionTraslados"
              className="btn btn-secondary btn-regresar"
            >
              <i className="fas fa-arrow-left"></i> Regresar
            </Link>
          </div>
        </CardBody>
      </Card>
      <ToastContainer />
    </div>
  );
}