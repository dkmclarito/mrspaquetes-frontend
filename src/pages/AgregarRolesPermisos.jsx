import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Card, CardBody, Button, FormGroup, Label, Input } from 'reactstrap';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import AuthService from '../services/authService';
import Breadcrumbs from "../components/RolesPermisos/Common/Breadcrumbs";

const API_URL = import.meta.env.VITE_API_URL;

const permisosEspañol = {
    //... mapeo de permisos en español ...
};

const AgregarRolesPermisos = () => {
    const { id } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();
    const [permisos, setPermisos] = useState([]);
    const [permisosAsignados, setPermisosAsignados] = useState([]);
    const [roleName, setRoleName] = useState(state?.name || ''); 

    const checkUserStatus = async () => {
        try {
            const token = AuthService.getCurrentUser();
            const userId = localStorage.getItem("userId");
            const role = JSON.parse(localStorage.getItem("role"))?.role;

            if (!token || !userId) {
                console.warn("Token o User ID no disponible, redirigiendo al login.");
                navigate("/login");
                return;
            }

            const response = await axios.get(`${API_URL}/auth/get_users`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const user = response.data.users.find(u => u.id === parseInt(userId, 10));

            if (user) {
                if (user.status === 0) {
                    console.warn("Usuario inactivo, cerrando sesión.");
                    AuthService.logout();

                    if (role === "admin" || role === "empleado" || role === "basico") {
                        navigate("/login");
                    } else {
                        navigate("/clientelogin");
                    }

                    window.location.reload();
                } else {
                    console.log("Usuario activo, puede continuar.");
                }
            } else {
                console.error("Usuario no encontrado en la respuesta.");
                AuthService.logout();
                navigate("/login");
                window.location.reload();
            }
        } catch (error) {
            console.error("Error al verificar el estado del usuario:", error);
            AuthService.logout();
            navigate("/login");
            window.location.reload();
        }
    };

    useEffect(() => {
        checkUserStatus();

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
    }, [id, navigate]);

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
