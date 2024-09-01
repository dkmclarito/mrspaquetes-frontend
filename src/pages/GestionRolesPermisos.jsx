import React, { useState, useEffect, useCallback } from "react";
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
        verificarEstadoUsuarioLogueado(); // Verifica el estado del usuario al cargar la página

        const interval = setInterval(() => {
            verificarEstadoUsuarioLogueado(); // Verifica el estado del usuario cada cierto tiempo
        }, 30000); // Verifica cada 30 segundos, ajusta según sea necesario

        return () => clearInterval(interval); // Limpia el intervalo al desmontar el componente
    }, [verificarEstadoUsuarioLogueado]);

    useEffect(() => {
        const fetchRoles = async () => {
            const token = AuthService.getCurrentUser(); 
            if (!token) {
                console.error("No se encontró token de autorización.");
                return;  // Sale de la función si no hay token
            }
            
            const response = await axios.get(`${API_URL}/roles`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data && Array.isArray(response.data)) {
                const transformedRoles = response.data.map(role => ({
                    ...role,
                    alias: roleAliases[role.name] || role.name  // Usa el alias si está disponible, de lo contrario usa el nombre original
                }));
                setRoles(transformedRoles);
            } else {
                console.error('Datos recibidos no son un array:', response.data);
            }
        };

        fetchRoles();
    }, []);

    const handleAssignPermissions = (id, name) => {
        navigate(`/AgregarRolesPermisos/${id}`, { state: { name } });  // Navega a la página para asignar permisos con el nombre del rol
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
