import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import '/src/styles/Empleados.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


// Función para convertir dd-mm-yyyy a yyyy-mm-dd
const formatDateForInput = (dateString) => {
  const [day, month, year] = dateString.split('-');
  return `${year}-${month}-${day}`;
};

// Función para convertir yyyy-mm-dd a dd-mm-yyyy
const formatDateFromInput = (dateString) => {
  const [year, month, day] = dateString.split('-');
  return `${day}-${month}-${year}`;
};

// Obtener el año actual
const getCurrentYear = () => new Date().getFullYear();
const currentYear = getCurrentYear();
const minDate = `${currentYear}-01-01`;
const maxDate = `${currentYear}-12-31`;

// Función para formatear el peso
const formatPeso = (value) => {
  let [integerPart, decimalPart] = value.replace(/,/g, '').split('.');

  if (integerPart.length > 3) {
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  return decimalPart !== undefined ? `${integerPart}.${decimalPart}` : integerPart;
};

// Validación del campo
const validateField = (name, value, fechaEnvio) => {
  let error = '';

  switch (name) {
    case 'tipo_paquete':
    case 'empaque':
    case 'estado_paquete':
      error = value === '' ? `Debe seleccionar un ${name.replace('_', ' ')}.` : '';
      break;
    case 'peso':
      const valueWithoutCommas = value.replace(/,/g, '');
      const pesoPattern = /^\d+(\.\d{1,2})?$/;
      const isNegative = parseFloat(valueWithoutCommas) < 0;
      const isZeroOrEmpty = parseFloat(valueWithoutCommas) <= 0 || isNaN(parseFloat(valueWithoutCommas));

      if (isNegative) {
        error = 'El peso no puede ser negativo.';
      } else if (!pesoPattern.test(valueWithoutCommas)) {
        error = 'Formato de peso inválido. Ejemplo válido: 1234.56';
      } else if (isZeroOrEmpty) {
        error = 'El peso debe ser mayor que cero.';
      }
      break;
    case 'fecha_envio':
      error = value === '' || new Date(value) > new Date() ? 'La fecha de envío es obligatoria y no puede ser futura.' : '';
      break;
    case 'fecha_entrega_estimada':
      error = value === '' || new Date(value) < new Date(fechaEnvio) ? 'La fecha de entrega estimada es obligatoria y no puede ser anterior a la fecha de envío.' : '';
      break;
    case 'descripcion_contenido':
      error = value.trim() === '' ? 'La descripción es obligatoria.' : '';
      break;
    default:
      break;
  }

  return error;
};

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
    tipo_paquete: '',
    empaque: '',
    estado_paquete: '',
    peso: '',
    fecha_envio: '',
    fecha_entrega_estimada: '',
    descripcion_contenido: ''
  });

  useEffect(() => {
    if (paqueteEditado) {
      //console.log('Paquete editado en modal:', paqueteEditado);
    }
  }, [paqueteEditado]);

  const handleFechaChange = (e, field) => {
    if (!paqueteEditado) return;
    const fechaInput = e.target.value;
    setPaqueteEditado(prevState => ({
      ...prevState,
      [field]: formatDateFromInput(fechaInput)
    }));
    setFormErrors(prevErrors => ({
      ...prevErrors,
      [field]: fechaInput === '' ? 'La fecha es obligatoria.' : ''
    }));
  };

  const handlePesoChange = (e) => {
    const { value } = e.target;
    const validChars = value.replace(/[^0-9.,]/g, '');
    let [integerPart, decimalPart] = validChars.split('.');
    
    integerPart = integerPart.slice(0, 7);
    
    if (decimalPart) {
      decimalPart = decimalPart.slice(0, 2);
    }

    const formattedPeso = formatPeso(integerPart + (decimalPart !== undefined ? '.' + decimalPart : ''));

    setPaqueteEditado(prev => ({
      ...prev,
      peso: formattedPeso
    }));

    const error = validateField('peso', formattedPeso);
    setFormErrors(prev => ({
      ...prev,
      peso: error
    }));
  };

  const handleChange = (e, field) => {
    if (!paqueteEditado) return;
    const { value } = e.target;
    setPaqueteEditado(prevState => ({
      ...prevState,
      [field]: value
    }));
    const error = validateField(field, value, paqueteEditado.fecha_envio);
    setFormErrors(prevErrors => ({
      ...prevErrors,
      [field]: error
    }));
  };

  const handleSelectChange = (e, field) => {
    if (!paqueteEditado) return;
    const value = e.target.value;
    setPaqueteEditado(prevState => ({
      ...prevState,
      [field]: value
    }));
    const error = validateField(field, value, paqueteEditado.fecha_envio);
    setFormErrors(prevErrors => ({
      ...prevErrors,
      [field]: error
    }));
  };

  const handleGuardarCambios = async () => {
    //console.log('handleGuardarCambios llamado'); 
  
    if (!paqueteEditado) return;
  
    const camposValidos = Object.keys(formErrors).every(field => formErrors[field] === '');
    //console.log('Errores en formulario:', formErrors); 
  
    if (!camposValidos) {
      toast.error('Por favor, corrige los errores en el formulario.', {
        position: 'top-right',
        autoClose: 500,
      });
      return;
    }
  
    try {
      const paqueteAEnviar = {
      id: paqueteEditado.id, 
      id_tipo_paquete: tiposPaquete.find(tipo => tipo.nombre === paqueteEditado.tipo_paquete)?.id,
      id_empaque: empaques.find(empaque => empaque.empaquetado === paqueteEditado.empaque)?.id,
      id_estado_paquete: estadosPaquete.find(estado => estado.nombre === paqueteEditado.estado_paquete)?.id,
      peso: paqueteEditado.peso,
      fecha_envio: formatDateForInput(paqueteEditado.fecha_envio),
      fecha_entrega_estimada: formatDateForInput(paqueteEditado.fecha_entrega_estimada),
      descripcion_contenido: paqueteEditado.descripcion_contenido
    };

  
      //console.log('Paquete a enviar:', paqueteAEnviar); 
  
      await guardarCambiosPaquete(paqueteAEnviar);
   
      setModalEditar(false);
    } catch (error) {
      console.error('Error al guardar los cambios del paquete:', error);
      toast.error('Hubo un error al guardar los cambios. Intenta nuevamente.', {
        position: 'top-right',
        autoClose: 500,
      });
    }
  };
  

  const getFormattedDate = (date) => date ? formatDateForInput(date) : '';

  return (
    <>
      <Modal show={modalEditar} onHide={() => setModalEditar(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Editar Paquete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group controlId="tipo_paquete">
                  <Form.Label>Tipo de Paquete</Form.Label>
                  <Form.Control
                    as="select"
                    value={paqueteEditado?.tipo_paquete || ''}
                    onChange={(e) => handleSelectChange(e, 'tipo_paquete')}
                  >
                    <option value="">Selecciona un tipo</option>
                    {tiposPaquete.map(tipo => (
                      <option key={tipo.id} value={tipo.nombre}>{tipo.nombre}</option>
                    ))}
                  </Form.Control>
                  <Form.Text className="text-danger">{formErrors.tipo_paquete}</Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="empaque">
                  <Form.Label>Empaque</Form.Label>
                  <Form.Control
                    as="select"
                    value={paqueteEditado?.empaque || ''}
                    onChange={(e) => handleSelectChange(e, 'empaque')}
                  >
                    <option value="">Selecciona un empaque</option>
                    {empaques.map(empaque => (
                      <option key={empaque.id} value={empaque.empaquetado}>{empaque.empaquetado}</option>
                    ))}
                  </Form.Control>
                  <Form.Text className="text-danger">{formErrors.empaque}</Form.Text>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group controlId="estado_paquete">
                  <Form.Label>Estado del Paquete</Form.Label>
                  <Form.Control
                    as="select"
                    value={paqueteEditado?.estado_paquete || ''}
                    onChange={(e) => handleSelectChange(e, 'estado_paquete')}
                  >
                    <option value="">Selecciona un estado</option>
                    {estadosPaquete.map(estado => (
                      <option key={estado.id} value={estado.nombre}>{estado.nombre}</option>
                    ))}
                  </Form.Control>
                  <Form.Text className="text-danger">{formErrors.estado_paquete}</Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="peso">
                  <Form.Label>Peso</Form.Label>
                  <Form.Control
                    type="text"
                    value={paqueteEditado?.peso || ''}
                    onChange={handlePesoChange}
                  />
                  <Form.Text className="text-danger">{formErrors.peso}</Form.Text>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group controlId="fecha_envio">
                  <Form.Label>Fecha de Envío</Form.Label>
                  <Form.Control
                    type="date"
                    value={getFormattedDate(paqueteEditado?.fecha_envio) || ''}
                    onChange={(e) => handleFechaChange(e, 'fecha_envio')}
                    min={minDate}
                    max={maxDate}
                  />
                  <Form.Text className="text-danger">{formErrors.fecha_envio}</Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="fecha_entrega_estimada">
                  <Form.Label>Fecha de Entrega Estimada</Form.Label>
                  <Form.Control
                    type="date"
                    value={getFormattedDate(paqueteEditado?.fecha_entrega_estimada) || ''}
                    onChange={(e) => handleFechaChange(e, 'fecha_entrega_estimada')}
                    min={paqueteEditado?.fecha_envio ? formatDateForInput(paqueteEditado.fecha_envio) : minDate}
                    max={maxDate}
                  />
                  <Form.Text className="text-danger">{formErrors.fecha_entrega_estimada}</Form.Text>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group controlId="descripcion_contenido">
              <Form.Label>Descripción del Contenido</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={paqueteEditado?.descripcion_contenido || ''}
                onChange={(e) => handleChange(e, 'descripcion_contenido')}
              />
              <Form.Text className="text-danger">{formErrors.descripcion_contenido}</Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalEditar(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleGuardarCambios}>
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>
      <ToastContainer />
    </>
  );
};

export default ModalEditarPaquete;
