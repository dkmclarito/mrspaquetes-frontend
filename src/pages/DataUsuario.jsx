import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Card, CardBody, Button, Badge } from "reactstrap";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import AuthService from "../services/authService";
import Breadcrumbs from "../components/Usuarios/Common/Breadcrumbs";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';

const API_URL = import.meta.env.VITE_API_URL;

const DataUsuario = () => {
  const { id } = useParams();
  const [usuario, setUsuario] = useState(null);
  const [empleado, setEmpleado] = useState(null);
  const navigate = useNavigate();

  const fetchUsuario = useCallback(async () => {
    try {
      const token = AuthService.getCurrentUser();
      const response = await axios.get(`${API_URL}/auth/show/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.user) {
        setUsuario(response.data.user);
        if (response.data.user.id_empleado) {
          await fetchEmpleado(response.data.user.id_empleado, token);
        }
      } else {
        console.error("Usuario no encontrado");
      }
    } catch (error) {
      console.error("Error al obtener los datos del usuario:", error);
    }
  }, [id]);

  const fetchEmpleado = async (idEmpleado, token) => {
    try {
      const empleadoResponse = await axios.get(`${API_URL}/empleados/${idEmpleado}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEmpleado(empleadoResponse.data.empleado);
    } catch (error) {
      console.error("Error al obtener los datos del empleado:", error);
    }
  };

  useEffect(() => {
    fetchUsuario();
  }, [fetchUsuario]);

  const handleAgregarEmpleado = () => {
    navigate(`/AgregarEmpleado/${id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Gestión de Usuarios" breadcrumbItem="Datos de Usuario" />
        <Button color="primary" onClick={() => navigate("/GestionUsuarios")}>
          Volver a Usuarios
        </Button>
        <Card>
          <CardBody>
            <h5 className="card-title">Detalles del Usuario</h5>
            <Row>
              <Col sm="12">
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <tbody>
                      <tr>
                        <th scope="row" style={{ width: '200px', whiteSpace: 'nowrap' }}>ID:</th>
                        <td>
                          <Badge color="primary">{usuario?.id}</Badge>
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">Email:</th>
                        <td>{usuario?.email || 'N/A'}</td>
                      </tr>
                      <tr>
                        <th scope="row">Estado:</th>
                        <td>
                          <Badge color={usuario?.status === 1 ? "success" : "danger"}>
                            {usuario?.status === 1 ? "Activo" : "Inactivo"}
                          </Badge>
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">Empleado:</th>
                        <td>
                          {empleado ? (
                            <>
                              {`${empleado.nombres} ${empleado.apellidos}`}
                              <Link to={`/DetallesEmpleado/${empleado.id}`} className="btn btn-info btn-sm ms-2">
                                <FontAwesomeIcon icon={faEye} /> Ver detalles del empleado
                              </Link>
                            </>
                          ) : (
                            <>
                              No asignado
                              <Button color="primary" size="sm" onClick={handleAgregarEmpleado} style={{ marginLeft: '10px' }}>
                                Agregar Empleado
                              </Button>
                            </>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">Rol:</th>
                        <td>{usuario?.role_name || 'Desconocido'}</td>
                      </tr>
                      <tr>
                        <th scope="row">Fecha de creación:</th>
                        <td>{formatDate(usuario?.created_at)}</td>
                      </tr>
                      <tr>
                        <th scope="row">Última actualización:</th>
                        <td>{formatDate(usuario?.updated_at)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Container>
    </div>
  );
};

export default DataUsuario;