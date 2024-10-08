import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  FormFeedback,
} from "reactstrap";
import Breadcrumbs from "../components/Bodegas/Common/Breadcrumbs";
import AuthService from "../services/authService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const AgregarBodega = () => {
  const [departamentos, setDepartamentos] = useState([]);
  const [municipiosPorDepartamento, setMunicipiosPorDepartamento] = useState(
    {}
  );
  const [nombre, setNombre] = useState("");
  const [tipoBodega, setTipoBodega] = useState(""); 
  const [direccion, setDireccion] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [isNombreValido, setIsNombreValido] = useState(true);
  const [isDireccionValida, setIsDireccionValida] = useState(true);
  const [existingBodegas, setExistingBodegas] = useState([]);
  const token = AuthService.getCurrentUser();
  const navigate = useNavigate();

  const verificarEstadoUsuarioLogueado = useCallback(async () => {
    try {
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
  }, [token]);

  useEffect(() => {
    verificarEstadoUsuarioLogueado(); // Verifica el estado del usuario al cargar la página
  }, [verificarEstadoUsuarioLogueado]);

  useEffect(() => {
    const interval = setInterval(() => {
      verificarEstadoUsuarioLogueado(); // Verifica el estado del usuario cada cierto tiempo
    }, 30000); // Verifica cada 30 segundos, ajusta según sea necesario

    return () => clearInterval(interval); 
  }, [verificarEstadoUsuarioLogueado]);

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
          const response = await fetch(
            `${API_URL}/dropdown/get_municipio/${departamento}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (!response.ok) throw new Error(`Error: ${response.statusText}`);
          const responseData = await response.json();
          if (responseData.municipio && Array.isArray(responseData.municipio)) {
            const municipios = responseData.municipio;
            setMunicipiosPorDepartamento((prev) => ({
              ...prev,
              [departamento]: municipios,
            }));
          } else {
            console.error(
              "Respuesta no válida para municipios:",
              responseData
            );
          }
        } catch (error) {
          console.error("Error al obtener los municipios:", error);
        }
      }
    };

    fetchMunicipios();
  }, [departamento, token]);

  const fetchExistingBodegas = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/bodegas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        setExistingBodegas(response.data.bodegas);
      }
    } catch (error) {
      console.error("Error al obtener las bodegas existentes:", error);
    }
  }, [token]);

  useEffect(() => {
    fetchExistingBodegas();
  }, [fetchExistingBodegas]);

  const validateNombre = (nombre) => {
    return (
      nombre.length > 0 &&
      nombre.length <= 100 &&
      !existingBodegas.some((bodega) => bodega.nombre === nombre)
    );
  };

  const validateDireccion = (direccion) => {
    return direccion.length > 0 && direccion.length <= 200;
  };

  const handleNombreChange = (e) => {
    const value = e.target.value;
    setNombre(value);
    setIsNombreValido(validateNombre(value));
  };

  const handleDireccionChange = (e) => {
    const value = e.target.value;
    setDireccion(value);
    setIsDireccionValida(validateDireccion(value));
  };

  const handleTipoBodegaChange = (e) => {
    setTipoBodega(e.target.value);
  };

  const handleDepartamentoChange = (e) => {
    const selectedDepartamento = e.target.value;
    setDepartamento(selectedDepartamento);
    setMunicipio("");
  };

  const handleMunicipioChange = (e) => {
    setMunicipio(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isNombreValido || !isDireccionValida) {
      toast.error(
        "Por favor, corrija los errores en el formulario antes de enviar.",
        {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
        }
      );
      return;
    }

    const bodegaData = {
      nombre,
      direccion,
      tipo_bodega: tipoBodega, 
      id_departamento: departamento,
      id_municipio: municipio,
    };

    try {
      const response = await fetch(`${API_URL}/bodegas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodegaData),
      });

      if (!response.ok) {
        let errorMessage = "Error al agregar la bodega.";
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

      toast.success("¡Bodega agregada con éxito!", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });

      setTimeout(() => {
        navigate("/GestionBodegas");
      }, 2000);

      setNombre("");
      setTipoBodega("");
      setDireccion("");
      setDepartamento("");
      setMunicipio("");
    } catch (error) {
      toast.error(`Error al agregar la bodega: ${error.message}`, {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });
    }
  };

  const handleExit = () => {    
    navigate("/GestionBodegas");
  };
  return (
    <Container>
      <Breadcrumbs
        title="Formulario de Registro de Bodegas"
        breadcrumbItem="Ingrese la información"
      />
      <Card>
        <CardBody>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label for="nombre">Nombre</Label>
                  <Input
                    type="text"
                    id="nombre"
                    value={nombre}
                    onChange={handleNombreChange}
                    required
                    invalid={!isNombreValido}
                  />
                  {!isNombreValido && (
                    <FormFeedback className="text-danger">
                      Ya existe una bodega con ese nombre.
                    </FormFeedback>
                  )}
                </FormGroup>
              </Col>

              <Col md="6">
                <FormGroup>
                  <Label for="tipo_bodega">Tipo de Bodega</Label>
                  <Input
                    type="select"
                    id="tipo_bodega"
                    value={tipoBodega}
                    onChange={handleTipoBodegaChange} 
                    required
                  >
                    <option value="">Seleccione un tipo</option>
                    <option value="fisica">Física</option>
                    <option value="movil">Móvil</option>
                  </Input>
                </FormGroup>
              </Col>
            </Row>

            <Row>
              <Col md="6">
                <FormGroup>
                  <Label for="direccion">Dirección</Label>
                  <Input
                    type="text"
                    id="direccion"
                    value={direccion}
                    onChange={handleDireccionChange}
                    required
                    invalid={!isDireccionValida}
                  />
                  {!isDireccionValida && (
                    <FormFeedback className="text-danger">
                      La dirección debe contener entre 1 y 200 caracteres.
                    </FormFeedback>
                  )}
                </FormGroup>
              </Col>

              <Col md="6">
                <FormGroup>
                  <Label for="departamento">Departamento</Label>
                  <Input
                    type="select"
                    id="departamento"
                    value={departamento}
                    onChange={handleDepartamentoChange}
                    required
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
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label for="municipio">Municipio</Label>
                  <Input
                    type="select"
                    id="municipio"
                    value={municipio}
                    onChange={handleMunicipioChange}
                    required
                  >
                    <option value="">Seleccione un municipio</option>
                    {municipiosPorDepartamento[departamento] &&
                      municipiosPorDepartamento[departamento].map((mun) => (
                        <option key={mun.id} value={mun.id}>
                          {mun.nombre}
                        </option>
                      ))}
                  </Input>
                </FormGroup>
              </Col>
            </Row>

            <Button type="submit" color="primary">
              Agregar Bodega
            </Button>
            <Button className="ms-2 btn-custom-red" onClick={handleExit}>
              Salir
            </Button>
          </Form>
        </CardBody>
      </Card>
    </Container>
  );
};

export default AgregarBodega;
