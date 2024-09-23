import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
  Nav,
  NavItem,
  NavLink,
  Progress,
} from "reactstrap";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faMapMarkerAlt,
  faBook,
  faDollarSign,
} from "@fortawesome/free-solid-svg-icons";
import AuthService from "../services/authService";

const API_URL = import.meta.env.VITE_API_URL;

export default function GenerarOrdenExpress() {
  const location = useLocation();
  const navigate = useNavigate();
  const { idCliente } = useParams();
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    id_cliente: idCliente,
    nombre_contacto: "",
    telefono: "",
    id_direccion: "",
    id_tipo_pago: 1,
    id_estado_paquete: 1,
    id_estado_paquetes: 1,
    total_pagar: 0,
    costo_adicional: "",
    concepto: "Envío de paquetes",
    tipo_documento: "consumidor_final",
    detalles: [],
  });
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(4);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addressChanged, setAddressChanged] = useState(false);
  const [useRecoleccion, setUseRecoleccion] = useState(false);
  const [direccionRecoleccion, setDireccionRecoleccion] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = AuthService.getCurrentUser();
        const clienteResponse = await axios.get(
          `${API_URL}/clientes/${idCliente}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setCliente(clienteResponse.data.cliente);

        const storedAddress = JSON.parse(
          localStorage.getItem("selectedAddress") || "{}"
        );
        const storedDireccionRecoleccion = JSON.parse(
          localStorage.getItem("direccionRecoleccion") || "{}"
        );
        const storedUseRecoleccion = JSON.parse(
          localStorage.getItem("useRecoleccion") || "false"
        );

        setSelectedAddress(storedAddress);
        setDireccionRecoleccion(storedDireccionRecoleccion);
        setUseRecoleccion(storedUseRecoleccion);

        setFormData((prevState) => ({
          ...prevState,
          nombre_contacto: storedAddress.nombre_contacto || "",
          telefono: storedAddress.telefono || "",
          id_direccion: useRecoleccion
            ? Number(storedDireccionRecoleccion.id)
            : Number(storedAddress.id),
          total_pagar: location.state?.totalPrice || 0,
          detalles:
            location.state?.detalles?.map((detalle) => ({
              ...detalle,
              id_tipo_paquete: Number(detalle.id_tipo_paquete),
              id_empaque: Number(detalle.id_empaque),
              peso: Number(detalle.peso),
              id_estado_paquete: 1,
              id_tamano_paquete: Number(detalle.tamano_paquete),
              id_tipo_entrega: 1,
              id_direccion:
                Number(location.state?.direccionRecoleccion?.id) ||
                Number(storedAddress.id),
              precio: Number(detalle.precio),
              fecha_envio: detalle.fecha_envio
                ? new Date(detalle.fecha_envio).toISOString().split("T")[0] +
                  "T00:00:00"
                : null,
              fecha_entrega_estimada: detalle.fecha_entrega_estimada
                ? new Date(detalle.fecha_entrega_estimada)
                    .toISOString()
                    .split("T")[0] + "T00:00:00"
                : null,
              fecha_entrega: detalle.fecha_entrega
                ? new Date(detalle.fecha_entrega).toISOString().split("T")[0] +
                  "T00:00:00"
                : null,
              descripcion_contenido: detalle.descripcion || "",
            })) || [],
          ...location.state?.commonData,
        }));

        setUseRecoleccion(location.state?.useRecoleccion || false);

        console.log("Datos iniciales del formulario:", formData);
      } catch (error) {
        console.error("Error al obtener datos:", error);
        toast.error("Error al obtener datos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [idCliente, location.state]);

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "nombre_contacto":
      case "telefono":
      case "concepto":
        if (!value.trim()) {
          error = "Este campo es requerido";
        }
        break;
      case "total_pagar":
      case "costo_adicional":
        if (isNaN(value) || Number(value) < 0) {
          error = "Debe ser un número positivo";
        }
        break;
      case "id_tipo_pago":
      case "tipo_documento":
        if (!value) {
          error = "Debe seleccionar una opción";
        }
        break;
      default:
        break;
    }
    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => {
      const updatedState = {
        ...prevState,
        [name]: value,
      };

      if (name === "costo_adicional") {
        const costoAdicional = Number(value) || 0;
        const totalPagarBase = location.state?.totalPrice || 0;
        updatedState.total_pagar = totalPagarBase + costoAdicional;
      }

      if (name === "nombre_contacto" || name === "telefono") {
        if (value !== selectedAddress[name]) {
          setAddressChanged(true);
        } else {
          setAddressChanged(false);
        }
      }

      return updatedState;
    });

    const error = validateField(name, value);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
  };

  const updateAddress = async () => {
    if (addressChanged && selectedAddress && selectedAddress.id) {
      try {
        const token = AuthService.getCurrentUser();
        const response = await axios.put(
          `${API_URL}/direcciones/${selectedAddress.id}`,
          {
            nombre_contacto: formData.nombre_contacto,
            telefono: formData.telefono,
            id_departamento: selectedAddress.id_departamento,
            id_municipio: selectedAddress.id_municipio,
            direccion: selectedAddress.direccion,
            referencia: selectedAddress.referencia,
            id_cliente: idCliente,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          console.log("Dirección actualizada con éxito");

          const updatedAddress = {
            ...selectedAddress,
            nombre_contacto: formData.nombre_contacto,
            telefono: formData.telefono,
          };
          setSelectedAddress(updatedAddress);
          localStorage.setItem(
            "selectedAddress",
            JSON.stringify(updatedAddress)
          );

          setAddressChanged(false);
        } else {
          throw new Error("La respuesta del servidor no fue exitosa");
        }
      } catch (error) {
        console.error("Error al actualizar la dirección:", error);
        toast.error(
          "Error al actualizar la dirección: " +
            (error.response?.data?.message || error.message)
        );
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error(
        "Por favor, corrija los errores en el formulario antes de enviar."
      );
      return;
    }

    try {
      const token = AuthService.getCurrentUser();

      await updateAddress();

      const orderData = {
        id_cliente: Number(formData.id_cliente),
        nombre_contacto: formData.nombre_contacto,
        telefono: formData.telefono,
        id_direccion: useRecoleccion
          ? Number(direccionRecoleccion.id)
          : Number(selectedAddress.id),
        id_tipo_pago: Number(formData.id_tipo_pago),
        total_pagar: Number(formData.total_pagar),
        costo_adicional: Number(formData.costo_adicional) || 0,
        concepto: formData.concepto,
        tipo_documento: formData.tipo_documento,
        tipo_orden: "orden", // Configuramos como 'orden' por defecto
        id_ubicacion_paquete: null, // Puedes ajustar esto según tus necesidades
        detalles: formData.detalles.map((detalle) => ({
          id_tipo_paquete: Number(detalle.id_tipo_paquete),
          id_empaque: Number(detalle.id_empaque),
          peso: Number(detalle.peso),
          id_estado_paquete: Number(detalle.id_estado_paquete),
          id_tamano_paquete: Number(detalle.id_tamano_paquete),
          fecha_envio: detalle.fecha_envio,
          fecha_entrega_estimada: detalle.fecha_entrega_estimada,
          fecha_entrega: detalle.fecha_entrega,
          descripcion_contenido: detalle.descripcion_contenido,
          id_tipo_entrega: 2, // Mantenemos 2 para express
          id_direccion: Number(selectedAddress.id),
          id_direccion_entrega: Number(selectedAddress.id),
          instrucciones_entrega: detalle.instrucciones_entrega,
          descripcion: detalle.descripcion,
          precio: Number(detalle.precio),
        })),
      };

      console.log("Datos enviados a la API:", orderData);

      const response = await axios.post(`${API_URL}/ordenes`, orderData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Respuesta de la API:", response.data);

      toast.success("Orden express registrada con éxito", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      navigate(`/procesarpagoexpress/${idCliente}`);
    } catch (error) {
      console.error("Error al registrar la orden:", error);
      if (error.response && error.response.data && error.response.data.errors) {
        console.log("Errores de validación:", error.response.data.errors);
        Object.keys(error.response.data.errors).forEach((key) => {
          toast.error(
            `Error en ${key}: ${error.response.data.errors[key].join(", ")}`
          );
        });
      } else {
        toast.error(
          "Error al registrar la orden: " +
            (error.response?.data?.message || error.message)
        );
      }
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!cliente) {
    return <div>No se pudo cargar la información del cliente.</div>;
  }

  const steps = [
    { step: 1, label: "", icon: faSearch },
    { step: 2, label: "", icon: faMapMarkerAlt },
    { step: 3, label: "", icon: faBook },
    { step: 4, label: "", icon: faDollarSign },
  ];

  return (
    <div className="page-content">
      <Container fluid>
        <h1 className="text-center titulo-pasos">Detalles de Pago express</h1>
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
            <Progress className="custom-progress barra-pasos" value={1 * 100} />
            <br></br>
          </Col>
        </Row>
        <ToastContainer />
        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <h4 className="card-title mb-4">
                  Generando orden para: {cliente.nombre} {cliente.apellido}
                </h4>
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <Label for="nombre_contacto">Nombre de Contacto</Label>
                        <Input
                          type="text"
                          name="nombre_contacto"
                          id="nombre_contacto"
                          value={formData.nombre_contacto}
                          onChange={handleInputChange}
                          invalid={!!errors.nombre_contacto}
                          required
                        />
                        <FormFeedback>{errors.nombre_contacto}</FormFeedback>
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <Label for="telefono">Teléfono</Label>
                        <Input
                          type="text"
                          name="telefono"
                          id="telefono"
                          value={formData.telefono}
                          onChange={handleInputChange}
                          invalid={!!errors.telefono}
                          required
                        />
                        <FormFeedback>{errors.telefono}</FormFeedback>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <Label for="id_tipo_pago">Tipo de Pago</Label>
                        <Input
                          type="select"
                          name="id_tipo_pago"
                          id="id_tipo_pago"
                          value={formData.id_tipo_pago}
                          onChange={handleInputChange}
                          invalid={!!errors.id_tipo_pago}
                        >
                          <option value={1}>Efectivo</option>
                          <option value={2}>Tarjeta</option>
                        </Input>
                        <FormFeedback>{errors.id_tipo_pago}</FormFeedback>
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <Label for="id_estado_paquete">
                          Estado de la Orden
                        </Label>
                        <Input
                          type="text"
                          name="id_estado_paquete"
                          id="id_estado_paquete"
                          value="En Proceso"
                          disabled
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <Label for="total_pagar">Total a Pagar</Label>
                        <Input
                          type="number"
                          name="total_pagar"
                          id="total_pagar"
                          value={formData.total_pagar}
                          onChange={handleInputChange}
                          invalid={!!errors.total_pagar}
                          required
                          readOnly
                        />
                        <FormFeedback>{errors.total_pagar}</FormFeedback>
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <Label for="costo_adicional">Costo Adicional</Label>
                        <Input
                          type="number"
                          name="costo_adicional"
                          id="costo_adicional"
                          value={formData.costo_adicional}
                          onChange={handleInputChange}
                          invalid={!!errors.costo_adicional}
                          placeholder="0"
                        />
                        <FormFeedback>{errors.costo_adicional}</FormFeedback>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <Label for="concepto">Concepto</Label>
                        <Input
                          type="text"
                          name="concepto"
                          id="concepto"
                          value={formData.concepto}
                          onChange={handleInputChange}
                          invalid={!!errors.concepto}
                        />
                        <FormFeedback>{errors.concepto}</FormFeedback>
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <Label for="tipo_documento">Tipo de Documento</Label>
                        <Input
                          type="select"
                          name="tipo_documento"
                          id="tipo_documento"
                          value={formData.tipo_documento}
                          onChange={handleInputChange}
                          invalid={!!errors.tipo_documento}
                        >
                          <option value="consumidor_final">
                            Consumidor Final
                          </option>
                          <option value="credito_fiscal">Crédito Fiscal</option>
                        </Input>
                        <FormFeedback>{errors.tipo_documento}</FormFeedback>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Button color="primary" type="submit">
                    Registrar Orden
                  </Button>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
