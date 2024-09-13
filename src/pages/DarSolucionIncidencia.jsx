import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, FormGroup, Label, Input, Button, Alert } from 'reactstrap';
import AuthService from '../services/authService';

const API_URL = import.meta.env.VITE_API_URL;

const DarSolucionIncidencia = () => {
  const { idIncidencia } = useParams();  // Obtiene el id de la incidencia de la URL
  const navigate = useNavigate();

  const [incidencia, setIncidencia] = useState(null);
  const [solucion, setSolucion] = useState('');
  const [alertaExito, setAlertaExito] = useState(false);
  const [alertaError, setAlertaError] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState('');

  const token = AuthService.getCurrentUser();

  // Obtener la incidencia por ID
  useEffect(() => {
    const fetchIncidencia = async () => {
      try {
        const response = await axios.get(`${API_URL}/incidencias/${idIncidencia}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIncidencia(response.data);  // Almacena la incidencia obtenida
        console.log('Incidencia obtenida:', response.data);  // Muestra los datos obtenidos en la consola
      } catch (error) {
        console.error('Error al obtener la incidencia:', error);
      }
    };

    fetchIncidencia();
  }, [idIncidencia, token]);

  // Manejar la actualización de la incidencia
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!incidencia) {
      console.error('No se puede enviar la solución porque la incidencia no se ha cargado.');
      return;
    }

    const fechaResolucion = new Date().toISOString().slice(0, 19).replace('T', ' ');  // Fecha y hora actuales

    // Actualizamos el objeto de la incidencia con los datos que se deben mantener y la nueva solución
    const incidenciaActualizada = {
      id_paquete: incidencia.id_paquete,
      id_tipo_incidencia: incidencia.id_tipo_incidencia,
      descripcion: incidencia.descripcion,
      estado: 3,  // Estado cerrado (id 3)
      fecha_hora: incidencia.fecha_hora,
      fecha_resolucion: fechaResolucion,  // Agrega la fecha de resolución actual
      id_usuario_reporta: incidencia.id_usuario_reporta,
      id_usuario_asignado: incidencia.id_usuario_asignado,
      solucion: solucion  // Solución proporcionada por el usuario
    };

    console.log('Datos enviados para actualizar la incidencia:', incidenciaActualizada);

    try {
      const response = await axios.put(`${API_URL}/incidencias/${idIncidencia}`, incidenciaActualizada, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        setAlertaExito(true);
        setTimeout(() => {
          setAlertaExito(false);
          navigate('/GestionIncidencias');  // Redirigir después de 3 segundos
        }, 3000);
      } else {
        console.error('Error en la respuesta del servidor:', response);
        setAlertaError(true);
        setErrorMensaje('Error al cerrar la incidencia. Intente nuevamente.');
      }
    } catch (error) {
      setAlertaError(true);
      const mensajeError = error.response ? error.response.data.message : 'Error al cerrar la incidencia';
      setErrorMensaje(mensajeError);
      console.error('Error al cerrar la incidencia:', error.response ? error.response.data : error);
    }
  };

  return (
    <Container fluid>
      <Row>
        <Col>
          <h4>Dar Solución a la Incidencia</h4>
          {alertaExito && <Alert color="success">Incidencia cerrada exitosamente</Alert>}
          {alertaError && <Alert color="danger">{errorMensaje}</Alert>}
          
          {incidencia ? (
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label for="solucion">Solución</Label>
                <Input
                  type="textarea"
                  id="solucion"
                  value={solucion}
                  onChange={(e) => setSolucion(e.target.value)}
                  required
                />
              </FormGroup>
              <Button type="submit" color="primary">Cerrar Incidencia</Button>
            </Form>
          ) : (
            <p>Cargando datos de la incidencia...</p>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default DarSolucionIncidencia;
