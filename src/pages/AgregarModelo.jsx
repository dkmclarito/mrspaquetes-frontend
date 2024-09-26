import React, { useState, useEffect, useCallback } from "react";
import { Card, CardBody, Col, Row, Container, Form, FormGroup, Label, Input, Button, Alert } from "reactstrap";
import Breadcrumbs from "../components/Vehiculos/Common/Breadcrumbs";
import AuthService from "../services/authService";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import "../styles/Vehiculos.css";

const API_URL = import.meta.env.VITE_API_URL;

const AgregarModelo = () => {
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [marcaSeleccionada, setMarcaSeleccionada] = useState("");
    const [marcas, setMarcas] = useState([]);
    const [isNombreValid, setIsNombreValid] = useState(true);
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
            // AuthService.logout();
            // window.location.href = "/login";
        }
    }, [token]);

    useEffect(() => {
        verificarEstadoUsuarioLogueado(); // Verifica el estado del usuario al cargar la página

        const interval = setInterval(() => {
            verificarEstadoUsuarioLogueado(); // Verifica el estado del usuario cada cierto tiempo
        }, 30000); // Verifica cada 30 segundos, ajusta según sea necesario

        return () => clearInterval(interval); // Limpia el intervalo al desmontar el componente
    }, [verificarEstadoUsuarioLogueado]);

    useEffect(() => {
        const fetchMarcas = async () => {
            try {
                const response = await axios.get(`${API_URL}/dropdown/get_marcas`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setMarcas(response.data.marcas || []);
            } catch (error) {
                handleError(error);
            }
        };

        fetchMarcas();
    }, [token]);

    const handleNombreChange = (e) => {
        const value = e.target.value;
        setNombre(value);
        setIsNombreValid(value.trim().length > 0);
    };

    const handleDescripcionChange = (e) => {
        setDescripcion(e.target.value);
    };

    const handleMarcaChange = (e) => {
        setMarcaSeleccionada(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isNombreValid || !marcaSeleccionada) {
            setErrorMensaje("Por favor, completa todos los campos requeridos.");
            toast.error("Por favor, completa todos los campos requeridos.", { position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true, });
            return;
        }

        const modeloData = {
            nombre,
            descripcion,
            id_marca: marcaSeleccionada,
        };

        try {
            const response = await axios.post(`${API_URL}/modeloVehiculo`, modeloData, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                }
            });

            toast.success("Modelo agregado exitosamente!", { position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true, });
            setTimeout(() => navigate('/GestionModelos'), 2000);
            resetForm();
        } catch (error) {
            handleError(error);
        }
    };

    const resetForm = () => {
        setNombre("");
        setDescripcion("");
        setMarcaSeleccionada("");
    };

    const handleError = (error) => {
        let errorMessage = "Hubo un error al agregar el modelo.";
        if (error.response && error.response.data) {
            errorMessage = error.response.data.message || errorMessage;
        }
        setErrorMensaje(errorMessage);
        toast.error(errorMessage, { position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true, });
    };
    const handleExit = () => {    
        navigate("/GestionModelos");
      };

    return (
        <Container>
            <Breadcrumbs title="Modelos" breadcrumbItem="Agregar Modelo" />
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
                                <FormGroup>
                                    <Label for="marca">Marca</Label>
                                    <Input
                                        type="select"
                                        name="marca"
                                        id="marca"
                                        value={marcaSeleccionada}
                                        onChange={handleMarcaChange}
                                        required
                                    >
                                        <option value="">Seleccione Marca</option>
                                        {marcas.map((marca) => (
                                            <option key={marca.id} value={marca.id}>
                                                {marca.nombre}
                                            </option>
                                        ))}
                                    </Input>
                                </FormGroup>
                                <Button type="submit" color="primary">Agregar Modelo</Button>
                                <Button className="ms-2 btn-custom-red" onClick={handleExit}>
                                Salir
                                </Button>
                            </Form>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
            <ToastContainer />
        </Container>
    );
};

export default AgregarModelo;
