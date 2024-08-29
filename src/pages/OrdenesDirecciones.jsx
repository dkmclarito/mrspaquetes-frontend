import React, { useState, useEffect } from 'react';
import { Container, Card, CardBody, Row, Col, Button, Table, Input, Label, FormGroup } from 'reactstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Breadcrumbs from '../components/Empleados/Common/Breadcrumbs';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export default function OrdenesDirecciones() {
  const { idCliente } = useParams();
  const [direcciones, setDirecciones] = useState([]);
  const [nuevaDireccion, setNuevaDireccion] = useState({
    direccion: "",
    referencia: "",
    id_departamento: "",
    id_municipio: "",
    nombre_contacto: "",
    telefono: "",
  });
  const [departamentos, setDepartamentos] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [selectedDireccion, setSelectedDireccion] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [cliente, setCliente] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const fetchDirecciones = async () => {
    try {
      const response = await axios.get(`${API_URL}/direcciones`, {
        params: { id_cliente: idCliente },
        headers: { Authorization: `Bearer ${token}` },
      });
      const direccionesData = response.data.direcciones || [];
      const direccionesWithDetails = await Promise.all(
        direccionesData.map(async (direccion) => {
          const municipiosResponse = await axios.get(`${API_URL}/dropdown/get_municipio/${direccion.id_departamento}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const municipio = municipiosResponse.data.municipio.find(m => m.id === direccion.id_municipio);
          const departamento = departamentos.find(d => d.id === direccion.id_departamento);
          return {
            ...direccion,
            departamento_nombre: departamento ? departamento.nombre : 'No disponible',
            municipio_nombre: municipio ? municipio.nombre : 'No disponible',
          };
        })
      );
      setDirecciones(direccionesWithDetails);
    } catch (error) {
      console.error('Error fetching direcciones:', error);
      toast.error(`Error al cargar las direcciones: ${error.message}`);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [responseCliente, responseDepartamentos] = await Promise.all([
          axios.get(`${API_URL}/clientes/${idCliente}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/dropdown/get_departamentos`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        setCliente(responseCliente.data.cliente || {});
        setDepartamentos(responseDepartamentos.data || []);

        await fetchDirecciones();
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error(`Error al cargar los datos: ${error.message}`);
      }
    };

    fetchData();
  }, [idCliente, token]);

  useEffect(() => {
    const fetchMunicipios = async () => {
      if (nuevaDireccion.id_departamento) {
        try {
          const response = await axios.get(`${API_URL}/dropdown/get_municipio/${nuevaDireccion.id_departamento}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setMunicipios(response.data.municipio || []);
        } catch (error) {
          console.error('Error fetching municipios:', error);
          toast.error(`Error al cargar municipios: ${error.message}`);
        }
      } else {
        setMunicipios([]);
      }
    };

    fetchMunicipios();
  }, [nuevaDireccion.id_departamento, token]);

  const handleAgregarDireccion = async () => {
    const { direccion, referencia, id_departamento, id_municipio, nombre_contacto, telefono } = nuevaDireccion;

    if (direccion.trim() && id_departamento && id_municipio && nombre_contacto && telefono) {
      try {
        const dataToSend = { 
          id_cliente: Number(idCliente), 
          direccion,
          referencia,
          id_departamento: Number(id_departamento),
          id_municipio: Number(id_municipio),
          nombre_contacto,
          telefono
        };

        await axios.post(`${API_URL}/direcciones`, dataToSend, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        toast.success('Dirección agregada exitosamente');
        
        setNuevaDireccion({
          direccion: "",
          referencia: "",
          id_departamento: "",
          id_municipio: "",
          nombre_contacto: "",
          telefono: "",
        });
        setIsAdding(false);

        await fetchDirecciones();
      } catch (error) {
        console.error('Error adding new address:', error);
        toast.error(`Error al agregar la dirección: ${error.response?.data?.message || error.message || 'Error desconocido'}`);
      }
    } else {
      toast.warn('Todos los campos son requeridos');
    }
  };

  const handleSeleccionarDireccion = (direccion) => {
    setSelectedDireccion(direccion);
  };

  const handleContinuar = () => {
    if (selectedDireccion) {
      localStorage.setItem('selectedAddress', JSON.stringify(selectedDireccion));
      localStorage.setItem('clienteData', JSON.stringify(cliente));
      navigate(`/DatosPaquete/${idCliente}`);
    } else {
      toast.warn('Por favor, seleccione una dirección antes de continuar');
    }
  };

  return (
    <Container fluid>
      <Breadcrumbs 
        title="Generando Orden" 
        breadcrumbItem="Seleccionar Dirección" 
      />
      <Card>
        <CardBody>
          <Row>
            <Col lg={12}>
              <h4>Seleccionar Dirección de Entrega</h4>
              {cliente ? (
                <h5>Cliente: {cliente.nombre} {cliente.apellido}</h5>
              ) : (
                <h5>Cargando información del cliente...</h5>
              )}
              <Button 
                color="primary" 
                onClick={() => setIsAdding(!isAdding)} 
                style={{ marginBottom: '10px' }}
                aria-expanded={isAdding}
              >
                {isAdding ? 'Cancelar Agregar Dirección' : 'Agregar Nueva Dirección'}
              </Button>
              {isAdding && (
                <div style={{ marginBottom: '10px' }}>
                  <FormGroup>
                    <Label for="direccion">Dirección:</Label>
                    <Input
                      type="text"
                      id="direccion"
                      value={nuevaDireccion.direccion}
                      onChange={(e) => setNuevaDireccion(prev => ({ ...prev, direccion: e.target.value }))}
                      placeholder="Ingrese la dirección"
                      aria-label="Dirección"
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label for="referencia">Referencia:</Label>
                    <Input
                      type="text"
                      id="referencia"
                      value={nuevaDireccion.referencia}
                      onChange={(e) => setNuevaDireccion(prev => ({ ...prev, referencia: e.target.value }))}
                      placeholder="Ingrese una referencia (opcional)"
                      aria-label="Referencia"
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label for="departamento">Departamento:</Label>
                    <Input
                      type="select"
                      id="departamento"
                      value={nuevaDireccion.id_departamento}
                      onChange={(e) => setNuevaDireccion(prev => ({ 
                        ...prev, 
                        id_departamento: e.target.value,
                        id_municipio: ""
                      }))}
                      aria-label="Seleccione un departamento"
                    >
                      <option value="">Seleccione un departamento</option>
                      {departamentos.map(departamento => (
                        <option key={departamento.id} value={departamento.id}>
                          {departamento.nombre}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                  <FormGroup>
                    <Label for="municipio">Municipio:</Label>
                    <Input
                      type="select"
                      id="municipio"
                      value={nuevaDireccion.id_municipio}
                      onChange={(e) => setNuevaDireccion(prev => ({ ...prev, id_municipio: e.target.value }))}
                      disabled={!nuevaDireccion.id_departamento}
                      aria-label="Seleccione un municipio"
                    >
                      <option value="">Seleccione un municipio</option>
                      {municipios.map(municipio => (
                        <option key={municipio.id} value={municipio.id}>
                          {municipio.nombre}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                  <FormGroup>
                    <Label for="nombre_contacto">Nombre de Contacto:</Label>
                    <Input
                      type="text"
                      id="nombre_contacto"
                      value={nuevaDireccion.nombre_contacto}
                      onChange={(e) => setNuevaDireccion(prev => ({ ...prev, nombre_contacto: e.target.value }))}
                      placeholder="Ingrese el nombre de contacto"
                      aria-label="Nombre de Contacto"
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label for="telefono">Teléfono:</Label>
                    <Input
                      type="text"
                      id="telefono"
                      value={nuevaDireccion.telefono}
                      onChange={(e) => setNuevaDireccion(prev => ({ ...prev, telefono: e.target.value }))}
                      placeholder="Ingrese el teléfono"
                      aria-label="Teléfono"
                    />
                  </FormGroup>
                  <Button 
                    color="success" 
                    onClick={handleAgregarDireccion} 
                    style={{ marginTop: '10px' }}
                  >
                    Agregar
                  </Button>
                </div>
              )}
              <Table responsive>
                <thead>
                  <tr>
                    <th>Dirección</th>
                    <th>Referencia</th>
                    <th>Departamento</th>
                    <th>Municipio</th>
                    <th>Nombre de Contacto</th>
                    <th>Teléfono</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {direcciones.length > 0 ? (
                    direcciones.map((direccion, index) => (
                      <tr key={index}>
                        <td>{direccion.direccion || 'Dirección no disponible'}</td>
                        <td>{direccion.referencia || 'N/A'}</td>
                        <td>{direccion.departamento_nombre || 'No disponible'}</td>
                        <td>{direccion.municipio_nombre || 'No disponible'}</td>
                        <td>{direccion.nombre_contacto || 'No disponible'}</td>
                        <td>{direccion.telefono || 'No disponible'}</td>
                        <td>
                          <Button
                            color={selectedDireccion === direccion ? "success" : "primary"}
                            onClick={() => handleSeleccionarDireccion(direccion)}
                            aria-pressed={selectedDireccion === direccion}
                          >
                            {selectedDireccion === direccion ? "Seleccionada" : "Seleccionar"}
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center">No hay direcciones disponibles</td>
                    </tr>
                  )}
                </tbody>
              </Table>
              {selectedDireccion && (
                <div>
                  <h5>Dirección Seleccionada:</h5>
                  <p>{selectedDireccion.direccion || 'Dirección no disponible'}</p>
                  <Button color="success" onClick={handleContinuar}>
                    Continuar con la Orden
                  </Button>
                </div>
              )}
            </Col>
          </Row>
        </CardBody>
      </Card>
    </Container>
  );
}