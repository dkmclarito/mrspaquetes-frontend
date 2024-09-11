import React, { useState, useEffect, useCallback } from "react";
import { Card, CardBody, Col, Row, Container, Form, FormGroup, Label, Input, Button, Alert, FormFeedback } from "reactstrap";
import Breadcrumbs from "../components/Clientes/Common/Breadcrumbs";
import AuthService from "../services/authService";
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../styles/Clientes.css";

const API_URL = import.meta.env.VITE_API_URL;

const AgregarCliente = () => {
    const [isEmailValid, setIsEmailValid] = useState(true);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [isPasswordValid, setIsPasswordValid] = useState(true);
    const [passwordError, setPasswordError] = useState("");
    const [nitErrorMessage, setNitErrorMessage] = useState("");
    const [formData, setFormData] = useState({ nit: '', });
    const [isDuiValid, setIsDuiValid] = useState(true);
    const [isTelefonoValid, setIsTelefonoValid] = useState(true);
    const [isNitValid, setIsNitValid] = useState(true);
    const [telefonoError, setTelefonoError] = useState("");
    const [isNrcValid, setIsNrcValid] = useState(true);
    const [tiposPersonas, setTiposPersonas] = useState([]);
    const [fechaRegistro, setFechaRegistro] = useState(new Date().toISOString().split('T')[0]);
    const [departamentos, setDepartamentos] = useState([]);
    const [municipiosPorDepartamento, setMunicipiosPorDepartamento] = useState({});
    const [nombres, setNombres] = useState("");
    const [apellidos, setApellidos] = useState("");
    const [tipoPersona, setTipoPersona] = useState("");
    const [dui, setDui] = useState("");
    const [telefono, setTelefono] = useState("");
    const [direccion, setDireccion] = useState("");
    const [departamento, setDepartamento] = useState("");
    const [municipio, setMunicipio] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [esContribuyente, setEsContribuyente] = useState(false);
    const [nombreComercial, setNombreComercial] = useState("");
    const [nit, setNit] = useState("");
    const [nrc, setNrc] = useState("");
    const [giro, setGiro] = useState(""); // Guardar la descripción seleccionada
    const [giros, setGiros] = useState([]); // Lista de giros desde la API
    const [filteredGiros, setFilteredGiros] = useState([]); // Lista filtrada
    const [searchGiro, setSearchGiro] = useState(""); // Término de búsqueda para giro
    const [nombreEmpresa, setNombreEmpresa] = useState("");
    const [alertaExito, setAlertaExito] = useState(false);
    const [alertaError, setAlertaError] = useState(false);
    const [errorMensaje, setErrorMensaje] = useState("");

    const navigate = useNavigate();
    const token = AuthService.getCurrentUser();

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

    useEffect(() => {
        const fetchGiros = async () => {
            try {
                const response = await axios.get(`${API_URL}/dropdown/giros`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (response.data.actividadEconomica) {
                    setGiros(response.data.actividadEconomica); // Guardamos los giros correctamente
                    setFilteredGiros([]); // Iniciamos con la lista vacía
                } else {
                    console.error("Error en la respuesta de giros", response.data);
                }
            } catch (error) {
                console.error("Error al obtener los giros:", error);
            }
        };
        fetchGiros();
    }, [token]);

    const handleSearchGiro = (e) => {
        const searchTerm = e.target.value.toLowerCase();
        setSearchGiro(searchTerm);

        if (searchTerm.length > 0) {
            const filtered = giros.filter((g) => {
                const codigo = g.st_codigo ? String(g.st_codigo) : "";
                const descripcion = g.st_descripcion ? g.st_descripcion.toLowerCase() : "";
                return codigo.includes(searchTerm) || descripcion.includes(searchTerm);
            });
            setFilteredGiros(filtered);
        } else {
            setFilteredGiros([]);
        }
    };

    const handleGiroSelect = (giro) => {
        setGiro(giro.st_descripcion); // Guardamos la descripción del giro seleccionada
        setSearchGiro(giro.st_descripcion); // Mostrar la descripción en el campo de búsqueda
        setFilteredGiros([]); // Limpiar la lista después de la selección
    };

    const handleEmailChange = (e) => {
        const email = e.target.value;
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net|edu|gov|mil|info|biz|co|us|ca)$/;

        if (emailPattern.test(email)) {
            setIsEmailValid(true);
            setEmailError("");
        } else {
            setIsEmailValid(false);
            setEmailError("El correo electrónico no es válido.");
        }

        setEmail(email);
    };

    const handlePasswordChange = (e) => {
        const password = e.target.value;
        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (passwordPattern.test(password)) {
            setIsPasswordValid(true);
            setPasswordError("");
        } else {
            setIsPasswordValid(false);
            setPasswordError("La contraseña debe tener al menos 8 caracteres, incluir una letra mayúscula, una minúscula, un número y un carácter especial.");
        }

        setPassword(password);
    };

    const handleDuiChange = (e) => {
        let value = e.target.value.replace(/[^\d]/g, "");

        if (value.length > 0 && value[0] !== "0") {
            value = "0" + value;
        }

        let formattedDui = value;
        if (formattedDui.length > 8) {
            formattedDui = formattedDui.slice(0, 8) + "-" + formattedDui.slice(8, 9);
        }
        const isValid = formattedDui.length === 10 && formattedDui.match(/^0\d{7}-\d{1}$/);
        setDui(formattedDui);
        setIsDuiValid(isValid);
    };

    const handleTelefonoChange = (e) => {
        let telefonoValue = e.target.value.replace(/[^\d]/g, "");

        if (telefonoValue.length > 0 && !["6", "7", "2"].includes(telefonoValue[0])) {
            setTelefonoError("El número de teléfono debe comenzar con 6, 7 o 2");
            setIsTelefonoValid(false);
            return;
        } else {
            setTelefonoError("");
        }

        if (telefonoValue.length > 8) {
            telefonoValue = telefonoValue.slice(0, 8);
        }

        if (telefonoValue.length > 4) {
            telefonoValue = telefonoValue.slice(0, 4) + "-" + telefonoValue.slice(4);
        }

        setTelefono(telefonoValue);

        const isValid = telefonoValue.length === 9;
        setIsTelefonoValid(isValid);
    };

    const handleNitChange = (event) => {
        const value = event.target.value || "";

        let nitSanitized = value.replace(/[^\d]/g, "");

        if (nitSanitized.length > 14) {
            nitSanitized = nitSanitized.slice(0, 14);
        }

        let errorMessage = "";
        if (nitSanitized.length !== 14 && nitSanitized.length > 0) {
            errorMessage = "El NIT debe tener 14 dígitos.";
        }

        let nitFormatted = nitSanitized;
        if (nitSanitized.length > 4) {
            nitFormatted = `${nitSanitized.substring(0, 4)}-${nitSanitized.substring(4)}`;
        }
        if (nitSanitized.length > 10) {
            nitFormatted = `${nitSanitized.substring(0, 4)}-${nitSanitized.substring(4, 10)}-${nitSanitized.substring(10)}`;
        }
        if (nitSanitized.length === 14) {
            nitFormatted = `${nitSanitized.substring(0, 4)}-${nitSanitized.substring(4, 10)}-${nitSanitized.substring(10, 13)}-${nitSanitized.charAt(13)}`;
        }

        setNit(value);
        setIsNitValid(errorMessage === "");
        setFormData(prevData => ({ ...prevData, nit: nitFormatted }));
        setNitErrorMessage(errorMessage);
    };

    const handleNrcChange = (e) => {
        let nrcValue = e.target.value.replace(/[^\d]/g, "");
        if (nrcValue.length > 7) {
            nrcValue = nrcValue.slice(0, 7);
        }

        if (nrcValue.length > 6) {
            nrcValue = nrcValue.slice(0, 6) + "-" + nrcValue.slice(6);
        }

        setNrc(nrcValue);

        const isValid = nrcValue.length === 8 && /^\d{6}-\d{1}$/.test(nrcValue);
        setIsNrcValid(isValid);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!isDuiValid || !isTelefonoValid || !isEmailValid || !isPasswordValid || tipoPersona === "") {
            setAlertaError(true);
            setErrorMensaje("Por favor, revisa los campos requeridos.");
            return;
        }
    
        // Asegurarse de que el giro sea un string y su descripción
        const giroValue = tipoPersona === "2" ? giro : null;
    
        const clienteData = {
            nombre: nombres,
            apellido: apellidos,
            email,
            password,
            id_tipo_persona: tipoPersona,
            dui,
            telefono,
            direccion,
            id_departamento: departamento,
            id_municipio: municipio,
            es_contribuyente: esContribuyente ? 1 : 0,
            nombre_comercial: tipoPersona === "1" ? null : nombreComercial,
            nombre_empresa: tipoPersona === "1" ? null : nombreEmpresa,
            nit: tipoPersona === "1" ? null : nit,
            nrc: tipoPersona === "1" ? null : nrc,
            giro: giroValue, // Usamos la descripción del giro como valor
            fecha_registro: fechaRegistro.replace(/-/g, "/"),
            id_estado: 1
        };
    
        console.log("Datos a enviar:", clienteData);
    
        try {
            const response = await axios.post(`${API_URL}/admin-registrar-cliente`, clienteData, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                }
            });
    
            console.log("Cliente registrado:", response.data);
            setAlertaExito(true);
            setTimeout(() => navigate('/GestionClientes'), 2000);
            resetForm();
            setAlertaError(false);
        } catch (error) {
            console.error("Error de solicitud:", error);
            handleError(error);
        }
    };

    const resetForm = () => {
        setEmail("");
        setPassword("");
        setNombres("");
        setApellidos("");
        setTipoPersona("");
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
    };

    const handleError = (error) => {
        let errorMessage = "Hubo un error al procesar la solicitud. Por favor, inténtalo de nuevo.";
    
        if (error.response && error.response.data) {
            const errorData = error.response.data.errors || error.response.data.error;
            
            // Verifica si los errores están relacionados con email, DUI, teléfono o NIT
            if (errorData) {
                let messages = [];
    
                // Si el error es un array
                if (Array.isArray(errorData)) {
                    if (errorData.includes("El DUI ya está registrado.") && errorData.includes("El teléfono ya está registrado.")) {
                        messages.push("El DUI y el teléfono ya están registrados.");
                    } else if (errorData.includes("El NIT ya está registrado.") && errorData.includes("El teléfono ya está registrado.")) {
                        messages.push("El NIT y el teléfono ya están registrados.");
                    } else if (errorData.includes("El DUI ya está registrado.")) {
                        messages.push("El DUI ya está registrado.");
                    } else if (errorData.includes("El NIT ya está registrado.")) {
                        messages.push("El NIT ya está registrado.");
                    } else if (errorData.includes("El teléfono ya está registrado.")) {
                        messages.push("El teléfono ya está registrado.");
                    }
                }
    
                // Si el error es un objeto con claves
                if (typeof errorData === 'object') {
                    const errorKeys = Object.keys(errorData);
    
                    if (errorKeys.includes("dui") && errorKeys.includes("telefono")) {
                        messages.push("El DUI y el teléfono ya están registrados.");
                    } else if (errorKeys.includes("nit") && errorKeys.includes("telefono")) {
                        messages.push("El NIT y el teléfono ya están registrados.");
                    } else if (errorKeys.includes("dui") && errorKeys.includes("email")) {
                        messages.push("El DUI y el correo electrónico ya están registrados.");
                    } else if (errorKeys.includes("dui")) {
                        messages.push("El DUI ya está registrado.");
                    } else if (errorKeys.includes("nit")) {
                        messages.push("El NIT ya está registrado.");
                    } else if (errorKeys.includes("telefono")) {
                        messages.push("El teléfono ya está registrado.");
                    } else if (errorKeys.includes("email")) {
                        messages.push("El correo electrónico ya está registrado.");
                    }
                }
    
                // Si hay varios errores, los concatenamos en el mensaje final
                if (messages.length > 0) {
                    errorMessage = messages.join(" ");
                }
            }
        }
    
        console.error("Error message:", errorMessage);
        setAlertaExito(false);
        setAlertaError(true);
        setErrorMensaje(errorMessage);
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
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
    const minDate = `${currentYear}-${currentMonth}-01`;
    const maxDate = new Date(currentYear, new Date().getMonth() + 1, 0).toISOString().split('T')[0];

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
                                                    <Label for="email">Correo Electrónico</Label>
                                                    <Input
                                                        type="email"
                                                        name="email"
                                                        id="email"
                                                        value={email}
                                                        onChange={handleEmailChange}
                                                        invalid={!isEmailValid}
                                                    />
                                                    <FormFeedback>{emailError}</FormFeedback>
                                                </FormGroup>
                                            </Col>
                                            <Col md={6}>
                                                <Label for="password">Contraseña</Label>
                                                <FormGroup className="password-group">
                                                    <Input
                                                        type="password"
                                                        name="password"
                                                        id="password"
                                                        value={password}
                                                        onChange={handlePasswordChange}
                                                        invalid={!isPasswordValid}
                                                    />
                                                    <FormFeedback>{passwordError}</FormFeedback>
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
                                        </Row>

                                        <Row form>
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
                                                    {telefonoError && (
                                                        <FormFeedback className="text-danger">{telefonoError}</FormFeedback>
                                                    )}
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

                                        {tipoPersona === "2" && (
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
                                                                value={formData.nit}
                                                                onChange={handleNitChange}
                                                                invalid={!isNitValid}
                                                            />
                                                            {!isNitValid && nitErrorMessage && (
                                                                <FormFeedback className="text-danger">
                                                                    {nitErrorMessage}
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
                                                                id="searchGiro"
                                                                value={searchGiro}
                                                                onChange={handleSearchGiro}
                                                                placeholder="Buscar giro por código o descripción"
                                                            />
                                                            {filteredGiros.length > 0 && (
                                                                <div className="dropdown-menu show">
                                                                    {filteredGiros.map((g) => (
                                                                        <Button
                                                                            key={g.sk_actividadeco}
                                                                            className="dropdown-item"
                                                                            onClick={() => handleGiroSelect(g)}
                                                                        >
                                                                            {g.st_codigo} - {g.st_descripcion}
                                                                        </Button>
                                                                    ))}
                                                                </div>
                                                            )}
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
                                                <Button className="ms-2 btn-custom-red" onClick={() => window.location.href = '/GestionClientes'}>
                                                    Salir
                                                </Button>
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
