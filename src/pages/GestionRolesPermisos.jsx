import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, CardBody, Button } from "reactstrap";
import Breadcrumbs from "../components/RolesPermisos/Common/Breadcrumbs";
import TablaRolesPermisos from "../components/RolesPermisos/TablaRolesPermisos";
import AuthService from "../services/authService"; 
import ModalConfirmarEliminar from "../components/RolesPermisos/ModalConfirmarEliminar"; // Importa el modal de confirmación

const API_URL = import.meta.env.VITE_API_URL;

const roleAliases = {
    admin: 'Administrador',
    cliente: 'Cliente',
    conductor: 'Conductor',
    basico: 'Básico'
};

const GestionRolesPermisos = () => {
    const [roles, setRoles] = useState([]);
    const [roleAEliminar, setRoleAEliminar] = useState(null); // Estado para manejar el rol a eliminar
    const [confirmarEliminar, setConfirmarEliminar] = useState(false); // Estado para mostrar el modal de confirmación
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
        const fetchRoles = async () => {
            const token = AuthService.getCurrentUser(); 
            if (!token) {
                console.error("No se encontró token de autorización.");
                return;  
            }
            
            const response = await axios.get(`${API_URL}/roles`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data && Array.isArray(response.data)) {
                const transformedRoles = response.data.map(role => ({
                    ...role,
                    alias: roleAliases[role.name] || role.name 
                }));
                setRoles(transformedRoles);
            } else {
                console.error('Datos recibidos no son un array:', response.data);
            }
        };

        fetchRoles();
    }, []);

    const handleAssignPermissions = (id, name) => {
        navigate(`/AgregarRolesPermisos/${id}`, { state: { name } }); 
    };

    const handleAddRole = () => {
        navigate('/AgregarNuevoRol'); 
    };

    const handleDeleteRole = (id) => {
        setRoleAEliminar(id); 
        setConfirmarEliminar(true); 
    };

    const confirmarEliminarRole = async () => {
        try {
            const token = AuthService.getCurrentUser();
            await axios.delete(`${API_URL}/roles/${roleAEliminar}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setRoles(prevRoles => prevRoles.filter(role => role.id !== roleAEliminar));
        } catch (error) {
            console.error("Error al eliminar el rol:", error);
            alert("No se pudo eliminar el rol. Inténtelo de nuevo más tarde.");
        } finally {
            setConfirmarEliminar(false); 
            setRoleAEliminar(null); 
        }
    };

    return (
        <Container fluid>
            <Breadcrumbs title="Roles y Permisos" breadcrumbItem="Lista de Roles" />
            <Row>
                <Col lg={12}>
                    <Card>
                        <CardBody>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h4 className="card-title">Roles</h4>
                                <Button color="primary" onClick={handleAddRole}>
                                    Agregar Nuevo Rol
                                </Button>
                            </div>
                            <TablaRolesPermisos
                                roles={roles}
                                onAssignPermissions={handleAssignPermissions}
                                onDeleteRole={handleDeleteRole} // Pasamos la función de eliminar rol a la tabla
                            />
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            <ModalConfirmarEliminar
                confirmarEliminar={confirmarEliminar}
                confirmarEliminarUsuario={confirmarEliminarRole}
                setConfirmarEliminar={setConfirmarEliminar}
            />
        </Container>
    );
};

export default GestionRolesPermisos;
