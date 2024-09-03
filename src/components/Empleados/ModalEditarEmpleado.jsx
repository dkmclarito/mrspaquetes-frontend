import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import "/src/styles/Empleados.css";
import { toast } from 'react-toastify';

const ModalEditarEmpleado = ({
  modalEditar,
  empleadoEditado,
  setEmpleadoEditado,
  guardarCambiosEmpleado,
  setModalEditar,
  cargos = [],
  estados = [],
  departamentos = [],
  municipios = [], 
  setDepartamentoSeleccionado,
}) => {
  const [formErrors, setFormErrors] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    cargo: '',
    estado: '',
    departamento: '',
    municipio: '',
    direccion: ''
  });

  useEffect(() => {
    if (empleadoEditado) {
      setDepartamentoSeleccionado(empleadoEditado.id_departamento);
      const formattedTelefono = formatTelefono(empleadoEditado.telefono || '');
      if (formattedTelefono !== empleadoEditado.telefono) {
        setEmpleadoEditado(prevState => ({
          ...prevState,
          telefono: formattedTelefono
        }));
      }
    }
  }, [empleadoEditado, setDepartamentoSeleccionado]);

  const formatTelefono = (telefono) => {
    const value = telefono.replace(/[^\d]/g, "").slice(0, 8);
    let formattedTelefono = "";
    if (value.length > 4) {
      formattedTelefono = value.slice(0, 4) + "-" + value.slice(4);
    } else {
      formattedTelefono = value;
    }
    return formattedTelefono;
  };

  const validateTelefono = (telefono) => {
    const validFormat = /^\d{4}-\d{4}$/;
    const startsWithValidDigit = /^[267]/.test(telefono.replace(/-/g, ''));
    return validFormat.test(telefono) && startsWithValidDigit;
  };

  const handleTelefonoChange = (e) => {
    let telefonoValue = e.target.value.replace(/[^\d]/g, '');
    
    if (telefonoValue.length > 0 && !['2', '6', '7'].includes(telefonoValue[0])) {
      telefonoValue = '';
    }

    if (telefonoValue.length > 8) {
      telefonoValue = telefonoValue.slice(0, 8);
    }

    if (telefonoValue.length > 4) {
      telefonoValue = telefonoValue.slice(0, 4) + '-' + telefonoValue.slice(4);
    }

    setEmpleadoEditado(prevState => ({ ...prevState, telefono: telefonoValue }));

    const isValidFormat = /^\d{4}-\d{4}$/.test(telefonoValue);
    const startsWithValidDigit = /^[267]/.test(telefonoValue.replace(/-/g, ''));
    const isTelefonoValid = isValidFormat && startsWithValidDigit;

    setFormErrors(prevErrors => ({
      ...prevErrors,
      telefono: telefonoValue === '' ? 'El teléfono es obligatorio.' : 
                !isTelefonoValid ? 'El número de teléfono debe tener el formato 1234-5678 y comenzar con 2, 6 o 7.' : ''
    }));
  };

  const handleNombreChange = (e) => {
    const nombre = e.target.value;
    const cleanedNombre = nombre.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ\s]/g, '');
    setEmpleadoEditado(prevState => ({ ...prevState, nombres: cleanedNombre }));
    const nombreValido = cleanedNombre.length > 0 && cleanedNombre.length <= 80;
    setFormErrors(prevErrors => ({
      ...prevErrors,
      nombre: !nombreValido ? 'El nombre no puede estar vacío y no debe contener números, ni caracteres especiales.' : ''
    }));
  };

  const handleApellidoChange = (e) => {
    const apellido = e.target.value;
    const cleanedApellido = apellido.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ\s]/g, '');
    setEmpleadoEditado(prevState => ({ ...prevState, apellidos: cleanedApellido }));
    const apellidoValido = cleanedApellido.length > 0 && cleanedApellido.length <= 80;
    setFormErrors(prevErrors => ({
      ...prevErrors,
      apellido: !apellidoValido ? 'El apellido no puede estar vacío y no debe contener números, ni caracteres especiales.' : ''
    }));
  };

  const handleDireccionChange = (e) => {
    const direccion = e.target.value;
    setEmpleadoEditado(prevState => ({ ...prevState, direccion: direccion }));
    setFormErrors(prevErrors => ({
      ...prevErrors,
      direccion: direccion.trim() === '' ? 'La dirección es obligatoria.' : ''
    }));
  };

  const handleSelectChange = (e, field) => {
    const value = e.target.value;
    setEmpleadoEditado(prevState => ({ ...prevState, [field]: value }));
    setFormErrors(prevErrors => ({
      ...prevErrors,
      [field]: value === '' ? `Debe seleccionar un ${field}.` : ''
    }));
  };

  const handleGuardarCambios = () => {
    const nombreValido = (empleadoEditado.nombres.trim() !== '') && 
                         (empleadoEditado.nombres.length <= 80);
    const apellidoValido = (empleadoEditado.apellidos.trim() !== '') &&
                           (empleadoEditado.apellidos.length <= 80);
    const telefonoValido = validateTelefono(empleadoEditado.telefono);
    const camposNoVacios = empleadoEditado.nombres.trim() !== '' && 
                           empleadoEditado.apellidos.trim() !== '' && 
                           empleadoEditado.telefono.trim() !== '' &&
                           empleadoEditado.id_cargo &&
                           empleadoEditado.id_estado &&
                           empleadoEditado.id_departamento &&
                           empleadoEditado.id_municipio &&
                           empleadoEditado.direccion.trim() !== '';

    if (!nombreValido) {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        nombre: 'El nombre es obligatorio y no debe contener números, ni caracteres especiales.'
      }));
    }
    if (!apellidoValido) {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        apellido: 'El apellido es obligatorio y no debe contener números, ni caracteres especiales.'
      }));
    }
    if (!telefonoValido) {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        telefono: 'El número de teléfono debe tener el formato 1234-5678 y comenzar con 2, 6 o 7.'
      }));
    }

    if (!camposNoVacios) {
      if (empleadoEditado.nombres.trim() === '') setFormErrors(prevErrors => ({ ...prevErrors, nombre: 'El nombre es obligatorio.' }));
      if (empleadoEditado.apellidos.trim() === '') setFormErrors(prevErrors => ({ ...prevErrors, apellido: 'El apellido es obligatorio.' }));
      if (empleadoEditado.telefono.trim() === '') setFormErrors(prevErrors => ({ ...prevErrors, telefono: 'El teléfono es obligatorio.' }));
      if (!empleadoEditado.id_cargo) setFormErrors(prevErrors => ({ ...prevErrors, cargo: 'Debe seleccionar un cargo.' }));
      if (!empleadoEditado.id_estado) setFormErrors(prevErrors => ({ ...prevErrors, estado: 'Debe seleccionar un estado.' }));
      if (!empleadoEditado.id_departamento) setFormErrors(prevErrors => ({ ...prevErrors, departamento: 'Debe seleccionar un departamento.' }));
      if (!empleadoEditado.id_municipio) setFormErrors(prevErrors => ({ ...prevErrors, municipio: 'Debe seleccionar un municipio.' }));
      if (empleadoEditado.direccion.trim() === '') setFormErrors(prevErrors => ({ ...prevErrors, direccion: 'La dirección es obligatoria.' }));
      return;
    }

    guardarCambiosEmpleado();
    // toast.success('Cambios guardados con éxito.', {
    //   position: "bottom-right",
    //   autoClose: 2000,
    //   hideProgressBar: true,
    //   closeOnClick: true,
    //   pauseOnHover: false,
    //   draggable: false,
    // });
    setModalEditar(false);
  };

  return (
    <Modal show={modalEditar} onHide={() => setModalEditar(false)} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Editar Empleado</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <Col md={6}>
              <Form.Group controlId="nombres">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  value={empleadoEditado ? empleadoEditado.nombres : ''}
                  onChange={handleNombreChange}
                  isInvalid={!!formErrors.nombre}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.nombre}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="apellidos">
                <Form.Label>Apellido</Form.Label>
                <Form.Control
                  type="text"
                  value={empleadoEditado ? empleadoEditado.apellidos : ''}
                  onChange={handleApellidoChange}
                  isInvalid={!!formErrors.apellido}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.apellido}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group controlId="telefono">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control
                  type="text"
                  value={empleadoEditado ? empleadoEditado.telefono : ''}
                  onChange={handleTelefonoChange}
                  isInvalid={!!formErrors.telefono}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.telefono}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="cargo">
                <Form.Label>Cargo</Form.Label>
                <Form.Control
                  as="select"
                  value={empleadoEditado ? empleadoEditado.id_cargo : ''}
                  onChange={(e) => {
                    handleSelectChange(e, 'id_cargo');
                    setFormErrors(prevErrors => ({
                      ...prevErrors,
                      cargo: e.target.value === '' ? 'Debe seleccionar un cargo.' : ''
                    }));
                  }}
                  isInvalid={!!formErrors.cargo}
                >
                  <option value="">Seleccionar Cargo</option>
                  {cargos.map(cargo => (
                    <option key={cargo.id} value={cargo.id}>{cargo.nombre}</option>
                  ))}
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                  {formErrors.cargo}
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
                  value={empleadoEditado ? empleadoEditado.id_estado : ''}
                  onChange={(e) => {
                    handleSelectChange(e, 'id_estado');
                    setFormErrors(prevErrors => ({
                      ...prevErrors,
                      estado: e.target.value === '' ? 'Debe seleccionar un estado.' : ''
                    }));
                  }}
                  isInvalid={!!formErrors.estado}
                >
                  <option value="">Seleccionar Estado</option>
                  {estados.map(estado => (
                    <option key={estado.id} value={estado.id}>{estado.estado}</option>
                  ))}
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                  {formErrors.estado}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="departamento">
                <Form.Label>Departamento</Form.Label>
                <Form.Control
                  as="select"
                  value={empleadoEditado ? empleadoEditado.id_departamento : ''}
                  onChange={(e) => {
                    const idDepartamento = e.target.value;
                    setEmpleadoEditado(prevState => ({ ...prevState, id_departamento: idDepartamento }));
                    setDepartamentoSeleccionado(idDepartamento);
                    setFormErrors(prevErrors => ({
                      ...prevErrors,
                      departamento: idDepartamento === '' ? 'Debe seleccionar un departamento.' : ''
                    }));
                  }}
                  isInvalid={!!formErrors.departamento}
                >
                  <option value="">Seleccionar Departamento</option>
                  {departamentos.map(departamento => (
                    <option key={departamento.id} value={departamento.id}>
                      {departamento.nombre}
                    </option>
                  ))}
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                  {formErrors.departamento}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group controlId="municipio">
                <Form.Label>Municipio</Form.Label>
                <Form.Control
                  as="select"
                  value={empleadoEditado ? empleadoEditado.id_municipio : ''}
                  onChange={(e) => {
                    handleSelectChange(e, 'id_municipio');
                    setFormErrors(prevErrors => ({
                      ...prevErrors,
                      municipio: e.target.value === '' ? 'Debe seleccionar un municipio.' : ''
                    }));
                  }}
                  isInvalid={!!formErrors.municipio}
                >
                  <option value="">Seleccione un Municipio</option>
                  {municipios && municipios.length > 0 ? (
                    municipios.map(municipio => (
                      <option key={municipio.id} value={municipio.id}>
                        {municipio.nombre}
                      </option>
                    ))
                  ) : (
                    <option value="">No hay municipios disponibles</option>
                  )}
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                  {formErrors.municipio}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="direccion">
                <Form.Label>Dirección</Form.Label>
                <Form.Control
                  type="text"
                  value={empleadoEditado ? empleadoEditado.direccion : ''}
                  onChange={handleDireccionChange}
                  isInvalid={!!formErrors.direccion}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.direccion}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setModalEditar(false)}>Cancelar</Button>
        <Button variant="primary" onClick={handleGuardarCambios}>Guardar Cambios</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEditarEmpleado;
