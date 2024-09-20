import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, Card, CardBody, Form, FormGroup, Label, Button, Alert} from "reactstrap";
import Select from "react-select";
import { useNavigate, Link } from "react-router-dom";
import AuthService from "../services/authService";
import Breadcrumbs from "../components/Usuarios/Common/Breadcrumbs";

const API_URL = import.meta.env.VITE_API_URL;

const UbicarPaqueteDaniado = () => {
  const [ubicaciones, setUbicaciones] = useState([]);
  const [paquetesDanio, setPaquetesDanio] = useState([]);
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState(null);
  const [paqueteSeleccionado, setPaqueteSeleccionado] = useState(null);
  const [alertaExito, setAlertaExito] = useState(false);
  const [alertaError, setAlertaError] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState("");

  const token = AuthService.getCurrentUser();
  const navigate = useNavigate();

  const customStyles = {
    option: (provided) => ({
      ...provided,
      color: 'black',  // Cambia el color del texto de las opciones
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'black',  // Cambia el color del texto del valor seleccionado
    }),
  };

  useEffect(() => {
    const fetchUbicaciones = async () => {
      try {
        const response = await axios.get(`${API_URL}/dropdown/get_Ubicaciones_paquetes_da`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUbicaciones(response.data || []);
      } catch (error) {
        console.error("Error al obtener ubicaciones:", error);
        setAlertaError(true);
        setErrorMensaje("Error al obtener ubicaciones. Intente nuevamente más tarde.");
      }
    };

    const fetchPaquetesDanio = async () => {
      try {
        const response = await axios.get(`${API_URL}/dropdown/get_paquetes_danio`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPaquetesDanio(response.data.paquetes || []);
      } catch (error) {
        console.error("Error al obtener paquetes dañados:", error);
        setAlertaError(true);
        setErrorMensaje("No hay paquetes dañados.");
      }
    };

    fetchUbicaciones();
    fetchPaquetesDanio();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!ubicacionSeleccionada || !paqueteSeleccionado) {
      setAlertaError(true);
      setErrorMensaje("Debe seleccionar una ubicación y un paquete dañado.");
      return;
    }

    const datosRegistro = {
      codigo_qr_paquete: paqueteSeleccionado.value,
      codigo_nomenclatura_ubicacion: ubicacionSeleccionada.value
    };

    try {
      const response = await axios.post(`${API_URL}/ubicacion-paquetes-danados`, datosRegistro, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200 || response.status === 201) {
        setAlertaExito(true);
        setTimeout(() => {
          setAlertaExito(false);
          navigate("/IncidenciasUbicadas", { replace: true });
        }, 3000);
      } else {
        setAlertaError(true);
        setErrorMensaje("Error al registrar la ubicación del paquete.");
      }
    } catch (error) {
      setAlertaError(true);
      const mensajeError = error.response ? error.response.data.message : "Error al registrar la ubicación del paquete.";
      setErrorMensaje(mensajeError);
      console.error("Error al registrar la ubicación del paquete:", error.response ? error.response.data : error);
    }
  };

  return (
    <Container fluid>
      <Breadcrumbs title="Gestión de Ubicaciones" breadcrumbItem="Ubicar Paquete Dañado" />
      <Card>
        <CardBody>
          <h5 className="mb-4">Ubicar Paquete Dañado</h5>
          {alertaExito && <Alert color="success">Paquete dañado ubicado exitosamente</Alert>}
          {alertaError && <Alert color="danger">{errorMensaje}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label for="ubicacion">Ubicación</Label>
                  <Select
                    id="ubicacion"
                    value={ubicacionSeleccionada}
                    onChange={setUbicacionSeleccionada}
                    options={ubicaciones.map((ubicacion) => ({
                      value: ubicacion.nomenclatura,
                      label: ubicacion.nomenclatura
                    }))}
                    placeholder="Buscar por nomenclatura"
                    isSearchable
                    required
                    styles={customStyles}  // Aplica los estilos personalizados
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label for="paquete">Paquete Dañado</Label>
                  <Select
                    id="paquete"
                    value={paqueteSeleccionado}
                    onChange={setPaqueteSeleccionado}
                    options={paquetesDanio.map((paquete) => ({
                      value: paquete.uuid,
                      label: paquete.uuid
                    }))}
                    placeholder="Buscar por UUID"
                    isSearchable
                    required
                    styles={customStyles}  // Aplica los estilos personalizados
                  />
                </FormGroup>
              </Col>
            </Row>

            <Button type="submit" color="primary">
              Ubicar Paquete
            </Button> <span></span>
            <Link to="/GestionIncidencias" className="btn btn-secondary btn-regresar">
                <i className="fas fa-arrow-left"></i> Regresar
              </Link>
          </Form>
        </CardBody>
      </Card>
    </Container>
  );
};

export default UbicarPaqueteDaniado;
