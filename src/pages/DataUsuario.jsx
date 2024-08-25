import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, CardBody, Table, Button } from "reactstrap";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
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
      <Container fluid>
        <Breadcrumbs title="Gestión de Usuarios" breadcrumbItem="Datos de Usuario" />
        <Button color="primary" onClick={() => navigate("/GestionUsuarios")}>
          Volver a Usuarios
        </Button>
        <h2 className="mt-4">Datos de Usuario</h2>
        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                {usuario ? (
                  <Table striped className="table-centered table-nowrap mb-0">
                    <thead className="thead-light">
                      <tr>
                        <th className="text-center">Campo</th>
                        <th className="text-center">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="text-center">ID</td>
                        <td className="text-center">{usuario.id}</td>
                      </tr>
                      <tr>
                        <td className="text-center">Email</td>
                        <td className="text-center">{usuario.email}</td>
                      </tr>
                      <tr>
                        <td className="text-center">Estado</td>
                        <td className="text-center">{usuario.status === 1 ? 'Activo' : 'Inactivo'}</td>
                      </tr>
                      <tr>
                        <td className="text-center">Empleado</td>
                        <td className="text-center">
                          {usuario.nombre_completo_empleado}
                          {!usuario.id_empleado && (
                            <Button color="secondary" onClick={handleAgregarEmpleado} style={{ marginLeft: '10px' }}>
                              Asignar Empleado
                            </Button>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="text-center">Rol</td>
                        <td className="text-center">{usuario.role_name || 'Desconocido'}</td>
                      </tr>
                      <tr>
                        <td className="text-center">Fecha de creación</td>
                        <td className="text-center">{usuario.created_at ? usuario.created_at.split(' ')[0] : 'Fecha no disponible'}</td>
                      </tr>
                      <tr>
                        <td className="text-center">Última actualización</td>
                        <td className="text-center">{usuario.updated_at ? usuario.updated_at.split(' ')[0] : 'Fecha no disponible'}</td>
                      </tr>
                    </tbody>
                  </Table>
                ) : (
                  <p>Cargando datos del usuario...</p>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

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


