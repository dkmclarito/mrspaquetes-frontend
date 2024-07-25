import React, { useState, useEffect } from "react";
import { Card, CardBody, Col, Row, Container, Form, FormGroup, Label, Input, Button, Alert, FormFeedback } from "reactstrap";
import Breadcrumbs from "../components/Clientes/Common/Breadcrumbs";
import AuthService from "../services/authService";
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../styles/Clientes.css";

const API_URL = import.meta.env.VITE_API_URL;

const AgregarCliente = () => {
    const [formData, setFormData] = useState({nit: '', });
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

    const handleNitChange = (event) => {
        const nit = event.target.value;
        
        // Remover caracteres no numéricos
        let nitSanitized = nit.replace(/[^\d]/g, "");
        
        // Limitar la longitud máxima a 14 caracteres
        if (nitSanitized.length > 14) {
            nitSanitized = nitSanitized.slice(0, 14);
        }
        
        let isValid = false;
        let nitFormateado = nitSanitized;
        
        if (nitSanitized.length === 14) {
            // Validar el formato y la longitud del NIT
            const codigoMunicipio = parseInt(nitSanitized.substring(0, 4), 10);
            const dia = parseInt(nitSanitized.substring(4, 6), 10);
            const mes = parseInt(nitSanitized.substring(6, 8), 10);
            const anio = parseInt(nitSanitized.substring(8, 10), 10);
            const correlativo = parseInt(nitSanitized.substring(10, 13), 10);
            const digitoVerificador = nitSanitized.charAt(13);
        
            const isValidMunicipio = codigoMunicipio >= 101 && codigoMunicipio <= 9999;
            const diasEnMes = new Date(2000 + anio, mes, 0).getDate();
            const isValidDiaMes = dia >= 1 && dia <= diasEnMes && mes >= 1 && mes <= 12;
            const isValidCorrelativo = correlativo >= 0 && correlativo <= 999;
            const isValidDigitoVerificador = /^[0-9]$/.test(digitoVerificador);
        
            isValid = isValidMunicipio && isValidDiaMes && isValidCorrelativo && isValidDigitoVerificador;
        
            if (isValid) {
                nitFormateado = `${nitSanitized.substring(0, 4)}-${nitSanitized.substring(4, 10)}-${nitSanitized.substring(10, 13)}-${nitSanitized.charAt(13)}`;
            }
        }
        
        setIsNitValid(isValid);
        setNit(isValid ? nitSanitized : null);  // Establece null si no es válido
        setFormData(prevData => ({ ...prevData, nit: isValid ? nitFormateado : null }));
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
        if (!isDuiValid || !isTelefonoValid || tipoPersona === "" || genero === "") {
            setAlertaError(true);
            setErrorMensaje("Por favor, revisa los campos requeridos.");
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
            nombre_comercial: tipoPersona === "1" ? null : nombreComercial,
            nombre_empresa: tipoPersona === "1" ? null : nombreEmpresa,
            nit: tipoPersona === "1" ? null : nit,
            nrc: tipoPersona === "1" ? null : nrc,
            giro: tipoPersona === "1" ? null : giro,
            fecha_registro: fechaRegistro.replace(/-/g, "/"),
            id_estado: 1
        };
    
        console.log("Datos a enviar:", clienteData); // Agrega esta línea para depuración
    
        try {
            const response = await axios.post(`${API_URL}/clientes`, clienteData, {
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
            console.error("Error de solicitud:", error.response);
            handleError(error);
        }
    };
    
    const resetForm = () => {
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
    };
    
    const handleError = (error) => {
        if (error.response && error.response.data) {
            const errorData = error.response.data.error;
            let errorMessage = "Error al agregar el cliente.";
    
            if (errorData.dui) {
                errorMessage = "El DUI ya está registrado.";
            } else if (errorData.telefono) {
                errorMessage = "El teléfono ya está registrado.";
            } else if (errorData.nit) {
                errorMessage = "El NIT ya está registrado.";
            } else if (errorData.nrc) {
                errorMessage = "El NRC ya está registrado.";
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
                                                                value={formData.nit}
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
                                                <Button href="/GestionClientes" color="danger">Cancelar</Button>
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