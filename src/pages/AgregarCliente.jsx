import React, { useState, useEffect } from "react";
import { Card, CardBody, Col, Row, Container, Form, FormGroup, Label, Input, Button, Alert, FormFeedback } from "reactstrap";
import Breadcrumbs from "../components/Clientes/Common/Breadcrumbs";
import AuthService from "../services/authService";
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../styles/Clientes.css";

const API_URL = import.meta.env.VITE_API_URL;

const AgregarCliente = () => {
    const [isDuiValid, setIsDuiValid] = useState(true);
    const [isTelefonoValid, setIsTelefonoValid] = useState(true);
    const [isNitValid, setIsNitValid] = useState(true);
    const [isNrcValid, setIsNrcValid] = useState(true);
    const [isGiroValid, setIsGiroValid] = useState(true);
    const [tiposPersonas, setTiposPersonas] = useState([]);
    const [fechaRegistro, setFechaRegistro] = useState(new Date().toISOString().split('T')[0]);
    const [generos, setGeneros] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [municipiosPorDepartamento, setMunicipiosPorDepartamento] = useState({});
    const [nombres, setNombres] = useState("");
    const [apellidos, setApellidos] = useState("");
    const [tipoPersona, setTipoPersona] = useState("");
    const [genero, setGenero] = useState("");
    const [dui, setDui] = useState("");
    const [telefono, setTelefono] = useState("");
    const [direccion, setDireccion] = useState("");
    const [departamento, setDepartamento] = useState("");
    const [municipio, setMunicipio] = useState("");
    const [esContribuyente, setEsContribuyente] = useState(false);
    const [nombreComercial, setNombreComercial] = useState("");
    const [nit, setNit] = useState("");
    const [nrc, setNrc] = useState("");
    const [giro, setGiro] = useState("");
    const [nombreEmpresa, setNombreEmpresa] = useState("");
    const [alertaExito, setAlertaExito] = useState(false);
    const [alertaError, setAlertaError] = useState(false);
    const [errorMensaje, setErrorMensaje] = useState("");

    const navigate = useNavigate();

    const token = AuthService.getCurrentUser();

    useEffect(() => {
        const fetchTiposPersonas = async () => {
            try {
                const response = await axios.get(`${API_URL}/dropdown/get_tipo_persona`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (response.data.tipo_persona && Array.isArray(response.data.tipo_persona)) {
                    setTiposPersonas(response.data.tipo_persona);
                } else {
                    console.error("Respuesta no válida para tipos de personas:", response.data);
                }
            } catch (error) {
                console.error("Error al obtener los tipos de personas:", error);
            }
        };
        fetchTiposPersonas();
    }, [token]);

    useEffect(() => {
        const fetchGeneros = async () => {
            try {
                const response = await axios.get(`${API_URL}/dropdown/get_generos`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (response.data.generos && Array.isArray(response.data.generos)) {
                    setGeneros(response.data.generos);
                } else {
                    console.error("Respuesta no válida para géneros:", response.data);
                }
            } catch (error) {
                console.error("Error al obtener los géneros:", error);
            }
        };

        fetchGeneros();
    }, [token]);


    useEffect(() => {
        const fetchDepartamentos = async () => {
            try {
                const response = await axios.get(`${API_URL}/dropdown/get_departamentos`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (response.data && Array.isArray(response.data)) {
                    setDepartamentos(response.data);
                } else {
                    console.error("Respuesta no válida para departamentos:", response.data);
                }
            } catch (error) {
                console.error("Error al obtener los departamentos:", error);
            }
        };

        fetchDepartamentos();
    }, [token]);

    useEffect(() => {
        const fetchMunicipios = async () => {
            if (departamento) {
                try {
                    const response = await axios.get(`${API_URL}/dropdown/get_municipio/${departamento}`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    if (response.data.municipio && Array.isArray(response.data.municipio)) {
                        setMunicipiosPorDepartamento(prev => ({
                            ...prev,
                            [departamento]: response.data.municipio
                        }));
                    } else {
                        console.error("Respuesta no válida para municipios:", response.data);
                    }
                } catch (error) {
                    console.error("Error al obtener los municipios:", error);
                }
            }
        };

        fetchMunicipios();
    }, [departamento, token]);


    const handleDuiChange = (e) => {
        let value = e.target.value.replace(/[^\d]/g, ""); // Eliminar caracteres no numéricos
    
        if (value.length > 0 && value[0] !== "0") {
            value = "0" + value;
        }
    
        let formattedDui = value;
        if (formattedDui.length > 8) {
            formattedDui = formattedDui.slice(0, 8) + "-" + formattedDui.slice(8, 9);
        }
    
        // Validar el DUI con el formato correcto (debe tener 10 caracteres y seguir el patrón)
        const isValid = formattedDui.length === 10 && formattedDui.match(/^0\d{7}-\d{1}$/);
        setDui(formattedDui);
        setIsDuiValid(isValid);
    };
    
    
    const handleTelefonoChange = (e) => {
        let telefonoValue = e.target.value.replace(/[^\d]/g, "");
        if (telefonoValue.length > 8) {
            telefonoValue = telefonoValue.slice(0, 8);
        }
        if (telefonoValue.length > 4) {
            telefonoValue = telefonoValue.slice(0, 4) + "-" + telefonoValue.slice(4);
        }
        setTelefono(telefonoValue);
        const isValid = telefonoValue.length === 9 && telefonoValue.match(/^\d{4}-\d{4}$/);
        setIsTelefonoValid(isValid);
    };

    const generateErrorMessage = (errorData) => {
        let errorMessage = "Error al agregar el empleado.";
        if (errorData.errors) {
            const errorKeys = Object.keys(errorData.errors);
            if (errorKeys.includes("dui")) {
                errorMessage = "El DUI ya está registrado.";
            } else if (errorData.errors.dui && errorData.errors.email) {
                errorMessage = "El DUI y el correo electrónico ya están registrados.";
            } else {
                errorMessage = errorData.message || "Error al agregar el empleado.";
            }
        }
        return errorMessage;
    };

    const handleNitChange = (e) => {
        let nitValue = e.target.value.replace(/[^\d]/g, ""); // Eliminar caracteres no numéricos
        if (nitValue.length > 17) {
            nitValue = nitValue.slice(0, 17);
        }
    
        // Formatear NIT según el patrón ####-######-###-#
        if (nitValue.length > 4) {
            nitValue = nitValue.slice(0, 4) + "-" + nitValue.slice(4);
        }
        if (nitValue.length > 11) {
            nitValue = nitValue.slice(0, 11) + "-" + nitValue.slice(11);
        }
        if (nitValue.length > 15) {
            nitValue = nitValue.slice(0, 15) + "-" + nitValue.slice(15);
        }
    
        setNit(nitValue);
    
        // Validación del NIT
        const isValid = nitValue.length === 17 && /^\d{4}-\d{6}-\d{3}-\d{1}$/.test(nitValue);
        setIsNitValid(isValid);
    };
    

    const handleNrcChange = (e) => {
        let nrcValue = e.target.value.replace(/[^\d]/g, ""); // Eliminar caracteres no numéricos
        if (nrcValue.length > 7) {
            nrcValue = nrcValue.slice(0, 7);
        }
    
        // Formatear NRC según el patrón ######-#
        if (nrcValue.length > 6) {
            nrcValue = nrcValue.slice(0, 6) + "-" + nrcValue.slice(6);
        }
    
        setNrc(nrcValue);
    
        // Validación del NRC
        const isValid = nrcValue.length === 8 && /^\d{6}-\d{1}$/.test(nrcValue);
        setIsNrcValid(isValid);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validaciones de campos
        if (!isDuiValid) {
            setAlertaError(true);
            setErrorMensaje("El DUI ingresado no es válido. Por favor, revisa el formato.");
            return;
        }

        if (!isTelefonoValid) {
            setAlertaError(true);
            setErrorMensaje("El teléfono ingresado no es válido. Por favor, revisa el formato.");
            return;
        }

        if (!isNitValid) {
            setAlertaError(true);
            setErrorMensaje("El NIT ingresado no es válido.");
            return;
        }

        if (!isNrcValid) {
            setAlertaError(true);
            setErrorMensaje("El NRC ingresado no es válido.");
            return;
        }

        if (!isGiroValid) {
            setAlertaError(true);
            setErrorMensaje("El giro no puede estar vacío.");
            return;
        }

        // Datos del cliente
        const clienteData = {
            nombre: nombres,
            apellido: apellidos,
            id_tipo_persona: tipoPersona,
            id_genero: genero,
            dui,
            telefono,
            direccion,
            id_departamento: departamento,
            id_municipio: municipio,
            es_contribuyente: esContribuyente ? 1 : 0,
            nombre_comercial: nombreComercial,
            nombre_empresa: nombreEmpresa,
            nit,
            nrc,
            giro,
            fecha_registro: fechaRegistro.replace(/-/g, "/"),
            id_estado: 1
        };

        try {
            const response = await axios.post(`${API_URL}/clientes`, clienteData, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                }
            });

            console.log("Cliente registrado:", response.data);
            setAlertaExito(true);

            // Redirige a la página de GestionClientes
            setTimeout(() => navigate('/GestionClientes'), 2000); // Redirige después de 2 segundos

            // Reinicia los campos del formulario
            setNombres("");
            setApellidos("");
            setTipoPersona("");
            setGenero("");
            setDui("");
            setTelefono("");
            setFechaRegistro("");
            setDireccion("");
            setDepartamento("");
            setMunicipio("");
            setEsContribuyente(false);
            setNombreComercial("");
            setNit("");
            setNrc("");
            setGiro("");
            setNombreEmpresa("");
            setAlertaError(false);
        } catch (error) {
            console.error("Error de solicitud:", error.response);

            if (error.response && error.response.data) {
                const errorData = error.response.data.error;
                let errorMessage = "Error al agregar el cliente.";

                // Manejo de errores específicos
                const errorMessages = [];
                if (errorData.dui) {
                    errorMessages.push("El DUI ya está registrado.");
                }
                if (errorData.telefono) {
                    errorMessages.push("El teléfono ya está registrado.");
                }
                if (errorData.nit) {
                    errorMessages.push("El NIT ya está registrado.");
                }
                if (errorData.nrc) {
                    errorMessages.push("El NRC ya está registrado.");
                }

                if (errorMessages.length > 0) {
                    errorMessage = errorMessages.join(" ");
                } else {
                    errorMessage = errorData.message || errorMessage;
                }

                setAlertaExito(false);
                setAlertaError(true);
                setErrorMensaje(errorMessage);
            } else {
                setAlertaExito(false);
                setAlertaError(true);
                setErrorMensaje("Hubo un error al procesar la solicitud. Por favor, inténtalo de nuevo.");
            }
        }
    };


    const handleDepartamentoChange = (e) => {
        const selectedDepartamento = e.target.value;
        setDepartamento(selectedDepartamento);
        setMunicipio("");
    };

    const handleTipoPersonaChange = (e) => {
        const selectedTipoPersona = e.target.value;
        setTipoPersona(selectedTipoPersona);
        if (selectedTipoPersona !== "2") {
            setEsContribuyente(false);
            setNombreComercial("");
            setNit("");
            setNrc("");
            setGiro("");
            setNombreEmpresa("");
        }
    };

    const isJuridicalPerson = tipoPersona === "2";

    const toggleAlertas = () => {
        setAlertaExito(false);
        setAlertaError(false);
        setErrorMensaje("");
    };
    const currentYear = new Date().getFullYear();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const minDate = `${currentYear}-${currentMonth}-01`;
    const maxDate = new Date(currentYear, new Date().getMonth() + 1, 0).toISOString().split('T')[0]; // Last day of the current month

    return (
        <React.Fragment>
            <div className="page-content">
                <Breadcrumbs title="Clientes" breadcrumbItem="Agregar Cliente" />
                <Container fluid>
                    <Row>
                        <Col lg="12">
                            <Card>
                                <CardBody>
                                    {alertaExito && (
                                        <Alert color="success" className="alert-dismissible fade show" role="alert">
                                            ¡Cliente registrado exitosamente!
                                            <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                                        </Alert>
                                    )}
                                    {alertaError && (
                                        <Alert color="danger" className="alert-dismissible fade show" role="alert">
                                            {errorMensaje}
                                            <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                                        </Alert>
                                    )}
                                    <Form onSubmit={handleSubmit}>
                                        <Row form>
                                            <Col md={6}>
                                                <FormGroup className="form-group-custom">
                                                    <Label for="nombres">Nombres</Label>
                                                    <Input
                                                        type="text"
                                                        id="nombres"
                                                        value={nombres}
                                                        onChange={(e) => setNombres(e.target.value)}
                                                        required
                                                    />
                                                </FormGroup>
                                            </Col>
                                            <Col md={6}>
                                                <FormGroup className="form-group-custom">
                                                    <Label for="apellidos">Apellidos</Label>
                                                    <Input
                                                        type="text"
                                                        id="apellidos"
                                                        value={apellidos}
                                                        onChange={(e) => setApellidos(e.target.value)}
                                                        required
                                                    />
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                        <Row form>
                                            <Col md={6}>
                                                <FormGroup className="form-group-custom">
                                                    <Label for="tipoPersona">Tipo de Persona</Label>
                                                    <Input
                                                        type="select"
                                                        id="tipoPersona"
                                                        value={tipoPersona}
                                                        onChange={handleTipoPersonaChange}
                                                        required
                                                    >
                                                        <option value="">Seleccione</option>
                                                        {tiposPersonas.map((tp) => (
                                                            <option key={tp.id} value={tp.id}>
                                                                {tp.nombre}
                                                            </option>
                                                        ))}
                                                    </Input>
                                                </FormGroup>
                                            </Col>
                                            <Col md={6}>
                                                <FormGroup className="form-group-custom">
                                                    <Label for="genero">Género</Label>
                                                    <Input
                                                        type="select"
                                                        id="genero"
                                                        value={genero}
                                                        onChange={(e) => setGenero(e.target.value)}
                                                        required
                                                    >
                                                        <option value="">Seleccione</option>
                                                        {generos.map((gen) => (
                                                            <option key={gen.id} value={gen.id}>
                                                                {gen.nombre}
                                                            </option>
                                                        ))}
                                                    </Input>
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                        <Row form>
                                            <Col md={6}>
                                                <FormGroup className="form-group-custom">
                                                    <Label for="dui">DUI</Label>
                                                    <Input
                                                        type="text"
                                                        id="dui"
                                                        value={dui}
                                                        onChange={handleDuiChange}
                                                        required
                                                        maxLength="10"
                                                        invalid={!isDuiValid}
                                                        disabled={isJuridicalPerson}
                                                    />
                                                    {!isDuiValid && (
                                                        <FormFeedback className="text-danger">
                                                            El DUI ingresado no es válido. Debe tener el formato 02345678-9.
                                                        </FormFeedback>
                                                    )}
                                                </FormGroup>
                                            </Col>
                                            <Col md={6}>
                                                <FormGroup className="form-group-custom">
                                                    <Label for="telefono">Teléfono</Label>
                                                    <Input
                                                        type="text"
                                                        id="telefono"
                                                        value={telefono}
                                                        onChange={handleTelefonoChange}
                                                        required
                                                        maxLength="9"
                                                        invalid={!isTelefonoValid}
                                                    />
                                                    {!isTelefonoValid && (
                                                        <FormFeedback className="text-danger">
                                                            El teléfono ingresado no es válido. Debe tener el formato 1234-5678.
                                                        </FormFeedback>
                                                    )}
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                        <Row form>
                                            <Col md={6}>
                                                <FormGroup className="form-group-custom">
                                                    <Label for="fechaRegistro">Fecha de Registro</Label>
                                                    <Input
                                                        type="date"
                                                        id="fechaRegistro"
                                                        value={fechaRegistro}
                                                        onChange={(e) => setFechaRegistro(e.target.value)}
                                                        required
                                                        min={minDate} // Set min date
                                                        max={maxDate}
                                                    />
                                                </FormGroup>
                                            </Col>
                                            <Col md={6}>
                                                <FormGroup className="form-group-custom">
                                                    <Label for="direccion">Dirección</Label>
                                                    <Input
                                                        type="text"
                                                        id="direccion"
                                                        value={direccion}
                                                        onChange={(e) => setDireccion(e.target.value)}
                                                        required
                                                    />
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                        <Row form>
                                            <Col md={6}>
                                                <FormGroup className="form-group-custom">
                                                    <Label for="departamento">Departamento</Label>
                                                    <Input
                                                        type="select"
                                                        id="departamento"
                                                        value={departamento}
                                                        onChange={handleDepartamentoChange}
                                                        required
                                                    >
                                                        <option value="">Seleccione</option>
                                                        {departamentos.map((dep) => (
                                                            <option key={dep.id} value={dep.id}>
                                                                {dep.nombre}
                                                            </option>
                                                        ))}
                                                    </Input>
                                                </FormGroup>
                                            </Col>
                                            <Col md={6}>
                                                <FormGroup className="form-group-custom">
                                                    <Label for="municipio">Municipio</Label>
                                                    <Input
                                                        type="select"
                                                        id="municipio"
                                                        value={municipio}
                                                        onChange={(e) => setMunicipio(e.target.value)}
                                                        required
                                                    >
                                                        <option value="">Seleccione</option>
                                                        {municipiosPorDepartamento[departamento]?.map((mun) => (
                                                            <option key={mun.id} value={mun.id}>
                                                                {mun.nombre}
                                                            </option>
                                                        ))}
                                                    </Input>
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                        {tipoPersona === "2" && ( // Si es persona jurídica
                                            <>
                                                <Row>
                                                    <Col md={6}>
                                                        <FormGroup>
                                                            <Label htmlFor="esContribuyente">¿Es Contribuyente?</Label>
                                                            <Input
                                                                type="checkbox"
                                                                id="esContribuyente"
                                                                checked={esContribuyente}
                                                                onChange={(e) => setEsContribuyente(e.target.checked)}
                                                            />
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col md={6}>
                                                        <FormGroup>
                                                            <Label htmlFor="nombreComercial">Nombre Comercial</Label>
                                                            <Input
                                                                type="text"
                                                                id="nombreComercial"
                                                                value={nombreComercial}
                                                                onChange={(e) => setNombreComercial(e.target.value)}
                                                            />
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md={6}>
                                                        <FormGroup>
                                                            <Label htmlFor="nit">NIT</Label>
                                                            <Input
                                                                type="text"
                                                                id="nit"
                                                                value={nit}
                                                                onChange={handleNitChange}
                                                                invalid={!isNitValid}
                                                            />
                                                            {!isNitValid && (
                                                                <FormFeedback className="text-danger">
                                                                    El NIT ingresado no es válido. Debe tener 14 dígitos.
                                                                </FormFeedback>
                                                            )}
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col md={6}>
                                                        <FormGroup>
                                                            <Label htmlFor="nrc">NRC</Label>
                                                            <Input
                                                                type="text"
                                                                id="nrc"
                                                                value={nrc}
                                                                onChange={handleNrcChange}
                                                                invalid={!isNrcValid}
                                                            />
                                                            {!isNrcValid && (
                                                                <FormFeedback className="text-danger">
                                                                    El NRC ingresado no es válido.
                                                                </FormFeedback>
                                                            )}
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md={6}>
                                                        <FormGroup>
                                                            <Label htmlFor="giro">Giro</Label>
                                                            <Input
                                                                type="text"
                                                                id="giro"
                                                                value={giro}
                                                                onChange={(e) => setGiro(e.target.value)}
                                                            />
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col md={12}>
                                                        <FormGroup>
                                                            <Label htmlFor="nombreEmpresa">Nombre de la Empresa</Label>
                                                            <Input
                                                                type="text"
                                                                id="nombreEmpresa"
                                                                value={nombreEmpresa}
                                                                onChange={(e) => setNombreEmpresa(e.target.value)}
                                                            />
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                            </>
                                        )}
                                        <Row>
                                            <Col md={12}>
                                                <Button type="submit" color="primary">Guardar</Button>
                                            </Col>
                                        </Row>
                                    </Form>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default AgregarCliente;