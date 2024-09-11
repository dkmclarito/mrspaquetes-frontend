import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, FormGroup, Label, Input, Button, Alert } from 'reactstrap';
import AuthService from '../services/authService';

const API_URL = import.meta.env.VITE_API_URL;

const AgregarIncidenciaPaqueteSeleccionado = () => {
  const { idPaquete } = useParams();  // Obtiene el id_paquete de la URL
  const navigate = useNavigate();

  const [idTipoIncidencia, setIdTipoIncidencia] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [estado, setEstado] = useState('');
  const [tipoIncidencias, setTipoIncidencias] = useState([]);
  const [estadosIncidencias, setEstadosIncidencias] = useState([]);
  const [alertaExito, setAlertaExito] = useState(false);
  const [alertaError, setAlertaError] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState('');

  const token = AuthService.getCurrentUser();

  useEffect(() => {
    const fetchTipoIncidencias = async () => {
      try {
        const response = await axios.get(`${API_URL}/dropdown/get_tipo_incidencia`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTipoIncidencias(response.data.tipo_incidencia || []);
      } catch (error) {
        console.error('Error al obtener tipos de incidencias:', error);
      }
    };

    const fetchEstadosIncidencias = async () => {
      try {
        const response = await axios.get(`${API_URL}/dropdown/get_estado_incidencias`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEstadosIncidencias(response.data.estado_incidencias || []);
        console.log('Estados de incidencias obtenidos:', response.data);  // Verifica los datos obtenidos
      } catch (error) {
        console.error('Error al obtener estados de incidencias:', error);
      }
    };

    fetchTipoIncidencias();
    fetchEstadosIncidencias();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fechaHoraActual = new Date().toISOString().slice(0, 19).replace('T', ' ');  // Fecha y hora actuales

    const incidenciaData = {
      id_paquete: idPaquete,  // Paquete seleccionado
      id_tipo_incidencia: idTipoIncidencia,
      descripcion,
      estado,
      fecha_hora: fechaHoraActual,  // Fecha y hora actuales
      fecha_resolucion: null,  // Enviar como null
      id_usuario_reporta: localStorage.getItem('userId'),  // Usuario logueado
      id_usuario_asignado: null,  // Enviar como null
      solucion: ""  // Solución vacía
    };

    console.log('Datos que se están enviando:', incidenciaData);  // Muestra los datos en la consola

    try {
      const response = await axios.post(`${API_URL}/incidencias`, incidenciaData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      // Considerar tanto 200 como 201 como respuestas exitosas
      if (response.status === 200 || response.status === 201) {
        setAlertaExito(true);
        setTimeout(() => {
          setAlertaExito(false);
          navigate('/GestionIncidencias');  // Redirigir después de 3 segundos
        }, 3000);
      } else {
        // Manejar el caso cuando la respuesta no es 200 o 201
        console.error('Error en la respuesta del servidor:', response);
        setAlertaError(true);
        setErrorMensaje('Error al agregar incidencia. Intente nuevamente.');
      }
    } catch (error) {
      // Manejo de error con más detalles
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
                {tipoIncidencias.map(tipo => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </option>
                ))}
              </Input>
            </FormGroup>
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
            <FormGroup>
              <Label for="estado">Estado</Label>
              <Input
                type="select"
                id="estado"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                required
              >
                <option value="">Seleccione un estado</option>
                {estadosIncidencias.map(estadoItem => (
                  <option key={estadoItem.id} value={estadoItem.id}>
                    {estadoItem.estado}
                  </option>
                ))}
              </Input>
            </FormGroup>
            <Button type="submit" color="primary">Agregar Incidencia</Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default AgregarIncidenciaPaqueteSeleccionado;


