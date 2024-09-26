import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardBody,
  Col,
  Row,
  Container,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  FormFeedback,
} from "reactstrap";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Breadcrumbs from "../components/Vehiculos/Common/Breadcrumbs";
import AuthService from "../services/authService";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Vehiculos.css";

const API_URL = import.meta.env.VITE_API_URL;

const AgregarVehiculo = () => {
  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [estados, setEstados] = useState([]);
  const [marcaSeleccionada, setMarcaSeleccionada] = useState(null);
  const [modeloSeleccionado, setModeloSeleccionado] = useState("");
  const [empleadoConductor, setEmpleadoConductor] = useState("");
  const [empleadoApoyo, setEmpleadoApoyo] = useState("");
  const [placa, setPlaca] = useState("");
  const [capacidadCarga, setCapacidadCarga] = useState("");
  const [idEstado, setIdEstado] = useState("");
  const [anio, setAnio] = useState("");
  const [bodegas, setBodegas] = useState([]);
  const [tipo, setTipo] = useState("");
  const [bodegaSeleccionada, setBodegaSeleccionada] = useState("");
  const [errors, setErrors] = useState({
    placa: "",
    capacidadCarga: "",
    anio: "",
  });
  const [existingVehiculos, setExistingVehiculos] = useState([]);

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
    const fetchMarcas = async () => {
      try {
        const response = await axios.get(`${API_URL}/dropdown/get_marcas`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setMarcas(response.data.marcas || []);
      } catch (error) {
        console.error("Error al obtener las marcas:", error);
      }
    };

    fetchMarcas();
  }, [token]);

  useEffect(() => {
    const fetchModelos = async () => {
      if (marcaSeleccionada) {
        try {
          const response = await axios.get(
            `${API_URL}/dropdown/get_modelos/${marcaSeleccionada.value}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setModelos(response.data.modelos || []);
        } catch (error) {
          console.error("Error al obtener los modelos:", error);
          setModelos([]);
        }
      } else {
        setModelos([]);
      }
    };

    fetchModelos();
  }, [marcaSeleccionada, token]);

  useEffect(() => {
    const fetchEmpleados = async () => {
      try {
        const response = await axios.get(`${API_URL}/dropdown/get_empleados`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setEmpleados(response.data.empleados || []);
      } catch (error) {
        console.error("Error al obtener los empleados:", error);
      }
    };

    fetchEmpleados();
  }, [token]);

  useEffect(() => {
    const fetchEstados = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/dropdown/get_estado_vehiculos`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setEstados(response.data.estado_vehiculos || []);
      } catch (error) {
        console.error("Error al obtener los estados:", error);
      }
    };

    fetchEstados();
  }, [token]);

  useEffect(() => {
    const fetchBodegas = async () => {
      try {
        const response = await axios.get(`${API_URL}/dropdown/get_bodegas`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBodegas(response.data.bodegas || []);
      } catch (error) {
        console.error("Error al obtener las bodegas:", error);
      }
    };

    fetchBodegas();
  }, [token]);

  useEffect(() => {
    const fetchExistingVehiculos = async () => {
      try {
        const response = await axios.get(`${API_URL}/vehiculo`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response.data.data);
        setExistingVehiculos(response.data.data || []);
      } catch (error) {
        console.error("Error al obtener los vehículos existentes:", error);
      }
    };

    fetchExistingVehiculos();
  }, [token]);

  const handleMarcaChange = (selectedOption) => {
    setMarcaSeleccionada(selectedOption);
    setModeloSeleccionado(null); // Limpiar el modelo seleccionado cuando cambia la marca
  };

  const handleModeloChange = (selectedOption) => {
    setModeloSeleccionado(selectedOption ? selectedOption.value : null);
  };

  const handleTipoChange = (e) => {
    setTipo(e.target.value);
    if (e.target.value === "moto") {
      setEmpleadoApoyo("");
      setBodegaSeleccionada("");
      setCapacidadCarga("");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    switch (name) {
      case "placa":
        setPlaca(value);
        break;
      case "capacidadCarga":
        setCapacidadCarga(value);
        break;
      case "anio":
        setAnio(value);
        break;
      case "empleadoConductor":
        setEmpleadoConductor(value);
        break;
      case "empleadoApoyo":
        setEmpleadoApoyo(value);
        break;
      case "idEstado":
        setIdEstado(value);
        break;
      case "bodegaSeleccionada":
        setBodegaSeleccionada(value);
        break;
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let formIsValid = true;
    const currentYear = new Date().getFullYear();
    let validationErrors = {};

    if (tipo === "camion") {
      const camionRegex = /^(C [A-Z0-9]{6}|P [A-Z0-9]{6})$/;
      if (!placa.match(camionRegex)) {
        validationErrors.placa =
          "El formato de la placa para un camión debe ser inical sin guiones 'C 000000' o 'P 000000'.";
        formIsValid = false;
      }
    } else if (tipo === "moto") {
      const motoRegex = /^M \d{6}$/;
      if (!placa.match(motoRegex)) {
        validationErrors.placa =
          "El formato de la placa para una moto debe ser 'M 120926'.";
        formIsValid = false;
      }
    } else {
      validationErrors.placa = "Seleccione un tipo de vehículo.";
      formIsValid = false;
    }

    if (tipo === "camion") {
      if (
        isNaN(capacidadCarga) ||
        capacidadCarga <= 0 ||
        capacidadCarga > 100
      ) {
        validationErrors.capacidadCarga =
          "La capacidad debe ser un número entre 1 y 100.";
        formIsValid = false;
      }
    }

    const minYear = tipo === "moto" ? currentYear - 8 : currentYear - 20;
    if (anio < minYear || anio > currentYear) {
      validationErrors.anio = `El año de fabricación debe estar entre ${minYear} y ${currentYear}.`;
      formIsValid = false;
    }

    if (!formIsValid) {
      setErrors(validationErrors);
      return;
    }

    // Check if the license plate already exists
    const placaExists = existingVehiculos.some(
      (vehiculo) => vehiculo.placa.toLowerCase() === placa.toLowerCase()
    );
    if (placaExists) {
      toast.error("Esta placa ya está registrada.", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    const vehiculoData = {
      id_marca: marcaSeleccionada ? marcaSeleccionada.value : null,
      id_modelo: modeloSeleccionado,
      placa,
      capacidad_carga: tipo === "moto" ? null : capacidadCarga,
      id_estado: idEstado,
      year_fabricacion: anio,
      id_empleado_conductor: empleadoConductor,
      id_empleado_apoyo: tipo === "moto" ? null : empleadoApoyo,
      id_bodega: tipo === "moto" ? null : bodegaSeleccionada,
      tipo,
    };

    try {
      const response = await axios.post(`${API_URL}/vehiculo`, vehiculoData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Vehículo registrado:", response.data);
      toast.success("Vehículo agregado con éxito.", {
        position: "bottom-right",
        autoClose: 6000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setTimeout(() => navigate("/GestionVehiculos"), 2000);
      resetForm();
    } catch (error) {
      console.error("Error de solicitud:", error.response);
      handleError(error);
    }
  };

  const resetForm = () => {
    setMarcaSeleccionada("");
    setModeloSeleccionado("");
    setEmpleadoConductor("");
    setEmpleadoApoyo("");
    setPlaca("");
    setCapacidadCarga("");
    setIdEstado("");
    setAnio("");
    setTipo("");
    setBodegaSeleccionada("");
    setErrors({});
  };

  const handleError = (error) => {
    if (error.response && error.response.data) {
      const errorData = error.response.data.error;
      let errorMessage = errorData;
      if (errorData) {
        if (errorData.id_marca) {
          errorMessage = "Error en la marca seleccionada.";
        } else if (errorData.id_modelo) {
          errorMessage = "Error en el modelo seleccionado.";
        } else if (errorData.empleadoConductor) {
          errorMessage = "El conductor ya está asignado a un vehiculo.";
        }else if (errorData.placa) {
          errorMessage = "La placa ya está registrada.";
        } else if (errorData.capacidad_carga) {
          errorMessage = "Error en la capacidad de carga.";
        } else if (errorData.id_estado) {
          errorMessage = "Error en el estado del vehículo.";
        } else if (errorData.year_fabricacion) {
          errorMessage = "Error en el año de fabricación.";
        } else {
          errorMessage = errorData.message || errorMessage;
        }
      } else {
        errorMessage = error.response.data.message || errorMessage;
      }

      toast.error(errorMessage, {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else {
      toast.error(
        "Hubo un error al procesar la solicitud. Por favor, inténtalo de nuevo.",
        {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    }
  };

  return (
    <Container fluid>
      <Breadcrumbs title="Vehículos" breadcrumbItem="Agregar Vehículo" />
      <Row>
        <Col xl="12">
          <Card>
            <CardBody>
              <Form onSubmit={handleSubmit}>
                <Row form>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="tipo">Tipo</Label>
                      <Input
                        type="select"
                        name="tipo"
                        id="tipo"
                        value={tipo}
                        onChange={handleTipoChange}
                        required
                      >
                        <option value="">Seleccione un tipo</option>
                        <option value="camion">Camión</option>
                        <option value="moto">Moto</option>
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup className="form-group-custom">
                      <Label for="marca">Marca</Label>
                      <Select
                        classNamePrefix="custom-select"
                        name="marca"
                        id="marca"
                        value={marcaSeleccionada}
                        onChange={handleMarcaChange}
                        options={marcas.map((marca) => ({
                          value: marca.id,
                          label: marca.nombre,
                        }))}
                        placeholder="Seleccione Marca"
                        isClearable
                        required
                        filterOption={(option, inputValue) =>
                          option.label.toLowerCase().includes(inputValue.toLowerCase())
                        }
                        maxMenuHeight={200}
                      />
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="modelo">Modelo</Label>
                      <Select
                        classNamePrefix="custom-select"
                        name="modelo"
                        id="modelo"
                        value={
                          modeloSeleccionado
                            ? {
                                value: modeloSeleccionado,
                                label: modelos.find(
                                  (m) => m.id === modeloSeleccionado
                                )?.nombre,
                              }
                            : null
                        }
                        onChange={handleModeloChange}
                        options={modelos.map((modelo) => ({
                          value: modelo.id,
                          label: modelo.nombre,
                        }))}
                        placeholder="Seleccione Modelo"
                        isClearable
                        isDisabled={!marcaSeleccionada}
                        required
                        filterOption={(option, inputValue) =>
                          option.label.toLowerCase().includes(inputValue.toLowerCase())
                        }
                        maxMenuHeight={200}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row form>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="conductor">Conductor</Label>
                      <Select
                        classNamePrefix="custom-select"
                        name="empleadoConductor"
                        id="conductor"
                        value={
                          empleadoConductor
                            ? {
                                value: empleadoConductor,
                                label:
                                  empleados.find(
                                    (empleado) =>
                                      empleado.id === empleadoConductor
                                  )?.nombres +
                                  " " +
                                  empleados.find(
                                    (empleado) =>
                                      empleado.id === empleadoConductor
                                  )?.apellidos,
                              }
                            : null
                        }
                        onChange={(selectedOption) =>
                          setEmpleadoConductor(
                            selectedOption ? selectedOption.value : ""
                          )
                        }
                        options={empleados
                          .filter((empleado) => empleado.id_cargo === 1)
                          .map((empleado) => ({
                            value: empleado.id,
                            label: `${empleado.nombres} ${empleado.apellidos}`,
                          }))}
                        placeholder="Seleccione Conductor"
                        isClearable
                        required
                        filterOption={(option, inputValue) =>
                          option.label.toLowerCase().includes(inputValue.toLowerCase())
                        }
                        maxMenuHeight={200}
                      />
                    </FormGroup>
                  </Col>

                  <Col md={6}>
                    <FormGroup className="form-group-custom">
                      <Label for="placa">Placa</Label>
                      <Input
                        type="text"
                        name="placa"
                        id="placa"
                        value={placa}
                        onChange={handleInputChange}
                        invalid={!!errors.placa}
                        required
                        maxLength="8"
                      />
                      <FormFeedback>{errors.placa}</FormFeedback>
                    </FormGroup>
                  </Col>
                </Row>
                <Row form>
                  <Col md={6}>
                    <FormGroup className="form-group-custom">
                      <Label for="anio">Año de Fabricación</Label>
                      <Input
                        type="number"
                        name="anio"
                        id="anio"
                        value={anio}
                        onChange={handleInputChange}
                        invalid={!!errors.anio}
                        required
                      />
                      <FormFeedback>{errors.anio}</FormFeedback>
                    </FormGroup>
                  </Col>

                  <Col md={6}>
                    <FormGroup>
                      <Label for="estado">Estado</Label>
                      <Input
                        type="select"
                        name="idEstado"
                        id="estado"
                        value={idEstado}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Seleccione Estado</option>
                        {estados.map((estado) => (
                          <option key={estado.id} value={estado.id}>
                            {estado.estado}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                  </Col>
                </Row>

                {tipo === "camion" && (
                  <>
                    <Row form>
                      <Col md={6}>
                        <FormGroup>
                          <Label for="capacidadCarga">
                            Capacidad de Carga (en paquetes)
                          </Label>
                          <Input
                            type="number"
                            name="capacidadCarga"
                            id="capacidadCarga"
                            value={capacidadCarga}
                            onChange={handleInputChange}
                            invalid={!!errors.capacidadCarga}
                            required
                            max="100"
                          />
                          <FormFeedback>{errors.capacidadCarga}</FormFeedback>
                        </FormGroup>
                      </Col>
                      <Col md={6}>
                        <FormGroup>
                          <Label for="apoyo">Apoyo</Label>
                          <Select
                            classNamePrefix="custom-select"
                            name="empleadoApoyo"
                            id="apoyo"
                            value={
                              empleadoApoyo
                                ? {
                                    value: empleadoApoyo,
                                    label:
                                      empleados.find(
                                        (empleado) =>
                                          empleado.id === empleadoApoyo
                                      )?.nombres +
                                      " " +
                                      empleados.find(
                                        (empleado) =>
                                          empleado.id === empleadoApoyo
                                      )?.apellidos,
                                  }
                                : null
                            }
                            onChange={(selectedOption) =>
                              setEmpleadoApoyo(
                                selectedOption ? selectedOption.value : ""
                              )
                            }
                            options={empleados
                              .filter((empleado) => empleado.id_cargo === 2)
                              .map((empleado) => ({
                                value: empleado.id,
                                label: `${empleado.nombres} ${empleado.apellidos}`,
                              }))}
                            placeholder="Seleccione Apoyo"
                            isClearable
                            required
                            filterOption={(option, inputValue) =>
                              option.label.toLowerCase().includes(inputValue.toLowerCase())
                            }
                            maxMenuHeight={200}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row form>
                      <Col md={6}>
                        <FormGroup>
                          <Label for="bodega">Bodega</Label>
                          <Select
                            classNamePrefix="custom-select"
                            name="bodegaSeleccionada"
                            id="bodega"
                            value={
                              bodegaSeleccionada
                                ? {
                                    value: bodegaSeleccionada,
                                    label: bodegas.find(
                                      (bodega) =>
                                        bodega.id === bodegaSeleccionada
                                    )?.nombre,
                                  }
                                : null
                            }
                            onChange={(selectedOption) =>
                              setBodegaSeleccionada(
                                selectedOption ? selectedOption.value : ""
                              )
                            }
                            options={bodegas.map((bodega) => ({
                              value: bodega.id,
                              label: bodega.nombre,
                            }))}
                            placeholder="Seleccione Bodega"
                            isClearable
                            required
                            filterOption={(option, inputValue) =>
                              option.label.toLowerCase().includes(inputValue.toLowerCase())
                            }
                            maxMenuHeight={200}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                  </>
                )}
                <Button color="primary" type="submit">
                  Guardar
                </Button>
                <Button
                  className="ms-2 btn-custom-red"
                  onClick={() => (window.location.href = "/GestionVehiculos")}
                >
                  Salir
                </Button>
              </Form>
            </CardBody>
          </Card>
        </Col>
      </Row>
      <br /><br /><br /><br />
      <ToastContainer />
    </Container>
  );
};

export default AgregarVehiculo;