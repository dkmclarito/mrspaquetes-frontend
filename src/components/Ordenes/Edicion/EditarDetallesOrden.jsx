import React, { useState, useEffect } from "react";
import {
  Form,
  FormGroup,
  Label,
  Input,
  Card,
  CardBody,
  Row,
  Col,
  Alert,
} from "reactstrap";
import axios from "axios";
import { toast } from "react-toastify";
import EditarPaquetes from "./EditarPaquetes";

const API_URL = import.meta.env.VITE_API_URL;

const EditarDetallesOrden = ({ orden: ordenInicial, actualizarOrden }) => {
  const [datosComunes, setDatosComunes] = useState({
    id_estado_paquetes: "",
    fecha_envio: "",
    fecha_entrega_estimada: "",
    fecha_entrega: "",
    id_tipo_entrega: "",
    instrucciones_entrega: "",
  });
  const [errors, setErrors] = useState({});
  const [estadosPaquete, setEstadosPaquete] = useState([]);
  const [tarifas, setTarifas] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [estadosRes, tarifasRes] = await Promise.all([
          axios.get(`${API_URL}/dropdown/get_estado_paquete`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/tarifa-destinos`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setEstadosPaquete(estadosRes.data.estado_paquetes || []);
        setTarifas(tarifasRes.data || []);

        const storedAddress = JSON.parse(
          localStorage.getItem("selectedAddress")
        );
        setSelectedAddress(storedAddress);

        inicializarDatos(ordenInicial);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        toast.error(
          "Error al cargar datos necesarios. Por favor, intente de nuevo más tarde."
        );
      }
    };

    fetchData();
  }, [ordenInicial]);

  const inicializarDatos = (orden) => {
    if (orden && orden.detalles && orden.detalles.length > 0) {
      const primerDetalle = orden.detalles[0];
      setDatosComunes({
        id_estado_paquetes: orden.id_estado_paquetes || "",
        fecha_envio: formatearFecha(primerDetalle.paquete?.fecha_envio),
        fecha_entrega_estimada: formatearFecha(
          primerDetalle.paquete?.fecha_entrega_estimada
        ),
        fecha_entrega: formatearFecha(primerDetalle.fecha_entrega),
        id_tipo_entrega: primerDetalle.id_tipo_entrega || "",
        instrucciones_entrega: primerDetalle.instrucciones_entrega || "",
      });
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "";
    const [datePart] = fecha.split(" ");
    return datePart;
  };

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "fecha_envio":
      case "fecha_entrega_estimada":
      case "fecha_entrega":
        if (!value) {
          error = "Debe seleccionar una fecha";
        }
        break;
      case "instrucciones_entrega":
        if (value.trim().length === 0) {
          error = "Este campo no puede estar vacío";
        }
        break;
    }
    return error;
  };

  const handleDatosComunesChange = (e) => {
    const { name, value } = e.target;
    setDatosComunes((prev) => {
      const nuevoDatosComunes = { ...prev, [name]: value };
      actualizarOrdenCompleta({
        ...ordenInicial,
        ...nuevoDatosComunes,
      });
      return nuevoDatosComunes;
    });
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const actualizarOrdenCompleta = (nuevaOrden) => {
    const ordenEnEdicion = JSON.parse(
      localStorage.getItem("ordenEnEdicion") || "{}"
    );
    const ordenActualizada = { ...ordenEnEdicion, ...nuevaOrden };
    localStorage.setItem("ordenEnEdicion", JSON.stringify(ordenActualizada));
    actualizarOrden(ordenActualizada);
  };

  return (
    <Form>
      <h3>Editar Detalles de la Orden</h3>

      <Card className="mb-3">
        <CardBody>
          <h4>Datos Comunes para todos los Paquetes</h4>
          <Row>
            <Col md={4}>
              <FormGroup>
                <Label for="id_estado_paquetes">Estado del Paquete</Label>
                <Input
                  type="select"
                  name="id_estado_paquetes"
                  id="id_estado_paquetes"
                  value={datosComunes.id_estado_paquetes}
                  onChange={handleDatosComunesChange}
                >
                  <option value="">Seleccione un estado</option>
                  {estadosPaquete.map((estado) => (
                    <option key={estado.id} value={estado.id}>
                      {estado.nombre}
                    </option>
                  ))}
                </Input>
                {errors.id_estado_paquetes && (
                  <Alert color="danger">{errors.id_estado_paquetes}</Alert>
                )}
              </FormGroup>
            </Col>
            <Col md={4}>
              <FormGroup>
                <Label for="fecha_envio">Fecha de Envío</Label>
                <Input
                  type="date"
                  name="fecha_envio"
                  id="fecha_envio"
                  value={datosComunes.fecha_envio}
                  onChange={handleDatosComunesChange}
                />
                {errors.fecha_envio && (
                  <Alert color="danger">{errors.fecha_envio}</Alert>
                )}
              </FormGroup>
            </Col>
            <Col md={4}>
              <FormGroup>
                <Label for="fecha_entrega_estimada">
                  Fecha de Entrega Estimada
                </Label>
                <Input
                  type="date"
                  name="fecha_entrega_estimada"
                  id="fecha_entrega_estimada"
                  value={datosComunes.fecha_entrega_estimada}
                  onChange={handleDatosComunesChange}
                />
                {errors.fecha_entrega_estimada && (
                  <Alert color="danger">{errors.fecha_entrega_estimada}</Alert>
                )}
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col md={4}>
              <FormGroup>
                <Label for="fecha_entrega">Fecha de Entrega</Label>
                <Input
                  type="date"
                  name="fecha_entrega"
                  id="fecha_entrega"
                  value={datosComunes.fecha_entrega}
                  onChange={handleDatosComunesChange}
                />
                {errors.fecha_entrega && (
                  <Alert color="danger">{errors.fecha_entrega}</Alert>
                )}
              </FormGroup>
            </Col>
            <Col md={4}>
              <FormGroup>
                <Label for="id_tipo_entrega">Tipo de Entrega</Label>
                <Input
                  type="select"
                  name="id_tipo_entrega"
                  id="id_tipo_entrega"
                  value={datosComunes.id_tipo_entrega}
                  onChange={handleDatosComunesChange}
                >
                  <option value="">Seleccione un tipo de entrega</option>
                  <option value="1">Entrega Normal</option>
                  <option value="2">Entrega Express</option>
                </Input>
                {errors.id_tipo_entrega && (
                  <Alert color="danger">{errors.id_tipo_entrega}</Alert>
                )}
              </FormGroup>
            </Col>
            <Col md={4}>
              <FormGroup>
                <Label for="instrucciones_entrega">
                  Instrucciones de Entrega
                </Label>
                <Input
                  type="textarea"
                  name="instrucciones_entrega"
                  id="instrucciones_entrega"
                  value={datosComunes.instrucciones_entrega}
                  onChange={handleDatosComunesChange}
                />
                {errors.instrucciones_entrega && (
                  <Alert color="danger">{errors.instrucciones_entrega}</Alert>
                )}
              </FormGroup>
            </Col>
          </Row>
        </CardBody>
      </Card>

      <EditarPaquetes
        ordenId={ordenInicial.id}
        actualizarOrden={actualizarOrdenCompleta}
        tarifas={tarifas}
        selectedAddress={selectedAddress}
      />
    </Form>
  );
};

export default EditarDetallesOrden;
