import React, { useState, useEffect } from 'react';
import { Card, CardBody, Form, FormGroup, Label, Input, Button } from 'reactstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const EditarDatosAsignacion = ({ asignacion, actualizarAsignacion }) => {
  const [formData, setFormData] = useState({
    fecha: '',
    id_vehiculo: '',
    id_estado: '',
  });
  const [vehiculos, setVehiculos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [paquetes, setPaquetes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (asignacion) {
      setFormData({
        fecha: asignacion.fecha ? new Date(asignacion.fecha).toISOString().split('T')[0] : '',
        id_vehiculo: asignacion.id_vehiculo || '',
        id_estado: asignacion.id_estado || '',
      });
      setPaquetes(asignacion.paquetes || []);
    }
    fetchDropdownData();
  }, [asignacion]);

  const fetchDropdownData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [vehiculosRes, estadosRes] = await Promise.all([
        axios.get(`${API_URL}/dropdown/get_vehiculos`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/dropdown/get_estado_rutas`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setVehiculos(vehiculosRes.data.vehiculos || []);
      setEstados(estadosRes.data.estado_rutas || []);
    } catch (error) {
      console.error("Error al obtener datos:", error);
      toast.error("Error al cargar los datos necesarios");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaqueteChange = (id, e) => {
    const { value } = e.target;
    setPaquetes(prev =>
      prev.map(paquete =>
        paquete.id === id ? { ...paquete, prioridad: Number(value) } : paquete
      )
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Guardar los datos en localStorage
    const datosAEnviar = {
      fecha_programada: formData.fecha,
      id_vehiculo: formData.id_vehiculo,
      paquetes
    };
    localStorage.setItem('asignacionData', JSON.stringify({
      codigo_unico_asignacion: asignacion.codigo_unico_asignacion, // Asegúrate de usar el identificador correcto
      ...datosAEnviar
    }));
    
    // Redirigir a la página de edición de paquetes
    navigate(`/EditarPaquetesAsignacion/${asignacion.codigo_unico_asignacion}`);
  };

  return (
    <Card>
      <CardBody>
        <h3>Editar Datos de la Asignación</h3>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label for="fecha">Fecha Programada</Label>
            <Input
              type="date"
              name="fecha"
              id="fecha"
              value={formData.fecha}
              onChange={handleInputChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for="id_vehiculo">Vehículo</Label>
            <Input
              type="select"
              name="id_vehiculo"
              id="id_vehiculo"
              value={formData.id_vehiculo}
              onChange={handleInputChange}
            >
              <option value="">Seleccione un vehículo</option>
              {vehiculos.map(vehiculo => (
                <option key={vehiculo.id} value={vehiculo.id}>{vehiculo.placa}</option>
              ))}
            </Input>
          </FormGroup>
          <FormGroup>
            <Label for="id_estado">Estado</Label>
            <Input
              type="select"
              name="id_estado"
              id="id_estado"
              value={formData.id_estado}
              onChange={handleInputChange}
            >
              <option value="">Seleccione un estado</option>
              {estados.map(estado => (
                <option key={estado.id} value={estado.id}>{estado.estado}</option>
              ))}
            </Input>
          </FormGroup>
         
          {paquetes.map(paquete => (
            <FormGroup key={paquete.id}>
              <Label for={`paquete-${paquete.id}`}>Paquete ID {paquete.id}</Label>
              <Input
                type="number"
                id={`paquete-${paquete.id}`}
                value={paquete.prioridad}
                onChange={(e) => handlePaqueteChange(paquete.id, e)}
                min="1"
                max="3"
              />
            </FormGroup>
          ))}
          <Button color="primary" type="submit">Continuar editando</Button>
        </Form>
      </CardBody>
    </Card>
  );
};

export default EditarDatosAsignacion;
