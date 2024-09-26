import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Card,
  CardBody,
  Row,
  Col,
  Button,
  Table,
  Input,
  Label,
  FormGroup,
  Nav,
  NavItem,
  NavLink,
  Progress,
  FormFeedback,
} from "reactstrap";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faMapMarkerAlt,
  faBook,
  faDollarSign,
} from "@fortawesome/free-solid-svg-icons";
import Breadcrumbs from "../components/Empleados/Common/Breadcrumbs";
import axios from "axios";
import AuthService from "../services/authService";

const API_URL = import.meta.env.VITE_API_URL;

export default function PreOrdenesDirecciones() {
  const { idCliente } = useParams();
  const [direcciones, setDirecciones] = useState([]);
  const [nuevaDireccion, setNuevaDireccion] = useState({
    direccion: "",
    referencia: "",
    id_departamento: "",
    id_municipio: "",
    nombre_contacto: "",
    telefono: "",
  });
  const [departamentos, setDepartamentos] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [selectedDireccion, setSelectedDireccion] = useState(null);
  const [direccionRecoleccion, setDireccionRecoleccion] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [cliente, setCliente] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [errors, setErrors] = useState({});

  // Nueva función para verificar el estado del usuario logueado
  const verificarEstadoUsuarioLogueado = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userId");
      const token = AuthService.getCurrentUser();

      if (userId && token) {
        const response = await axios.get(`${API_URL}/auth/show/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Verifica si el token es inválido
        if (response.data.status === "Token is Invalid") {
          console.error("Token is invalid. Logging out...");
          AuthService.logout();
          window.location.href = "/login"; // Redirige a login si el token es inválido
          return;
        }

        // Si el token es válido y el usuario está activo, no se hace nada
      }
    } catch (error) {
      console.error("Error 500 DKM:", error);
      // AuthService.logout();
      //window.location.href = "/login";
    }
  }, []);

  const fetchDirecciones = async () => {
    try {
      const response = await axios.get(`${API_URL}/direcciones`, {
        params: { id_cliente: idCliente },
        headers: { Authorization: `Bearer ${token}` },
      });
      const direccionesData = response.data.direcciones || [];

      const direccionesWithDetails = await Promise.all(
        direccionesData.map(async (direccion) => {
          // Obtener los municipios relacionados con el departamento
          const municipiosResponse = await axios.get(
            `${API_URL}/dropdown/get_municipio/${direccion.id_departamento}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const municipio = municipiosResponse.data.municipio.find(
            (m) => m.id === direccion.id_municipio
          );

          // Obtener el nombre del departamento desde el endpoint
          const departamentoResponse = await axios.get(
            `${API_URL}/dropdown/get_departamentos`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const departamento = departamentoResponse.data.find(
            (d) => d.id === direccion.id_departamento
          );

          // Log para verificar
          console.log("Municipio encontrado:", municipio);
          console.log("Departamento encontrado:", departamento);

          return {
            ...direccion,
            departamento_nombre: departamento
              ? departamento.nombre
              : "No disponible",
            municipio_nombre: municipio ? municipio.nombre : "No disponible",
          };
        })
      );

      setDirecciones(direccionesWithDetails);
    } catch (error) {
      console.error("Error fetching direcciones:", error);
      toast.error(`Error al cargar las direcciones: ${error.message}`);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [responseCliente, responseDepartamentos] = await Promise.all([
          axios.get(`${API_URL}/clientes/${idCliente}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/dropdown/get_departamentos`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setCliente(responseCliente.data.cliente || {});
        setDepartamentos(responseDepartamentos.data || []);

        // Fetch direcciones after setting departamentos
        await fetchDirecciones();
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error(`Error al cargar los datos: ${error.message}`);
      }
    };

    verificarEstadoUsuarioLogueado(); // Verifica el estado del usuario al cargar la página
    fetchData();
  }, [idCliente, token, verificarEstadoUsuarioLogueado]);

  useEffect(() => {
    const interval = setInterval(() => {
      verificarEstadoUsuarioLogueado(); // Verifica el estado del usuario cada cierto tiempo
    }, 30000); // Verifica cada 30 segundos, ajusta según sea necesario

    return () => clearInterval(interval); // Limpia el intervalo al desmontar el componente
  }, [verificarEstadoUsuarioLogueado]);

  useEffect(() => {
    const fetchMunicipios = async () => {
      if (nuevaDireccion.id_departamento) {
        try {
          const response = await axios.get(
            `${API_URL}/dropdown/get_municipio/${nuevaDireccion.id_departamento}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setMunicipios(response.data.municipio || []);
        } catch (error) {
          console.error("Error fetching municipios:", error);
          toast.error(`Error al cargar municipios: ${error.message}`);
        }
      } else {
        setMunicipios([]);
      }
    };

    fetchMunicipios();
  }, [nuevaDireccion.id_departamento, token]);

  const formatPhoneNumber = (value) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, "");
    if (phoneNumber.length <= 4) return phoneNumber;
    return `${phoneNumber.slice(0, 4)}-${phoneNumber.slice(4, 8)}`;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!nuevaDireccion.direccion.trim()) {
      newErrors.direccion = "La dirección es requerida";
    }
    if (!nuevaDireccion.id_departamento) {
      newErrors.id_departamento = "El departamento es requerido";
    }
    if (!nuevaDireccion.id_municipio) {
      newErrors.id_municipio = "El municipio es requerido";
    }
    if (!nuevaDireccion.nombre_contacto.trim()) {
      newErrors.nombre_contacto = "El nombre de contacto es requerido";
    }
    if (!nuevaDireccion.telefono.trim()) {
      newErrors.telefono = "El teléfono es requerido";
    } else {
      const phoneDigits = nuevaDireccion.telefono.replace(/\D/g, "");
      if (phoneDigits.length !== 8) {
        newErrors.telefono = "El teléfono debe tener 8 dígitos";
      } else if (!/^[267]/.test(phoneDigits)) {
        newErrors.telefono = "El teléfono debe comenzar con 2, 6 o 7";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhoneChange = (e) => {
    const formattedPhoneNumber = formatPhoneNumber(e.target.value);
    setNuevaDireccion((prev) => ({
      ...prev,
      telefono: formattedPhoneNumber,
    }));
  };

  const handleAgregarDireccion = async () => {
    if (validateForm()) {
      try {
        const dataToSend = {
          id_cliente: Number(idCliente),
          direccion: nuevaDireccion.direccion,
          referencia: nuevaDireccion.referencia,
          id_departamento: Number(nuevaDireccion.id_departamento),
          id_municipio: Number(nuevaDireccion.id_municipio),
          nombre_contacto: nuevaDireccion.nombre_contacto,
          telefono: nuevaDireccion.telefono,
        };

        await axios.post(`${API_URL}/direcciones`, dataToSend, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        toast.success("Dirección agregada exitosamente");

        setNuevaDireccion({
          direccion: "",
          referencia: "",
          id_departamento: "",
          id_municipio: "",
          nombre_contacto: "",
          telefono: "",
        });
        setIsAdding(false);

        await fetchDirecciones();
      } catch (error) {
        console.error("Error adding new address:", error);
        toast.error(
          `Error al agregar la dirección: ${error.response?.data?.message || error.message || "Error desconocido"}`
        );
      }
    } else {
      toast.warn("Por favor, corrija los errores en el formulario");
    }
  };

  const handleSeleccionarDireccion = (direccion) => {
    setSelectedDireccion(direccion);
  };

  const handleSeleccionarDireccionRecoleccion = (direccion) => {
    setDireccionRecoleccion(direccion);
  };

  const handleContinuar = () => {
    if (selectedDireccion && direccionRecoleccion) {
      localStorage.setItem(
        "selectedAddress",
        JSON.stringify(selectedDireccion)
      );
      localStorage.setItem(
        "direccionRecoleccion",
        JSON.stringify(direccionRecoleccion)
      );
      localStorage.setItem("clienteData", JSON.stringify(cliente));
      navigate(`/DatosPaquetePreOrden/${idCliente}`);
    } else {
      toast.warn(
        "Por favor, seleccione una dirección de entrega y una de recolección antes de continuar"
      );
    }
  };

  const [currentStep, setCurrentStep] = useState(2);
  const steps = [
    { step: 1, label: "", icon: faSearch },
    { step: 2, label: "", icon: faMapMarkerAlt },
    { step: 3, label: "", icon: faBook },
    { step: 4, label: "", icon: faDollarSign },
  ];

  return (
    <Container fluid>
      <h1 className="text-center titulo-pasos">
        Seleccionar Dirección para Pre-Orden
      </h1>
      <Row>
        <Col lg={12}>
          <Nav pills className="justify-content-center mb-4">
            {steps.map(({ step, label, icon }) => (
              <NavItem key={step}>
                <NavLink
                  className={`stepperDark ${currentStep === step ? "active" : ""}`}
                  href="#"
                  style={{
                    borderRadius: "50%",
                    padding: "10px 20px",
                    margin: "0 5px",
                  }}
                >
                  <FontAwesomeIcon
                    icon={icon}
                    style={{ fontSize: "15px", marginBottom: "0px" }}
                  />
                  {label}
                </NavLink>
              </NavItem>
            ))}
          </Nav>
          {/*<Breadcrumbs breadcrumbItem="Seleccionar Cliente" />*/}
          {/*<Progress value={(currentStep / steps.length) * 100} color="primary" />*/}
          <Progress className="custom-progress barra-pasos" value={0.5 * 100} />
          <br></br>
        </Col>
      </Row>
      <Card>
        <CardBody>
          <Row>
            <Col lg={12}>
              {cliente ? (
                <h5>
                  Cliente: {cliente.nombre} {cliente.apellido}
                </h5>
              ) : (
                <h5>Cargando información del cliente...</h5>
              )}
              <Button
                color="primary"
                onClick={() => setIsAdding(!isAdding)}
                style={{ marginBottom: "10px" }}
                aria-expanded={isAdding}
              >
                {isAdding
                  ? "Cancelar Agregar Dirección"
                  : "Agregar Nueva Dirección"}
              </Button>
              {isAdding && (
                <div style={{ marginBottom: "10px" }}>
                  <FormGroup>
                    <Label for="direccion">Dirección:</Label>
                    <Input
                      type="text"
                      id="direccion"
                      value={nuevaDireccion.direccion}
                      onChange={(e) =>
                        setNuevaDireccion((prev) => ({
                          ...prev,
                          direccion: e.target.value,
                        }))
                      }
                      placeholder="Ingrese la dirección"
                      aria-label="Dirección"
                      invalid={!!errors.direccion}
                    />
                    <FormFeedback>{errors.direccion}</FormFeedback>
                  </FormGroup>
                  <FormGroup>
                    <Label for="referencia">Referencia:</Label>
                    <Input
                      type="text"
                      id="referencia"
                      value={nuevaDireccion.referencia}
                      onChange={(e) =>
                        setNuevaDireccion((prev) => ({
                          ...prev,
                          referencia: e.target.value,
                        }))
                      }
                      placeholder="Ingrese una referencia (opcional)"
                      aria-label="Referencia"
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label for="departamento">Departamento:</Label>
                    <Input
                      type="select"
                      id="departamento"
                      value={nuevaDireccion.id_departamento}
                      onChange={(e) =>
                        setNuevaDireccion((prev) => ({
                          ...prev,
                          id_departamento: e.target.value,
                          id_municipio: "",
                        }))
                      }
                      aria-label="Seleccione un departamento"
                      invalid={!!errors.id_departamento}
                    >
                      <option value="">Seleccione un departamento</option>
                      {departamentos
                        .filter((d) => [11, 12, 13, 14].includes(d.id))
                        .map((departamento) => (
                          <option key={departamento.id} value={departamento.id}>
                            {departamento.nombre}
                          </option>
                        ))}
                    </Input>
                    <FormFeedback>{errors.id_departamento}</FormFeedback>
                  </FormGroup>
                  <FormGroup>
                    <Label for="municipio">Municipio:</Label>
                    <Input
                      type="select"
                      id="municipio"
                      value={nuevaDireccion.id_municipio}
                      onChange={(e) =>
                        setNuevaDireccion((prev) => ({
                          ...prev,
                          id_municipio: e.target.value,
                        }))
                      }
                      disabled={!nuevaDireccion.id_departamento}
                      aria-label="Seleccione un municipio"
                      invalid={!!errors.id_municipio}
                    >
                      <option value="">Seleccione un municipio</option>
                      {municipios.map((municipio) => (
                        <option key={municipio.id} value={municipio.id}>
                          {municipio.nombre}
                        </option>
                      ))}
                    </Input>
                    <FormFeedback>{errors.id_municipio}</FormFeedback>
                  </FormGroup>
                  <FormGroup>
                    <Label for="nombre_contacto">Nombre de Contacto:</Label>
                    <Input
                      type="text"
                      id="nombre_contacto"
                      value={nuevaDireccion.nombre_contacto}
                      onChange={(e) =>
                        setNuevaDireccion((prev) => ({
                          ...prev,
                          nombre_contacto: e.target.value,
                        }))
                      }
                      placeholder="Ingrese el nombre de contacto"
                      aria-label="Nombre de Contacto"
                      invalid={!!errors.nombre_contacto}
                    />
                    <FormFeedback>{errors.nombre_contacto}</FormFeedback>
                  </FormGroup>
                  <FormGroup>
                    <Label for="telefono">Teléfono:</Label>
                    <Input
                      type="text"
                      id="telefono"
                      value={nuevaDireccion.telefono}
                      onChange={handlePhoneChange}
                      placeholder="Ej: 2222-2222"
                      maxLength="9"
                      aria-label="Teléfono"
                      invalid={!!errors.telefono}
                    />
                    <FormFeedback>{errors.telefono}</FormFeedback>
                  </FormGroup>
                  <Button
                    color="success"
                    onClick={handleAgregarDireccion}
                    style={{ marginTop: "10px" }}
                  >
                    Agregar
                  </Button>
                </div>
              )}
              <h4>Seleccionar Dirección de Entrega</h4>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Dirección</th>
                    <th>Referencia</th>
                    <th>Departamento</th>
                    <th>Municipio</th>
                    <th>Nombre de Contacto</th>
                    <th>Teléfono</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {direcciones.length > 0 ? (
                    direcciones.map((direccion, index) => (
                      <tr key={index}>
                        <td>
                          {direccion.direccion || "Dirección no disponible"}
                        </td>
                        <td>{direccion.referencia || "N/A"}</td>
                        <td>{direccion.departamento_nombre}</td>
                        <td>{direccion.municipio_nombre}</td>
                        <td>{direccion.nombre_contacto || "No disponible"}</td>
                        <td>{direccion.telefono || "No disponible"}</td>
                        <td>
                          <Button
                            color={
                              selectedDireccion === direccion
                                ? "success"
                                : "primary"
                            }
                            onClick={() =>
                              handleSeleccionarDireccion(direccion)
                            }
                            aria-pressed={selectedDireccion === direccion}
                          >
                            {selectedDireccion === direccion
                              ? "Seleccionada"
                              : "Seleccionar"}
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center">
                        No hay direcciones disponibles
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
              {selectedDireccion && (
                <>
                  <h4>Seleccionar Dirección de Recolección</h4>
                  <Table responsive>
                    <thead>
                      <tr>
                        <th>Dirección</th>
                        <th>Referencia</th>
                        <th>Departamento</th>
                        <th>Municipio</th>
                        <th>Nombre de Contacto</th>
                        <th>Teléfono</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {direcciones.length > 0 ? (
                        direcciones
                          .filter(
                            (direccion) =>
                              direccion.id_departamento === 12 &&
                              direccion.id_municipio === 215
                          )
                          .map((direccion, index) => (
                            <tr key={index}>
                              <td>
                                {direccion.direccion ||
                                  "Dirección no disponible"}
                              </td>
                              <td>{direccion.referencia || "N/A"}</td>
                              <td>{direccion.departamento_nombre}</td>
                              <td>{direccion.municipio_nombre}</td>
                              <td>
                                {direccion.nombre_contacto || "No disponible"}
                              </td>
                              <td>{direccion.telefono || "No disponible"}</td>
                              <td>
                                <Button
                                  color={
                                    direccionRecoleccion === direccion
                                      ? "success"
                                      : "primary"
                                  }
                                  onClick={() =>
                                    handleSeleccionarDireccionRecoleccion(
                                      direccion
                                    )
                                  }
                                  disabled={direccion === selectedDireccion}
                                >
                                  {direccionRecoleccion === direccion
                                    ? "Seleccionada"
                                    : "Seleccionar"}
                                </Button>
                              </td>
                            </tr>
                          ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center">
                            No hay direcciones disponibles en San Miguel
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </>
              )}
              {selectedDireccion && direccionRecoleccion && (
                <div>
                  <h5>Dirección de Entrega Seleccionada:</h5>
                  <p>
                    {selectedDireccion.direccion || "Dirección no disponible"}
                  </p>
                  <h5>Dirección de Recolección Seleccionada:</h5>
                  <p>
                    {direccionRecoleccion.direccion ||
                      "Dirección no disponible"}
                  </p>
                  <Button
                    className="btnGuardarDatosPaquete"
                    color="success"
                    onClick={handleContinuar}
                  >
                    Continuar con la Pre-Orden
                  </Button>
                </div>
              )}
            </Col>
          </Row>
        </CardBody>
      </Card>
    </Container>
  );
}
