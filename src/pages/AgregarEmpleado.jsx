import React, { useState, useEffect } from "react";
import { Card, CardBody, Col, Row, Container, Form, FormGroup, Label, Input, Button } from "reactstrap";
import Breadcrumbs from "../components/Empleados/Common/Breadcrumbs";
import AuthService from "../services/authService";
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import "../styles/Empleados.css";

const API_URL = import.meta.env.VITE_API_URL;

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
  const [salarioFormatted, setSalarioFormatted] = useState("");
  const [cargo, setCargo] = useState("");
  const [direccion, setDireccion] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [municipio, setMunicipio] = useState("");
  const token = AuthService.getCurrentUser();
  const navigate = useNavigate(); // Hook de navegación para redirección

  useEffect(() => {
    const fetchCargos = async () => {
      try {
        const response = await fetch(`${API_URL}/dropdown/get_cargos`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error(`Error: ${response.statusText}`);
        const responseData = await response.json();
        if (responseData.cargos && Array.isArray(responseData.cargos)) {
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
        const response = await fetch(`${API_URL}/dropdown/get_departamentos`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error(`Error: ${response.statusText}`);
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
          const response = await fetch(`${API_URL}/dropdown/get_municipio/${departamento}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!response.ok) throw new Error(`Error: ${response.statusText}`);
          const responseData = await response.json();
          if (responseData.municipio && Array.isArray(responseData.municipio)) {
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
        const response = await fetch(`${API_URL}/dropdown/get_generos`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error(`Error: ${response.statusText}`);
        const responseData = await response.json();
        if (responseData.generos && Array.isArray(responseData.generos)) {
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
    if (duiValue.length > 9) duiValue = duiValue.slice(0, 9); 
    if (duiValue.length > 8) duiValue = duiValue.slice(0, 8) + "-" + duiValue.slice(8); 
    setDui(duiValue);
  };

  const handleTelefonoChange = (e) => {
    let telefonoValue = e.target.value.replace(/[^\d]/g, ""); 
    if (telefonoValue.length > 8) telefonoValue = telefonoValue.slice(0, 8); 
    if (telefonoValue.length > 4) telefonoValue = telefonoValue.slice(0, 4) + "-" + telefonoValue.slice(4); 
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
  
  const handleSubmit = async (e) => {
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
      direccion,
    };
  
    // Validar el teléfono
    if (empleadoData.telefono.length !== 8) {
      toast.error("El número de teléfono ingresado no es válido. Debe contener exactamente 8 dígitos.", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });
      return; 
    }
  
    // Validar el DUI
    if (empleadoData.dui.length !== 9) {
      toast.error("El DUI ingresado no es válido. Debe contener exactamente 9 dígitos.", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });
      return; 
    }
  
    try {
      const response = await fetch(`${API_URL}/empleados`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(empleadoData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = generateErrorMessage(errorData);
        throw new Error(errorMessage);
      }
  
      const data = await response.json();
  
      toast.success("¡Empleado agregado con éxito!", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });
  
      setTimeout(() => {
        navigate("/GestionEmpleados"); 
      }, 2000);  
      // Resetear el formulario
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
    } catch (error) {
      toast.error(`Error al agregar el empleado: ${error.message}`, {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });
    }
  };
  
  const generateErrorMessage = (errorData) => {
    let errorMessage = "Error al agregar el empleado.";
    if (errorData.errors) {
      const errorKeys = Object.keys(errorData.errors);
      if (errorKeys.includes("dui")) {
        errorMessage = "El DUI ya está registrado.";
      } else if (errorKeys.includes("email")) {
        errorMessage = "El correo electrónico ya está registrado.";
      } else {
        errorMessage = errorData.message;
      }
    }
    return errorMessage;
  };
  
  
  
  return (
    <Container fluid>
      <Breadcrumbs title="Formulario de Registro de Empleados" breadcrumbItem="Ingrese la información" />
      <Row>
        <Col>
          <Card>
            <CardBody>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md="6">
                    <FormGroup>
                      <Label for="nombres">Nombres</Label>
                      <Input
                        id="nombres"
                        name="nombres"
                        type="text"
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
                        id="apellidos"
                        name="apellidos"
                        type="text"
                        value={apellidos}
                        onChange={(e) => setApellidos(e.target.value)}
                        required
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <FormGroup>
                      <Label for="genero">Género</Label>
                      <Input
                        id="genero"
                        name="genero"
                        type="select"
                        value={genero}
                        onChange={(e) => setGenero(e.target.value)}
                        required
                      >
                        <option value="">Seleccionar Género</option>
                        {generos.map((gen) => (
                          <option key={gen.id} value={gen.id}>
                            {gen.nombre}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Label for="dui">DUI</Label>
                      <Input
                        id="dui"
                        name="dui"
                        type="text"
                        value={dui}
                        onChange={handleDuiChange}
                        maxLength="10"
                        required
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <FormGroup>
                      <Label for="telefono">Teléfono</Label>
                      <Input
                        id="telefono"
                        name="telefono"
                        type="text"
                        value={telefono}
                        onChange={handleTelefonoChange}
                        maxLength="9"
                        required
                      />
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Label for="correo">Correo Electrónico</Label>
                      <Input
                        id="correo"
                        name="correo"
                        type="email"
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                        required
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <FormGroup>
                      <Label for="fechaNacimiento">Fecha de Nacimiento</Label>
                      <Input
                        id="fechaNacimiento"
                        name="fechaNacimiento"
                        type="date"
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
                        id="fechaContratacion"
                        name="fechaContratacion"
                        type="date"
                        value={fechaContratacion}
                        onChange={(e) => setFechaContratacion(e.target.value)}
                        required
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                  <FormGroup>
                    <Label for="salario">Salario</Label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">$</span>
                      </div>
                      <Input
                        type="text"
                        id="salario"
                        value={salarioFormatted}
                        onChange={handleSalarioChange}
                        maxLength="13"
                        required
                      />
                    </div>
                  </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Label for="cargo">Cargo</Label>
                      <Input
                        id="cargo"
                        name="cargo"
                        type="select"
                        value={cargo}
                        onChange={(e) => setCargo(e.target.value)}
                        required
                      >
                        <option value="">Seleccionar Cargo</option>
                        {cargos.map((car) => (
                          <option key={car.id} value={car.id}>
                            {car.nombre}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                <Row>
                  <Col md="6">
                    <FormGroup>
                      <Label for="direccion">Dirección</Label>
                      <Input
                        id="direccion"
                        name="direccion"
                        type="text"
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
                        id="departamento"
                        name="departamento"
                        type="select"
                        value={departamento}
                        onChange={(e) => {
                          setDepartamento(e.target.value);
                          setMunicipio(""); // Limpiar el municipio cuando se cambia el departamento
                        }}
                        required
                      >
                        <option value="">Seleccionar Departamento</option>
                        {departamentos.map((dep) => (
                          <option key={dep.id} value={dep.id}>
                            {dep.nombre}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                  </Col>
                  </Row>
                  <Col md="6">
                    <FormGroup>
                      <Label for="municipio">Municipio</Label>
                      <Input
                        id="municipio"
                        name="municipio"
                        type="select"
                        value={municipio}
                        onChange={(e) => setMunicipio(e.target.value)}
                        required
                        disabled={!departamento}
                      >
                        <option value="">Seleccionar Municipio</option>
                        {(municipiosPorDepartamento[departamento] || []).map((mun) => (
                          <option key={mun.id} value={mun.id}>
                            {mun.nombre}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                  </Col>
                </Row>
                
                <Button color="primary" type="submit">
                  Registrar
                </Button>
                <Button color="secondary" className="ms-2" onClick={() => window.location.href = '/GestionEmpleados'}>
  Salir
</Button>
              </Form>
            </CardBody>
          </Card>
        </Col>
      </Row>
      <ToastContainer position="bottom-right" autoClose={10000} hideProgressBar={true} />
    </Container>
  );
};

export default AgregarEmpleado;

