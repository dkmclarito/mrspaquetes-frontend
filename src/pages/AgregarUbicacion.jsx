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

const AgregarUbicacion = () => {
  const [bodegas, setBodegas] = useState([]);
  const [pasillos, setPasillos] = useState([]);
  const [nomenclatura, setNomenclatura] = useState("");
  const [idBodega, setIdBodega] = useState("");
  const [idPasillo, setIdPasillo] = useState("");
  const [isNomenclaturaValida, setIsNomenclaturaValida] = useState(true);
  const [existingUbicaciones, setExistingUbicaciones] = useState([]);
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
    verificarEstadoUsuarioLogueado();
  }, [verificarEstadoUsuarioLogueado]);

  useEffect(() => {
    const interval = setInterval(() => {
      verificarEstadoUsuarioLogueado();
    }, 30000);

    return () => clearInterval(interval);
  }, [verificarEstadoUsuarioLogueado]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = AuthService.getCurrentUser();
  
        const response = await axios.get(`${API_URL}/bodegas`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // Verifica si la respuesta es exitosa y contiene datos
        if (response.status === 200 && response.data.bodegas) {
          setBodegas(response.data.bodegas);
        } else {
          console.error("No se encontraron bodegas.");
        }
      } catch (error) {
        console.error("Error al obtener bodegas:", error);
      }
    };
  
    fetchData();
  }, []);

  useEffect(() => {
    const fetchPasillos = async () => {
      try {
        const response = await fetch(`${API_URL}/dropdown/get_pasillos`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        // Verifica si la respuesta es exitosa
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
  
        const data = await response.json();
  
        // Verifica que la respuesta sea un array de pasillos
        if (Array.isArray(data.pasillos)) {
          setPasillos(data.pasillos);
        } else {
          console.error("La respuesta no contiene pasillos válidos:", data);
        }
      } catch (error) {
        console.error("Error al obtener los pasillos:", error);
      }
    };
  
    if (token) {
      fetchPasillos();
    }
  }, [token]);  

  const fetchExistingUbicaciones = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/ubicaciones`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        setExistingUbicaciones(response.data.ubicaciones);
      }
    } catch (error) {
      console.error("Error al obtener las ubicaciones existentes:", error);
    }
  }, [token]);

  useEffect(() => {
    fetchExistingUbicaciones();
  }, [fetchExistingUbicaciones]);

  const validateNomenclatura = (nomenclatura) => {
    return (
      nomenclatura.length > 0 &&
      nomenclatura.length <= 100 &&
      !existingUbicaciones.some((ubicacion) => ubicacion.nomenclatura === nomenclatura)
    );
  };

  const handleNomenclaturaChange = (e) => {
    const value = e.target.value;
    setNomenclatura(value);
    setIsNomenclaturaValida(validateNomenclatura(value));
  };

  const handleBodegaChange = (e) => {
    setIdBodega(e.target.value);
  };

  const handlePasilloChange = (e) => {
    setIdPasillo(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isNomenclaturaValida) {
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

    const ubicacionData = {
      nomenclatura,
      id_bodega: idBodega,
      id_pasillo: idPasillo,
    };

    try {
      const response = await fetch(`${API_URL}/ubicaciones`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(ubicacionData),
      });

      if (!response.ok) {
        let errorMessage = "Error al agregar la ubicación.";
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

      toast.success("¡Ubicación agregada con éxito!", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });

      setTimeout(() => {
        navigate("/GestionUbicaciones");
      }, 2000);

      setNomenclatura("");
      setIdBodega("");
      setIdPasillo("");
    } catch (error) {
      toast.error(`Error al agregar la ubicación: ${error.message}`, {
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
    <Container>
      <Breadcrumbs
        title="Formulario de Registro de Ubicaciones"
        breadcrumbItem="Ingrese la información"
      />
      <Card>
        <CardBody>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label for="nomenclatura">Nomenclatura</Label>
                  <Input
                    type="text"
                    id="nomenclatura"
                    value={nomenclatura}
                    onChange={handleNomenclaturaChange}
                    required
                    invalid={!isNomenclaturaValida}
                  />
                  {!isNomenclaturaValida && (
                    <FormFeedback className="text-danger">
                      Ya existe una ubicación con esa nomenclatura.
                    </FormFeedback>
                  )}
                </FormGroup>
              </Col>

              <Col md="6">
                <FormGroup>
                  <Label for="id_bodega">Bodega</Label>
                  <Input
                    type="select"
                    id="id_bodega"
                    value={idBodega}
                    onChange={handleBodegaChange}
                    required
                  >
                    <option value="">Seleccione una bodega</option>
                    {bodegas.map((bodega) => (
                      <option key={bodega.id} value={bodega.id}>
                        {bodega.nombre}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </Col>

              <Col md="6">
                <FormGroup>
                  <Label for="id_pasillo">Pasillo</Label>
                  <Input
                    type="select"
                    id="id_pasillo"
                    value={idPasillo}
                    onChange={handlePasilloChange}
                    required
                  >
                  <option value="">Seleccione un pasillo</option>
                    {pasillos.map((pasillo) => (
                      <option key={pasillo.id} value={pasillo.id}>
                        {pasillo.nombre}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </Col>
            </Row>

            <Button type="submit" color="primary">
              Agregar Ubicación
            </Button>
          </Form>
        </CardBody>
      </Card>
    </Container>
  );
};

export default AgregarUbicacion;
