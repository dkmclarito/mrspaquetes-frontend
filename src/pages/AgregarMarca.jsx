import React, { useState, useEffect, useCallback } from "react";
import { Card, CardBody, Col, Row, Container, Form, FormGroup, Label, Input, Button, FormFeedback } from "reactstrap";
import Breadcrumbs from "../components/Vehiculos/Common/Breadcrumbs";
import AuthService from "../services/authService";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import "../styles/Vehiculos.css";

const API_URL = import.meta.env.VITE_API_URL;

const AgregarMarca = () => {
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [isNombreValid, setIsNombreValid] = useState(true);

    const navigate = useNavigate();
    const token = AuthService.getCurrentUser();

    const verificarEstadoUsuarioLogueado = useCallback(async () => {
        try {
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
            //AuthService.logout();
            //window.location.href = "/login";
        }
    }, [token]);

    useEffect(() => {
        verificarEstadoUsuarioLogueado(); // Verifica el estado del usuario al cargar la página

        const interval = setInterval(() => {
            verificarEstadoUsuarioLogueado(); // Verifica el estado del usuario cada cierto tiempo
        }, 30000); // Verifica cada 30 segundos, ajusta según sea necesario

        return () => clearInterval(interval); // Limpia el intervalo al desmontar el componente
    }, [verificarEstadoUsuarioLogueado]);

    const handleNombreChange = (e) => {
        const value = e.target.value;
        setNombre(value);
        setIsNombreValid(value.trim().length > 0); // Validar si el nombre no está vacío
    };

    const handleDescripcionChange = (e) => {
        setDescripcion(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isNombreValid) {
            toast.error("Por favor, ingresa un nombre válido.");
            return;
        }

        const marcaData = {
            nombre,
            descripcion,
        };

        try {
            const response = await axios.post(`${API_URL}/marcaVehiculo`, marcaData, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                }
            });

            toast.success("Marca agregada exitosamente!", { position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true, });
            setTimeout(() => navigate('/GestionMarcas'), 2000);
            resetForm();
        } catch (error) {
            handleError(error);
        }
    };

    const resetForm = () => {
        setNombre("");
        setDescripcion("");
    };

    const handleError = (error) => {
        let errorMessage = "Hubo un error al agregar la marca.";
        if (error.response && error.response.data) {
            errorMessage = error.response.data.message || errorMessage;
        }
        toast.error(errorMessage, { position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true, });
    };

    return (
        <Container>
            <Breadcrumbs title="Marcas" breadcrumbItem="Agregar Marca" />
            <Row>
                <Col lg="12">
                    <Card>
                        <CardBody>
                            <Form onSubmit={handleSubmit}>
                                <FormGroup>
                                    <Label for="nombre">Nombre</Label>
                                    <Input
                                        type="text"
                                        id="nombre"
                                        value={nombre}
                                        onChange={handleNombreChange}
                                        invalid={!isNombreValid}
                                        required
                                    />
                                    <FormFeedback>Por favor, ingresa un nombre válido.</FormFeedback>
                                </FormGroup>
                                <FormGroup>
                                    <Label for="descripcion">Descripción</Label>
                                    <Input
                                        type="textarea"
                                        id="descripcion"
                                        value={descripcion}
                                        onChange={handleDescripcionChange}
                                        required
                                    />
                                </FormGroup>
                                <Button type="submit" color="primary">Agregar Marca</Button>
                            </Form>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AgregarMarca;
