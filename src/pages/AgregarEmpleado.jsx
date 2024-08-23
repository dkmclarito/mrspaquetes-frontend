import React, { useState, useEffect } from "react";
import { Card, CardBody, Col, Row, Container, Form, FormGroup, Label, Input, Button, FormFeedback } from "reactstrap";
import Breadcrumbs from "../components/Empleados/Common/Breadcrumbs";
import AuthService from "../services/authService";
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import "../styles/Empleados.css";

const API_URL = import.meta.env.VITE_API_URL;

function getFechaContratacionPorDefecto() {
  const anioActual = new Date().getFullYear();
  const fechaActual = new Date();
  const mes = String(fechaActual.getMonth() + 1).padStart(2, '0');
  const dia = String(fechaActual.getDate()).padStart(2, '0');
  return `${anioActual}-${mes}-${dia}`;
}

function getFechaMinimaNacimiento() {
  const fechaActual = new Date();
  fechaActual.setFullYear(fechaActual.getFullYear() - 18);
  const anio = fechaActual.getFullYear();
  const mes = String(fechaActual.getMonth() + 1).padStart(2, '0');
  const dia = String(fechaActual.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

function getFechaActual() {
  const fechaActual = new Date();
  const anio = fechaActual.getFullYear();
  const mes = String(fechaActual.getMonth() + 1).padStart(2, '0');
  const dia = String(fechaActual.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

const AgregarEmpleado = () => {
  const [cargos, setCargos] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [municipiosPorDepartamento, setMunicipiosPorDepartamento] = useState({});
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [genero, setGenero] = useState("");
  const [dui, setDui] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [fechaContratacion, setFechaContratacion] = useState(getFechaContratacionPorDefecto());
  const [cargo, setCargo] = useState("");
  const [direccion, setDireccion] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [isDuiValid, setIsDuiValid] = useState(true);
  const [isTelefonoValid, setIsTelefonoValid] = useState(true);
  const [isFechaNacimientoValida, setIsFechaNacimientoValida] = useState(true);
  const [isFechaContratacionValida, setIsFechaContratacionValida] = useState(true);
  const [isNombreValido, setIsNombreValido] = useState(true);
  const [isApellidosValid, setIsApellidosValid] = useState(true);
  const token = AuthService.getCurrentUser();
  const navigate = useNavigate();
  const today = new Date();
  const [duiError, setDuiError] = useState(""); 
  const currentYear = today.getFullYear();
  const minYear = 1900;
 const [maxDate, setMaxDate] = useState('');
 const [telefonoError, setTelefonoError] = useState("");
 const [isFechaNacimientoRequerida, setIsFechaNacimientoRequerida] = useState(false);
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

  const validateNombre = (nombre) => {
    // Expresión regular para permitir letras con tildes, espacios y "ñ"
    const regex = /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/;
    return regex.test(nombre) && nombre.length <= 80;
  };

  const validateApellido = (apellido) => {
    // Expresión regular para permitir letras con tildes, espacios y "ñ"
    const regex = /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/;
    return regex.test(apellido) && apellido.length <= 80;
  };

  const verificarDuiUnico = async (dui) => {
    try {
      // Realiza una solicitud al método `index` con el parámetro de DUI
      const response = await fetch(`${API_URL}/empleados?dui=${encodeURIComponent(dui)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
  
      const data = await response.json();
  
      // Asegúrate de que `data.empleados` existe y es un array
      if (!Array.isArray(data.empleados)) {
        console.error("La respuesta de la API no contiene un array de empleados.");
        return false;
      }
  
      // Verifica si el arreglo de empleados contiene elementos
      const existe = data.empleados.some(empleado => empleado.dui === dui);
      return existe;
    } catch (error) {
      console.error("Error al verificar el DUI:", error);
      return false;
    }
  };
  
  
  
  const handleNombresChange = (e) => {
    const nombre = e.target.value;
    // Filtrar caracteres no permitidos
    const cleanedNombre = nombre.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ\s]/g, '');
    setNombres(cleanedNombre);
    setIsNombreValido(validateNombre(cleanedNombre));
  };


  const handleApellidosChange = (e) => {
    const apellido = e.target.value;
    // Filtrar caracteres no permitidos
    const cleanedApellido = apellido.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ\s]/g, '');
    setApellidos(cleanedApellido);
    setIsApellidosValid(validateApellido(cleanedApellido));
  };

  const handleFechaNacimientoChange = (e) => {
    const { value } = e.target;
    const fechaSeleccionada = new Date(value);
    const fechaActual = new Date();
    const fechaMinima = new Date(getFechaMinimaNacimiento());

    if (fechaSeleccionada > fechaActual || fechaSeleccionada > fechaMinima) {
      setIsFechaNacimientoValida(false);
    } else {
      setIsFechaNacimientoValida(true);
      setFechaNacimiento(value);
    }
  };
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    setMaxDate(formattedDate);
  }, []);

  // Función de validación de fecha
  const validateDate = (dateString) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;

    const [year, month, day] = dateString.split('-').map(Number);
    const today = new Date();
    const inputDate = new Date(year, month - 1, day);

    const minYear = 1900; // Ajusta esto según sea necesario

    // Validación del año
    if (year < minYear || year > today.getFullYear()) return false;

    // Validación del mes
    if (month < 1 || month > 12) return false;

    // Validación del día
    const daysInMonth = new Date(year, month, 0).getDate();
    if (day < 1 || day > daysInMonth) return false;

    // Validación de fechas futuras
    if (inputDate > today) return false;

    return true;
  };

  const handleFechaContratacionChange = (e) => {
    const fecha = e.target.value;
    const [anio, mes, dia] = fecha.split("-");

    // Usar el año actual para la fecha de contratación
    const anioActual = new Date().getFullYear();
    const fechaContratacionDate = new Date(`${anioActual}-${mes}-${dia}`);
    const fechaActual = new Date();

    // Validar que la fecha de contratación no sea posterior a la fecha actual
    const esFechaValida = fechaContratacionDate <= fechaActual;

    setIsFechaContratacionValida(esFechaValida);
    if (esFechaValida) {
      setFechaContratacion(`${anioActual}-${mes}-${dia}`);
    }
  };

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

    // Verificar si el primer dígito es 6, 7 o 2
    if (telefonoValue.length > 0 && !["6", "7", "2"].includes(telefonoValue[0])) {
      setTelefonoError("El número de teléfono debe comenzar con 6, 7 o 2");
      setIsTelefonoValid(false);
      // Prevent further input by not updating state by default
      return;
    } else {
      setTelefonoError("");
    }

    // Limit to 8 digits
    if (telefonoValue.length > 8) {
      telefonoValue = telefonoValue.slice(0, 8);
    }

    if (telefonoValue.length > 4) {
      telefonoValue = telefonoValue.slice(0, 4) + "-" + telefonoValue.slice(4);
    }

    setTelefono(telefonoValue);

    // Validar el formato 1234-5678
    const isValidFormat = /^\d{4}-\d{4}$/.test(telefonoValue);
    if (!isValidFormat) {
      setTelefonoError("El número de teléfono debe tener el formato 1234-5678");
      setIsTelefonoValid(false);
    } else {
      setTelefonoError("");
      setIsTelefonoValid(true);
    }
  };

  const validarFechas = () => {
    const fechaNacimientoDate = new Date(fechaNacimiento);
    const fechaActual = new Date();

    if (!isFechaNacimientoValida || fechaNacimientoDate > fechaActual) {
      return false;
    }

    const fechaContratacionDate = new Date(fechaContratacion);

    if (!isFechaContratacionValida || fechaContratacionDate > fechaActual) {
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validar que la fecha de nacimiento esté llena
    if (!fechaNacimiento) {
      setIsFechaNacimientoRequerida(true);
      return;
    } else {
      setIsFechaNacimientoRequerida(false);
    }
  
    // Verificar si hay errores en el formulario
    if (!isNombreValido || !isApellidosValid || !isTelefonoValid || !validarFechas() || !isDuiValid) {
      toast.error("Por favor, corrija los errores en el formulario antes de enviar.", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });
      return;
    }
  
    // Verificar si el DUI ya está registrado
    const duiExiste = await verificarDuiUnico(dui.replace(/-/g, ""));
    if (duiExiste) {
      toast.error("El DUI ya está registrado.", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });
      return;
    }
  
    // Datos del empleado a enviar
    const empleadoData = {
      nombres,
      apellidos,
      dui: dui.replace(/-/g, ""),
      telefono: telefono.replace(/-/g, ""),
      fecha_nacimiento: fechaNacimiento,
      fecha_contratacion: fechaContratacion,
      id_estado: 1,
      id_cargo: cargo,
      id_departamento: departamento,
      id_municipio: municipio,
      direccion,
    };
  
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
        let errorMessage = "Error al agregar el empleado.";
        toast.error(errorMessage, {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
        });
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
  
      // Limpiar campos
      setNombres("");
      setApellidos("");
      setDui("");
      setTelefono("");
      setFechaNacimiento("");
      setFechaContratacion(getFechaContratacionPorDefecto());
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
  
  return (
    <Container><Breadcrumbs title="Formulario de Registro de Empleados" breadcrumbItem="Ingrese la información" />
      <Card>
        <CardBody>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label for="nombres">Nombres</Label>
                  <Input
                    type="text"
                    id="nombres"
                    value={nombres}
                    onChange={handleNombresChange}
                    required
                    invalid={!isNombreValido}
                  />
                  {!isNombreValido && (
                    <FormFeedback className="text-danger">
                      Los nombres deben contener solo letras y espacios, no deben contener números.
                    </FormFeedback>
                  )}
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label for="apellidos">Apellidos</Label>
                  <Input
                    type="text"
                    id="apellidos"
                    value={apellidos}
                    onChange={handleApellidosChange}
                    required
                    invalid={!isApellidosValid}
                  />
                  {!isApellidosValid && (
                    <FormFeedback className="text-danger">
                      Los apellidos deben contener solo letras y espacios, no deben contener números.
                    </FormFeedback>
                  )}
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
                    invalid={!isDuiValid}
                    maxLength="10"
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
                  {telefonoError && (
                    <FormFeedback className="text-danger">{telefonoError}</FormFeedback>

                  )}
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label for="fechaNacimiento">Fecha de Nacimiento</Label>
                  <Input
                    type="date"
                    id="fechaNacimiento"
                    value={fechaNacimiento}
                    onChange={handleFechaNacimientoChange}
                    max={getFechaActual()}
                    invalid={!isFechaNacimientoValida || isFechaNacimientoRequerida}
                  />
                      <FormFeedback>
                        La fecha de nacimiento es requerida, debe ser válida de una persona mayor de edad y no puede ser en el futuro.
                      </FormFeedback>
                    </FormGroup>
                        </Col>
                        <Col md="6">
                        <FormGroup>
                              <Label for="fechaContratacion">Fecha de Contratación</Label>
                              <Input          
                                  type="date"
                                  id="fechaContratacion"
                                  value={fechaContratacion}
                                  onChange={handleFechaContratacionChange}
                                  required
                                  invalid={!isFechaContratacionValida}
                              />
                              <FormFeedback>La fecha de contratación no puede ser posterior a la fecha actual.</FormFeedback>
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
                              {cargos.map((car) => (
                                <option key={car.id} value={car.id}>
                                  {car.nombre}
                                </option>
                              ))}
                            </Input>
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
                              {departamentos.map((dep) => (
                                <option key={dep.id} value={dep.id}>
                                  {dep.nombre}
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
                              disabled={!departamento}
                            >
                              <option value="">Seleccione un municipio</option>
                              {municipiosPorDepartamento[departamento]?.map((mun) => (
                                <option key={mun.id} value={mun.id}>
                                  {mun.nombre}
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
                            <Col md="12">
                            <Button color="primary" type="submit">
                            Registrar
                            </Button>
                            <Button className="ms-2 btn-custom-red" onClick={() => window.location.href = '/GestionEmpleados'}>
                            Salir
                            </Button>
                            </Col>
                          </Row>
                        </Form>
                    </CardBody>
                    </Card>
                  <ToastContainer />
                </Container>
              );
            };

export default AgregarEmpleado;