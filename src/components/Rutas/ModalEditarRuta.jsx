import React, { useState, useEffect, useCallback } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { toast } from 'react-toastify';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const ModalEditarRuta = ({
  modalEditar,
  rutaEditada,
  setRutaEditada,
  guardarCambiosRuta,
  setModalEditar,
  destinos,
  bodegas,
}) => {
  const [localRutaEditada, setLocalRutaEditada] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [existingRoutes, setExistingRoutes] = useState([]);

  const token = localStorage.getItem('token') || '';

  useEffect(() => {
    if (rutaEditada) {
      setLocalRutaEditada({
        id: rutaEditada.id,
        nombre: rutaEditada.nombre,
        id_destino: destinos.find(dest => dest.nombre === rutaEditada.destino)?.id || '',
        id_bodega: bodegas.find(bod => bod.nombre === rutaEditada.bodega)?.id || '',
        estado: rutaEditada.estado === 'Activo' ? '1' : '0',
        fecha_programada: formatDateForInput(rutaEditada.fecha_programada)
      });
    }
  }, [rutaEditada, destinos, bodegas]);

  useEffect(() => {
    const fetchExistingRoutes = async () => {
      try {
        let allRoutes = [];
        let page = 1;
        let totalPages;

        do {
          const response = await axios.get(`${API_URL}/rutas?page=${page}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          allRoutes = allRoutes.concat(response.data.data || []);
          totalPages = response.data.last_page;
          page++;
        } while (page <= totalPages);

        setExistingRoutes(allRoutes);
      } catch (error) {
        console.error("Error al obtener rutas existentes:", error);
        toast.error("Error al cargar las rutas existentes");
      }
    };

    fetchExistingRoutes();
  }, [token]);

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalRutaEditada(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'nombre':
        error = value.trim() === '' ? 'El nombre es requerido' : '';
        break;
      case 'id_destino':
        error = value === '' ? 'Debe seleccionar un destino' : '';
        break;
      case 'id_bodega':
        error = value === '' ? 'Debe seleccionar una bodega' : '';
        break;
      case 'estado':
        error = value === '' ? 'Debe seleccionar un estado' : '';
        break;
      case 'fecha_programada':
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        const [year, month, day] = value.split('-').map(Number);
        const programmedDate = new Date(year, month - 1, day);
        
        if (programmedDate < currentDate) {
          error = "La fecha programada no puede ser menor a la fecha actual";
        } else if (year > currentDate.getFullYear()) {
          error = "El año no puede ser mayor al año actual";
        } else if (year.toString().length !== 4) {
          error = "El año debe tener exactamente 4 dígitos";
        } else if (month > 12) {
          error = "El mes no puede ser mayor a 12";
        } else if (day > 31) {
          error = "El día no puede ser mayor a 31";
        }
        break;
      default:
        break;
    }
    setFormErrors(prev => ({ ...prev, [name]: error }));
  };

  const checkRouteNameExists = useCallback((name) => {
    return existingRoutes.some(route => 
      route.nombre.toLowerCase() === name.toLowerCase() && route.id !== localRutaEditada.id
    );
  }, [existingRoutes, localRutaEditada.id]);

  const handleGuardarCambios = async () => {
    const newErrors = {};
    Object.keys(localRutaEditada).forEach(key => validateField(key, localRutaEditada[key]));
    
    if (checkRouteNameExists(localRutaEditada.nombre)) {
      newErrors.nombre = "Ya existe una ruta con este nombre";
    }

    if (Object.values(newErrors).some(error => error !== '')) {
      setFormErrors(newErrors);
      return;
    }

    const dataToSend = {
      ...localRutaEditada,
      estado: localRutaEditada.estado === '1' ? 1 : 0,
    };

    try {
      await guardarCambiosRuta(dataToSend);
      setModalEditar(false);
      toast.success("Cambios guardados con éxito");
    } catch (error) {
      console.error("Error al guardar cambios:", error);
      toast.error("Error al guardar los cambios");
    }
  };

  if (!localRutaEditada) return null;

  return (
    <Modal show={modalEditar} onHide={() => setModalEditar(false)} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Editar Ruta</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <Col md={6}>
              <Form.Group controlId="nombre">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={localRutaEditada.nombre || ""}
                  onChange={handleChange}
                  isInvalid={!!formErrors.nombre}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.nombre}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="id_destino">
                <Form.Label>Destino</Form.Label>
                <Form.Control
                  as="select"
                  name="id_destino"
                  value={localRutaEditada.id_destino || ""}
                  onChange={handleChange}
                  isInvalid={!!formErrors.id_destino}
                >
                  <option value="">Seleccione un destino</option>
                  {destinos.map(dest => (
                    <option key={dest.id} value={dest.id}>
                      {dest.nombre}
                    </option>
                  ))}
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                  {formErrors.id_destino}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group controlId="id_bodega">
                <Form.Label>Bodega</Form.Label>
                <Form.Control
                  as="select"
                  name="id_bodega"
                  value={localRutaEditada.id_bodega || ""}
                  onChange={handleChange}
                  isInvalid={!!formErrors.id_bodega}
                >
                  <option value="">Seleccione una bodega</option>
                  {bodegas.map(bod => (
                    <option key={bod.id} value={bod.id}>
                      {bod.nombre}
                    </option>
                  ))}
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                  {formErrors.id_bodega}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="estado">
                <Form.Label>Estado</Form.Label>
                <Form.Control
                  as="select"
                  name="estado"
                  value={localRutaEditada.estado || ""}
                  onChange={handleChange}
                  isInvalid={!!formErrors.estado}
                >
                  <option value="">Seleccione un estado</option>
                  <option value="1">Activo</option>
                  <option value="0">Inactivo</option>
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                  {formErrors.estado}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group controlId="fecha_programada">
                <Form.Label>Fecha Programada</Form.Label>
                <Form.Control
                  type="date"
                  name="fecha_programada"
                  value={localRutaEditada.fecha_programada || ""}
                  onChange={handleChange}
                  isInvalid={!!formErrors.fecha_programada}
                  min={new Date().toISOString().split('T')[0]}
                  max={`${new Date().getFullYear()}-12-31`}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.fecha_programada}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setModalEditar(false)}>Cerrar</Button>
        <Button variant="primary" onClick={handleGuardarCambios}>Guardar Cambios</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEditarRuta;