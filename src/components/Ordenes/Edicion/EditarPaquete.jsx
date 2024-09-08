import React, { useState, useEffect } from "react";
import { FormGroup, Label, Input, FormFeedback, Row, Col } from "reactstrap";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const EditarPaquete = ({
  paquete,
  actualizarPaquete,
  tarifas,
  selectedAddress,
  index,
}) => {
  const [tiposPaquete, setTiposPaquete] = useState([]);
  const [tiposCaja, setTiposCaja] = useState([]);
  const [errors, setErrors] = useState({});
  const [paqueteLocal, setPaqueteLocal] = useState({
    id_tipo_paquete: "",
    tipo_caja: "",
    peso: "",
    id_tamano_paquete: "",
    descripcion_contenido: "",
    precio: "",
    ...paquete,
  });

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [tiposPaqueteRes, tiposCajaRes] = await Promise.all([
          axios.get(`${API_URL}/dropdown/get_tipo_paquete`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/dropdown/get_empaques`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setTiposPaquete(tiposPaqueteRes.data.tipo_paquete || []);
        setTiposCaja(tiposCajaRes.data.empaques || []);
      } catch (error) {
        console.error("Error al obtener los datos del dropdown:", error);
      }
    };

    fetchDropdownData();
  }, []);

  useEffect(() => {
    setPaqueteLocal((prevState) => ({
      ...prevState,
      ...paquete,
      id_tipo_paquete: paquete.id_tipo_paquete || "",
      tipo_caja: paquete.tipo_caja || "",
    }));
  }, [paquete]);

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "peso":
        const pesoPattern = /^\d{1,6}(,\d{3})*(\.\d{0,2})?$/;
        if (!pesoPattern.test(value)) {
          error = "Formato de peso inválido.";
        }
        break;
      case "id_tipo_paquete":
      case "tipo_caja":
      case "id_tamano_paquete":
        if (!value) {
          error = "Debe seleccionar una opción.";
        }
        break;
      case "descripcion_contenido":
        if (!value.trim()) {
          error = "Debe rellenar este campo.";
        }
        break;
      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedPaquete = { ...paqueteLocal, [name]: value };

    if (name === "id_tamano_paquete") {
      updatedPaquete.precio = calculatePrice(value);
    }

    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));

    setPaqueteLocal(updatedPaquete);
    actualizarPaquete(index, updatedPaquete);
  };

  const handlePesoChange = (e) => {
    const { value } = e.target;
    const validChars = value.replace(/[^0-9.,]/g, "");
    let [integerPart, decimalPart] = validChars.split(".");

    integerPart = integerPart.slice(0, 7);

    if (decimalPart) {
      decimalPart = decimalPart.slice(0, 2);
    }

    const formattedPeso = formatPeso(
      integerPart + (decimalPart !== undefined ? "." + decimalPart : "")
    );

    handleChange({ target: { name: "peso", value: formattedPeso } });
  };

  const formatPeso = (value) => {
    let [integerPart, decimalPart] = value.replace(/,/g, "").split(".");

    if (integerPart.length > 3) {
      integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    return decimalPart !== undefined
      ? `${integerPart}.${decimalPart}`
      : integerPart;
  };

  const calculatePrice = (tamanoPaquete) => {
    if (!selectedAddress || !tamanoPaquete) return "";

    const isSanMiguelUrban =
      selectedAddress.id_departamento === 12 &&
      selectedAddress.id_municipio === 215;
    let tarifaType = isSanMiguelUrban ? "tarifa urbana" : "tarifa rural";

    const tarifa = tarifas.find(
      (t) =>
        t.tamano_paquete === getTamanoPaqueteString(tamanoPaquete) &&
        t.departamento === selectedAddress.departamento_nombre &&
        t.municipio === selectedAddress.municipio_nombre &&
        t.tarifa === tarifaType
    );

    if (!tarifa) {
      const generalTarifa = tarifas.find(
        (t) =>
          t.tamano_paquete === getTamanoPaqueteString(tamanoPaquete) &&
          t.departamento === selectedAddress.departamento_nombre &&
          t.tarifa === tarifaType
      );

      return generalTarifa ? generalTarifa.monto : "";
    }

    return tarifa.monto;
  };

  const getTamanoPaqueteString = (tamanoPaquete) => {
    switch (tamanoPaquete) {
      case "1":
        return "pequeno";
      case "2":
        return "mediano";
      case "3":
        return "grande";
      default:
        return "";
    }
  };

  return (
    <div>
      <Row>
        <Col md={6}>
          <FormGroup>
            <Label for="id_tipo_paquete">Tipo de Paquete</Label>
            <Input
              type="select"
              name="id_tipo_paquete"
              id="id_tipo_paquete"
              value={paqueteLocal.id_tipo_paquete}
              onChange={handleChange}
              invalid={!!errors.id_tipo_paquete}
            >
              <option value="">Seleccione</option>
              {tiposPaquete.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nombre}
                </option>
              ))}
            </Input>
            <FormFeedback>{errors.id_tipo_paquete}</FormFeedback>
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup>
            <Label for="tipo_caja">Tipo de Caja</Label>
            <Input
              type="select"
              name="tipo_caja"
              id="tipo_caja"
              value={paqueteLocal.tipo_caja}
              onChange={handleChange}
              invalid={!!errors.tipo_caja}
            >
              <option value="">Seleccione</option>
              {tiposCaja.map((caja) => (
                <option key={caja.id} value={caja.id}>
                  {caja.empaquetado}
                </option>
              ))}
            </Input>
            <FormFeedback>{errors.tipo_caja}</FormFeedback>
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <FormGroup>
            <Label for="peso">Peso (Libras)</Label>
            <Input
              type="text"
              name="peso"
              id="peso"
              value={paqueteLocal.peso}
              onChange={handlePesoChange}
              invalid={!!errors.peso}
            />
            <FormFeedback>{errors.peso}</FormFeedback>
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup>
            <Label for="id_tamano_paquete">Tamaño del Paquete</Label>
            <Input
              type="select"
              name="id_tamano_paquete"
              id="id_tamano_paquete"
              value={paqueteLocal.id_tamano_paquete}
              onChange={handleChange}
              invalid={!!errors.id_tamano_paquete}
            >
              <option value="">Seleccione</option>
              <option value="1">Pequeño</option>
              <option value="2">Mediano</option>
              <option value="3">Grande</option>
            </Input>
            <FormFeedback>{errors.id_tamano_paquete}</FormFeedback>
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col md={9}>
          <FormGroup>
            <Label for="descripcion_contenido">Descripción del Contenido</Label>
            <Input
              type="textarea"
              name="descripcion_contenido"
              id="descripcion_contenido"
              value={paqueteLocal.descripcion_contenido}
              onChange={handleChange}
              invalid={!!errors.descripcion_contenido}
            />
            <FormFeedback>{errors.descripcion_contenido}</FormFeedback>
          </FormGroup>
        </Col>
        <Col md={3}>
          <FormGroup>
            <Label for="precio">Precio</Label>
            <Input
              type="text"
              name="precio"
              id="precio"
              value={paqueteLocal.precio}
              readOnly
            />
          </FormGroup>
        </Col>
      </Row>
    </div>
  );
};

export default EditarPaquete;
