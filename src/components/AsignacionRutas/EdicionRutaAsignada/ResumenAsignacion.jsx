import React, { useEffect, useState } from 'react';
import { Card, CardBody, ListGroup, ListGroupItem, Spinner } from 'reactstrap';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const ESTADOS = {
  1: 'Activo',
  2: 'Inactivo',
  3: 'Pendiente',
  4: 'Cancelada'
};

const ResumenAsignacion = ({ asignacion }) => {
  const [data, setData] = useState({
    vehiculos: {},
    departamentos: [],
    municipios: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        console.log('Fetching data for asignacion:', asignacion);

        const [vehiculosRes, departamentosRes] = await Promise.all([
          axios.get(`${API_URL}/vehiculo`, { headers }),
          axios.get(`${API_URL}/dropdown/get_departamentos`, { headers }),
        ]);

        console.log('Vehiculos response:', vehiculosRes.data);
        console.log('Departamentos response:', departamentosRes.data);

        let municipiosRes = { data: { municipio: [] } };
        if (asignacion && asignacion.id_departamento) {
          console.log('Fetching municipios for departamento:', asignacion.id_departamento);
          municipiosRes = await axios.get(`${API_URL}/dropdown/get_municipio/${asignacion.id_departamento}`, { headers });
          console.log('Municipios response:', municipiosRes.data);
        } else {
          console.log('No departamento ID available, skipping municipios fetch');
        }

        const mapVehiculosToObject = (array) => 
          array.reduce((acc, item) => ({ ...acc, [item.id]: item }), {});

        const mappedData = {
          vehiculos: mapVehiculosToObject(vehiculosRes.data.data),
          departamentos: departamentosRes.data,
          municipios: municipiosRes.data.municipio || [],
        };

        console.log('Mapped data:', mappedData);

        setData(mappedData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error al obtener los datos', err);
        setError('No se pudieron cargar los datos necesarios');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [asignacion]);

  const getNombre = (id, tipo) => {
    console.log(`Getting nombre for ${tipo} with id:`, id);
    console.log(`Data for ${tipo}:`, data[tipo]);
    if (tipo === 'vehiculos') {
      return data[tipo][id] ? `${data[tipo][id].placa} - ${data[tipo][id].marca} ${data[tipo][id].modelo}` : 'N/A';
    } else {
      const item = Array.isArray(data[tipo]) ? data[tipo].find(item => item.id === id) : null;
      if (!item) {
        console.log(`No data found for ${tipo} with id:`, id);
        return 'N/A';
      }
      return item.nombre;
    }
  };

  if (isLoading) {
    return (
      <div className="text-center">
        <Spinner color="primary" />
        <p>Cargando datos...</p>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!asignacion) {
    return <div className="alert alert-info">No hay datos disponibles</div>;
  }

  console.log('Rendering with asignacion:', asignacion);
  console.log('Current data state:', data);

  return (
    <Card>
      <CardBody>
        <h2>Resumen de la Asignación</h2>
        <ListGroup>
          <ListGroupItem>
            <strong>Código de Asignación:</strong> {asignacion.codigo_unico_asignacion || 'N/A'}
          </ListGroupItem>
          <ListGroupItem>
            <strong>Vehículo:</strong> {getNombre(asignacion.id_vehiculo, 'vehiculos')}
          </ListGroupItem>
          <ListGroupItem>
            <strong>Fecha Programada:</strong> {asignacion.fecha ? new Date(asignacion.fecha).toLocaleDateString('es-ES') : 'N/A'}
          </ListGroupItem>
          <ListGroupItem>
            <strong>Estado:</strong> {ESTADOS[asignacion.id_estado] || 'N/A'}
          </ListGroupItem>
          <ListGroupItem>
            <strong>Destino:</strong> {asignacion.destino || 'N/A'}
          </ListGroupItem>
          <ListGroupItem>
            <strong>Departamento:</strong> {getNombre(asignacion.id_departamento, 'departamentos')}
          </ListGroupItem>
          <ListGroupItem>
            <strong>Municipio:</strong> {getNombre(asignacion.id_municipio, 'municipios')}
          </ListGroupItem>
          <ListGroupItem>
            <strong>Dirección:</strong> {asignacion.id_direccion || 'N/A'}
          </ListGroupItem>
          <ListGroupItem>
            <strong>Prioridad:</strong> {asignacion.prioridad || 'N/A'}
          </ListGroupItem>
          <ListGroupItem>
            <strong>Status:</strong> {asignacion.status === 1 ? 'Activo' : 'Inactivo'}
          </ListGroupItem>
        </ListGroup>
      </CardBody>
    </Card>
  );
};

export default ResumenAsignacion;