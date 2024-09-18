import React, { useState, useEffect } from 'react';
import { Card, CardBody, Form, FormGroup, Label, Input, Table, Button, Row, Col } from 'reactstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

export default function EditarPaquetesAsignacion() {
  const [formData, setFormData] = useState({
    id_bodega: 1,
    fecha_programada: '',
    id_vehiculo: '',
    id_ruta: null,
    paquetes: []
  });
  const [vehiculos, setVehiculos] = useState([]);
  const [paquetesDisponibles, setPaquetesDisponibles] = useState([]);
  const [allPaquetes, setAllPaquetes] = useState([]);
  const { codigo_unico_asignacion } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAsignacionDetails();
    fetchVehiculos();
    fetchAllPaquetes();
  }, []);

  useEffect(() => {
    if (allPaquetes.length > 0 && formData.paquetes.length > 0) {
      updateAvailablePackages(formData.paquetes, allPaquetes);
    }
  }, [formData.paquetes, allPaquetes]);

  const fetchAsignacionDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/asignacionrutas?codigo_unico_asignacion=${codigo_unico_asignacion}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const asignacionData = response.data.asignacionrutas.data;

      if (asignacionData.length === 0) {
        throw new Error('No se encontró la asignación');
      }

      const rutaResponse = await axios.get(`${API_URL}/rutas/${asignacionData[0].id_ruta}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const rutaData = rutaResponse.data.ruta;

      const paquetes = asignacionData.map((a, index) => ({
        item: index + 1,
        id: a.id_paquete,
        prioridad: a.prioridad.toString(),
        destino: a.destino,
        fecha: a.fecha,
        id_ruta: a.id_ruta,
        id_vehiculo: a.id_vehiculo,
        isOriginal: true
      }));

      setFormData(prev => ({
        ...prev,
        id_bodega: 1,
        fecha_programada: rutaData.fecha_programada ? new Date(rutaData.fecha_programada).toISOString().split('T')[0] : '',
        id_vehiculo: asignacionData[0].id_vehiculo || '',
        id_ruta: asignacionData[0].id_ruta,
        paquetes: paquetes
      }));

      console.log("Paquetes asignados:", paquetes);
    } catch (error) {
      console.error("Error al obtener detalles de la asignación:", error);
      toast.error("Error al cargar los detalles de la asignación");
    }
  };

  const fetchVehiculos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/dropdown/get_vehiculos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVehiculos(response.data.vehiculos || []);
      console.log("Vehículos fetched:", response.data.vehiculos);
    } catch (error) {
      console.error("Error al obtener vehículos:", error);
      toast.error("Error al cargar los vehículos");
    }
  };

  const fetchAllPaquetes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/ordenes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const paquetes = response.data.data.flatMap((orden, ordenIndex) => 
        orden.detalles.map((detalle, detalleIndex) => ({
          item: detalleIndex + 1,
          id: detalle.id_paquete,
          destino: `${detalle.departamento}, ${detalle.municipio}, ${detalle.direccion}`
        }))
      );
      setAllPaquetes(paquetes);
      console.log("Todos los paquetes fetched:", paquetes);

      updateAvailablePackages(formData.paquetes, paquetes);
    } catch (error) {
      console.error("Error al obtener paquetes:", error);
      toast.error("Error al cargar los paquetes");
    }
  };

  const updateAvailablePackages = (assignedPaquetes, allPaquetes) => {
    const assignedIds = new Set(assignedPaquetes.map(p => p.id));
    const availablePaquetes = allPaquetes.filter(p => !assignedIds.has(p.id));
    setPaquetesDisponibles(availablePaquetes);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaqueteChange = (id, e) => {
    const { value } = e.target;

    // Validar que solo se permitan números positivos mayores o iguales a 1
    if (!/^\d*$/.test(value) || (value !== '' && Number(value) < 1)) {
      return; // Ignorar valores inválidos
    }
  
    setFormData(prev => {
      // Update the priority for the specific package
      const updatedPaquetes = prev.paquetes.map(paquete => {
        if (paquete.id === id) {
          return { ...paquete, prioridad: value };
        }
        return paquete;
      });

      return {
        ...prev,
        paquetes: updatedPaquetes
      };
    });
  };

  const agregarPaquete = (paquete) => {
    setFormData(prev => {
      const newPaquetes = [
        ...prev.paquetes,
        {
          ...paquete,
          item: prev.paquetes.length + 1,
          prioridad: '',
          isOriginal: false
        }
      ];
      return { ...prev, paquetes: newPaquetes };
    });
    setPaquetesDisponibles(prev => prev.filter(p => p.id !== paquete.id));
  };

  const quitarPaquete = (id) => {
    setFormData(prev => {
      const updatedPaquetes = prev.paquetes.filter(p => p.id !== id)
        .map((p, index) => ({ ...p, item: index + 1 }));
      return { ...prev, paquetes: updatedPaquetes };
    });
    const paqueteRemovido = allPaquetes.find(p => p.id === id);
    if (paqueteRemovido) {
      setPaquetesDisponibles(prev => [...prev, paqueteRemovido]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar prioridades
    const numItems = formData.paquetes.length;
    const priorities = formData.paquetes.map(p => Number(p.prioridad));
    const uniquePriorities = new Set(priorities.filter(p => p > 0));
    const hasInvalidPriorities = priorities.some(p => p < 1 || isNaN(p) || p > numItems);
    const hasDuplicatePriorities = uniquePriorities.size !== priorities.filter(p => p > 0).length;

    if (hasInvalidPriorities || hasDuplicatePriorities) {
      toast.error(`Las prioridades deben ser números únicos mayores o iguales a 1 y menores o iguales a ${numItems}`);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const dataToSubmit = {
        ...formData,
        paquetes: formData.paquetes.map(p => ({ ...p, prioridad: Number(p.prioridad) }))
      };
      const response = await axios.put(`${API_URL}/asignacionrutas/${codigo_unico_asignacion}`, dataToSubmit, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("Update response:", response.data);
      toast.success("Asignación actualizada con éxito");
      navigate('/GestionAsignarRutas');
    } catch (error) {
      console.error("Error al actualizar la asignación:", error);
      if (error.response && error.response.data && error.response.data.errors) {
        Object.values(error.response.data.errors).forEach(errorMsg => 
          toast.error(errorMsg[0])
        );
      } else {
        toast.error("Error al actualizar la asignación");
      }
    }
  };

  return (
    <Card>
      <CardBody>
        <h3>Editar Paquetes de la Asignación</h3>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
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
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label for="id_vehiculo">Vehículo</Label>
                <Input
                  type="text"
                  name="id_vehiculo"
                  id="id_vehiculo"
                  value={vehiculos.find(v => v.id === formData.id_vehiculo)?.placa || ''}
                  readOnly
                />
              </FormGroup>
            </Col>
          </Row>
          
          <h4 className="mt-4">Paquetes Asignados</h4>
          <Table striped responsive>
            <thead>
              <tr>
                <th>Item</th>
                <th>ID</th>
                <th>Destino</th>
                <th>Prioridad</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {formData.paquetes.map((paquete) => (
                <tr key={paquete.id}>
                  <td>{paquete.item}</td>
                  <td>{paquete.id}</td>
                  <td>{paquete.destino}</td>
                  <td>
                    <Input
                      type="number"
                      min="1"
                      value={paquete.prioridad}
                      onChange={(e) => handlePaqueteChange(paquete.id, e)}
                      placeholder="Ingrese prioridad"
                    />
                  </td>
                  <td>
                    {!paquete.isOriginal && (
                      <Button color="danger" onClick={() => quitarPaquete(paquete.id)}>
                        Quitar
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          
          <h4 className="mt-4">Paquetes Disponibles</h4>
          <Table striped responsive>
            <thead>
              <tr>
                <th>Item</th>
                <th>ID</th>
                <th>Destino</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {paquetesDisponibles.map((paquete) => (
                <tr key={paquete.id}>
                  <td>{paquete.item}</td>
                  <td>{paquete.id}</td>
                  <td>{paquete.destino}</td>
                  <td>
                    <Button color="primary" onClick={() => agregarPaquete(paquete)}>
                      Agregar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          
          <Button color="primary" type="submit" className="mt-3">Guardar Cambios</Button>
        </Form>
      </CardBody>
    </Card>
  );
}
