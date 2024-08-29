import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Container,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  FormFeedback,
  Row,
  Col,
  CardHeader
} from "reactstrap";
import Breadcrumbs from "../components/Paquetes/Common/Breadcrumbs";
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import "../styles/Paquetes.css";

const AgregarOrden = () => {
  const [clientes, setClientes] = useState([]);
  const [direcciones, setDirecciones] = useState([]);
  const [tiposPaquete, setTiposPaquete] = useState([]);
  const [empaques, setEmpaques] = useState([]);
  const [estadosPaquete, setEstadosPaquete] = useState([]);
  const [orden, setOrden] = useState({
    id_cliente: '',
    nombre_contacto: '',
    telefono: '',
    id_direccion: '',
    id_tipo_pago: '1',
    total_pagar: '',
    costo_adicional: '',
    concepto: '',
  });
  const [detalles, setDetalles] = useState([{
    id_tipo_paquete: '',
    id_empaque: '',
    peso: '',
    id_estado_paquete: '',
    fecha_envio: '',
    fecha_entrega_estimada: '',
    fecha_entrega: '',
    descripcion_contenido: '',
    id_tipo_entrega: '',
    id_cliente_entrega: '',
    nombre_contacto: '',
    telefono: '',
    id_direccion: '',
    instrucciones_entrega: '',
    descripcion: '',
    precio: '',
  }]);
  const [errors, setErrors] = useState({
    id_cliente: '',
    nombre_contacto: '',
    telefono: '',
    id_direccion: '',
    id_tipo_pago: '',
    total_pagar: '',
    costo_adicional: '',
    concepto: '',
    detalles: []
  });

  const token = localStorage.getItem('token');
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [clientesRes, tiposPaqueteRes, empaquesRes, estadosPaqueteRes] = await Promise.all([
          fetch(`${API_URL}/dropdown/get_clientes`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/dropdown/get_tipo_paquete`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/dropdown/get_empaques`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/dropdown/get_estado_paquete`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (!clientesRes.ok || !tiposPaqueteRes.ok || !empaquesRes.ok || !estadosPaqueteRes.ok) {
          throw new Error('Error en la respuesta del servidor');
        }

        const clientesData = await clientesRes.json();
        const tiposPaqueteData = await tiposPaqueteRes.json();
        const empaquesData = await empaquesRes.json();
        const estadosPaqueteData = await estadosPaqueteRes.json();

        setClientes(clientesData.clientes || []);
        setTiposPaquete(tiposPaqueteData.tipo_paquete || []);
        setEmpaques(empaquesData.empaques || []);
        setEstadosPaquete(estadosPaqueteData.estado_paquetes || []);

      } catch (error) {
        console.error("Error al obtener los datos del dropdown:", error);
        toast.error('Error al obtener los datos del dropdown');
      }
    };

    fetchDropdownData();
  }, [token, API_URL]);

  useEffect(() => {
    const fetchDirecciones = async () => {
      if (orden.id_cliente) {
        try {
          const response = await fetch(`${API_URL}/dropdown/get_direcciones/${orden.id_cliente}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            setDirecciones(data);
          } else {
            toast.error("Error al cargar direcciones");
          }
        } catch (error) {
          toast.error(`Error: ${error.message}`);
        }
      } else {
        setDirecciones([]); // Clear addresses when no client is selected
      }
    };

    fetchDirecciones();
  }, [orden.id_cliente, token]);


  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'telefono':
        const phonePattern = /^[0-9]{8}$/;
        if (!phonePattern.test(value)) {
          error = 'Número de teléfono inválido.';
        }
        break;

      case 'total_pagar':
      case 'costo_adicional':
      case 'peso':
      case 'precio':
        if (isNaN(value) || value < 0) {
          error = 'El valor debe ser un número positivo.';
        }
        break;

      case 'id_cliente':
      case 'id_direccion':
      case 'id_tipo_paquete':
      case 'id_empaque':
      case 'id_estado_paquete':
      case 'id_tipo_entrega':
      case 'id_cliente_entrega':
        if (!value) {
          error = 'Debe seleccionar una opción.';
        }
        break;

      case 'concepto':
      case 'descripcion_contenido':
      case 'instrucciones_entrega':
      case 'descripcion':
        if (!value.trim()) {
          error = 'Debe rellenar este campo.';
        }
        break;

      case 'fecha_envio':
      case 'fecha_entrega_estimada':
      case 'fecha_entrega':
        if (!value) {
          error = 'Debe seleccionar una fecha.';
        }
        break;

      default:
        break;
    }

    return error;
  };

  const handleChangeOrden = (e) => {
    const { name, value } = e.target;
    setOrden(prev => ({
      ...prev,
      [name]: value
    }));
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleChangeDetalle = (index, e) => {
    const { name, value } = e.target;
    const updatedDetalles = [...detalles];
    updatedDetalles[index] = { ...updatedDetalles[index], [name]: value };
    setDetalles(updatedDetalles);
    
    const error = validateField(name, value);
    setErrors(prev => {
      const newDetallesErrors = [...(prev.detalles || [])];
      newDetallesErrors[index] = { ...newDetallesErrors[index], [name]: error };
      return { ...prev, detalles: newDetallesErrors };
    });
  };

  const agregarDetalle = () => {
    setDetalles([...detalles, {
      id_tipo_paquete: '',
      id_empaque: '',
      peso: '',
      id_estado_paquete: '',
      fecha_envio: '',
      fecha_entrega_estimada: '',
      fecha_entrega: '',
      descripcion_contenido: '',
      id_tipo_entrega: '',
      id_cliente_entrega: '',
      nombre_contacto: '',
      telefono: '',
      id_direccion: '',
      instrucciones_entrega: '',
      descripcion: '',
      precio: '',
    }]);
    setErrors(prev => ({
      ...prev,
      detalles: [...prev.detalles, {}]
    }));
  };

  const removerDetalle = (index) => {
    setDetalles(detalles.filter((_, idx) => idx !== index));
    setErrors(prev => ({
      ...prev,
      detalles: prev.detalles.filter((_, idx) => idx !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    let valid = true;
    let errorsTemp = { ...errors };
  
    // Validate orden fields
    Object.keys(orden).forEach(key => {
      const error = validateField(key, orden[key]);
      if (error) {
        errorsTemp[key] = error;
        valid = false;
      } else {
        errorsTemp[key] = '';
      }
    });
  
    // Validate detalles fields
    errorsTemp.detalles = detalles.map(detalle => {
      const detalleErrors = {};
      Object.keys(detalle).forEach(key => {
        const error = validateField(key, detalle[key]);
        if (error) {
          detalleErrors[key] = error;
          valid = false;
        } else {
          detalleErrors[key] = '';
        }
      });
      return detalleErrors;
    });
  
    setErrors(errorsTemp);
  
    if (!valid) {
      toast.error("Por favor, corrija los errores en el formulario antes de enviar.", {
        position: "bottom-right",
        autoClose: 1000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });
      return;
    }
  
    // Prepare the data to be sent
    const ordenData = {
      ...orden,
      detalles: detalles
    };
  
    console.log("Datos a enviar:", ordenData);
  
    try {
      const response = await fetch(`${API_URL}/ordenes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(ordenData),
      });
  
      if (response.ok) {
        toast.success("Orden agregada con éxito.");
        navigate('/GestionPaquetes');
      } else {
        const errorData = await response.json();
        console.log("Error en la respuesta:", errorData);
        throw new Error(errorData.message || 'Error al agregar la orden');
      }
    } catch (error) {
      toast.error(`Error al agregar la orden: ${error.message}`);
      console.error("Detalles del error:", error);
    }
  };
  return (
    <>
      <ToastContainer />
      <Container fluid>
        <Breadcrumbs
          title="Ingresar nueva orden"
          breadcrumbItems={[
            { title: "Ordenes", link: "/ordenes" },
            { title: "Agregar Orden" }
          ]}
        />
        <Card>
          <CardHeader>
            <h4>Agregar Orden</h4>
          </CardHeader>
          <CardBody>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="id_cliente">Cliente</Label>
                    <Input
                      type="select"
                      name="id_cliente"
                      id="id_cliente"
                      value={orden.id_cliente}
                      onChange={handleChangeOrden}
                      invalid={!!errors.id_cliente}
                    >
                      <option value="">Seleccione un cliente</option>
                      {clientes.map(cliente => (
                        <option key={cliente.id} value={cliente.id}>
                          {cliente.nombre}
                        </option>
                      ))}
                    </Input>
                    {errors.id_cliente && <FormFeedback>{errors.id_cliente}</FormFeedback>}
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="nombre_contacto">Nombre de Contacto</Label>
                    <Input
                      type="text"
                      name="nombre_contacto"
                      id="nombre_contacto"
                      value={orden.nombre_contacto}
                      onChange={handleChangeOrden}
                      invalid={!!errors.nombre_contacto}
                    />
                    {errors.nombre_contacto && <FormFeedback>{errors.nombre_contacto}</FormFeedback>}
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="telefono">Teléfono</Label>
                    <Input
                      type="text"
                      name="telefono"
                      id="telefono"
                      value={orden.telefono}
                      onChange={handleChangeOrden}
                      invalid={!!errors.telefono}
                    />
                    {errors.telefono && <FormFeedback>{errors.telefono}</FormFeedback>}
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="id_direccion">Dirección</Label>
                    <Input
                      type="select"
                      name="id_direccion"
                      id="id_direccion"
                      value={orden.id_direccion}
                      onChange={handleChangeOrden}
                      invalid={!!errors.id_direccion}
                    >
                      <option value="">Seleccione una dirección</option>
                      {direcciones.map(direccion => (
                        <option key={direccion.id} value={direccion.id}>
                          {direccion.direccion}
                        </option>
                      ))}
                    </Input>
                    {errors.id_direccion && <FormFeedback>{errors.id_direccion}</FormFeedback>}
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
                      value={orden.id_tipo_pago}
                      onChange={handleChangeOrden}
                      invalid={!!errors.id_tipo_pago}
                    >
                      <option value="1">Efectivo</option>
                      <option value="2">Tarjeta</option>
                      {/* Agrega más tipos de pago si es necesario */}
                    </Input>
                    {errors.id_tipo_pago && <FormFeedback>{errors.id_tipo_pago}</FormFeedback>}
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="total_pagar">Total a Pagar</Label>
                    <Input
                      type="number"
                      name="total_pagar"
                      id="total_pagar"
                      value={orden.total_pagar}
                      onChange={handleChangeOrden}
                      invalid={!!errors.total_pagar}
                    />
                    {errors.total_pagar && <FormFeedback>{errors.total_pagar}</FormFeedback>}
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="costo_adicional">Costo Adicional</Label>
                    <Input
                      type="number"
                      name="costo_adicional"
                      id="costo_adicional"
                      value={orden.costo_adicional}
                      onChange={handleChangeOrden}
                      invalid={!!errors.costo_adicional}
                    />
                    {errors.costo_adicional && <FormFeedback>{errors.costo_adicional}</FormFeedback>}
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="concepto">Concepto</Label>
                    <Input
                      type="text"
                      name="concepto"
                      id="concepto"
                      value={orden.concepto}
                      onChange={handleChangeOrden}
                      invalid={!!errors.concepto}
                    />
                    {errors.concepto && <FormFeedback>{errors.concepto}</FormFeedback>}
                  </FormGroup>
                </Col>
              </Row>
              <h4>Detalles</h4>
              {detalles.map((detalle, index) => (
                <Card key={index} className="mb-3">
                  <CardBody>
                    <Row>
                      <Col md={4}>
                        <FormGroup>
                          <Label for={`id_tipo_paquete_${index}`}>Tipo de Paquete</Label>
                          <Input
                            type="select"
                            name="id_tipo_paquete"
                            id={`id_tipo_paquete_${index}`}
                            value={detalle.id_tipo_paquete}
                            onChange={(e) => handleChangeDetalle(index, e)}
                            invalid={!!(errors.detalles[index] && errors.detalles[index].id_tipo_paquete)}
                          >
                            <option value="">Seleccione un tipo de paquete</option>
                            {tiposPaquete.map(tipo => (
                              <option key={tipo.id} value={tipo.id}>
                                {tipo.nombre}
                              </option>
                            ))}
                          </Input>
                          {errors.detalles[index]?.id_tipo_paquete && <FormFeedback>{errors.detalles[index].id_tipo_paquete}</FormFeedback>}
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
                            onChange={(e) => handleChangeDetalle(index, e)}
                            invalid={!!(errors.detalles[index] && errors.detalles[index].id_empaque)}
                          >
                            <option value="">Seleccione un empaque</option>
                            {empaques.map(empaque => (
                              <option key={empaque.id} value={empaque.id}>
                                {empaque.empaquetado}
                              </option>
                            ))}
                          </Input>
                          {errors.detalles[index]?.id_empaque && <FormFeedback>{errors.detalles[index].id_empaque}</FormFeedback>}
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
                            onChange={(e) => handleChangeDetalle(index, e)}
                            invalid={!!(errors.detalles[index] && errors.detalles[index].peso)}
                          />
                          {errors.detalles[index]?.peso && <FormFeedback>{errors.detalles[index].peso}</FormFeedback>}
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={4}>
                        <FormGroup>
                          <Label for={`id_estado_paquete_${index}`}>Estado del Paquete</Label>
                          <Input
                            type="select"
                            name="id_estado_paquete"
                            id={`id_estado_paquete_${index}`}
                            value={detalle.id_estado_paquete}
                            onChange={(e) => handleChangeDetalle(index, e)}
                            invalid={!!(errors.detalles[index] && errors.detalles[index].id_estado_paquete)}
                          >
                            <option value="">Seleccione un estado</option>
                            {estadosPaquete.map(estado => (
                              <option key={estado.id} value={estado.id}>
                                {estado.nombre}
                              </option>
                            ))}
                          </Input>
                          {errors.detalles[index]?.id_estado_paquete && <FormFeedback>{errors.detalles[index].id_estado_paquete}</FormFeedback>}
                        </FormGroup>
                      </Col>
                      <Col md={4}>
                        <FormGroup>
                          <Label for={`fecha_envio_${index}`}>Fecha de Envío</Label>
                          <Input
                            type="date"
                            name="fecha_envio"
                            id={`fecha_envio_${index}`}
                            value={detalle.fecha_envio}
                            onChange={(e) => handleChangeDetalle(index, e)}
                            invalid={!!(errors.detalles[index] && errors.detalles[index].fecha_envio)}
                          />
                          {errors.detalles[index]?.fecha_envio && <FormFeedback>{errors.detalles[index].fecha_envio}</FormFeedback>}
                        </FormGroup>
                      </Col>
                      <Col md={4}>
                        <FormGroup>
                          <Label for={`fecha_entrega_estimada_${index}`}>Fecha de Entrega Estimada</Label>
                          <Input
                            type="date"
                            name="fecha_entrega_estimada"
                            id={`fecha_entrega_estimada_${index}`}
                            value={detalle.fecha_entrega_estimada}
                            onChange={(e) => handleChangeDetalle(index, e)}
                            invalid={!!(errors.detalles[index] && errors.detalles[index].fecha_entrega_estimada)}
                          />
                          {errors.detalles[index]?.fecha_entrega_estimada && <FormFeedback>{errors.detalles[index].fecha_entrega_estimada}</FormFeedback>}
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={4}>
                        <FormGroup>
                          <Label for={`fecha_entrega_${index}`}>Fecha de Entrega</Label>
                          <Input
                            type="date"
                            name="fecha_entrega"
                            id={`fecha_entrega_${index}`}
                            value={detalle.fecha_entrega}
                            onChange={(e) => handleChangeDetalle(index, e)}
                            invalid={!!(errors.detalles[index] && errors.detalles[index].fecha_entrega)}
                          />
                          {errors.detalles[index]?.fecha_entrega && <FormFeedback>{errors.detalles[index].fecha_entrega}</FormFeedback>}
                        </FormGroup>
                      </Col>
                      <Col md={4}>
                        <FormGroup>
                          <Label for={`descripcion_contenido_${index}`}>Descripción del Contenido</Label>
                          <Input
                            type="text"
                            name="descripcion_contenido"
                            id={`descripcion_contenido_${index}`}
                            value={detalle.descripcion_contenido}
                            onChange={(e) => handleChangeDetalle(index, e)}
                            invalid={!!(errors.detalles[index] && errors.detalles[index].descripcion_contenido)}
                          />
                          {errors.detalles[index]?.descripcion_contenido && <FormFeedback>{errors.detalles[index].descripcion_contenido}</FormFeedback>}
                        </FormGroup>
                      </Col>
                      <Col md={4}>
                        <FormGroup>
                          <Label for={`id_tipo_entrega_${index}`}>Tipo de Entrega</Label>
                          <Input
                            type="select"
                            name="id_tipo_entrega"
                            id={`id_tipo_entrega_${index}`}
                            value={detalle.id_tipo_entrega}
                            onChange={(e) => handleChangeDetalle(index, e)}
                            invalid={!!(errors.detalles[index] && errors.detalles[index].id_tipo_entrega)}
                          >
                            <option value="">Seleccione un tipo de entrega</option>
                            <option value="1">Entrega Normal</option>
                            <option value="2">Entrega Express</option>
                          </Input>
                          {errors.detalles[index]?.id_tipo_entrega && <FormFeedback>{errors.detalles[index].id_tipo_entrega}</FormFeedback>}
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={4}>
                        <FormGroup>
                          <Label for={`id_cliente_entrega_${index}`}>Cliente de Entrega</Label>
                          <Input
                            type="select"
                            name="id_cliente_entrega"
                            id={`id_cliente_entrega_${index}`}
                            value={detalle.id_cliente_entrega}
                            onChange={(e) => handleChangeDetalle(index, e)}
                            invalid={!!(errors.detalles[index] && errors.detalles[index].id_cliente_entrega)}
                          >
                            <option value="">Seleccione un cliente de entrega</option>
                            {clientes.map(cliente => (
                              <option key={cliente.id} value={cliente.id}>
                                {cliente.nombre}
                              </option>
                            ))}
                          </Input>
                          {errors.detalles[index]?.id_cliente_entrega && <FormFeedback>{errors.detalles[index].id_cliente_entrega}</FormFeedback>}
                        </FormGroup>
                      </Col>
                      <Col md={4}>
                        <FormGroup>
                          <Label for={`nombre_contacto_${index}`}>Nombre de Contacto</Label>
                          <Input
                            type="text"
                            name="nombre_contacto"
                            id={`nombre_contacto_${index}`}
                            value={detalle.nombre_contacto}
                            onChange={(e) => handleChangeDetalle(index, e)}
                            invalid={!!(errors.detalles[index] && errors.detalles[index].nombre_contacto)}
                          />
                          {errors.detalles[index]?.nombre_contacto && <FormFeedback>{errors.detalles[index].nombre_contacto}</FormFeedback>}
                        </FormGroup>
                      </Col>
                      <Col md={4}>
                        <FormGroup>
                          <Label for={`telefono_${index}`}>Teléfono</Label>
                          <Input
                            type="text"
                            name="telefono"
                            id={`telefono_${index}`}
                            value={detalle.telefono}
                            onChange={(e) => handleChangeDetalle(index, e)}
                            invalid={!!(errors.detalles[index] && errors.detalles[index].telefono)}
                          />
                          {errors.detalles[index]?.telefono && <FormFeedback>{errors.detalles[index].telefono}</FormFeedback>}
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={4}>
                        <FormGroup>
                          <Label for={`id_direccion_${index}`}>Dirección de Entrega</Label>
                          <Input
                            type="select"
                            name="id_direccion"
                            id={`id_direccion_${index}`}
                            value={detalle.id_direccion}
                            onChange={(e) => handleChangeDetalle(index, e)}
                            invalid={!!(errors.detalles[index] && errors.detalles[index].id_direccion)}
                          >
                            <option value="">Seleccione una dirección</option>
                            {direcciones.map(direccion => (
                              <option key={direccion.id} value={direccion.id}>
                                {direccion.direccion}
                              </option>
                            ))}
                          </Input>
                          {errors.detalles[index]?.id_direccion && <FormFeedback>{errors.detalles[index].id_direccion}</FormFeedback>}
                        </FormGroup>
                      </Col>
                      <Col md={4}>
                        <FormGroup>
                          <Label for={`instrucciones_entrega_${index}`}>Instrucciones de Entrega</Label>
                          <Input
                            type="text"
                            name="instrucciones_entrega"
                            id={`instrucciones_entrega_${index}`}
                            value={detalle.instrucciones_entrega}
                            onChange={(e) => handleChangeDetalle(index, e)}
                            invalid={!!(errors.detalles[index] && errors.detalles[index].instrucciones_entrega)}
                          />
                          {errors.detalles[index]?.instrucciones_entrega && <FormFeedback>{errors.detalles[index].instrucciones_entrega}</FormFeedback>}
                        </FormGroup>
                      </Col>
                      <Col md={4}>
                        <FormGroup>
                          <Label for={`descripcion_${index}`}>Descripción</Label>
                          <Input
                            type="text"
                            name="descripcion"
                            id={`descripcion_${index}`}
                            value={detalle.descripcion}
                            onChange={(e) => handleChangeDetalle(index, e)}
                            invalid={!!(errors.detalles[index] && errors.detalles[index].descripcion)}
                          />
                          {errors.detalles[index]?.descripcion && <FormFeedback>{errors.detalles[index].descripcion}</FormFeedback>}
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <FormGroup>
                          <Label for={`precio_${index}`}>Precio</Label>
                          <Input
                            type="number"
                            name="precio"
                            id={`precio_${index}`}
                            value={detalle.precio}
                            onChange={(e) => handleChangeDetalle(index, e)}
                            invalid={!!(errors.detalles[index] && errors.detalles[index].precio)}
                          />
                          {errors.detalles[index]?.precio && <FormFeedback>{errors.detalles[index].precio}</FormFeedback>}
                        </FormGroup>
                      </Col>
                      <Col md={12} className="d-flex align-items-end">
                        <Button color="primary" className="me-2" onClick={agregarDetalle}>
                          Agregar Detalle
                        </Button>
                        <Button color="danger" onClick={() => removerDetalle(index)}>
                          Eliminar Detalle
                        </Button>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              ))}
              
              <Button color="success" type="submit" className="ml-2">Guardar Orden</Button>
            </Form>
          </CardBody>
        </Card>
      </Container>
    </>
  );
};

export default AgregarOrden;
