import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, FormGroup, Label, Input, Button, Alert } from 'reactstrap';
import Select from 'react-select';
import AuthService from '../services/authService';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const AgregarIncidencia = () => {
  const navigate = useNavigate();

  const [uuidPaquete, setUuidPaquete] = useState(null);
  const [idTipoIncidencia, setIdTipoIncidencia] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipoIncidencias, setTipoIncidencias] = useState([]);
  const [paquetesDanio, setPaquetesDanio] = useState([]);
  const [alertaExito, setAlertaExito] = useState(false);
  const [alertaError, setAlertaError] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState('');

  const token = AuthService.getCurrentUser();

  const customStyles = {
    option: (provided) => ({
      ...provided,
      color: 'black',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'black',
    }),
  };

  useEffect(() => {
    const fetchTipoIncidencias = async () => {
      try {
        const response = await axios.get(`${API_URL}/dropdown/get_tipo_incidencia`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTipoIncidencias(response.data.tipo_incidencia || []);
      } catch (error) {
        console.error('Error al obtener tipos de incidencias:', error);
        setAlertaError(true);
        setErrorMensaje('Error al obtener tipos de incidencias. Intente nuevamente más tarde.');
      }
    };

    fetchTipoIncidencias();
  }, [token]);

  useEffect(() => {
    const fetchPaquetesDanio = async () => {
      try {
        // Realiza la solicitud a la nueva ruta
        const response = await axios.get(`${API_URL}/dropdown/get_paquetes_danio`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        // Imprime en la consola el contenido completo de la respuesta
        console.log('Respuesta completa del servidor:', response);
  
        if (response.status === 200 && response.data && Array.isArray(response.data.paquetes)) {
          const paquetesFiltrados = response.data.paquetes.filter(paquete => paquete.id_ubicacion === null);
          setPaquetesDanio(paquetesFiltrados);
          console.log('Paquetes con id_ubicacion null:', paquetesFiltrados);
        } else {
          throw new Error('Datos inesperados al obtener paquetes con daño');
        }
      } catch (error) {
        console.error('Error al obtener paquetes con daño:', error);
        setAlertaError(true);
        setErrorMensaje('Error al obtener paquetes con daño. Intente nuevamente más tarde.');
      }
    };
  
    fetchPaquetesDanio();
  }, [token]);
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fechaHoraActual = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const incidenciaData = {
      id_paquete: uuidPaquete ? uuidPaquete.value : '',
      id_tipo_incidencia: idTipoIncidencia,
      descripcion,
      estado: '1',
      fecha_hora: fechaHoraActual,
      fecha_resolucion: null,
      id_usuario_reporta: localStorage.getItem('userId'),
      id_usuario_asignado: null,
      solucion: 'Pendiente',
    };

    console.log('Datos que se están enviando:', incidenciaData);

    try {
      const response = await axios.post(`${API_URL}/incidencias`, incidenciaData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        setAlertaExito(true);
        setTimeout(() => {
          setAlertaExito(false);
          navigate('/GestionIncidencias', { replace: true });
        }, 3000);
      } else {
        console.error('Error en la respuesta del servidor:', response);
        setAlertaError(true);
        setErrorMensaje('Error al agregar incidencia. Intente nuevamente.');
      }
    } catch (error) {
      setAlertaError(true);
      const mensajeError = error.response ? error.response.data.message : 'Error al agregar incidencia';
      setErrorMensaje(mensajeError);
      console.error('Error al agregar incidencia:', error.response ? error.response.data : error);
    }
  };

  return (
    <Container fluid>
      <Row>
        <Col>
          <h4>Agregar Incidencia</h4>
          {alertaExito && <Alert color="success">Incidencia agregada exitosamente</Alert>}
          {alertaError && <Alert color="danger">{errorMensaje}</Alert>}
          <Form onSubmit={handleSubmit}>
            {/* Alineamos los campos en una sola fila */}
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label for="id_tipo_incidencia">Tipo de Incidencia</Label>
                  <Input
                    type="select"
                    id="id_tipo_incidencia"
                    value={idTipoIncidencia}
                    onChange={(e) => setIdTipoIncidencia(e.target.value)}
                    required
                  >
                    <option value="">Seleccione un tipo de incidencia</option>
                    {tipoIncidencias.map((tipo) => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.nombre}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </Col>

              <Col md="6">
                <FormGroup>
                  <Label for="uuid_paquete">Paquete con incidencia</Label>
                  <Select
                    id="uuid_paquete"
                    value={uuidPaquete}
                    onChange={(selectedOption) => setUuidPaquete(selectedOption)}
                    options={paquetesDanio.map((paquete) => ({
                      value: paquete.id,
                      label: paquete.descripcion_contenido,
                    }))}
                    placeholder="Buscar por descripción"
                    isSearchable
                    required
                    styles={customStyles}
                  />
                </FormGroup>
              </Col>
            </Row>

            {/* Campo de Descripción en otra fila */}
            <Row>
              <Col md="12">
                <FormGroup>
                  <Label for="descripcion">Descripción</Label>
                  <Input
                    type="textarea"
                    id="descripcion"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    required
                  />
                </FormGroup>
              </Col>
            </Row>

            <Button type="submit" color="primary">
              Agregar Incidencia
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default AgregarIncidencia;
