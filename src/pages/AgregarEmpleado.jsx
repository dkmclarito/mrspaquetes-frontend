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
  const currentYear = today.getFullYear();
  const minYear = 1900;
  const maxDate = `${currentYear}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;


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

  const validateName = (name) => {
    // Expresión regular para permitir letras, espacios y "ñ"
    const regex = /^[A-Za-zñÑ\s]+$/;
    return regex.test(name) && name.length <= 80;
  };

  const validateApellido = (name) => {
    // Expresión regular para permitir letras, espacios y "ñ"
    const regex = /^[A-Za-zñÑ\s]+$/;
    return regex.test(name) && name.length <= 80;
  };
  
  
  const handleNombresChange = (e) => {
    const nombre = e.target.value;
    // Filtrar caracteres no permitidos
    const cleanedNombre = nombre.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ\s]/g, '');
    setNombres(cleanedNombre);
    setIsNombreValido(validateName(cleanedNombre));
  };

 
  const handleApellidosChange = (e) => {
    const apellido = e.target.value;
    // Filtrar caracteres no permitidos
    const cleanedApellido = apellido.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ\s]/g, '');
    setApellidos(cleanedApellido);
    setIsApellidosValid(validateApellido(cleanedApellido));
  };
  
  const handleFechaNacimientoChange = (e) => {
    const rawValue = e.target.value;
    const isValid = validateDate(rawValue);
    setIsFechaNacimientoValida(isValid);
    setFechaNacimiento(rawValue);
  };

   const validateDate = (dateString) => {
    
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;

    const [year, month, day] = dateString.split('-').map(Number);
    const today = new Date();
    const inputDate = new Date(year, month - 1, day);

    if (year < minYear || year > today.getFullYear()) return false;

    if (month < 1 || month > 12) return false;

    const daysInMonth = new Date(year, month, 0).getDate();
    if (day < 1 || day > daysInMonth) return false;

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
    const value = e.target.value.replace(/[^\d]/g, ""); // Eliminar caracteres no numéricos
    const telefonoValue = value.slice(0, 8); // Limitar a 8 dígitos
    const formattedTelefono = telefonoValue.slice(0, 4) + "-" + telefonoValue.slice(4);
    setTelefono(formattedTelefono);
    setIsTelefonoValid(telefonoValue.length === 8 && formattedTelefono.match(/^\d{4}-\d{4}$/));
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
    const empleadoData = {
      nombres,
      apellidos,
      id_genero: genero,
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

    if (!isTelefonoValid) {
      toast.error("El número de teléfono ingresado no es válido. Debe tener el formato 0000-0000.", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });
      return; 
    }

    if (!validarFechas()) {
      setIsFechaNacimientoValida(false);
      setIsFechaContratacionValida(false);
      toast.error("Las fechas ingresadas no son válidas.", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });
      return;
    }

    setIsFechaNacimientoValida(true);
    setIsFechaContratacionValida(true);

    if (!isDuiValid) {
      toast.error("El DUI ingresado no es válido. Debe tener el formato 0XXXXXXX-X.", {
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

      setNombres("");
      setApellidos("");
      setGenero("");
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
                                  {generos.map((gen) => (
                                    <option key={gen.id} value={gen.id}>
                                      {gen.nombre}
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
                          <Col md="6">
                          <FormGroup>
                      <Label for="fechaNacimiento">Fecha de Nacimiento</Label>
                      <Input
                      
                        type="date"
                        id="fechaNacimiento"
                        value={fechaNacimiento}
                        onChange={handleFechaNacimientoChange}
                        max={maxDate}
                        required
                        invalid={!isFechaNacimientoValida}
                      />
                      <FormFeedback>
                        La fecha de nacimiento debe ser válida y no puede ser en el futuro.
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
                        <Button color="secondary" className="ms-2" onClick={() => window.location.href = '/GestionEmpleados'}>
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
                        
                              

