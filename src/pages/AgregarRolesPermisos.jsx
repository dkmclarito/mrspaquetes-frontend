import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Card, CardBody, Button, FormGroup, Label, Input } from 'reactstrap';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import AuthService from '../services/authService';
import Breadcrumbs from "../components/RolesPermisos/Common/Breadcrumbs";

const API_URL = import.meta.env.VITE_API_URL;

// Mapeo de permisos a español
const permisosEspañol = {
    "auth-view_user": "Ver usuario",
    "auth-get_user_by_id": "Obtener usuario por ID",
    "auth-get_users": "Obtener usuarios",
    "auth-assign_user_role": "Asignar rol a usuario",
    "auth-assign_permissions_to_role": "Asignar permisos a rol",
    "auth-update": "Actualizar autenticación",
    "auth-store": "Almacenar autenticación",
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
    "destinos-view": "Ver destinos",
    "destinos-show": "Mostrar destinos",
    "destinos-create": "Crear destinos",
    "destinos-update": "Actualizar destinos",
    "destinos-destroy": "Eliminar destinos",
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
    "orden-update": "Actulizar órden",
    "orden-destroy": "Eliminar órden"
};

const AgregarRolesPermisos = () => {
    const { id } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();
    const [permisos, setPermisos] = useState([]);
    const [permisosAsignados, setPermisosAsignados] = useState([]);
    const [roleName, setRoleName] = useState(state?.name || ''); 

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
           // AuthService.logout();
           // window.location.href = "/login";
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
        const fetchPermisosAsignados = async () => {
            try {
                const token = AuthService.getCurrentUser(); 
                const permisosResponse = await axios.get(`${API_URL}/auth/get_assigned_permissions_to_role/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const permisosData = permisosResponse.data.permissions;
                if (Array.isArray(permisosData)) {
                    setPermisos(permisosData);
                    setPermisosAsignados(permisosData.filter(permiso => permiso.assigned).map(permiso => permiso.id));
                } else {
                    console.error('La respuesta de la API no es un array:', permisosData);
                }
            } catch (error) {
                console.error('Error al obtener permisos asignados:', error);
            }
        };

        fetchPermisosAsignados();
    }, [id]);

    const handlePermisoChange = (permisoId, isChecked) => {
        setPermisosAsignados(current => {
            if (isChecked) {
                return [...current, permisoId];
            } else {
                return current.filter(id => id !== permisoId);
            }
        });
    };

    const handleSubmit = async () => {
        try {
            const token = AuthService.getCurrentUser();
            await axios.post(`${API_URL}/auth/assign_permissions_to_role/${id}`, {
                permissions: permisosAsignados
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            alert('Permisos actualizados exitosamente!');
            navigate('/GestionRolesPermisos');
        } catch (error) {
            console.error('Error al actualizar permisos:', error);
            alert('Error al actualizar permisos.');
        }
    };

    const showConfirmationDialog = () => {
        if (!roleName) {
            alert('El nombre del rol no se ha cargado aún. Por favor, espere.');
            return;
        }

        confirmAlert({
            title: `Permisos para ${roleName}`,
            message: '¿Está seguro de asignar a este rol los permisos seleccionados?',
            buttons: [
                {
                    label: 'SI ASIGNAR',
                    onClick: handleSubmit
                },
                {
                    label: 'CANCELAR'
                }
            ]
        });
    };

    const handleBack = () => {
        navigate('/GestionRolesPermisos');
    };

    return (
        <Container fluid>
            <Breadcrumbs title="Roles y Permisos" breadcrumbItem="Lista de Permisos" />
            <Row>
                <Col lg={12}>
                    <Card>
                        <CardBody>
                            <h3>Asignación de permisos al rol de {roleName}</h3>
                            <br />
                            {Array.isArray(permisos) ? permisos.map(permiso => (
                                <FormGroup key={permiso.id}>
                                    <Label check>
                                        <Input
                                            type="checkbox"
                                            checked={permisosAsignados.includes(permiso.id)}
                                            onChange={e => handlePermisoChange(permiso.id, e.target.checked)}
                                        />{' '}
                                        {permisosEspañol[permiso.name] || permiso.name} 
                                    </Label>
                                </FormGroup>
                            )) : <p>Cargando permisos...</p>}
                            <hr />
                            <Button color="primary" onClick={showConfirmationDialog} style={{ marginRight: '10px' }}>
                                Guardar Cambios
                            </Button>
                            <Button color="secondary" onClick={handleBack}>
                                Regresar
                            </Button>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AgregarRolesPermisos;
