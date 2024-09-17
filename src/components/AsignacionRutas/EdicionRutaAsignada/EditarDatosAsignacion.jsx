import React, { useState, useEffect } from 'react';
import { Card, CardBody, Form, FormGroup, Label, Input, Button, Table } from 'reactstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const EditarDatosAsignacion = ({ asignacion, actualizarAsignacion }) => {
  const [formData, setFormData] = useState({
    id_bodega: 1, // Default value
    fecha_programada: '',
    id_vehiculo: '',
    paquetes: []
  });
  const [vehiculos, setVehiculos] = useState([]);
  const [paquetesDisponibles, setPaquetesDisponibles] = useState([]);
  const navigate = useNavigate();
  const { codigo_unico_asignacion } = useParams();

  useEffect(() => {
    if (asignacion) {
      setFormData({
        id_bodega: 1,
        fecha_programada: asignacion.fecha ? new Date(asignacion.fecha).toISOString().split('T')[0] : '',
        id_vehiculo: asignacion.id_vehiculo || '',
        paquetes: asignacion.paquetes || []
      });
    }
    fetchVehiculos();
    fetchPaquetes();
  }, [asignacion]);

  const fetchVehiculos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/dropdown/get_vehiculos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVehiculos(response.data.vehiculos || []);
    } catch (error) {
      console.error("Error al obtener vehículos:", error);
      toast.error("Error al cargar los vehículos");
    }
  };

  const fetchPaquetes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/paquete`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPaquetesDisponibles(response.data.data || []);
    } catch (error) {
      console.error("Error al obtener paquetes:", error);
      toast.error("Error al cargar los paquetes");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaqueteChange = (id, e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      paquetes: prev.paquetes.map(paquete =>
        paquete.id === id ? { ...paquete, prioridad: Number(value) } : paquete
      )
    }));
  };

  const agregarPaquete = (paquete) => {
    setFormData(prev => ({
      ...prev,
      paquetes: [...prev.paquetes, { id: paquete.id, prioridad: 1 }]
    }));
    setPaquetesDisponibles(prev => prev.filter(p => p.id !== paquete.id));
  };

  const removerPaquete = (id) => {
    const paqueteRemovido = formData.paquetes.find(p => p.id === id);
    setFormData(prev => ({
      ...prev,
      paquetes: prev.paquetes.filter(p => p.id !== id)
    }));
    if (paqueteRemovido) {
      setPaquetesDisponibles(prev => [...prev, paqueteRemovido]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/asignacionrutas/${codigo_unico_asignacion}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("Update response:", response.data);
      toast.success("Datos de la asignación actualizados con éxito");
      actualizarAsignacion(response.data);

      // Store updated data in localStorage
      localStorage.setItem('asignacionData', JSON.stringify(formData));

      navigate(`/EditarPaquetesAsignacion/${codigo_unico_asignacion}`);
    } catch (error) {
      console.error("Error al actualizar los datos:", error);
      if (error.response && error.response.data && error.response.data.errors) {
        Object.values(error.response.data.errors).forEach(errorMsg => 
          toast.error(errorMsg[0])
        );
      } else {
        toast.error("Error al actualizar los datos de la asignación");
      }
    }
  };

  return (
    <Card>
      <CardBody>
        <h3>Editar Datos de la Asignación</h3>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label for="fecha_programada">Fecha Programada</Label>
            <Input
              type="date"
              name="fecha_programada"
              id="fecha_programada"
              value={formData.fecha_programada}
              onChange={handleInputChange}
              required
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
              required
            >
              <option value="">Seleccione un vehículo</option>
              {vehiculos.map(vehiculo => (
                <option key={vehiculo.id} value={vehiculo.id}>{vehiculo.placa}</option>
              ))}
            </Input>
          </FormGroup>
          <FormGroup>
            <Label>Paquetes Asignados</Label>
            <Table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Prioridad</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {formData.paquetes.map(paquete => (
                  <tr key={paquete.id}>
                    <td>{paquete.id}</td>
                    <td>
                      <Input
                        type="number"
                        value={paquete.prioridad}
                        onChange={(e) => handlePaqueteChange(paquete.id, e)}
                        min="1"
                        max="3"
                      />
                    </td>
                    <td>
                      <Button color="danger" onClick={() => removerPaquete(paquete.id)}>Eliminar</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </FormGroup>
          <FormGroup>
            <Label>Paquetes Disponibles</Label>
            <Table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tipo de Paquete</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {paquetesDisponibles.map(paquete => (
                  <tr key={paquete.id}>
                    <td>{paquete.id}</td>
                    <td>{paquete.tipo_paquete}</td>
                    <td>
                      <Button color="primary" onClick={() => agregarPaquete(paquete)}>Agregar</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </FormGroup>
          <Button color="primary" type="submit">Guardar y Continuar</Button>
        </Form>
      </CardBody>
    </Card>
  );
};

export default EditarDatosAsignacion;