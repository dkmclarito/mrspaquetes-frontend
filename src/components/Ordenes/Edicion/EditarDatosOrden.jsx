import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
} from "reactstrap";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

const EditarDatosOrden = ({ orden, actualizarOrden }) => {
  const [formData, setFormData] = useState({
    id_cliente: "",
    id_tipo_pago: "",
    concepto: "",
    tipo_documento: "",
    costo_adicional: "",
    total_pagar: "",
  });

  const tipoOrden = orden.tipo_orden === "preorden" ? "Pre-Orden" : "Orden";
  const ordenPagada = orden.estado_pago === "pagado";

  useEffect(() => {
    if (orden) {
      setFormData({
        id_cliente: orden.id_cliente || "",
        id_tipo_pago: orden.id_tipo_pago || "",
        concepto: orden.concepto || "",
        tipo_documento: orden.tipo_documento || "",
        costo_adicional: orden.costo_adicional || "",
        total_pagar: orden.total_pagar || "",
      });
    }
  }, [orden]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const dataToSend = {
        id_cliente: parseInt(formData.id_cliente),
        id_tipo_pago: parseInt(formData.id_tipo_pago),
        id_direccion: parseInt(orden.id_direccion), // Usamos el id_direccion actual de la orden
        concepto: formData.concepto,
        tipo_documento: formData.tipo_documento,
        costo_adicional: parseFloat(formData.costo_adicional),
        total_pagar: parseFloat(formData.total_pagar),
      };

      const response = await axios.put(
        `${API_URL}/ordenes/actualizar-orden/${orden.id}`,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        toast.success("Datos de la orden actualizados con éxito");
        actualizarOrden(dataToSend);
      } else {
        toast.error("Error al actualizar los datos de la orden");
      }
    } catch (error) {
      console.error("Error al actualizar los datos de la orden:", error);
      if (error.response) {
        console.error("Datos de respuesta del servidor:", error.response.data);
        console.error("Estado de la respuesta:", error.response.status);
        console.error("Cabeceras de la respuesta:", error.response.headers);

        if (error.response.data && error.response.data.errors) {
          Object.entries(error.response.data.errors).forEach(([key, value]) => {
            console.error(`Error en ${key}:`, value);
            toast.error(`Error en ${key}: ${value.join(", ")}`);
          });
        } else {
          toast.error(
            "Error al actualizar los datos de la orden: " +
              (error.response.data.message || "Error desconocido")
          );
        }
      } else if (error.request) {
        console.error("No se recibió respuesta del servidor");
        toast.error("No se pudo conectar con el servidor");
      } else {
        console.error("Error al configurar la solicitud:", error.message);
        toast.error("Error al procesar la solicitud: " + error.message);
      }
    }
  };

  const disabledInputStyle = {
    backgroundColor: "#d1d3d6", // Un gris más oscuro
    color: "black",
    cursor: "not-allowed",
    opacity: 0.8, // Añadimos un poco de opacidad para suavizar el contraste
  };

  return (
    <Card>
      <CardBody>
        <h3>Editar Datos de la {tipoOrden}</h3>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label for="id_tipo_pago">Tipo de Pago</Label>
            <Input
              type="select"
              name="id_tipo_pago"
              id="id_tipo_pago"
              value={formData.id_tipo_pago}
              onChange={handleInputChange}
              disabled={ordenPagada}
              style={ordenPagada ? disabledInputStyle : {}}
            >
              <option value="1">Efectivo</option>
              <option value="2">Tarjeta</option>
            </Input>
          </FormGroup>
          <FormGroup>
            <Label for="concepto">Concepto</Label>
            <Input
              type="text"
              name="concepto"
              id="concepto"
              value={formData.concepto}
              onChange={handleInputChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for="tipo_documento">Tipo de Documento</Label>
            <Input
              type="select"
              name="tipo_documento"
              id="tipo_documento"
              value={formData.tipo_documento}
              onChange={handleInputChange}
              disabled={ordenPagada}
              style={ordenPagada ? disabledInputStyle : {}}
            >
              <option value="consumidor_final">Consumidor Final</option>
              <option value="credito_fiscal">Crédito Fiscal</option>
            </Input>
          </FormGroup>
          <FormGroup>
            <Label for="costo_adicional">Costo Adicional</Label>
            <Input
              type="number"
              name="costo_adicional"
              id="costo_adicional"
              value={formData.costo_adicional}
              onChange={handleInputChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for="total_pagar">Total a Pagar</Label>
            <Input
              type="text"
              name="total_pagar"
              id="total_pagar"
              value={formData.total_pagar}
              readOnly
            />
          </FormGroup>
          <Button color="primary" type="submit">
            Guardar Cambios
          </Button>
        </Form>
      </CardBody>
    </Card>
  );
};

export default EditarDatosOrden;
