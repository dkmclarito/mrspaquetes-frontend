import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardBody, Form, FormGroup, Label, Input, Table, Button, Row, Col, Alert } from 'reactstrap';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useParams, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const PACKAGE_SIZES = {
  1: 'Pequeño',
  2: 'Mediano',
  3: 'Grande',
  'pequeno': 'Pequeño',
  'mediano': 'Mediano',
  'grande': 'Grande'
};

const SIZE_EQUIVALENTS = {
  'Pequeño': 1,
  'Mediano': 2,
  'Grande': 4
};

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
  const [capacidadExcedida, setCapacidadExcedida] = useState(false);
  const [excesoPaquetes, setExcesoPaquetes] = useState(0);
  const [departamentos, setDepartamentos] = useState([]);
  const [municipios, setMunicipios] = useState({});
  const { codigo_unico_asignacion } = useParams();
  const navigate = useNavigate();

  const fetchAsignacionDetails = useCallback(async () => {
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

      const paquetes = asignacionData.map((a) => {
        const paqueteCompleto = allPaquetes.find(p => p.id_paquete === a.id_paquete) || {};
        return {
          ...paqueteCompleto,
          id_paquete: a.id_paquete,
          tamano_paquete: paqueteCompleto.tamano_paquete || a.tamano_paquete,
          direccion: paqueteCompleto.direccion || a.destino,
          departamento: paqueteCompleto.departamento || a.departamento,
          municipio: paqueteCompleto.municipio || a.municipio,
          created_at: paqueteCompleto.created_at || a.fecha,
          prioridad: a.prioridad.toString(),
          isOriginal: true
        };
      });

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
  }, [codigo_unico_asignacion, allPaquetes]);

  const fetchVehiculos = useCallback(async () => {
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
  }, []);

  const fetchAllPaquetes = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/ordenes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const paquetes = response.data.data.flatMap(orden => 
        orden.estado_pago === "pagado" ? orden.detalles.map(detalle => ({
          id_paquete: detalle.id_paquete,
          tamano_paquete: detalle.paquete.id_tamano_paquete,
          direccion: detalle.direccion,
          departamento: detalle.departamento,
          municipio: detalle.municipio,
          created_at: detalle.fecha_ingreso,
          estado_paquete: detalle.paquete.id_estado_paquete
        })) : []
      ).filter(paquete => paquete.estado_paquete === 2);

      setAllPaquetes(paquetes);
      console.log("Todos los paquetes fetched:", paquetes);
    } catch (error) {
      console.error("Error al obtener paquetes:", error);
      toast.error("Error al cargar los paquetes");
    }
  }, []);

  const fetchDepartamentos = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/dropdown/get_departamentos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDepartamentos(response.data);
    } catch (error) {
      console.error("Error al obtener departamentos:", error);
      //toast.error("Error al cargar los departamentos");
    }
  }, []);

  const fetchMunicipios = useCallback(async (departamentoId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/dropdown/get_municipio/${departamentoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMunicipios(prev => ({
        ...prev,
        [departamentoId]: response.data.municipio
      }));
    } catch (error) {
      console.error(`Error al obtener municipios para el departamento ${departamentoId}:`, error);
      //toast.error(`Error al cargar los municipios para el departamento ${departamentoId}`);
    }
  }, []);

  useEffect(() => {
    fetchAllPaquetes();
    fetchVehiculos();
    fetchDepartamentos();
  }, [fetchAllPaquetes, fetchVehiculos, fetchDepartamentos]);

  useEffect(() => {
    if (allPaquetes.length > 0) {
      fetchAsignacionDetails();
    }
  }, [fetchAsignacionDetails, allPaquetes]);

  useEffect(() => {
    if (allPaquetes.length > 0 && formData.paquetes.length > 0) {
      updateAvailablePackages();
    }
  }, [allPaquetes, formData.paquetes]);

  useEffect(() => {
    checkVehicleCapacity();
  }, [formData.paquetes, formData.id_vehiculo]);

  useEffect(() => {
    departamentos.forEach(dep => fetchMunicipios(dep.id));
  }, [departamentos, fetchMunicipios]);

  const updateAvailablePackages = useCallback(() => {
    const assignedIds = new Set(formData.paquetes.map(p => p.id_paquete));
    const availablePaquetes = allPaquetes.filter(p => !assignedIds.has(p.id_paquete));
    setPaquetesDisponibles(availablePaquetes);
  }, [allPaquetes, formData.paquetes]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaqueteChange = (id, e) => {
    const { value } = e.target;

    if (!/^\d*$/.test(value) || (value !== '' && Number(value) < 1)) {
      return;
    }
  
    setFormData(prev => ({
      ...prev,
      paquetes: prev.paquetes.map(paquete => 
        paquete.id_paquete === id ? { ...paquete, prioridad: value } : paquete
      )
    }));
  };

  const agregarPaquete = (paquete) => {
    setFormData(prev => ({
      ...prev,
      paquetes: [...prev.paquetes, { ...paquete, prioridad: '', isOriginal: false }]
    }));
  };

  const quitarPaquete = (id) => {
    setFormData(prev => ({
      ...prev,
      paquetes: prev.paquetes.filter(p => p.id_paquete !== id)
    }));
  };

  const checkVehicleCapacity = useCallback(() => {
    const selectedVehicle = vehiculos.find(v => v.id === formData.id_vehiculo);
    if (!selectedVehicle) return;

    const vehicleCapacity = selectedVehicle.capacidad_carga || 0;
    const totalEquivalentPackages = formData.paquetes.reduce((total, paquete) => {
      return total + SIZE_EQUIVALENTS[formatTamanoPaquete(paquete.tamano_paquete)] || 0;
    }, 0);

    setCapacidadExcedida(totalEquivalentPackages > vehicleCapacity);
    setExcesoPaquetes(Math.max(0, totalEquivalentPackages - vehicleCapacity));
  }, [formData.paquetes, formData.id_vehiculo, vehiculos]);

  const formatTamanoPaquete = (id) => {
    return PACKAGE_SIZES[id] || 'Desconocido';
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
        return 'Fecha inválida';
      }
      return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Error en fecha';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const numItems = formData.paquetes.length;
    const priorities = formData.paquetes.map(p => Number(p.prioridad));
    const uniquePriorities = new Set(priorities.filter(p => p > 0));
    const hasInvalidPriorities = priorities.some(p => p < 1 || isNaN(p) || p > numItems);
    const hasDuplicatePriorities = uniquePriorities.size !== priorities.filter(p => p > 0).length;

    if (hasInvalidPriorities || hasDuplicatePriorities) {
      toast.error(`Los órdenes de entrega deben ser números únicos mayores o iguales a 1 y menores o iguales a ${numItems}`);
      return;
    }

    if (capacidadExcedida) {
      toast.error("La capacidad del vehículo ha sido excedida. Por favor, ajuste los paquetes.");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const dataToSubmit = {
        id_bodega: formData.id_bodega,
        fecha_programada: formData.fecha_programada,
        id_vehiculo: formData.id_vehiculo,
        paquetes: formData.paquetes.map(p => ({ 
          id: p.id_paquete,
          prioridad: Number(p.prioridad)
        }))
      };
      console.log("Data being sent to API:", dataToSubmit);
      
      const response = await axios.put(`${API_URL}/asignacionrutas/${formData.id_ruta}`, dataToSubmit, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Update response:", response.data);
      
      toast.success("Asignación actualizada con éxito", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      setTimeout(() => {
        navigate('/GestionAsignarRutas');
      }, 2000);
    } catch (error) {
      console.error("Error al actualizar la asignación:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error setting up request:", error.message);
      }
      toast.error("Error al actualizar la asignación: " + (error.response?.data?.message || error.message));
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
          
          {capacidadExcedida && (
            <Alert color="danger">
              La capacidad del vehículo ha sido excedida por {excesoPaquetes} paquetes pequeños equivalentes.
            </Alert>
          )}
          
          <h4 className="mt-4">Paquetes Asignados</h4>
          <Table striped responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tamaño</th>
                <th>Dirección</th>
                <th>Fecha de registro</th>
                <th>Orden de entrega</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {formData.paquetes.map((paquete) => (
                <tr key={paquete.id_paquete}>
                  <td>{paquete.id_paquete}</td>
                  <td>{formatTamanoPaquete(paquete.tamano_paquete)}</td>
                  <td>{paquete.direccion}</td>
                  <td>{formatDate(paquete.created_at)}</td>
                  <td>
                    <Input
                      type="number"
                      min="1"
                      value={paquete.prioridad}
                      onChange={(e) => handlePaqueteChange(paquete.id_paquete, e)}
                      placeholder="Ingrese orden"
                    />
                  </td>
                  <td>
                    {!paquete.isOriginal && (
                      <Button color="danger" onClick={() => quitarPaquete(paquete.id_paquete)}>
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
                <th>ID</th>
                <th>Tamaño</th>
                <th>Dirección</th>
                <th>Departamento</th>
                <th>Municipio</th>
                <th>Fecha de registro</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {paquetesDisponibles.map((paquete) => (
                <tr key={paquete.id_paquete}>
                  <td>{paquete.id_paquete}</td>
                  <td>{formatTamanoPaquete(paquete.tamano_paquete)}</td>
                  <td>{paquete.direccion}</td>
                  <td>{departamentos.find(d => d.id === paquete.departamento)?.nombre || paquete.departamento}</td>
                  <td>{municipios[paquete.departamento]?.find(m => m.id === paquete.municipio)?.nombre || paquete.municipio}</td>
                  <td>{formatDate(paquete.created_at)}</td>
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
      <ToastContainer />
    </Card>
  );
}