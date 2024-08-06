import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import "/src/styles/Empleados.css";
import { toast } from 'react-toastify';

const getCurrentDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return { year, month, day };
};

const { year: currentYear, month: currentMonth, day: currentDay } = getCurrentDate();

const ModalEditarPaquete = ({
  modalEditar,
  paqueteEditado,
  setPaqueteEditado,
  guardarCambiosPaquete,
  setModalEditar,
  tiposPaquete = [],
  empaques = [],
  estadosPaquete = []
}) => {
  const [formErrors, setFormErrors] = useState({
    tipo: '',
    empaque: '',
    estado: '',
    peso: '',
    fechaEnvio: '',
    fechaEntrega: '',
    descripcion: ''
  });

  useEffect(() => {
    console.log('Paquete editado en modal:', paqueteEditado);
  }, [paqueteEditado]);

  useEffect(() => {
    setPaqueteEditado(prev => ({
      ...prev,
      fecha_envio: `${currentYear}-${currentMonth}-${currentDay}`,
      fecha_entrega_estimada: `${currentYear}-${currentMonth}-${currentDay}`
    }));
  }, [currentDay, currentMonth, currentYear]);

  const formatoFecha = (fecha) => {
    if (!fecha) return '';
    const [year, month, day] = fecha.split('-');
    return `${day}-${month}-${year}`;
  };

  const convertirFechaParaInput = (fecha) => {
    if (!fecha) return '';
    const [day, month, year] = fecha.split('-');
    return `${year}-${month}-${day}`;
  };

  const handleFechaChange = (e, field) => {
    const fecha = e.target.value;
    let error = '';

    if (!fecha) {
      error = 'La fecha es obligatoria.';
    } else {
      const [year, month, day] = fecha.split('-').map(Number);
      if (month < 1 || month > 12) {
        error = 'El mes debe estar entre 1 y 12.';
      } else if (day < 1 || day > 31) {
        error = 'El día debe estar entre 1 y 31.';
      } else if (field === 'fecha_envio' && new Date(fecha) > new Date()) {
        error = 'La fecha de envío no puede ser futura.';
      } else if (field === 'fecha_entrega_estimada' && new Date(fecha) < new Date(paqueteEditado.fecha_envio)) {
        error = 'La fecha de entrega estimada no puede ser anterior a la fecha de envío.';
      }
    }

    setPaqueteEditado(prevState => ({
      ...prevState,
      [field]: fecha
    }));
    setFormErrors(prevErrors => ({
      ...prevErrors,
      [field]: error
    }));
  };

  const handleChange = (e, field) => {
    const { value } = e.target;
    setPaqueteEditado(prevState => ({
      ...prevState,
      [field]: value
    }));
    setFormErrors(prevErrors => ({
      ...prevErrors,
      [field]: value === '' ? `El campo ${field} es obligatorio.` : ''
    }));
  };

  const handleSelectChange = (e, field) => {
    const value = e.target.value;
    setPaqueteEditado(prevState => ({
      ...prevState,
      [field]: value
    }));
    setFormErrors(prevErrors => ({
      ...prevErrors,
      [field]: value === '' ? `Debe seleccionar un ${field}.` : ''
    }));
  };

  const handleGuardarCambios = () => {
    const pesoValido = paqueteEditado.peso && !isNaN(paqueteEditado.peso);
    const fechaEnvioValida = paqueteEditado.fecha_envio && new Date(paqueteEditado.fecha_envio) <= new Date();
    const fechaEntregaValida = paqueteEditado.fecha_entrega_estimada && new Date(paqueteEditado.fecha_entrega_estimada) >= new Date(paqueteEditado.fecha_envio);
    const descripcionValida = paqueteEditado.descripcion_contenido && paqueteEditado.descripcion_contenido.length > 0;

    setFormErrors({
      peso: pesoValido ? '' : 'El peso es obligatorio y debe ser un número.',
      fechaEnvio: fechaEnvioValida ? '' : 'La fecha de envío es obligatoria y no puede ser futura.',
      fechaEntrega: fechaEntregaValida ? '' : 'La fecha de entrega estimada es obligatoria y no puede ser anterior a la fecha de envío.',
      descripcion: descripcionValida ? '' : 'La descripción es obligatoria.'
    });

    const camposValidos = pesoValido && fechaEnvioValida && fechaEntregaValida && descripcionValida;

    if (!camposValidos) return;

    const paqueteAEnviar = {
      ...paqueteEditado,
      fecha_envio: convertirFechaParaInput(paqueteEditado.fecha_envio),
      fecha_entrega_estimada: convertirFechaParaInput(paqueteEditado.fecha_entrega_estimada)
    };

    guardarCambiosPaquete(paqueteAEnviar);
    toast.success('Cambios guardados con éxito.');
    setModalEditar(false);
  };

  return (
    <Modal show={modalEditar} onHide={() => setModalEditar(false)} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Editar Paquete</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <Col md={6}>
              <Form.Group controlId="tipo">
                <Form.Label>Tipo de Paquete</Form.Label>
                <Form.Control
                  as="select"
                  value={paqueteEditado ? tiposPaquete.find(tipo => tipo.nombre === paqueteEditado.tipo_paquete)?.id || '' : ''}
                  onChange={(e) => handleSelectChange(e, 'id_tipo_paquete')}
                  isInvalid={!!formErrors.tipo}
                >
                  <option value="">Seleccionar Tipo</option>
                  {tiposPaquete.map(tipo => (
                    <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                  ))}
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                  {formErrors.tipo}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="empaque">
                <Form.Label>Empaque</Form.Label>
                <Form.Control
                  as="select"
                  value={paqueteEditado ? empaques.find(empaque => empaque.empaquetado === paqueteEditado.empaque)?.id || '' : ''}
                  onChange={(e) => handleSelectChange(e, 'id_empaque')}
                  isInvalid={!!formErrors.empaque}
                >
                  <option value="">Seleccionar Empaque</option>
                  {empaques.map(empaque => (
                    <option key={empaque.id} value={empaque.id}>{empaque.empaquetado}</option>
                  ))}
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                  {formErrors.empaque}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group controlId="estado">
                <Form.Label>Estado</Form.Label>
                <Form.Control
                  as="select"
                  value={paqueteEditado ? estadosPaquete.find(estado => estado.nombre === paqueteEditado.estado_paquete)?.id || '' : ''}
                  onChange={(e) => handleSelectChange(e, 'id_estado_paquete')}
                  isInvalid={!!formErrors.estado}
                >
                  <option value="">Seleccionar Estado</option>
                  {estadosPaquete.map(estado => (
                    <option key={estado.id} value={estado.id}>{estado.nombre}</option>
                  ))}
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                  {formErrors.estado}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="peso">
                <Form.Label>Peso (Libras)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={paqueteEditado ? paqueteEditado.peso || '' : ''}
                  onChange={(e) => handleChange(e, 'peso')}
                  isInvalid={!!formErrors.peso}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.peso}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group controlId="fechaEnvio">
                <Form.Label>Fecha de Envío</Form.Label>
                <Form.Control
                  type="date"
                  value={paqueteEditado ? convertirFechaParaInput(paqueteEditado.fecha_envio) : ''}
                  onChange={(e) => handleFechaChange(e, 'fecha_envio')}
                  isInvalid={!!formErrors.fechaEnvio}
                  min={`${currentYear}-01-01`}
                  max={`${currentYear}-12-31`}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.fechaEnvio}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="fechaEntrega">
                <Form.Label>Fecha de Entrega Estimada</Form.Label>
                <Form.Control
                  type="date"
                  value={paqueteEditado ? convertirFechaParaInput(paqueteEditado.fecha_entrega_estimada) : ''}
                  onChange={(e) => handleFechaChange(e, 'fecha_entrega_estimada')}
                  isInvalid={!!formErrors.fechaEntrega}
                  min={`${currentYear}-01-01`}
                  max={`${currentYear}-12-31`}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.fechaEntrega}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Form.Group controlId="descripcion">
                <Form.Label>Descripción del Contenido</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={paqueteEditado ? paqueteEditado.descripcion_contenido || '' : ''}
                  onChange={(e) => handleChange(e, 'descripcion_contenido')}
                  isInvalid={!!formErrors.descripcion}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.descripcion}
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

export default ModalEditarPaquete;


