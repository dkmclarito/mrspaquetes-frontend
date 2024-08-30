import React, { useState, useEffect } from "react";
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
import Breadcrumbs from "../components/Bodegas/Common/Breadcrumbs";
import AuthService from "../services/authService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const AgregarRuta = () => {
  const [destinos, setDestinos] = useState([]);
  const [bodegas, setBodegas] = useState([]);
  const [nombre, setNombre] = useState("");
  const [distancia, setDistancia] = useState("");
  const [duracion, setDuracion] = useState("");
  const [fecha, setFecha] = useState("");
  const [destino, setDestino] = useState("");
  const [bodega, setBodega] = useState("");
  const [isNombreValido, setIsNombreValido] = useState(true);
  const [isDistanciaValida, setIsDistanciaValida] = useState(true);
  const [isDuracionValida, setIsDuracionValida] = useState(true);
  const [isFechaValida, setIsFechaValida] = useState(true);
  const token = AuthService.getCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDestinos = async () => {
      try {
        const response = await fetch(`${API_URL}/destinos`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error(`Error: ${response.statusText}`);
        const data = await response.json();
        if (data.destinos && Array.isArray(data.destinos)) {
          setDestinos(data.destinos);
        } else {
          console.error("Respuesta no válida para destinos:", data);
          setDestinos([]);
        }
      } catch (error) {
        console.error("Error al obtener las destinos:", error);
        setDestinos([]);
      }
    };

    const fetchBodegas = async () => {
      try {
        const response = await fetch(`${API_URL}/bodegas`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error(`Error: ${response.statusText}`);
        const data = await response.json();
        if (data.bodegas && Array.isArray(data.bodegas)) {
          setBodegas(data.bodegas);
        } else {
          console.error("Respuesta no válida para bodegas:", data);
          setBodegas([]);
        }
      } catch (error) {
        console.error("Error al obtener las bodegas:", error);
        setBodegas([]);
      }
    };

    fetchDestinos();
    fetchBodegas();
  }, [token]);

  const validateNombre = (nombre) => nombre.length > 0 && nombre.length <= 100;
  const validateDistancia = (distancia) => !isNaN(distancia) && distancia > 0;
  const validateDuracion = (duracion) => !isNaN(duracion) && duracion > 0;
  const validateFecha = (fecha) => !isNaN(Date.parse(fecha));

  const handleNombreChange = (e) => {
    const value = e.target.value;
    setNombre(value);
    setIsNombreValido(validateNombre(value));
  };

  const handleDistanciaChange = (e) => {
    const value = e.target.value;
    setDistancia(value);
    setIsDistanciaValida(validateDistancia(value));
  };

  const handleDuracionChange = (e) => {
    const value = e.target.value;
    setDuracion(value);
    setIsDuracionValida(validateDuracion(value));
  };

  const handleFechaChange = (e) => {
    const value = e.target.value;
    setFecha(value);
    setIsFechaValida(validateFecha(value));
  };

  const handleDestinoChange = (e) => {
    setDestino(e.target.value);
  };

  const handleBodegaChange = (e) => {
    setBodega(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !isNombreValido ||
      !isDistanciaValida ||
      !isDuracionValida ||
      !isFechaValida
    ) {
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

    const rutaData = {
      nombre,
      distancia_km: distancia,
      duracion_aproximada: duracion,
      fecha_programada: fecha,
      id_destino: destino,
      id_bodega: bodega,
      estado: 1, // Asignar valor fijo de 1 al campo estado
    };

    try {
      const response = await fetch(`${API_URL}/rutas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(rutaData),
      });

      if (!response.ok) {
        let errorMessage = "Error al agregar la ruta.";
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

      toast.success("¡Ruta agregada con éxito!", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });

      setTimeout(() => {
        navigate("/GestionRutas");
      }, 2000);

      // Limpiar campos
      setNombre("");
      setDistancia("");
      setDuracion("");
      setFecha("");
      setDestino("");
      setBodega("");
    } catch (error) {
      toast.error(`Error al agregar la ruta: ${error.message}`, {
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
        title="Formulario de Registro de Rutas"
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
                    invalid={!isNombreValido}
                    required
                  />
                  <FormFeedback>
                    El nombre es requerido y debe tener hasta 100 caracteres.
                  </FormFeedback>
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label for="distancia">Distancia (km)</Label>
                  <Input
                    type="number"
                    id="distancia"
                    value={distancia}
                    onChange={handleDistanciaChange}
                    invalid={!isDistanciaValida}
                    required
                  />
                  <FormFeedback>
                    La distancia debe ser un número positivo.
                  </FormFeedback>
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label for="duracion">Duración (minutos)</Label>
                  <Input
                    type="number"
                    id="duracion"
                    value={duracion}
                    onChange={handleDuracionChange}
                    invalid={!isDuracionValida}
                    required
                  />
                  <FormFeedback>
                    La duración debe ser un número positivo.
                  </FormFeedback>
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label for="fecha">Fecha Programada</Label>
                  <Input
                    type="date"
                    id="fecha"
                    value={fecha}
                    onChange={handleFechaChange}
                    invalid={!isFechaValida}
                    required
                  />
                  <FormFeedback>La fecha debe ser válida.</FormFeedback>
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label for="destino">Destino</Label>
                  <Input
                    type="select"
                    id="destino"
                    value={destino}
                    onChange={handleDestinoChange}
                    required
                  >
                    <option value="">Seleccione un Destino</option>
                    {Array.isArray(destinos) &&
                      destinos.map((dest) => (
                        <option key={dest.id} value={dest.id}>
                          {dest.nombre}
                        </option>
                      ))}
                  </Input>
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label for="bodega">Bodega</Label>
                  <Input
                    type="select"
                    id="bodega"
                    value={bodega}
                    onChange={handleBodegaChange}
                    required
                  >
                    <option value="">Seleccione una Bodega</option>
                    {Array.isArray(bodegas) &&
                      bodegas.map((bodega) => (
                        <option key={bodega.id} value={bodega.id}>
                          {bodega.nombre}
                        </option>
                      ))}
                  </Input>
                </FormGroup>
              </Col>
            </Row>
            <Button color="primary" type="submit">
              Guardar
            </Button>
          </Form>
        </CardBody>
      </Card>
    </Container>
  );
};

export default AgregarRuta;
