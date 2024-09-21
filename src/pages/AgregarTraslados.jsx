import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Input,
  Label,
  Button,
  Form,
  FormGroup,
  Table,
  FormFeedback,
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "../components/Traslados/Common/Breadcrumbs";
import AuthService from "../services/authService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";

const API_URL = import.meta.env.VITE_API_URL;

const customStyles = {
  control: (provided) => ({
    ...provided,
    backgroundColor: '#333',
    borderColor: '#666',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#fff',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? '#555' : '#333',
    color: '#fff',
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: '#333',
  }),
  input: (provided) => ({
    ...provided,
    color: '#fff',
  }),
};

const AgregarTraslado = () => {
  const navigate = useNavigate();
  const [bodegas, setBodegas] = useState([]);
  const [formData, setFormData] = useState(() => {
    const savedFormData = localStorage.getItem('trasladoFormData');
    return savedFormData ? JSON.parse(savedFormData) : {
      bodega_origen: "",
      bodega_destino: "",
      codigos_qr: [],
      fecha_traslado: new Date().toISOString().split('T')[0],
    };
  });
  const [codigoQR, setCodigoQR] = useState("");
  const [errors, setErrors] = useState({});

  const verificarEstadoUsuarioLogueado = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userId");
      const token = AuthService.getCurrentUser();

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
    const interval = setInterval(verificarEstadoUsuarioLogueado, 30000);
    return () => clearInterval(interval);
  }, [verificarEstadoUsuarioLogueado]);

  useEffect(() => {
    const fetchBodegas = async () => {
      try {
        const token = AuthService.getCurrentUser();
        const response = await axios.get(`${API_URL}/dropdown/get_bodegas`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data && Array.isArray(response.data.bodegas)) {
          const bodegasOptions = response.data.bodegas.map((bodega) => ({
            value: bodega.id,
            label: bodega.nombre,
          }));
          setBodegas(bodegasOptions);
        } else {
          console.error("Unexpected API response format:", response.data);
          toast.error("Error al cargar las bodegas: formato de respuesta inesperado");
        }
      } catch (error) {
        console.error("Error al obtener bodegas:", error);
        toast.error("Error al cargar las bodegas");
      }
    };

    fetchBodegas();
  }, []);

  useEffect(() => {
    localStorage.setItem('trasladoFormData', JSON.stringify(formData));
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };

  const handleSelectChange = (selectedOption, { name }) => {
    setFormData({ ...formData, [name]: selectedOption.value });
    validateField(name, selectedOption.value);
  };

  const validateField = (name, value) => {
    let newErrors = { ...errors };
    switch (name) {
      case "bodega_origen":
      case "bodega_destino":
        if (!value) {
          newErrors[name] = "Este campo es requerido";
        } else {
          delete newErrors[name];
        }
        break;
      case "fecha_traslado":
        const dateError = validateDate(value);
        if (dateError) {
          newErrors[name] = dateError;
        } else {
          delete newErrors[name];
        }
        break;
      default:
        break;
    }
    setErrors(newErrors);
  };

  const validateDate = (date) => {
    const selectedDate = new Date(date);
    const currentDate = new Date();
    
    
    selectedDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);

  
    if (selectedDate < currentDate) {
      return "La fecha no puede ser anterior a la fecha actual";
    }

    const [year, month, day] = date.split('-').map(Number);
    const currentYear = currentDate.getFullYear();

   
    if (year < currentYear || year > currentYear + 1) {
      return `El año debe ser ${currentYear} o ${currentYear + 1}`;
    }
    if (month < 1 || month > 12) {
      return 'El mes debe estar entre 1 y 12';
    }
    if (day < 1 || day > 31) {
      return 'El día debe estar entre 1 y 31';
    }
    return '';
  };

  const handleAddCodigoQR = () => {
    if (!codigoQR.trim()) {
      setErrors({ ...errors, codigoQR: "El código QR no puede estar vacío." });
      return;
    }
    if (formData.codigos_qr.includes(codigoQR)) {
      setErrors({ ...errors, codigoQR: "El código ya está ingresado en su lista." });
      return;
    }

    setFormData({
      ...formData,
      codigos_qr: [...formData.codigos_qr, codigoQR],
    });
    setCodigoQR("");
    setErrors({ ...errors, codigoQR: "" });
  };

  const handleRemoveCodigoQR = (index) => {
    const newCodigos = [...formData.codigos_qr];
    newCodigos.splice(index, 1);
    setFormData({ ...formData, codigos_qr: newCodigos });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    try {
      const token = AuthService.getCurrentUser();
      await axios.post(`${API_URL}/traslados`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      toast.success("Traslado registrado con éxito", {
        onClose: () => {
          localStorage.removeItem('trasladoFormData');
          navigate("/GestionTraslados");
        }
      });
    } catch (error) {
      console.error("Error al registrar traslado:", error);
      toast.error("Error al registrar el traslado");
    }
  };

  const validateForm = () => {
    const formErrors = {};
    if (!formData.bodega_origen) formErrors.bodega_origen = "Este campo es requerido";
    if (!formData.bodega_destino) formErrors.bodega_destino = "Este campo es requerido";
    const dateError = validateDate(formData.fecha_traslado);
    if (dateError) formErrors.fecha_traslado = dateError;
    if (formData.codigos_qr.length === 0) formErrors.codigos_qr = "Debe agregar al menos un código QR";
    return formErrors;
  };

  const handleExit = () => {
    localStorage.removeItem('trasladoFormData');
    navigate("/GestionTraslados");
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Agregar Paquetes a Traslados" breadcrumbItem="Agregar Traslado" />
        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col lg={4}>
                      <FormGroup>
                        <Label for="bodega_origen">Bodega de Origen</Label>
                        <Select
                          id="bodega_origen"
                          name="bodega_origen"
                          options={bodegas}
                          onChange={(option) => handleSelectChange(option, { name: "bodega_origen" })}
                          value={bodegas.find((option) => option.value === formData.bodega_origen)}
                          styles={customStyles}
                          isInvalid={!!errors.bodega_origen}
                          isSearchable={true}
                        />
                        {errors.bodega_origen && <FormFeedback className="d-block">{errors.bodega_origen}</FormFeedback>}
                      </FormGroup>
                    </Col>
                    <Col lg={4}>
                      <FormGroup>
                        <Label for="bodega_destino">Bodega de Destino</Label>
                        <Select
                          id="bodega_destino"
                          name="bodega_destino"
                          options={bodegas}
                          onChange={(option) => handleSelectChange(option, { name: "bodega_destino" })}
                          value={bodegas.find((option) => option.value === formData.bodega_destino)}
                          styles={customStyles}
                          isInvalid={!!errors.bodega_destino}
                          isSearchable={true}
                        />
                        {errors.bodega_destino && <FormFeedback className="d-block">{errors.bodega_destino}</FormFeedback>}
                      </FormGroup>
                    </Col>
                    <Col lg={4}>
                      <FormGroup>
                        <Label for="fecha_traslado">Fecha de Traslado</Label>
                        <Input
                          type="date"
                          name="fecha_traslado"
                          id="fecha_traslado"
                          value={formData.fecha_traslado}
                          onChange={handleInputChange}
                          invalid={!!errors.fecha_traslado}
                        />
                        {errors.fecha_traslado && (
                          <FormFeedback className="d-block" style={{ color: 'red' }}>
                            {errors.fecha_traslado}
                          </FormFeedback>
                        )}
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col lg={6}>
                      <FormGroup>
                        <Label for="codigo_qr">Código QR</Label>
                        <div className="d-flex">
                          <Input
                            type="text"
                            id="codigo_qr"
                            value={codigoQR}
                            onChange={(e) => setCodigoQR(e.target.value)}
                            placeholder="Ingrese código QR"
                            className="mr-2"
                            invalid={!!errors.codigoQR}
                          />
                          <Button color="primary" onClick={handleAddCodigoQR} style={{ marginLeft: '1rem' }}>
                            Agregar
                          </Button>
                        </div>
                        {errors.codigoQR && <FormFeedback className="d-block">{errors.codigoQR}</FormFeedback>}
                      </FormGroup>
                    </Col>
                  </Row>
                  {formData.codigos_qr.length > 0 && (
                    <Row>
                      <Col lg={6}>
                        <Table responsive striped className="mt-2">
                          <thead>
                            <tr>
                              <th>Ítem</th>
                              <th>Código QR</th>
                              <th>Acción</th>
                            </tr>
                          </thead>
                          <tbody>
                            {formData.codigos_qr.map((codigo, index) => (
                              <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{codigo}</td>
                                <td>
                                  <Button color="danger" size="sm" onClick={() => handleRemoveCodigoQR(index)}>
                                    Eliminar
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </Col>
                    </Row>
                  )}
                  {errors.codigos_qr && <FormFeedback className="d-block">{errors.codigos_qr}</FormFeedback>}
                  <Col md="12" className="mt-4">
                    <Button color="primary" type="submit">
                      Registrar Traslado
                    </Button>
                    <Button className="ms-2 btn-custom-red" onClick={handleExit}>
                      Salir
                    </Button>
                  </Col>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default AgregarTraslado;