import React, { useState, useEffect, useCallback } from "react";
import { Card, CardBody, Col, Row, Container, Form, FormGroup, Label, Input, Button } from "reactstrap";
import Breadcrumbs from "../components/Vehiculos/Common/Breadcrumbs";
import AuthService from "../services/authService";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import "../styles/Vehiculos.css";

const API_URL = import.meta.env.VITE_API_URL;

const OrdenEntregada = () => {
    const [idPaquete, setIdPaquete] = useState("");
    const [imagen, setImagen] = useState(null);
    const [alertaError, setAlertaError] = useState(false);
    const [errorMensaje, setErrorMensaje] = useState("");

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
        }
    }, [token]);

    useEffect(() => {
        verificarEstadoUsuarioLogueado(); // Verifica el estado del usuario al cargar la página

        const interval = setInterval(() => {
            verificarEstadoUsuarioLogueado(); // Verifica el estado del usuario cada cierto tiempo
        }, 30000); // Verifica cada 30 segundos

        return () => clearInterval(interval); // Limpia el intervalo al desmontar el componente
    }, [verificarEstadoUsuarioLogueado]);

    const handleIdPaqueteChange = (e) => {
        setIdPaquete(e.target.value);
    };

    const handleImagenChange = (e) => {
        if (e.target.files[0]) {
            setImagen(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!idPaquete || !imagen) {
            setErrorMensaje("Por favor, proporciona el codigo Qr del paquete y selecciona una imagen.");
            toast.error("Por favor, completa todos los campos requeridos.", { position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true, });
            return;
        }

        const formData = new FormData();
        formData.append("uuid", idPaquete);
        formData.append("validacion_entrega", imagen);

        try {
            const response = await axios.post(`${API_URL}/validacion-entrega`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });

            toast.success("Paquete validado exitosamente!", { position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true, });
            //setTimeout(() => navigate('/GestionPaquetes'), 2000); // Redirigir después de 2 segundos
            resetForm();
        } catch (error) {
            handleError(error);
        }
    };

    const resetForm = () => {
        setIdPaquete("");
        setImagen(null);
    };

    const handleError = (error) => {
        let errorMessage = "Hubo un error al validar el paquete.";
        if (error.response && error.response.data) {
            errorMessage = error.response.data.message || errorMessage;
        }
        setErrorMensaje(errorMessage);
        toast.error(errorMessage, { position: "bottom-right", autoClose: 5000 });
    };

    return (
        <Container>
            <Breadcrumbs title="Validación" breadcrumbItem="Validar Entrega" />
            <Row>
                <Col lg="12">
                    <Card>
                        <CardBody>
                            <Form onSubmit={handleSubmit}>
                                <FormGroup>
                                    <Label for="idPaquete">ID del Paquete</Label>
                                    <Input
                                        type="text"
                                        id="idPaquete"
                                        value={idPaquete}
                                        onChange={handleIdPaqueteChange}
                                        required
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="imagen">Imagen de Entrega</Label>
                                    <Input
                                        type="file"
                                        id="imagen"
                                        accept="image/*"  // Esto permite seleccionar solo imágenes y abre la cámara en dispositivos móviles
                                        capture="environment"  // Esto intenta usar la cámara trasera del dispositivo
                                        onChange={handleImagenChange}
                                        required
                                    />
                                </FormGroup>
                                <Button type="submit" color="primary">Validar Entrega</Button>
                            </Form>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
            <ToastContainer />
        </Container>
    );
};

export default OrdenEntregada;
