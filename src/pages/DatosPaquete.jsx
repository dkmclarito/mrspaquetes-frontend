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
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';

export default function DatosPaquete() {
  const { idCliente } = useParams();
  const [cliente, setCliente] = useState(null);
  const [tiposPaquete, setTiposPaquete] = useState([]);
  const [empaques, setEmpaques] = useState([]);
  const [estadosPaquete, setEstadosPaquete] = useState([]);
  const [tarifas, setTarifas] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [commonData, setCommonData] = useState({
    id_estado_paquete: '',
    fecha_envio: '',
    fecha_entrega_estimada: '',
    fecha_entrega: '',
    id_tipo_entrega: '',
    instrucciones_entrega: '',
  });
  const [paquetes, setPaquetes] = useState([{
    id_tipo_paquete: '',
    id_empaque: '',
    peso: '',
    descripcion: '',
    precio: '',
    tamano_paquete: '',
  }]);
  const [errors, setErrors] = useState({
    commonData: {},
    paquetes: []
  });

  const token = localStorage.getItem('token');
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clienteRes, tiposPaqueteRes, empaquesRes, estadosPaqueteRes, tarifasRes] = await Promise.all([
          axios.get(`${API_URL}/clientes/${idCliente}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/dropdown/get_tipo_paquete`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/dropdown/get_empaques`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/dropdown/get_estado_paquete`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/tarifa-destinos`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        setCliente(clienteRes.data.cliente || {});
        setTiposPaquete(tiposPaqueteRes.data.tipo_paquete || []);
        setEmpaques(empaquesRes.data.empaques || []);
        setEstadosPaquete(estadosPaqueteRes.data.estado_paquetes || []);
        setTarifas(tarifasRes.data || []);

        const storedAddress = JSON.parse(localStorage.getItem('selectedAddress'));
        setSelectedAddress(storedAddress);
        console.log('Selected address:', storedAddress);

        console.log('Fetched data:', {
          cliente: clienteRes.data.cliente,
          tiposPaquete: tiposPaqueteRes.data.tipo_paquete,
          empaques: empaquesRes.data.empaques,
          estadosPaquete: estadosPaqueteRes.data.estado_paquetes,
          tarifas: tarifasRes.data,
          storedAddress
        });

      } catch (error) {
        console.error("Error al obtener los datos:", error);
        toast.error('Error al obtener los datos');
      }
    };

    fetchData();
  }, [idCliente, token, API_URL]);

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'peso':
      case 'precio':
        if (isNaN(value) || value <= 0) {
          error = 'El valor debe ser un número positivo.';
        }
        break;

      case 'id_tipo_paquete':
      case 'id_empaque':
      case 'id_estado_paquete':
      case 'id_tipo_entrega':
      case 'tamano_paquete':
        if (!value) {
          error = 'Debe seleccionar una opción.';
        }
        break;

      case 'descripcion':
      case 'instrucciones_entrega':
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

  const handleChangeCommonData = (e) => {
    const { name, value } = e.target;
    setCommonData(prev => ({ ...prev, [name]: value }));
    
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      commonData: { ...prev.commonData, [name]: error }
    }));

    // If the delivery type changes, recalculate prices for all packages
    if (name === 'id_tipo_entrega') {
      const updatedPaquetes = paquetes.map(paquete => ({
        ...paquete,
        precio: calculatePrice(paquete.tamano_paquete, value)
      }));
      setPaquetes(updatedPaquetes);
    }
  };

  const getTamanoPaqueteString = (tamanoPaquete) => {
    switch (tamanoPaquete) {
      case '1': return 'pequeno';
      case '2': return 'mediano';
      case '3': return 'grande';
      default: return '';
    }
  };

  const calculatePrice = (tamanoPaquete, tipoEntrega) => {
    if (!selectedAddress || !tamanoPaquete) {
      console.log('Missing selectedAddress or tamanoPaquete', { selectedAddress, tamanoPaquete });
      return '';
    }

    const isExpress = tipoEntrega === '2';
    const isSanMiguelUrban = selectedAddress.id_departamento === 12 && selectedAddress.id_municipio === 215;

    console.log('Calculating price for:', { tamanoPaquete, tipoEntrega, selectedAddress, isExpress, isSanMiguelUrban });

    let tarifaType;
    if (isExpress && isSanMiguelUrban) {
      tarifaType = 'tarifa urbana express';
    } else if (isSanMiguelUrban) {
      tarifaType = 'tarifa urbana';
    } else {
      tarifaType = 'tarifa rural';
    }

    const tarifa = tarifas.find(t => 
      t.tamano_paquete === getTamanoPaqueteString(tamanoPaquete) &&
      t.departamento === selectedAddress.departamento_nombre &&
      t.municipio === selectedAddress.municipio_nombre &&
      t.tarifa === tarifaType
    );

    if (!tarifa) {
      console.log('No exact match found, searching for a general tariff for the department');
      const generalTarifa = tarifas.find(t => 
        t.tamano_paquete === getTamanoPaqueteString(tamanoPaquete) &&
        t.departamento === selectedAddress.departamento_nombre &&
        t.tarifa === tarifaType
      );

      if (generalTarifa) {
        console.log('Found general tarifa:', generalTarifa);
        return generalTarifa.monto;
      }

      console.log('No matching tarifa found');
      return '';
    }

    console.log('Found tarifa:', tarifa);
    return tarifa.monto;
  };

  const handleChangePaquete = (index, e) => {
    const { name, value } = e.target;
    const updatedPaquetes = [...paquetes];
    updatedPaquetes[index] = { ...updatedPaquetes[index], [name]: value };

    if (name === 'tamano_paquete') {
      if (selectedAddress) {
        const calculatedPrice = calculatePrice(value, commonData.id_tipo_entrega);
        updatedPaquetes[index].precio = calculatedPrice;
        console.log(`Updated price for paquete ${index}:`, calculatedPrice);
      } else {
        console.log('No selectedAddress available, price calculation skipped');
      }
    }

    setPaquetes(updatedPaquetes);
    
    const error = validateField(name, value);
    setErrors(prev => {
      const newPaquetesErrors = [...(prev.paquetes || [])];
      newPaquetesErrors[index] = { ...newPaquetesErrors[index], [name]: error };
      return { ...prev, paquetes: newPaquetesErrors };
    });

    console.log('Updated paquete:', updatedPaquetes[index]);
  };

  const agregarPaquete = () => {
    setPaquetes(prev => [...prev, {
      id_tipo_paquete: '',
      id_empaque: '',
      peso: '',
      descripcion: '',
      precio: '',
      tamano_paquete: '',
    }]);
    setErrors(prev => ({
      ...prev,
      paquetes: [...prev.paquetes, {}]
    }));
  };

  const removerPaquete = (index) => {
    setPaquetes(prev => prev.filter((_, idx) => idx !== index));
    setErrors(prev => ({
      ...prev,
      paquetes: prev.paquetes.filter((_, idx) => idx !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    let isValid = true;
    let newErrors = {
      commonData: {},
      paquetes: paquetes.map(() => ({}))
    };

    // Validate common data
    Object.keys(commonData).forEach(key => {
      const error = validateField(key, commonData[key]);
      if (error) {
        newErrors.commonData[key] = error;
        isValid = false;
      }
    });

    // Validate paquetes
    paquetes.forEach((paquete, index) => {
      Object.keys(paquete).forEach(key => {
        const error = validateField(key, paquete[key]);
        if (error) {
          newErrors.paquetes[index][key] = error;
          isValid = false;
        }
      });
    });

    setErrors(newErrors);

    if (!isValid) {
      toast.error("Por favor, corrija los errores en el formulario antes de enviar.");
      return;
    }

    const detalles = paquetes.map(paquete => ({
      ...commonData,
      ...paquete,
      id_direccion: selectedAddress ? selectedAddress.id : null
    }));

    const totalPrice = detalles.reduce((sum, detalle) => sum + parseFloat(detalle.precio || 0), 0);

    console.log('Submitting form:', { detalles, totalPrice, commonData });

    navigate(`/GenerarOrden/${idCliente}`, { 
      state: { 
        detalles: detalles,
        totalPrice: totalPrice,
        commonData: commonData
      } 
    });
  };

  const isExpressAvailable = selectedAddress && 
    selectedAddress.id_departamento === 12 && 
    selectedAddress.id_municipio === 200;

  return (
    <Container fluid>
      <ToastContainer />
      <Card>
        <CardHeader>
          <h4>Agregar datos de los Paquetes</h4>
          {cliente && (
            <h5>Cliente: {cliente.nombre} {cliente.apellido}</h5>
          )}
          {selectedAddress && (
            <h6>Dirección seleccionada: {selectedAddress.direccion}</h6>
          )}
        </CardHeader>
        <CardBody>
          <Form onSubmit={handleSubmit}>
            <Card className="mb-3">
              <CardBody>
                <h5>Datos Comunes para todos los Paquetes</h5>
                <Row>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="id_estado_paquete">Estado del Paquete</Label>
                      <Input
                        type="select"
                        name="id_estado_paquete"
                        id="id_estado_paquete"
                        value={commonData.id_estado_paquete}
                        onChange={handleChangeCommonData}
                        invalid={!!errors.commonData.id_estado_paquete}
                      >
                        <option value="">Seleccione un estado</option>
                        {estadosPaquete.map(estado => (
                          <option key={estado.id} value={estado.id}>
                            {estado.nombre}
                          </option>
                        ))}
                      </Input>
                      {errors.commonData.id_estado_paquete && <FormFeedback>{errors.commonData.id_estado_paquete}</FormFeedback>}
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="fecha_envio">Fecha de Envío</Label>
                      <Input
                        type="date"
                        name="fecha_envio"
                        id="fecha_envio"
                        value={commonData.fecha_envio}
                        onChange={handleChangeCommonData}
                        invalid={!!errors.commonData.fecha_envio}
                      />
                      {errors.commonData.fecha_envio && <FormFeedback>{errors.commonData.fecha_envio}</FormFeedback>}
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="fecha_entrega_estimada">Fecha de Entrega Estimada</Label>
                      <Input
                        type="date"
                        name="fecha_entrega_estimada"
                        id="fecha_entrega_estimada"
                        value={commonData.fecha_entrega_estimada}
                        onChange={handleChangeCommonData}
                        invalid={!!errors.commonData.fecha_entrega_estimada}
                      />
                      {errors.commonData.fecha_entrega_estimada && <FormFeedback>{errors.commonData.fecha_entrega_estimada}</FormFeedback>}
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
                        value={commonData.fecha_entrega}
                        onChange={handleChangeCommonData}
                        invalid={!!errors.commonData.fecha_entrega}
                      />
                      {errors.commonData.fecha_entrega && <FormFeedback>{errors.commonData.fecha_entrega}</FormFeedback>}
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="id_tipo_entrega">Tipo de Entrega</Label>
                      <Input
                        type="select"
                        name="id_tipo_entrega"
                        id="id_tipo_entrega"
                        value={commonData.id_tipo_entrega}
                        onChange={handleChangeCommonData}
                        invalid={!!errors.commonData.id_tipo_entrega}
                      >
                        <option value="">Seleccione un tipo de entrega</option>
                        <option value="1">Entrega Normal</option>
                        {isExpressAvailable && <option value="2">Entrega Express</option>}
                      </Input>
                      {errors.commonData.id_tipo_entrega && <FormFeedback>{errors.commonData.id_tipo_entrega}</FormFeedback>}
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="instrucciones_entrega">Instrucciones de Entrega</Label>
                      <Input
                        type="text"
                        name="instrucciones_entrega"
                        id="instrucciones_entrega"
                        value={commonData.instrucciones_entrega}
                        onChange={handleChangeCommonData}
                        invalid={!!errors.commonData.instrucciones_entrega}
                      />
                      {errors.commonData.instrucciones_entrega && <FormFeedback>{errors.commonData.instrucciones_entrega}</FormFeedback>}
                    </FormGroup>
                  </Col>
                </Row>
              </CardBody>
            </Card>

            {paquetes.map((paquete, index) => (
              <Card key={index} className="mb-3">
                <CardBody>
                  <h5>Paquete {index + 1}</h5>
                  <Row>
                    <Col md={4}>
                      <FormGroup>
                        <Label for={`id_tipo_paquete_${index}`}>Tipo de Paquete</Label>
                        <Input
                          type="select"
                          name="id_tipo_paquete"
                          id={`id_tipo_paquete_${index}`}
                          value={paquete.id_tipo_paquete}
                          onChange={(e) => handleChangePaquete(index, e)}
                          invalid={!!(errors.paquetes[index] && errors.paquetes[index].id_tipo_paquete)}
                        >
                          <option value="">Seleccione un tipo de paquete</option>
                          {tiposPaquete.map(tipo => (
                            <option key={tipo.id} value={tipo.id}>
                              {tipo.nombre}
                            </option>
                          ))}
                        </Input>
                        {errors.paquetes[index]?.id_tipo_paquete && <FormFeedback>{errors.paquetes[index].id_tipo_paquete}</FormFeedback>}
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup>
                        <Label for={`id_empaque_${index}`}>Empaque</Label>
                        <Input
                          type="select"
                          name="id_empaque"
                          id={`id_empaque_${index}`}
                          value={paquete.id_empaque}
                          onChange={(e) => handleChangePaquete(index, e)}
                          invalid={!!(errors.paquetes[index] && errors.paquetes[index].id_empaque)}
                        >
                          <option value="">Seleccione un empaque</option>
                          {empaques.map(empaque => (
                            <option key={empaque.id} value={empaque.id}>
                              {empaque.empaquetado}
                            </option>
                          ))}
                        </Input>
                        {errors.paquetes[index]?.id_empaque && <FormFeedback>{errors.paquetes[index].id_empaque}</FormFeedback>}
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup>
                        <Label for={`peso_${index}`}>Peso</Label>
                        <Input
                          type="number"
                          name="peso"
                          id={`peso_${index}`}
                          value={paquete.peso}
                          onChange={(e) => handleChangePaquete(index, e)}
                          invalid={!!(errors.paquetes[index] && errors.paquetes[index].peso)}
                        />
                        {errors.paquetes[index]?.peso && <FormFeedback>{errors.paquetes[index].peso}</FormFeedback>}
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup>
                        <Label for={`descripcion_${index}`}>Descripción</Label>
                        <Input
                          type="text"
                          name="descripcion"
                          id={`descripcion_${index}`}
                          value={paquete.descripcion}
                          onChange={(e) => handleChangePaquete(index, e)}
                          invalid={!!(errors.paquetes[index] && errors.paquetes[index].descripcion)}
                        />
                        {errors.paquetes[index]?.descripcion && <FormFeedback>{errors.paquetes[index].descripcion}</FormFeedback>}
                      </FormGroup>
                    </Col>
                 
                    <Col md={4}>
                      <FormGroup>
                        <Label for={`tamano_paquete_${index}`}>Tamaño del Paquete</Label>
                        <Input
                          type="select"
                          name="tamano_paquete"
                          id={`tamano_paquete_${index}`}
                          value={paquete.tamano_paquete}
                          onChange={(e) => handleChangePaquete(index, e)}
                          invalid={!!(errors.paquetes[index] && errors.paquetes[index].tamano_paquete)}
                        >
                          <option value="">Seleccione un tamaño</option>
                          <option value="1">Pequeño</option>
                          <option value="2">Mediano</option>
                          {commonData.id_tipo_entrega !== '2' && <option value="3">Grande</option>}
                        </Input>
                        {errors.paquetes[index]?.tamano_paquete && <FormFeedback>{errors.paquetes[index].tamano_paquete}</FormFeedback>}
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup>
                        <Label for={`precio_${index}`}>Precio</Label>
                        <Input
                          type="text"
                          name="precio"
                          id={`precio_${index}`}
                          value={paquete.precio}
                          readOnly
                          invalid={!!(errors.paquetes[index] && errors.paquetes[index].precio)}
                        />
                        {errors.paquetes[index]?.precio && <FormFeedback>{errors.paquetes[index].precio}</FormFeedback>}
                      </FormGroup>
                    </Col>
                  </Row>
                  {index > 0 && (
                    <Row className="mt-3">
                      <Col>
                        <Button color="danger" onClick={() => removerPaquete(index)}>
                          Eliminar Paquete
                        </Button>
                      </Col>
                    </Row>
                  )}
                </CardBody>
              </Card>
            ))}
            <Row className="mb-3">
              <Col className="d-flex justify-content-start">
                <Button color="primary" onClick={agregarPaquete}>
                  Agregar Paquete
                </Button>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col className="d-flex justify-content-start">
                <Button color="success" type="submit">
                  Guardar Paquetes
                </Button>
              </Col>
            </Row>
          </Form>
        </CardBody>
      </Card>
    </Container>
  );
}