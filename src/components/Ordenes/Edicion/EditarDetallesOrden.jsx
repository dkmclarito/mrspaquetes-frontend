import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Row,
  Col,
  Container,
  FormFeedback,
} from "reactstrap";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

const EditarDetallesOrden = ({
  orden,
  actualizarOrden,
  onOrdenActualizada,
}) => {
  const [commonData, setCommonData] = useState({
    fecha_envio: "",
    fecha_entrega_estimada: "",
    fecha_entrega: "",
    id_tipo_entrega: "1",
    instrucciones_entrega: "",
    id_estado_paquete: "1",
  });
  const [paquetes, setPaquetes] = useState([]);
  const [tiposPaquete, setTiposPaquete] = useState([]);
  const [tiposCaja, setTiposCaja] = useState([]);
  const [tarifas, setTarifas] = useState([]);
  const [errors, setErrors] = useState({
    commonData: {},
    paquetes: [],
  });
  const [detalles, setDetalles] = useState([]);
  const [paquetesAEliminar, setPaquetesAEliminar] = useState([]);

  useEffect(() => {
    if (orden && orden.detalles) {
      const primerDetalle = orden.detalles[0];
      setCommonData({
        fecha_envio: formatDate(primerDetalle.fecha_envio),
        fecha_entrega_estimada: formatDate(primerDetalle.fecha_entrega),
        fecha_entrega: formatDate(primerDetalle.fecha_entrega_estimada),
        id_tipo_entrega: primerDetalle.id_tipo_entrega,
        instrucciones_entrega: primerDetalle.instrucciones_entrega,
        id_estado_paquete: primerDetalle.id_estado_paquete,
      });

      const paquetesFormateados = orden.detalles.map((detalle) => ({
        id: detalle.id,
        id_tipo_paquete: detalle.id_tipo_paquete,
        id_tamano_paquete: detalle.id_tamano_paquete,
        tipo_caja: detalle.tipo_caja,
        peso: detalle.peso,
        descripcion_contenido: detalle.descripcion_contenido,
        precio: detalle.precio,
      }));
      setPaquetes(paquetesFormateados);
      setDetalles(orden.detalles);
    }
    fetchTipos();
  }, [orden]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const fetchTipos = async () => {
    const token = localStorage.getItem("token");
    try {
      const [tiposPaqueteRes, tiposCajaRes, tarifasRes] = await Promise.all([
        axios.get(`${API_URL}/dropdown/get_tipo_paquete`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/dropdown/get_empaques`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/tarifa-destinos`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setTiposPaquete(tiposPaqueteRes.data.tipo_paquete || []);
      setTiposCaja(tiposCajaRes.data.empaques || []);
      setTarifas(tarifasRes.data || []);
    } catch (error) {
      console.error("Error al cargar los tipos:", error);
      toast.error("Error al cargar los datos necesarios");
    }
  };

  const validateField = (name, value) => {
    switch (name) {
      case "fecha_envio":
      case "fecha_entrega_estimada":
      case "fecha_entrega":
        return value ? "" : "Este campo es requerido";
      case "id_tipo_entrega":
      case "id_estado_paquete":
      case "id_tipo_paquete":
      case "id_tamano_paquete":
      case "tipo_caja":
        return value ? "" : "Debe seleccionar una opción";
      case "instrucciones_entrega":
      case "descripcion_contenido":
        return value.length <= 255 ? "" : "Máximo 255 caracteres";
      case "peso":
        return value > 0 ? "" : "El peso debe ser mayor a 0";
      case "precio":
        return value >= 0 ? "" : "El precio no puede ser negativo";
      default:
        return "";
    }
  };

  const handleInputChange = (index, e) => {
    const { name, value } = e.target;
    const nuevosDetalles = [...detalles];
    nuevosDetalles[index] = { ...nuevosDetalles[index], [name]: value };
    setDetalles(nuevosDetalles);
  };

  const handleCommonDataChange = (e) => {
    const { name, value } = e.target;
    setCommonData((prev) => {
      const updatedData = { ...prev, [name]: value };

      // Si se cambia la fecha de entrega estimada, actualizar también la fecha de entrega
      if (name === "fecha_entrega_estimada") {
        updatedData.fecha_entrega = value;
      }

      return updatedData;
    });

    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      commonData: { ...prev.commonData, [name]: error },
    }));
  };

  const handlePaqueteChange = (index, e) => {
    const { name, value } = e.target;
    const updatedPaquetes = [...paquetes];
    updatedPaquetes[index] = { ...updatedPaquetes[index], [name]: value };

    if (name === "id_tamano_paquete") {
      updatedPaquetes[index].precio = calculatePrice(value);
    }

    setPaquetes(updatedPaquetes);

    const error = validateField(name, value);
    setErrors((prev) => {
      const newPaquetesErrors = [...prev.paquetes];
      newPaquetesErrors[index] = { ...newPaquetesErrors[index], [name]: error };
      return { ...prev, paquetes: newPaquetesErrors };
    });
  };

  const calculatePrice = (tamanoPaquete) => {
    const tarifa = tarifas.find(
      (t) => t.tamano_paquete === getTamanoPaqueteString(tamanoPaquete)
    );
    return tarifa ? tarifa.monto : 0;
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

  const getEstadoPaqueteNombre = (id) => {
    const estados = {
      1: "En Recepción",
      2: "En Bodega",
      3: "En Espera de Recolección",
      4: "En Tránsito",
      5: "En Ruta de Entrega",
      6: "Reprogramado",
      7: "Recibido en Destino",
      8: "Entregado",
      9: "En Proceso de Retorno",
      10: "Devuelto",
      11: "Dañado",
      12: "Perdido",
      13: "Cancelado",
      14: "En espera de reubicación",
    };
    return estados[id] || "Desconocido";
  };

  const agregarPaquete = () => {
    setPaquetes([
      ...paquetes,
      {
        id_tipo_paquete: "",
        id_tamano_paquete: "",
        tipo_caja: "",
        peso: "",
        descripcion_contenido: "",
        precio: "",
      },
    ]);
    setErrors((prev) => ({
      ...prev,
      paquetes: [...prev.paquetes, {}],
    }));
  };

  const removerPaquete = (index) => {
    const paqueteARemover = paquetes[index];
    if (paqueteARemover.id) {
      setPaquetesAEliminar([...paquetesAEliminar, paqueteARemover.id]);
    }
    setPaquetes(paquetes.filter((_, idx) => idx !== index));
    setErrors((prev) => ({
      ...prev,
      paquetes: prev.paquetes.filter((_, idx) => idx !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    let hasErrors = false;
    let newErrors = {
      commonData: {},
      paquetes: paquetes.map(() => ({})),
    };

    // Validar que haya al menos un paquete
    if (paquetes.length === 0) {
      toast.error("Debe haber al menos un paquete en la orden.");
      return;
    }

    // Validar commonData
    Object.keys(commonData).forEach((key) => {
      const error = validateField(key, commonData[key]);
      if (error) {
        newErrors.commonData[key] = error;
        hasErrors = true;
      }
    });

    // Validar paquetes
    paquetes.forEach((paquete, index) => {
      Object.keys(paquete).forEach((key) => {
        const error = validateField(key, paquete[key]);
        if (error) {
          newErrors.paquetes[index][key] = error;
          hasErrors = true;
        }
      });
    });

    setErrors(newErrors);

    if (hasErrors) {
      toast.error("Por favor, corrija los errores antes de enviar.");
      return;
    }

    try {
      for (const idPaquete of paquetesAEliminar) {
        try {
          const response = await axios.delete(
            `${API_URL}/detalle-orden/${idPaquete}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (response.status === 200) {
            toast.success(`Paquete ${idPaquete} eliminado correctamente`);
          }
        } catch (error) {
          console.error(`Error al eliminar el paquete ${idPaquete}:`, error);
          if (error.response) {
            switch (error.response.status) {
              case 409:
                toast.error(
                  `No se puede eliminar el paquete ${idPaquete}. La orden puede estar completada o en un estado que no permite eliminación.`
                );
                break;
              case 404:
                toast.error(`Paquete ${idPaquete} no encontrado.`);
                break;
              default:
                toast.error(
                  `Error al eliminar el paquete ${idPaquete}: ${error.response.data.mensaje || "Error desconocido"}`
                );
            }
          } else {
            toast.error(
              `Error de red al intentar eliminar el paquete ${idPaquete}`
            );
          }
          hasErrors = true;
        }
      }

      const updatedPaquetes = [...paquetes];

      for (let i = 0; i < paquetes.length; i++) {
        const paquete = paquetes[i];
        try {
          if (paquete.id) {
            const updatedPaquete = await actualizarDetalle(paquete, token);
            updatedPaquetes[i] = { ...paquete, ...updatedPaquete };
          } else {
            const newPaquete = await crearNuevoDetalle(paquete, token);
            updatedPaquetes[i] = { ...paquete, ...newPaquete };
          }
        } catch (error) {
          console.error(
            `Error procesando paquete ${paquete.id || "nuevo"}:`,
            error
          );
          hasErrors = true;
          if (
            error.response &&
            error.response.data &&
            error.response.data.errors
          ) {
            setErrors((prevErrors) => ({
              ...prevErrors,
              [paquete.id || `new_${i}`]: error.response.data.errors,
            }));
          }
        }
      }

      if (!hasErrors) {
        const nuevoTotalPagar = updatedPaquetes.reduce(
          (sum, paquete) => sum + parseFloat(paquete.precio || 0),
          0
        );

        const ordenActualizada = {
          id_cliente: orden.id_cliente,
          id_tipo_pago: orden.id_tipo_pago,
          id_direccion: orden.id_direccion,
          direccion_recoleccion: orden.direccion_recoleccion,
          total_pagar: nuevoTotalPagar,
          costo_adicional: orden.costo_adicional,
          concepto: orden.concepto,
          tipo_documento: orden.tipo_documento,
        };

        await axios.put(
          `${API_URL}/ordenes/actualizar-orden/${orden.id}`,
          ordenActualizada,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast.success("Detalles de la orden actualizados con éxito");
        actualizarOrden({
          ...orden,
          detalles: updatedPaquetes,
          total_pagar: nuevoTotalPagar,
        });

        // Llamar a la función de actualización proporcionada por el componente padre
        if (onOrdenActualizada) {
          onOrdenActualizada();
        }
      } else {
        toast.warn(
          "Se guardaron algunos cambios, pero hubo errores. Por favor, revise los detalles y vuelva a intentar."
        );
      }
    } catch (error) {
      console.error("Error general al procesar la orden:", error);
      toast.error(
        "Ocurrió un error al procesar la orden. Por favor, inténtelo de nuevo."
      );
    }
  };

  const actualizarDetalle = async (paquete, token) => {
    const detalleActualizado = {
      id_tipo_entrega: parseInt(commonData.id_tipo_entrega),
      id_estado_paquetes: parseInt(commonData.id_estado_paquete),
      id_direccion_entrega: orden.id_direccion,
      instrucciones_entrega: commonData.instrucciones_entrega,
      descripcion: paquete.descripcion_contenido,
      precio: parseFloat(paquete.precio),
      fecha_ingreso: commonData.fecha_envio,
      fecha_entrega: commonData.fecha_entrega,
      fecha_envio: commonData.fecha_envio,
      fecha_entrega_estimada: commonData.fecha_entrega_estimada,
    };

    try {
      const response = await axios.put(
        `${API_URL}/ordenes/actualizar-detalle-orden/${paquete.id}`,
        detalleActualizado,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 422) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [paquete.id]: error.response.data.errors,
        }));
        toast.error(`Error de validación en paquete ${paquete.id}`);
      }
      throw error;
    }
  };

  const crearNuevoDetalle = async (paquete, token) => {
    const descripcion = paquete.descripcion_contenido || "Sin descripción";

    const nuevoDetalle = {
      id_tipo_paquete: parseInt(paquete.id_tipo_paquete) || 1,
      id_tamano_paquete: parseInt(paquete.id_tamano_paquete) || 1,
      id_empaque: parseInt(paquete.tipo_caja) || 1,
      peso: parseFloat(paquete.peso) || 0,
      id_estado_paquete: parseInt(commonData.id_estado_paquete) || 1,
      fecha_envio:
        commonData.fecha_envio || new Date().toISOString().split("T")[0],
      fecha_entrega_estimada:
        commonData.fecha_entrega_estimada ||
        new Date().toISOString().split("T")[0],
      descripcion_contenido: descripcion,
      id_tipo_entrega: parseInt(commonData.id_tipo_entrega) || 1,
      instrucciones_entrega: commonData.instrucciones_entrega || "",
      descripcion: descripcion,
      precio: parseFloat(paquete.precio) || 0,
      fecha_entrega:
        commonData.fecha_entrega || new Date().toISOString().split("T")[0],
      id_direccion: parseInt(orden.id_direccion) || 1,
    };

    try {
      const response = await axios.post(
        `${API_URL}/ordenes/crear-detalle-orden/${orden.id}/${orden.numero_seguimiento}`,
        nuevoDetalle,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error("Error completo al crear detalle:", error);
      if (error.response) {
        console.error(
          "Datos de la respuesta del servidor:",
          error.response.data
        );
        if (error.response.status === 422) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            new: error.response.data.errors,
          }));
          toast.error("Error de validación en nuevo paquete");
        }
      }
      throw error;
    }
  };

  const tipoOrden = orden.tipo_orden === "preorden" ? "Pre-Orden" : "Orden";
  const today = new Date().toISOString().split("T")[0];

  return (
    <Container fluid>
      <Card>
        <CardHeader>
          <h3>Editar Detalles de la {tipoOrden}</h3>
        </CardHeader>
        <CardBody>
          <Form onSubmit={handleSubmit}>
            <Card className="mb-4">
              <CardBody>
                <h5 className="mb-3">Datos Comunes para todos los Paquetes</h5>
                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="fecha_envio">Fecha de Recepción</Label>
                      <Input
                        type="date"
                        name="fecha_envio"
                        id="fecha_envio"
                        value={commonData.fecha_envio}
                        readOnly
                        className="dark-mode-input-date"
                      />
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="fecha_entrega_estimada">
                        Fecha de Entrega Estimada
                      </Label>
                      <Input
                        type="date"
                        name="fecha_entrega_estimada"
                        id="fecha_entrega_estimada"
                        value={commonData.fecha_entrega_estimada}
                        onChange={handleCommonDataChange}
                        invalid={!!errors.commonData.fecha_entrega_estimada}
                        className="dark-mode-input-date"
                      />
                      <FormFeedback>
                        {errors.commonData.fecha_entrega_estimada}
                      </FormFeedback>
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="id_tipo_entrega">Tipo de Entrega</Label>
                      <Input
                        type="select"
                        name="id_tipo_entrega"
                        id="id_tipo_entrega"
                        value={commonData.id_tipo_entrega}
                        onChange={handleCommonDataChange}
                        invalid={!!errors.commonData.id_tipo_entrega}
                        disabled
                      >
                        <option value="1">Normal</option>
                        <option value="2">Urgente</option>
                      </Input>
                      <FormFeedback>
                        {errors.commonData.id_tipo_entrega}
                      </FormFeedback>
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="instrucciones_entrega">
                        Instrucciones de Entrega
                      </Label>
                      <Input
                        type="textarea"
                        name="instrucciones_entrega"
                        id="instrucciones_entrega"
                        value={commonData.instrucciones_entrega}
                        onChange={handleCommonDataChange}
                        invalid={!!errors.commonData.instrucciones_entrega}
                      />
                      <FormFeedback>
                        {errors.commonData.instrucciones_entrega}
                      </FormFeedback>
                    </FormGroup>
                  </Col>
                </Row>
              </CardBody>
            </Card>

            {paquetes.map((paquete, index) => (
              <Card key={index} className="mb-4">
                <CardBody>
                  <h5 className="mb-3">Paquete {index + 1}</h5>
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
                          value={paquete.id_tipo_paquete}
                          onChange={(e) => handlePaqueteChange(index, e)}
                          invalid={!!errors.paquetes[index]?.id_tipo_paquete}
                        >
                          <option value="">Seleccione un tipo</option>
                          {tiposPaquete.map((tipo) => (
                            <option key={tipo.id} value={tipo.id}>
                              {tipo.nombre}
                            </option>
                          ))}
                        </Input>
                        <FormFeedback>
                          {errors.paquetes[index]?.id_tipo_paquete}
                        </FormFeedback>
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup>
                        <Label for={`id_tamano_paquete_${index}`}>
                          Tamaño del Paquete
                        </Label>
                        <Input
                          type="select"
                          name="id_tamano_paquete"
                          id={`id_tamano_paquete_${index}`}
                          value={paquete.id_tamano_paquete}
                          onChange={(e) => handlePaqueteChange(index, e)}
                          invalid={!!errors.paquetes[index]?.id_tamano_paquete}
                        >
                          <option value="">Seleccione un tamaño</option>
                          <option value="1">Pequeño</option>
                          <option value="2">Mediano</option>
                          <option value="3">Grande</option>
                        </Input>
                        <FormFeedback>
                          {errors.paquetes[index]?.id_tamano_paquete}
                        </FormFeedback>
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup>
                        <Label for={`tipo_caja_${index}`}>Tipo de Caja</Label>
                        <Input
                          type="select"
                          name="tipo_caja"
                          id={`tipo_caja_${index}`}
                          value={paquete.tipo_caja || ""}
                          onChange={(e) => handlePaqueteChange(index, e)}
                          invalid={!!errors.paquetes[index]?.tipo_caja}
                        >
                          <option value="">Seleccione un tipo</option>
                          {tiposCaja.map((caja) => (
                            <option key={caja.id} value={caja.id}>
                              {caja.empaquetado}
                            </option>
                          ))}
                        </Input>
                        <FormFeedback>
                          {errors.paquetes[index]?.tipo_caja}
                        </FormFeedback>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={4}>
                      <FormGroup>
                        <Label for={`peso_${index}`}>Peso (kg)</Label>
                        <Input
                          type="number"
                          name="peso"
                          id={`peso_${index}`}
                          value={paquete.peso}
                          onChange={(e) => handlePaqueteChange(index, e)}
                          invalid={!!errors.paquetes[index]?.peso}
                        />
                        <FormFeedback>
                          {errors.paquetes[index]?.peso}
                        </FormFeedback>
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup>
                        <Label for={`descripcion_contenido_${index}`}>
                          Descripción del Contenido
                        </Label>
                        <Input
                          type="textarea"
                          name="descripcion_contenido"
                          id={`descripcion_contenido_${index}`}
                          value={paquete.descripcion_contenido}
                          onChange={(e) => handlePaqueteChange(index, e)}
                          invalid={
                            !!errors.paquetes[index]?.descripcion_contenido
                          }
                        />
                        <FormFeedback>
                          {errors.paquetes[index]?.descripcion_contenido}
                        </FormFeedback>
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup>
                        <Label for={`precio_${index}`}>Precio</Label>
                        <Input
                          type="number"
                          name="precio"
                          id={`precio_${index}`}
                          value={paquete.precio}
                          readOnly
                          invalid={!!errors.paquetes[index]?.precio}
                        />
                        <FormFeedback>
                          {errors.paquetes[index]?.precio}
                        </FormFeedback>
                      </FormGroup>
                    </Col>
                  </Row>
                  {index > 0 && (
                    <Button
                      color="danger"
                      onClick={() => removerPaquete(index)}
                    >
                      Eliminar Paquete
                    </Button>
                  )}
                </CardBody>
              </Card>
            ))}
            <Row className="mb-3">
              <Col>
                <Button color="primary" onClick={agregarPaquete}>
                  Agregar Paquete
                </Button>
              </Col>
            </Row>
            <Row>
              <Col>
                <Button color="success" type="submit">
                  Guardar Cambios
                </Button>
              </Col>
            </Row>
          </Form>
        </CardBody>
      </Card>
    </Container>
  );
};

export default EditarDetallesOrden;
