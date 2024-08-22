import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, CardBody } from "reactstrap";
import Breadcrumbs from "../components/RolesPermisos/Common/Breadcrumbs";
import TablaRolesPermisos from "../components/RolesPermisos/TablaRolesPermisos";
import AuthService from "../services/authService"; 

const API_URL = import.meta.env.VITE_API_URL;

// Mapeo de nombres técnicos a nombres en español
const roleAliases = {
    admin: 'Administrador',
    cliente: 'Cliente',
    conductor: 'Conductor',
    basico: 'Básico'
};

const GestionRolesPermisos = () => {
    const [roles, setRoles] = useState([]);
    const navigate = useNavigate();

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
    }, [navigate]);

    const handleAssignPermissions = (id, name) => {
        navigate(`/AgregarRolesPermisos/${id}`, { state: { name } });
    };

    return (
        <Container fluid>
            <Breadcrumbs title="Roles y Permisos" breadcrumbItem="Lista de Roles" />
            <Row>
                <Col lg={12}>
                    <Card>
                        <CardBody>
                            <TablaRolesPermisos roles={roles} onAssignPermissions={handleAssignPermissions} />
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default GestionRolesPermisos;

