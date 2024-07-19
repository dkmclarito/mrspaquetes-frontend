import React, { useState, useEffect } from "react";
import { Card, CardBody, Col, Row, Container, Form, FormGroup, Label, Input, Button, Alert } from "reactstrap";
import Breadcrumbs from "../components/Empleados/Common/Breadcrumbs";
import AuthService from "../services/authService";
import { Link } from 'react-router-dom';
import "../styles/Empleados.css";

const AgregarEmpleado = () => {
  const [cargos, setCargos] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [municipiosPorDepartamento, setMunicipiosPorDepartamento] = useState({});
  const [generos, setGeneros] = useState([]);
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [genero, setGenero] = useState("");
  const [dui, setDui] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [fechaContratacion, setFechaContratacion] = useState("");
  const [salario, setSalario] = useState("");
  const [salarioFormatted, setSalarioFormatted] = useState('');
  const [cargo, setCargo] = useState("");
  const [direccion, setDireccion] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [alertaExito, setAlertaExito] = useState(false);
  const [alertaError, setAlertaError] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState("");

  const token = AuthService.getCurrentUser();

  useEffect(() => {
    const fetchCargos = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/dropdown/get_cargos", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const responseData = await response.json();
        if (responseData.hasOwnProperty("cargos") && Array.isArray(responseData.cargos)) {
          setCargos(responseData.cargos);
        } else {
          console.error("Respuesta no válida para cargos:", responseData);
        }
      } catch (error) {
        console.error("Error al obtener los cargos:", error);
      }
    };

    fetchCargos();
  }, [token]);

  useEffect(() => {
    const fetchDepartamentos = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/dropdown/get_departamentos", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Error al obtener los departamentos: ${response.statusText}`);
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setDepartamentos(data);
        } else {
          console.error("Respuesta no válida para departamentos:", data);
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
          const response = await fetch(`http://127.0.0.1:8000/api/dropdown/get_municipio/${departamento}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const responseData = await response.json();

          if (responseData.hasOwnProperty("municipio") && Array.isArray(responseData.municipio)) {
            const municipios = responseData.municipio;
            setMunicipiosPorDepartamento((prev) => ({
              ...prev,
              [departamento]: municipios,
            }));
          } else {
            console.error("Respuesta no válida para municipios:", responseData);
          }
        } catch (error) {
          console.error("Error al obtener los municipios:", error);
        }
      }
    };

    fetchMunicipios();
  }, [departamento, token]);

  useEffect(() => {
    const fetchGeneros = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/dropdown/get_generos", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const responseData = await response.json();
        if (responseData.hasOwnProperty("generos") && Array.isArray(responseData.generos)) {
          setGeneros(responseData.generos);
        } else {
          console.error("Respuesta no válida para géneros:", responseData);
        }
      } catch (error) {
        console.error("Error al obtener los géneros:", error);
      }
    };

    fetchGeneros();
  }, [token]);

  const handleDuiChange = (e) => {
    let duiValue = e.target.value.replace(/[^\d]/g, ""); 
    if (duiValue.length > 9) {
      duiValue = duiValue.slice(0, 9); 
    }
    if (duiValue.length > 8) {
      duiValue = duiValue.slice(0, 8) + "-" + duiValue.slice(8); 
    }
    setDui(duiValue);
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
  };

  const handleSalarioChange = (e) => {
    let salarioValue = e.target.value;
  
   
    salarioValue = salarioValue.replace(/[^0-9.]/g, "");
  
   
    const partes = salarioValue.split(".");
    if (partes.length > 2) {
      salarioValue = partes[0] + "." + partes.slice(1).join("");
    }
  
   
    if (partes[0].length > 10) {
      partes[0] = partes[0].slice(0, 10);
    }
  
    if (partes[1]) {
      partes[1] = partes[1].slice(0, 2);
    }
  
    const formattedIntegerPart = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
    const salarioFormatted = partes[1] !== undefined ? `${formattedIntegerPart}.${partes[1]}` : formattedIntegerPart;
  
    setSalario(salarioValue);
  
  
    setSalarioFormatted(salarioFormatted);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const salarioNumerico = parseFloat(salario.replace(/,/g, "."));
    const empleadoData = {

      nombres,
      apellidos,
      id_genero: genero,
      dui: dui.replace(/-/g, ""), 
      telefono: telefono.replace(/-/g, ""), 
      email: correo,
      fecha_nacimiento: fechaNacimiento.replace(/-/g, "/"),
      fecha_contratacion: fechaContratacion.replace(/-/g, "/"),
      salario: isNaN(salarioNumerico) ? 0 : salarioNumerico, 
      id_estado: 1,
      id_cargo: cargo,
      id_departamento: departamento,
      id_municipio: municipio,
    };

    fetch("http://127.0.0.1:8000/api/empleados", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(empleadoData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error HTTP ${response.status} - ${response.statusText}`);
        }
        return response.json();
      })
      .then(() => {
        setAlertaExito(true);
        setNombres("");
        setApellidos("");
        setGenero("");
        setDui("");
        setTelefono("");
        setCorreo("");
        setFechaNacimiento("");
        setFechaContratacion("");
        setSalario("");
        setSalarioFormatted("");
        setCargo("");
        setDireccion("");
        setDepartamento("");
        setMunicipio("");
        setAlertaError(false);
      })
      .catch((error) => {
        console.error("Error al agregar empleado:", error);
        setAlertaError(true);
        setErrorMensaje("No se pudo agregar el empleado. Inténtelo de nuevo más tarde.");
      });
  };

  return (
    <div>
      <Breadcrumbs />
      <Container className="mt-5">
        <Card>
          <CardBody>
            <h5 className="mb-4">Agregar Empleado</h5>
            {alertaExito && <Alert color="success">Empleado agregado exitosamente!</Alert>}
            {alertaError && <Alert color="danger">{errorMensaje}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md="6">
                  <FormGroup>
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
                <Col md="6">
                  <FormGroup>
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
                <Col md="6">
                  <FormGroup>
                    <Label for="genero">Género</Label>
                    <Input
                      type="select"
                      id="genero"
                      value={genero}
                      onChange={(e) => setGenero(e.target.value)}
                      required
                    >
                      <option value="">Seleccione un género</option>
                      {generos.map((genero) => (
                        <option key={genero.id} value={genero.id}>
                          {genero.nombre}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>
                <Col md="6">
                  <FormGroup>
                    <Label for="dui">DUI</Label>
                    <Input
                      type="text"
                      id="dui"
                      value={dui}
                      onChange={handleDuiChange}
                      required
                      maxLength="10"
                    />
                  </FormGroup>
                </Col>
                <Col md="6">
                  <FormGroup>
                    <Label for="telefono">Teléfono</Label>
                    <Input
                      type="text"
                      id="telefono"
                      value={telefono}
                      onChange={handleTelefonoChange}
                      required
                      maxLength="9"
                    />
                  </FormGroup>
                </Col>
                <Col md="6">
                  <FormGroup>
                    <Label for="correo">Correo Electrónico</Label>
                    <Input
                      type="email"
                      id="correo"
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                      required
                    />
                  </FormGroup>
                </Col>
                <Col md="6">
                  <FormGroup>
                    <Label for="fechaNacimiento">Fecha de Nacimiento</Label>
                    <Input
                      type="date"
                      id="fechaNacimiento"
                      value={fechaNacimiento}
                      onChange={(e) => setFechaNacimiento(e.target.value)}
                      required
                    />
                  </FormGroup>
                </Col>
                <Col md="6">
                  <FormGroup>
                    <Label for="fechaContratacion">Fecha de Contratación</Label>
                    <Input
                      type="date"
                      id="fechaContratacion"
                      value={fechaContratacion}
                      onChange={(e) => setFechaContratacion(e.target.value)}
                      required
                    />
                  </FormGroup>
                </Col>
                <Col md="6">
                  <FormGroup>
                    <Label for="salario">Salario</Label>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <Input
                        type="text"
                        id="salario"
                        value={salarioFormatted}
                        onChange={handleSalarioChange}
                        required
                      />
                    </div>
                  </FormGroup>
                </Col>
                <Col md="6">
                  <FormGroup>
                    <Label for="cargo">Cargo</Label>
                    <Input
                      type="select"
                      id="cargo"
                      value={cargo}
                      onChange={(e) => setCargo(e.target.value)}
                      required
                    >
                      <option value="">Seleccione un cargo</option>
                      {cargos.map((cargo) => (
                        <option key={cargo.id} value={cargo.id}>
                          {cargo.nombre}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>
                <Col md="6">
                  <FormGroup>
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
                <Col md="6">
                  <FormGroup>
                    <Label for="departamento">Departamento</Label>
                    <Input
                      type="select"
                      id="departamento"
                      value={departamento}
                      onChange={(e) => setDepartamento(e.target.value)}
                      required
                    >
                      <option value="">Seleccione un departamento</option>
                      {departamentos.map((departamento) => (
                        <option key={departamento.id} value={departamento.id}>
                          {departamento.nombre}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>
                <Col md="6">
                  <FormGroup>
                    <Label for="municipio">Municipio</Label>
                    <Input
                      type="select"
                      id="municipio"
                      value={municipio}
                      onChange={(e) => setMunicipio(e.target.value)}
                      required
                    >
                      <option value="">Seleccione un municipio</option>
                      {municipiosPorDepartamento[departamento]?.map((municipio) => (
                        <option key={municipio.id} value={municipio.id}>
                          {municipio.nombre}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>
                <Col md="12">
                <Button type="submit" color="primary" className="me-2">Registrar</Button>
                <Link to="/GestionEmpleados">
                  <Button color="secondary">Salir</Button>
                </Link>
                </Col>
              </Row>
            </Form>
          </CardBody>
        </Card>
      </Container>
    </div>
  );
};

export default AgregarEmpleado;