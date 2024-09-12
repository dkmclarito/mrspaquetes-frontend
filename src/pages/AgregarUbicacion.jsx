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

const AgregarUbicacionPaquete = () => {
  const [paquetes, setPaquetes] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [idPaquete, setIdPaquete] = useState("");
  const [idUbicacion, setIdUbicacion] = useState("");
  const [estado, setEstado] = useState(true);
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
        const response = await axios.get(`${API_URL}/dropdown/get_paquetes`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
    
        if (response.status === 200 && response.data.paquetes) {
          // Filtrar paquetes que no están asignados
          const paquetesNoAsignados = response.data.paquetes.filter(paquete => !paquete.id_ubicacion);
          setPaquetes(paquetesNoAsignados);
        } else {
          console.error("No se encontraron paquetes.");
        }
        setPaquetes(paquetesNoAsignados);
      } catch (error) {
        console.error("Error al obtener paquetes:", error);
      }
    };
  
    fetchData();
  }, [token]);

  useEffect(() => {
    const fetchUbicaciones = async () => {
      try {
        const response = await axios.get(`${API_URL}/dropdown/get_Ubicaciones_SinPaquetes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
    
        
        setUbicaciones(response.data || []);
      } catch (error) {
        console.error("Error al obtener ubicaciones:", error);
      }
    };
  
    fetchUbicaciones();
  }, [token]);

  const handlePaqueteChange = (e) => {
    setIdPaquete(e.target.value);
  };

  const handleUbicacionChange = (e) => {
    setIdUbicacion(e.target.value);
  };

  const handleEstadoChange = (e) => {
    setEstado(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const ubicacionPaqueteData = {
      id_paquete: idPaquete,
      id_ubicacion: idUbicacion,
      estado,
    };

    try {
      const response = await fetch(`${API_URL}/ubicaciones-paquetes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(ubicacionPaqueteData),
      });

      if (!response.ok) {
        let errorMessage = "Error al registrar la ubicación del paquete.";
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

      toast.success("¡Ubicación del paquete registrada con éxito!", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });

      setTimeout(() => {
        navigate("/GestionUbicacion");
      }, 2000);

      setIdPaquete("");
      setIdUbicacion("");
      setEstado(true);
    } catch (error) {
      toast.error(`Error al registrar la ubicación del paquete: ${error.message}`, {
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
        title="Formulario de Registro de Ubicaciones de Paquetes"
        breadcrumbItem="Ingrese la información"
      />
      <Card>
        <CardBody>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label for="id_paquete">Paquete</Label>
                  <Input
                    type="select"
                    id="id_paquete"
                    value={idPaquete}
                    onChange={handlePaqueteChange}
                    required
                  >
                    <option value="">Seleccione un paquete</option>
                    {paquetes.map((paquete) => (
                      <option key={paquete.id} value={paquete.id}>
                      {`Paquete ${paquete.id} - Ubicacion: ${paquete.id_ubicacion}`}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </Col>

              <Col md="6">
                <FormGroup>
                  <Label for="id_ubicacion">Ubicación</Label>
                  <Input
                    type="select"
                    id="id_ubicacion"
                    value={idUbicacion}
                    onChange={handleUbicacionChange}
                    required
                  >
                    <option value="">Seleccione una ubicación</option>
                    {ubicaciones.map((ubicacion) => (
                      <option key={ubicacion.id} value={ubicacion.id}>
                        {ubicacion.nomenclatura}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </Col>
              <br /><br />
              <Col md="6">
                <FormGroup check>
                  <Label check>
                    <Input
                      type="checkbox"
                      id="estado"
                      checked={estado}
                      onChange={handleEstadoChange}
                    />
                    Estado (Activo/Inactivo)
                  </Label>
                </FormGroup>
              </Col>
            </Row>
            <br />
            <Button type="submit" color="primary">
              Registrar Ubicación de Paquete
            </Button>
            <Button className="ms-2 btn-custom-red" onClick={() => window.location.href = '/GestionUbicacion'}>
              Salir
            </Button>
          </Form>
        </CardBody>
      </Card>
    </Container>
  );
};

export default AgregarUbicacionPaquete;
