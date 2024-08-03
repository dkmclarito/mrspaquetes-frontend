import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, CardBody } from "reactstrap";
import Breadcrumbs from "../components/RolesPermisos/Common/Breadcrumbs";
import TablaRolesPermisos from "../components/RolesPermisos/TablaRolesPermisos";
import AuthService from "../services/authService"; 

const API_URL = import.meta.env.VITE_API_URL;

const GestionRolesPermisos = () => {
    const [roles, setRoles] = useState([]);
    const navigate = useNavigate();

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
                setRoles(response.data); 
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
