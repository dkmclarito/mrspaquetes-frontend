import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Card, CardBody, Button, Badge } from "reactstrap";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import AuthService from "../services/authService";
import Breadcrumbs from "../components/RolesPermisos/Common/Breadcrumbs";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

const API_URL = import.meta.env.VITE_API_URL;

// Mapeo de permisos a español
const permisosEspañol = {
  "auth-get_user_by_id": "Obtener usuario por ID",
  "auth-get_users": "Obtener usuarios",
  "auth-assign_user_role": "Asignar rol a usuario",
  "auth-assign_permissions_to_role": "Asignar permisos a rol",
  "auth-update": "Actualizar autenticación",
  "auth-store": "Almacenar autenticación",
  "auth-adminClienteRegistrar": "Registrar cliente como administrador",
  "auth-actualizarClientePerfil": "Actualizar perfil del cliente",
  "auth-destroy": "Eliminar autenticación",
  "roles-view": "Ver roles",
  "roles-create": "Crear roles",
  "roles-update": "Actualizar roles",
  "roles-assign_permissions": "Asignar permisos a roles",
  "roles-destroy": "Eliminar roles",
  "permission-view": "Ver permisos",
  "permission-create": "Crear permisos",
  "permission-update": "Actualizar permisos",
  "permission-destroy": "Eliminar permisos",
  "tipoPersona-view": "Ver tipo de persona",
  "tipoPersona-create": "Crear tipo de persona",
  "tipoPersona-update": "Actualizar tipo de persona",
  "tipoPersona-destroy": "Eliminar tipo de persona",
  "clientes-view": "Ver clientes",
  "clientes-create": "Crear clientes",
  "clientes-update": "Actualizar clientes",
  "clientes-destroy": "Eliminar clientes",
  "modeloVehiculo-view": "Ver modelo de vehículo",
  "modeloVehiculo-show": "Mostrar modelo de vehículo",
  "modeloVehiculo-create": "Crear modelo de vehículo",
  "modeloVehiculo-update": "Actualizar modelo de vehículo",
  "modeloVehiculo-destroy": "Eliminar modelo de vehículo",
  "marcaVehiculo-view": "Ver marca de vehículo",
  "marcaVehiculo-show": "Mostrar marca de vehículo",
  "marcaVehiculo-create": "Crear marca de vehículo",
  "marcaVehiculo-update": "Actualizar marca de vehículo",
  "marcaVehiculo-destroy": "Eliminar marca de vehículo",
  "vehiculo-view": "Ver vehículo",
  "vehiculo-show": "Mostrar vehículo",
  "vehiculo-create": "Crear vehículo",
  "vehiculo-update": "Actualizar vehículo",
  "vehiculo-destroy": "Eliminar vehículo",
  "empleados-view": "Ver empleados",
  "empleados-show": "Mostrar empleados",
  "empleados-create": "Crear empleados",
  "empleados-update": "Actualizar empleados",
  "empleados-destroy": "Eliminar empleados",
  "rutas-view": "Ver rutas",
  "rutas-show": "Mostrar rutas",
  "rutas-create": "Crear rutas",
  "rutas-update": "Actualizar rutas",
  "rutas-destroy": "Eliminar rutas",
  "direcciones-view": "Ver direcciones",
  "direcciones-show": "Mostrar direcciones",
  "direcciones-create": "Crear direcciones",
  "direcciones-update": "Actualizar direcciones",
  "direcciones-destroy": "Eliminar direcciones",
  "bodegas-view": "Ver bodegas",
  "bodegas-show": "Mostrar bodegas",
  "bodegas-create": "Crear bodegas",
  "bodegas-update": "Actualizar bodegas",
  "bodegas-destroy": "Eliminar bodegas",
  "asignacionrutas-view": "Ver asignación de rutas",
  "asignacionrutas-show": "Mostrar asignación de rutas",
  "asignacionrutas-create": "Crear asignación de rutas",
  "asignacionrutas-update": "Actualizar asignación de rutas",
  "asignacionrutas-destroy": "Eliminar asignación de rutas",
  "paquete-view": "Ver paquete",
  "paquete-show": "Mostrar paquete",
  "paquete-create": "Crear paquete",
  "paquete-update": "Actualizar paquete",
  "paquete-destroy": "Eliminar paquete",
  "paquete-restore": "Restaurar paquete",
  "historialpaquetes-view": "Ver historial de paquetes",
  "historialpaquete-show": "Mostrar historial de paquete",
  "incidencias-view": "Ver incidencias",
  "incidencias-create": "Crear incidencias",
  "incidencias-show": "Mostrar incidencias",
  "incidencias-update": "Actualizar incidencias",
  "incidencias-destroy": "Eliminar incidencias",
  "orden-view": "Vista de órdenes",
  "orden-show": "Mostrar órden",
  "orden-create": "Crear órden",
  "orden-update": "Actualizar órden",
  "orden-destroy": "Eliminar órden",
  "orden-cliente": "Orden del cliente",
  "mis-ordenes-cliente": "Mis órdenes del cliente",
  "rutarecoleccion-view": "Ver ruta de recolección",
  "rutarecoleccion-show": "Mostrar ruta de recolección",
  "rutarecoleccion-create": "Crear ruta de recolección",
  "rutarecoleccion-update": "Actualizar ruta de recolección",
  "rutarecoleccion-destroy": "Eliminar ruta de recolección",
  "ordenrecoleccion-view": "Ver orden de recolección",
  "ordenrecoleccion-show": "Mostrar orden de recolección",
  "ordenrecoleccion-create": "Crear orden de recolección",
  "ordenrecoleccion-update": "Actualizar orden de recolección",
  "ordenrecoleccion-destroy": "Eliminar orden de recolección",
  "ubicaciones-view": "Ver ubicaciones",
  "ubicaciones-show": "Mostrar ubicaciones",
  "ubicaciones-create": "Crear ubicaciones",
  "ubicaciones-update": "Actualizar ubicaciones",
  "ubicaciones-destroy": "Eliminar ubicaciones",
  "ubicacionespaquetes-view": "Ver ubicaciones de paquetes",
  "ubicacionespaquetes-show": "Mostrar ubicaciones de paquetes",
  "ubicacionespaquetes-create": "Crear ubicaciones de paquetes",
  "ubicacionespaquetes-update": "Actualizar ubicaciones de paquetes",
  "ubicacionespaquetes-destroy": "Eliminar ubicaciones de paquetes",
  "pasillos-view": "Ver pasillos",
  "pasillos-show": "Mostrar pasillos",
  "pasillos-create": "Crear pasillos",
  "pasillos-update": "Actualizar pasillos",
  "pasillos-destroy": "Eliminar pasillos",
  "traslados-view": "Ver traslados",
  "traslados-show": "Mostrar traslados",
  "traslados-create": "Crear traslados",
  "traslados-update": "Actualizar traslados",
  "traslados-destroy": "Eliminar traslados",
  "traslados-pdf": "Generar PDF de traslados",
  "ubicacion-paquetes-danados-index": "Índice de paquetes dañados",
  "ubicacion-paquetes-danados-store": "Almacenar ubicación de paquetes dañados",
  "ubicacion-paquetes-danados-show": "Mostrar ubicación de paquetes dañados",
  "ubicacion-paquetes-danados-update": "Actualizar ubicación de paquetes dañados",
  "ubicacion-paquetes-danados-destroy": "Eliminar ubicación de paquetes dañados",
};


const DataRol = () => {
  const { id } = useParams();
  const [rol, setRol] = useState(null);
  const [permisosAsignados, setPermisosAsignados] = useState([]);
  const [showAllPermissions, setShowAllPermissions] = useState(false);
  const navigate = useNavigate();

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

  const fetchRolDetails = useCallback(async () => {
    try {
      const token = AuthService.getCurrentUser();

      // Obtener detalles del rol
      const rolesResponse = await axios.get(`${API_URL}/roles`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const rolesData = rolesResponse.data;
      const role = rolesData.find((role) => role.id === parseInt(id));
      setRol(role || { name: "Desconocido" });

      // Obtener permisos asignados al rol
      const permisosResponse = await axios.get(
        `${API_URL}/auth/get_assigned_permissions_to_role/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const permisosData = permisosResponse.data.permissions;
      const assignedPermissions = permisosData.filter((permiso) => permiso.assigned);
      setPermisosAsignados(assignedPermissions);
    } catch (error) {
      console.error("Error al obtener los detalles del rol:", error);
    }
  }, [id]);

  useEffect(() => {
    fetchRolDetails();
  }, [fetchRolDetails]);

  const handleBack = () => {
    navigate("/GestionRolesPermisos");
  };

  const displayedPermissions = showAllPermissions ? permisosAsignados : permisosAsignados.slice(0, 5);

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Roles y Permisos" breadcrumbItem="Detalles del Rol" />
        <Card>
          <CardBody>
            <h5 className="card-title">Detalles del Rol</h5>
            <Row>
              <Col sm="12">
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <tbody>
                      <tr>
                        <th scope="row" style={{ width: "200px", whiteSpace: "nowrap" }}>
                          ID:
                        </th>
                        <td>
                          <Badge color="primary">{rol?.id}</Badge>
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">Nombre del Rol:</th>
                        <td>{rol?.name || "Desconocido"}</td>
                      </tr>
                      <tr>
                        <th scope="row">Permisos Asignados:</th>
                        <td>
                          {permisosAsignados.length > 0 ? (
                            <div>
                              {displayedPermissions.map((permiso) => (
                                <div key={permiso.id} style={{ display: 'flex', alignItems: 'center' }}>
                                  <FontAwesomeIcon icon={faCheckCircle} color="green" className="me-2" />
                                  <span style={{ background: 'none' }}>{permisosEspañol[permiso.name] || permiso.name}</span>
                                </div>
                              ))}
                              {permisosAsignados.length > 5 && (
                                <Button color="secondary" onClick={() => setShowAllPermissions(!showAllPermissions)}>
                                  {showAllPermissions ? "Ver menos" : "Ver más"}
                                </Button>
                              )}
                            </div>
                          ) : (
                            "No hay permisos asignados."
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Col>
            </Row>
            <div className="d-flex justify-content-between mt-4">
              <Link to="/GestionRolesPermisos" className="btn btn-secondary btn-regresar">
                <i className="fas fa-arrow-left"></i> Regresar
              </Link>
              <Link to={`/AgregarRolesPermisos/${id}`} className="btn btn-primary">
                Quitar o asignar más permisos
              </Link>

            </div>



          </CardBody>
        </Card>
      </Container>
    </div>
  );
};

export default DataRol;
