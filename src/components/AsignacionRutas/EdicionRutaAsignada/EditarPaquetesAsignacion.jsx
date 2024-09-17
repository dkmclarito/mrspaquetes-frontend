import React, { useState, useEffect } from 'react';
import { Card, CardBody, Form, FormGroup, Label, Input, Button, Table } from 'reactstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL;

const tamanosPaquete = {
  pequeno: 'Pequeño',
  mediano: 'Mediano',
  grande: 'Grande'
};

const EditarPaquetesAsignacion = ({ asignacion, actualizarAsignacion }) => {
  const [paquetes, setPaquetes] = useState([]);
  const [paquetesDisponibles, setPaquetesDisponibles] = useState([]);
  const [nuevoPaquete, setNuevoPaquete] = useState({ id: '', prioridad: 1 });

  useEffect(() => {
    console.log("EditarPaquetesAsignacion props:", asignacion);
    if (asignacion && asignacion.codigo_unico_asignacion) {
      fetchPaquetes();
    }
  }, [asignacion]);

  const fetchPaquetes = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      
      const [paquetesResponse, asignacionesResponse] = await Promise.all([
        axios.get(`${API_URL}/paquete`, config),
        axios.get(`${API_URL}/asignacionrutas`, config)
      ]);

      const allPaquetes = paquetesResponse.data.data || [];
      const asignaciones = asignacionesResponse.data.asignacionrutas.data || [];

      const paquetesAsignados = asignaciones
        .filter(a => a.codigo_unico_asignacion === asignacion.codigo_unico_asignacion)
        .map(a => ({
          ...allPaquetes.find(p => p.id === a.id_paquete),
          prioridad: a.prioridad
        }));

      const idsPaquetesAsignados = new Set(paquetesAsignados.map(p => p.id));
      const paquetesNoAsignados = allPaquetes.filter(p => !idsPaquetesAsignados.has(p.id));

      setPaquetes(paquetesAsignados);
      setPaquetesDisponibles(paquetesNoAsignados);

      console.log("Paquetes asignados:", paquetesAsignados);
      console.log("Paquetes disponibles:", paquetesNoAsignados);
    } catch (error) {
      console.error("Error al obtener paquetes:", error);
      toast.error("Error al cargar los paquetes");
    }
  };

  const handlePaqueteChange = (id, e) => {
    const { value } = e.target;
    setPaquetes(prev =>
      prev.map(paquete =>
        paquete.id === id ? { ...paquete, prioridad: Number(value) } : paquete
      )
    );
  };

  const handleNuevoPaqueteChange = (e) => {
    const { name, value } = e.target;
    setNuevoPaquete(prev => ({ ...prev, [name]: value }));
  };

  const agregarPaquete = () => {
    if (nuevoPaquete.id) {
      const paqueteToAdd = paquetesDisponibles.find(p => p.id.toString() === nuevoPaquete.id);
      if (paqueteToAdd) {
        console.log("Agregando nuevo paquete:", paqueteToAdd);
        setPaquetes([...paquetes, { ...paqueteToAdd, prioridad: nuevoPaquete.prioridad }]);
        setPaquetesDisponibles(paquetesDisponibles.filter(p => p.id.toString() !== nuevoPaquete.id));
        setNuevoPaquete({ id: '', prioridad: 1 });
      }
    }
  };

  const removerPaquete = (id) => {
    const paqueteRemovido = paquetes.find(p => p.id === id);
    setPaquetes(paquetes.filter(p => p.id !== id));
    if (paqueteRemovido) {
      setPaquetesDisponibles([...paquetesDisponibles, paqueteRemovido]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const updatedPaquetes = paquetes.map(paquete => ({
        id_paquete: paquete.id,
        prioridad: paquete.prioridad,
        codigo_unico_asignacion: asignacion.codigo_unico_asignacion
      }));
      
      const response = await axios.put(`${API_URL}/asignacionrutas/${asignacion.id}/paquetes`, {
        paquetes: updatedPaquetes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Update response:", response.data);
      toast.success("Paquetes de la asignación actualizados con éxito");
      actualizarAsignacion(response.data);
    } catch (error) {
      console.error("Error al actualizar los paquetes:", error);
      toast.error("Error al actualizar los paquetes de la asignación");
    }
  };

  const getTamanoNombre = (tamano) => {
    return tamanosPaquete[tamano] || tamano;
  };

  return (
    <Card>
      <CardBody>
        <h3>Editar Paquetes de la Asignación</h3>
        <Form onSubmit={handleSubmit}>
          <Table striped responsive className="table-centered table-nowrap mb-0">
            <thead className="thead-light">
              <tr>
                <th>ID</th>
                <th>Tipo de Paquete</th>
                <th>Tamaño</th>
                <th>Estado</th>
                <th>Prioridad</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {paquetes.map((paquete) => (
                <tr key={paquete.id}>
                  <td>{paquete.id}</td>
                  <td>{paquete.tipo_paquete}</td>
                  <td>{getTamanoNombre(paquete.tamano_paquete)}</td>
                  <td>{paquete.estado_paquete}</td>
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
          
          <h4 className="mt-4">Agregar Nuevo Paquete</h4>
          <Table striped responsive className="table-centered table-nowrap mb-0">
            <thead className="thead-light">
              <tr>
                <th>ID</th>
                <th>Tipo de Paquete</th>
                <th>Tamaño</th>
                <th>Estado</th>
                <th>Prioridad</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {paquetesDisponibles.map((paquete) => (
                <tr key={paquete.id}>
                  <td>{paquete.id}</td>
                  <td>{paquete.tipo_paquete}</td>
                  <td>{getTamanoNombre(paquete.tamano_paquete)}</td>
                  <td>{paquete.estado_paquete}</td>
                  <td>
                    <Input
                      type="number"
                      name="prioridad"
                      value={nuevoPaquete.id === paquete.id.toString() ? nuevoPaquete.prioridad : 1}
                      onChange={handleNuevoPaqueteChange}
                      min="1"
                      max="3"
                    />
                  </td>
                  <td>
                    <Button color="primary" onClick={() => {
                      setNuevoPaquete({ id: paquete.id.toString(), prioridad: 1 });
                      agregarPaquete();
                    }}>
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
};

export default EditarPaquetesAsignacion;