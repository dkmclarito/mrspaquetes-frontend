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
import Breadcrumbs from "../components/Rutas/Common/Breadcrumbs";
import AuthService from "../services/authService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const AgregarRuta = () => {
  const [formData, setFormData] = useState({
    id_destino: "",
    nombre: "",
    id_bodega: "",
    fecha_programada: "",
    estado: "1" 
  });
  const [errors, setErrors] = useState({});
  const [destinos, setDestinos] = useState([]);
  const [bodegas, setBodegas] = useState([]);
  const [existingRoutes, setExistingRoutes] = useState([]);
  const navigate = useNavigate();
  
  const token = localStorage.getItem('token') || AuthService.getToken?.() || '';

  const fetchDestinosYBodegas = useCallback(async () => {
    try {
      const [destinosResponse, bodegasResponse] = await Promise.all([
        axios.get(`${API_URL}/destinos`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/bodegas`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      setDestinos(destinosResponse.data.destinos || []);
      setBodegas(bodegasResponse.data.bodegas || []);
    } catch (error) {
      console.error("Error al obtener datos:", error);
      toast.error("Error al cargar los datos necesarios");
    }
  }, [token]);

  useEffect(() => {
    fetchDestinosYBodegas();
  }, [fetchDestinosYBodegas]);

  useEffect(() => {
    const fetchExistingRoutes = async () => {
      try {
        let allRoutes = [];
        let page = 1;
        let totalPages;

        do {
          const response = await axios.get(`${API_URL}/rutas?page=${page}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          //console.log(`Rutas existentes obtenidas - Página ${page}:`, response.data);
          allRoutes = allRoutes.concat(response.data.data || []);
          totalPages = response.data.last_page;
          page++;
        } while (page <= totalPages);

        setExistingRoutes(allRoutes);
      } catch (error) {
        console.error("Error al obtener rutas existentes:", error);
        toast.error("Error al cargar las rutas existentes");
      }
    };

    fetchExistingRoutes();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Validación en tiempo real para la fecha
    if (name === 'fecha_programada') {
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0); // Resetear la hora a 00:00:00
      const [year, month, day] = value.split('-').map(Number);
      const programmedDate = new Date(year, month - 1, day);
      
      let dateError = null;

      if (programmedDate < currentDate) {
        dateError = "La fecha programada no puede ser menor a la fecha actual";
      } else if (year > currentDate.getFullYear()) {
        dateError = "El año no puede ser mayor al año actual";
      } else if (year.toString().length !== 4) {
        dateError = "El año debe tener exactamente 4 dígitos";
      } else if (month > 12) {
        dateError = "El mes no puede ser mayor a 12";
      } else if (day > 31) {
        dateError = "El día no puede ser mayor a 31";
      }

      setErrors({
        ...errors,
        fecha_programada: dateError
      });
    } else if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.id_destino) newErrors.id_destino = "El destino es requerido";
    if (!formData.nombre) newErrors.nombre = "El nombre de la ruta es requerido";
    if (!formData.id_bodega) newErrors.id_bodega = "La bodega es requerida";
    if (!formData.fecha_programada) {
      newErrors.fecha_programada = "La fecha programada es requerida";
    }
    return newErrors;
  };

  const checkRouteNameExists = async (name) => {
    // Verificar si el nombre de la ruta ya existe en el conjunto de rutas existentes
    const exists = existingRoutes.some(route => route.nombre.toLowerCase() === name.toLowerCase());
    //console.log("Verificación de nombre de ruta:", name, "Existe:", exists);
    return exists;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Verifica si el nombre de la ruta ya existe
    const routeExists = await checkRouteNameExists(formData.nombre);
    if (routeExists) {
      setErrors(prevErrors => ({
        ...prevErrors,
        nombre: "Ya existe una ruta con este nombre"
      }));
      
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/rutas`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 201) {
        toast.success('Ruta agregada con éxito');
        navigate('/GestionRutas');
      }
    } catch (error) {
      console.error("Error al crear la ruta:", error);
      toast.error('Error del servidor al crear la ruta');
    }
  };

  const handleSalir = () => {
    navigate('/GestionRutas'); // Redirige a la página de Gestión de Rutas
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Crear Ruta" breadcrumbItem="Crear Ruta" />
          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col md={6}>
                        <FormGroup>
                          <Label for="nombre">Nombre de la Ruta</Label>
                          <Input
                            type="text"
                            name="nombre"
                            id="nombre"
                            value={formData.nombre}
                            onChange={handleInputChange}
                            invalid={!!errors.nombre}
                          />
                          {errors.nombre && <FormFeedback>{errors.nombre}</FormFeedback>}
                        </FormGroup>
                      </Col>

                      <Col md={6}>
                        <FormGroup>
                          <Label for="id_destino">Destino</Label>
                          <Input
                            type="select"
                            name="id_destino"
                            id="id_destino"
                            value={formData.id_destino}
                            onChange={handleInputChange}
                            invalid={!!errors.id_destino}
                          >
                            <option value="">Seleccione un destino</option>
                            {destinos.map((destino) => (
                              <option key={destino.id} value={destino.id}>
                                {destino.nombre}
                              </option>
                            ))}
                          </Input>
                          {errors.id_destino && <FormFeedback>{errors.id_destino}</FormFeedback>}
                        </FormGroup>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <FormGroup>
                          <Label for="id_bodega">Bodega</Label>
                          <Input
                            type="select"
                            name="id_bodega"
                            id="id_bodega"
                            value={formData.id_bodega}
                            onChange={handleInputChange}
                            invalid={!!errors.id_bodega}
                          >
                            <option value="">Seleccione una bodega</option>
                            {bodegas.map((bodega) => (
                              <option key={bodega.id} value={bodega.id}>
                                {bodega.nombre}
                              </option>
                            ))}
                          </Input>
                          {errors.id_bodega && <FormFeedback>{errors.id_bodega}</FormFeedback>}
                        </FormGroup>
                      </Col>

                      <Col md={6}>
                        <FormGroup>
                          <Label for="fecha_programada">Fecha Programada</Label>
                          <Input
                            type="date"
                            name="fecha_programada"
                            id="fecha_programada"
                            value={formData.fecha_programada}
                            onChange={handleInputChange}
                            invalid={!!errors.fecha_programada}
                            min={new Date().toISOString().split('T')[0]}
                            max={`${new Date().getFullYear()}-12-31`}
                          />
                          {errors.fecha_programada && <FormFeedback>{errors.fecha_programada}</FormFeedback>}
                        </FormGroup>
                      </Col>
                    </Row>
                    <Col md="12">
                      <Button color="primary" type="submit">
                        Registrar
                      </Button>
                      <Button className="ms-2 btn-custom-red" onClick={handleSalir}>
                        Salir
                      </Button>
                    </Col>
                  </Form>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default AgregarRuta;

