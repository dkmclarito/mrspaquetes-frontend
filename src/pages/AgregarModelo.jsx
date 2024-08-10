import React, { useState, useEffect } from "react";
import { Card, CardBody, Col, Row, Container, Form, FormGroup, Label, Input, Button, Alert, FormFeedback } from "reactstrap";
import Breadcrumbs from "../components/Vehiculos/Common/Breadcrumbs";
import AuthService from "../services/authService";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../styles/Vehiculos.css";

const API_URL = import.meta.env.VITE_API_URL;

const AgregarModelo = () => {
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [marcaSeleccionada, setMarcaSeleccionada] = useState("");
    const [marcas, setMarcas] = useState([]);
    const [isNombreValid, setIsNombreValid] = useState(true);
    const [alertaExito, setAlertaExito] = useState(false);
    const [alertaError, setAlertaError] = useState(false);
    const [errorMensaje, setErrorMensaje] = useState("");

    const navigate = useNavigate();
    const token = AuthService.getCurrentUser();

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
            setAlertaError(true);
            setErrorMensaje("Por favor, completa todos los campos requeridos.");
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

            setAlertaExito(true);
            setTimeout(() => navigate('/GestionModelos'), 2000);
            resetForm();
            setAlertaError(false);
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
        setAlertaError(true);
        setErrorMensaje(errorMessage);
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
                                    <FormFeedback>Por favor, ingresa un nombre válido.</FormFeedback>
                                </FormGroup>
                                <FormGroup>
                                    <Label for="descripcion">Descripción</Label>
                                    <Input
                                        type="textarea"
                                        id="descripcion"
                                        value={descripcion}
                                        onChange={handleDescripcionChange}
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
                                {alertaExito && <Alert color="success" toggle={() => setAlertaExito(false)}>Modelo agregado exitosamente!</Alert>}
                                {alertaError && <Alert color="danger" toggle={() => setAlertaError(false)}>{errorMensaje}</Alert>}
                            </Form>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AgregarModelo;
