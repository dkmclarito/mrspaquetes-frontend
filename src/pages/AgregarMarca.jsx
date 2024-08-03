import React, { useState, useEffect } from "react";
import { Card, CardBody, Col, Row, Container, Form, FormGroup, Label, Input, Button, Alert, FormFeedback } from "reactstrap";
import Breadcrumbs from "../components/Vehiculos/Common/Breadcrumbs";
import AuthService from "../services/authService";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../styles/Vehiculos.css";

const API_URL = import.meta.env.VITE_API_URL;

const AgregarMarca = () => {
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [isNombreValid, setIsNombreValid] = useState(true);
    const [alertaExito, setAlertaExito] = useState(false);
    const [alertaError, setAlertaError] = useState(false);
    const [errorMensaje, setErrorMensaje] = useState("");

    const navigate = useNavigate();
    const token = AuthService.getCurrentUser();

    const handleNombreChange = (e) => {
        const value = e.target.value;
        setNombre(value);
        setIsNombreValid(value.trim().length > 0); // Validate if the name is not empty
    };

    const handleDescripcionChange = (e) => {
        setDescripcion(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isNombreValid) {
            setAlertaError(true);
            setErrorMensaje("Por favor, ingresa un nombre válido.");
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

            setAlertaExito(true);
            setTimeout(() => navigate('/GestionMarcas'), 2000);
            resetForm();
            setAlertaError(false);
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
        setAlertaError(true);
        setErrorMensaje(errorMessage);
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
                                <Button type="submit" color="primary">Agregar Marca</Button>
                                {alertaExito && <Alert color="success" toggle={() => setAlertaExito(false)}>Marca agregada exitosamente!</Alert>}
                                {alertaError && <Alert color="danger" toggle={() => setAlertaError(false)}>{errorMensaje}</Alert>}
                            </Form>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AgregarMarca;
