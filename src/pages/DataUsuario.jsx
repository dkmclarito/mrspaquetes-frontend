import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, CardBody, Table, Button,Badge } from "reactstrap";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import ModalAgregarEmpleado from "../components/Usuarios/ModalAgregarEmpleado";
import AuthService from "../services/authService";
import Breadcrumbs from "../components/Usuarios/Common/Breadcrumbs";

const API_URL = import.meta.env.VITE_API_URL;

const DataUsuario = () => {
  const { id } = useParams(); // Obtener ID del usuario desde los parámetros de la URL
  const [usuario, setUsuario] = useState(null);
  const [modalAgregarEmpleado, setModalAgregarEmpleado] = useState(false); // Estado para controlar el modal
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const token = AuthService.getCurrentUser();
        const response = await axios.get(`${API_URL}/auth/get_users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const foundUser = response.data.users.find((user) => user.id === parseInt(id, 10));
        if (foundUser) {
          // Obtener el nombre del empleado si está asignado
          if (foundUser.id_empleado) {
            const empleadoResponse = await axios.get(`${API_URL}/empleados`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            const empleadoAsignado = empleadoResponse.data.empleados.find(e => e.id === foundUser.id_empleado);
            foundUser.nombre_completo_empleado = empleadoAsignado ? `${empleadoAsignado.nombres} ${empleadoAsignado.apellidos}` : 'No asignado';
          } else {
            foundUser.nombre_completo_empleado = 'No asignado';
          }
          setUsuario(foundUser);
        } else {
          console.error("Usuario no encontrado");
        }
      } catch (error) {
        console.error("Error al obtener los datos del usuario:", error);
      }
    };

    fetchUsuario();
  }, [id]);

  const handleAgregarEmpleado = () => {
    setModalAgregarEmpleado(true); // Abrir el modal cuando se hace clic en "Agregar Empleado"
  };

  const handleEmpleadoAsignado = (nuevoEmpleado) => {
    setUsuario((prevUsuario) => ({
      ...prevUsuario,
      id_empleado: nuevoEmpleado.id,
      nombre_completo_empleado: `${nuevoEmpleado.nombres} ${nuevoEmpleado.apellidos}`,
    }));
    setModalAgregarEmpleado(false);
  };

  return (
    <div className="page-content">
      <Card>
        <CardBody>
          <h5 className="card-title">Datos de Usuario</h5>                
          <Row>
            <Col sm="12">
              <div className="table-responsive">
                <table className="table table-bordered tabla-datosusuario">
                {usuario ? (
                  <Table className="">
                    <tbody>
                      <tr>
                        <th scope="row" style={{ width: '150px', whiteSpace: 'nowrap' }}>ID:</th>
                        <td>
                        <Badge color="primary">{usuario.id}</Badge>
                        </td>
                      </tr>
                      <tr>
                      <th scope="row">Email:</th>
                        <td>{usuario.email}</td>
                      </tr>
                      <tr>
                      <th scope="row">Estado:</th>
                        <td>
                          <Badge color={usuario.id_estado === 1 ? "danger" : "success"}>
                          {usuario.status === 1 ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </td>
                      </tr>
                      <tr>
                      <th scope="row">Empleado:</th>
                        <td style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          {usuario.nombre_completo_empleado}
                          {!usuario.id_empleado && (
                            <Button color="primary" onClick={handleAgregarEmpleado} style={{ marginLeft: '10px' }}>
                              Asignar Empleado
                            </Button>
                          )}
                        </td>
                      </tr>
                      <tr>
                      <th scope="row">Rol:</th>
                        <td>{usuario.role_name || 'Desconocido'}</td>
                      </tr>
                      <tr>
                      <th scope="row">Fecha de creación:</th>
                        <td>{usuario.created_at ? usuario.created_at.split(' ')[0] : 'Fecha no disponible'}</td>
                      </tr>
                      <tr>
                      <th scope="row">Última actualización:</th>
                        <td>{usuario.updated_at ? usuario.updated_at.split(' ')[0] : 'Fecha no disponible'}</td>
                      </tr>
                    </tbody>
                  </Table>
                ) : (
                  <p>Cargando datos del usuario...</p>
                )}
                </table>
              </div>
          </Col>
        </Row>
        <div className="d-flex justify-content-between mt-4">
        <Link to="/GestionUsuarios" className="btn btn-secondary btn-regresar">
              <i className="fas fa-arrow-left"></i> Regresar
        </Link>
        </div>      
        </CardBody>
        </Card>

      <ModalAgregarEmpleado
        isOpen={modalAgregarEmpleado}
        toggle={() => setModalAgregarEmpleado(false)}
        onEmpleadoAsignado={handleEmpleadoAsignado}
        usuario={usuario} // Pasamos el usuario completo al modal
      />
    </div>
  );
};

export default DataUsuario;


