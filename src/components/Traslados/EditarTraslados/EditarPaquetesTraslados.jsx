import React, { useState, useEffect } from 'react';
import { Card, CardBody, Form, FormGroup, Label, Input, Table, Button, Row, Col } from 'reactstrap';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import Pagination from 'react-js-pagination';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 10;

export default function EditarPaquetesTraslados() {
  const [traslado, setTraslado] = useState(null);
  const [nuevoPaqueteUUID, setNuevoPaqueteUUID] = useState('');
  const [nuevosPaquetes, setNuevosPaquetes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTraslado();
  }, [id]);

  const fetchTraslado = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/traslados/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Traslado data fetched:", response.data);
      setTraslado(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar el traslado:", error);
      setError("Error al cargar los datos del traslado");
      setLoading(false);
      toast.error("Error al cargar los datos del traslado");
    }
  };

  const handleAgregarPaquete = () => {
    if (!nuevoPaqueteUUID.trim()) {
      toast.error("Por favor, ingrese un UUID de paquete válido");
      return;
    }

    if (traslado.paquetes.some(p => p.uuid === nuevoPaqueteUUID) || 
        nuevosPaquetes.some(p => p.uuid === nuevoPaqueteUUID)) {
      toast.error("Este paquete ya está en el traslado");
      return;
    }

    const newPaquete = { uuid: nuevoPaqueteUUID };
    setNuevosPaquetes(prev => [...prev, newPaquete]);
    setNuevoPaqueteUUID('');
    toast.success("Paquete agregado a la lista");
  };

  const handleActualizarTraslado = async () => {
    try {
      const token = localStorage.getItem("token");
      const nuevosUUIDs = nuevosPaquetes.map(paquete => paquete.uuid);
      
      console.log("Datos enviados a la API:", { codigos_qr: nuevosUUIDs });
      
      const response = await axios.put(`${API_URL}/traslados/${id}`, 
        { codigos_qr: nuevosUUIDs },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log("Respuesta de la API:", response.data);
      
      toast.success("Traslado actualizado con éxito", {
        onClose: () => {
          navigate('/GestionTraslados');
        }
      });
    } catch (error) {
      console.error("Error al actualizar el traslado:", error.response?.data || error);
      toast.error("Error al actualizar el traslado: " + (error.response?.data?.message || error.message));
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleExit = () => {
    navigate('/GestionTraslados');
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!traslado) return <div>No se encontró el traslado</div>;

  const allPaquetes = [...traslado.paquetes, ...nuevosPaquetes];
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentPaquetes = allPaquetes.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <Card>
      <CardBody>
        <h3>Editar Paquetes del Traslado</h3>
        <Form>
          <Row>
            <Col md={6}>
              <FormGroup>
                <Label>Número de Traslado</Label>
                <Input type="text" value={traslado.numero_traslado} disabled />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label>Estado</Label>
                <Input type="text" value={traslado.estado} disabled />
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col md={4}>
              <FormGroup>
                <Label>Bodega de Origen</Label>
                <Input type="text" value={traslado.bodega_origen} disabled />
              </FormGroup>
            </Col>
            <Col md={4}>
              <FormGroup>
                <Label>Bodega de Destino</Label>
                <Input type="text" value={traslado.bodega_destino} disabled />
              </FormGroup>
            </Col>
            <Col md={4}>
              <FormGroup>
                <Label>Fecha de Traslado</Label>
                <Input type="text" value={traslado.fecha_traslado} disabled />
              </FormGroup>
            </Col>
          </Row>
        </Form>

        <h4 className="mt-4">Paquetes Asignados</h4>
        <Table striped responsive>
          <thead>
            <tr>
              <th>UUID</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {currentPaquetes.map((paquete, index) => (
              <tr key={paquete.uuid || index}>
                <td>{paquete.uuid}</td>
                <td>{nuevosPaquetes.includes(paquete) ? 'Nuevo' : 'Existente'}</td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Row>
          <Col lg={12} style={{ marginTop: "20px", display: 'flex', justifyContent: 'center' }}>
            <Pagination
              activePage={currentPage}
              itemsCountPerPage={ITEMS_PER_PAGE}
              totalItemsCount={allPaquetes.length}
              pageRangeDisplayed={5}
              onChange={handlePageChange}
              itemClass="page-item"
              linkClass="page-link"
              innerClass="pagination"
            />
          </Col>
        </Row>
        <h4 className="mt-4">Agregar Nuevo Paquete</h4>
        <FormGroup>
          <Label for="nuevoPaqueteUUID">UUID del Paquete</Label>
          <Row className="align-items-end">
            <Col md={8}>
              <Input
                type="text"
                name="nuevoPaqueteUUID"
                id="nuevoPaqueteUUID"
                value={nuevoPaqueteUUID}
                onChange={(e) => setNuevoPaqueteUUID(e.target.value)}
                placeholder="Ingrese el UUID del paquete"
              />
            </Col>
            <Col md={4}>
              <Button 
                color="primary" 
                onClick={handleAgregarPaquete} 
                className="w-100"
              >
                Agregar Paquete
              </Button>
            </Col>
          </Row>
        </FormGroup>
        <Col md="12" className="mt-4">
        <Button color="primary" onClick={handleActualizarTraslado}>
            Actualizar Traslado
          </Button>
          <Button className="ms-2 btn-custom-red" onClick={handleExit}>
            Salir
         </Button>
        </Col>
      </CardBody>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Card>
  );
}