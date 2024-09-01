import React, { useState, useEffect } from "react";
import {
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Alert,
  Card,
  CardBody,
  Row,
  Col,
} from "reactstrap";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

const EditarDetallesOrden = ({ orden, actualizarOrden }) => {
  const [errors, setErrors] = useState({});
  const [tiposPaquete, setTiposPaquete] = useState([]);
  const [empaques, setEmpaques] = useState([]);
  const [estadosPaquete, setEstadosPaquete] = useState([]);
  const [detalles, setDetalles] = useState(orden.detalles || []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [tiposRes, empaquesRes, estadosRes] = await Promise.all([
          axios.get(`${API_URL}/dropdown/get_tipo_paquete`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/dropdown/get_empaques`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/dropdown/get_estado_paquete`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setTiposPaquete(tiposRes.data.tipo_paquete || []);
        setEmpaques(empaquesRes.data.empaques || []);
        setEstadosPaquete(estadosRes.data.estado_paquetes || []);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        toast.error("Error al cargar datos del paquete");
      }
    };

    fetchData();
  }, []);

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "peso":
      case "precio":
        if (isNaN(value) || value <= 0) {
          error = "Debe ser un número positivo";
        }
        break;
      case "descripcion_contenido":
      case "instrucciones_entrega":
        if (value.trim().length === 0) {
          error = "Este campo no puede estar vacío";
        }
        break;
      case "fecha_envio":
      case "fecha_entrega_estimada":
        if (!value) {
          error = "Debe seleccionar una fecha";
        }
        break;
    }
    return error;
  };

  const handleDetalleChange = (index, e) => {
    const { name, value } = e.target;
    const nuevosDetalles = [...detalles];
    nuevosDetalles[index] = { ...nuevosDetalles[index], [name]: value };
    setDetalles(nuevosDetalles);

    const error = validateField(name, value);
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (!newErrors[index]) newErrors[index] = {};
      newErrors[index][name] = error;
      return newErrors;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let hasErrors = false;

    detalles.forEach((detalle, index) => {
      Object.keys(detalle).forEach((key) => {
        const error = validateField(key, detalle[key]);
        if (error) {
          setErrors((prev) => ({
            ...prev,
            [index]: { ...prev[index], [key]: error },
          }));
          hasErrors = true;
        }
      });
    });

    if (hasErrors) {
      toast.error("Por favor, corrija los errores antes de guardar.");
      return;
    }

    actualizarOrden({ ...orden, detalles });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <h3>Editar Detalles de la Orden</h3>
      {detalles.map((detalle, index) => (
        <Card key={index} className="mb-3">
          <CardBody>
            <h5>Paquete {index + 1}</h5>
            <Row>
              <Col md={4}>
                <FormGroup>
                  <Label for={`id_tipo_paquete_${index}`}>
                    Tipo de Paquete
                  </Label>
                  <Input
                    type="select"
                    name="id_tipo_paquete"
                    id={`id_tipo_paquete_${index}`}
                    value={detalle.id_tipo_paquete}
                    onChange={(e) => handleDetalleChange(index, e)}
                  >
                    <option value="">Seleccione un tipo</option>
                    {tiposPaquete.map((tipo) => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.nombre}
                      </option>
                    ))}
                  </Input>
                  {errors[index]?.id_tipo_paquete && (
                    <Alert color="danger">
                      {errors[index].id_tipo_paquete}
                    </Alert>
                  )}
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label for={`id_empaque_${index}`}>Empaque</Label>
                  <Input
                    type="select"
                    name="id_empaque"
                    id={`id_empaque_${index}`}
                    value={detalle.id_empaque}
                    onChange={(e) => handleDetalleChange(index, e)}
                  >
                    <option value="">Seleccione un empaque</option>
                    {empaques.map((empaque) => (
                      <option key={empaque.id} value={empaque.id}>
                        {empaque.empaquetado}
                      </option>
                    ))}
                  </Input>
                  {errors[index]?.id_empaque && (
                    <Alert color="danger">{errors[index].id_empaque}</Alert>
                  )}
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label for={`peso_${index}`}>Peso</Label>
                  <Input
                    type="number"
                    name="peso"
                    id={`peso_${index}`}
                    value={detalle.peso}
                    onChange={(e) => handleDetalleChange(index, e)}
                  />
                  {errors[index]?.peso && (
                    <Alert color="danger">{errors[index].peso}</Alert>
                  )}
                </FormGroup>
              </Col>
            </Row>
            {/* Agregar más campos según sea necesario */}
          </CardBody>
        </Card>
      ))}
      <Button color="primary" type="submit">
        Guardar Cambios
      </Button>
    </Form>
  );
};

export default EditarDetallesOrden;
