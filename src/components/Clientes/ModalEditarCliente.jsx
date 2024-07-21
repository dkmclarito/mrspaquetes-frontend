import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input, Button, FormFeedback, Row, Col } from "reactstrap";

// Función para convertir la fecha de YYYY-MM-DD HH:MM:SS a YYYY-MM-DD
const formatDate = (date) => {
  if (!date) return "";
  const [year, month, day] = date.split(' ')[0].split('-');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

// Función para validar el formato de DUI
const isValidDUI = (dui) => {
  return dui.length === 10 && dui.match(/^\d{8}-\d{1}$/);
};

// Función para validar el formato de teléfono
const isValidTelefono = (telefono) => {
  return telefono.length === 9 && telefono.match(/^\d{4}-\d{4}$/);
};

// Función para validar el formato de correo electrónico
const isValidEmail = (email) => {
  return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
};

const ModalEditarCliente = ({
  modalEditar,
  clienteEditado,
  setClienteEditado,
  guardarCambiosCliente,
  setModalEditar
}) => {
  const [error, setError] = useState("");
  const [isDuiValid, setIsDuiValid] = useState(true);
  const [isTelefonoValid, setIsTelefonoValid] = useState(true);
  const [isEmailValid, setIsEmailValid] = useState(true);

  useEffect(() => {
    if (clienteEditado) {
      setIsDuiValid(isValidDUI(clienteEditado.dui));
      setIsTelefonoValid(isValidTelefono(clienteEditado.telefono));
      setIsEmailValid(isValidEmail(clienteEditado.email));
      setError("");
    }
  }, [clienteEditado]);

  const handleDuiChange = (e) => {
    let duiValue = e.target.value.replace(/[^\d]/g, "");
    if (duiValue.length > 9) {
      duiValue = duiValue.slice(0, 9);
    }
    if (duiValue.length > 8) {
      duiValue = duiValue.slice(0, 8) + "-" + duiValue.slice(8);
    }
    setClienteEditado({ ...clienteEditado, dui: duiValue });

    const isValid = isValidDUI(duiValue);
    setIsDuiValid(isValid);

    if (!isValid) {
      setError("El DUI ingresado no es válido. Por favor, revisa el formato.");
    } else {
      setError("");
    }
  };

  const handleTelefonoChange = (e) => {
    let telefonoValue = e.target.value.replace(/[^\d]/g, "");
    if (telefonoValue.length > 8) {
      telefonoValue = telefonoValue.slice(0, 8);
    }
    if (telefonoValue.length > 4) {
      telefonoValue = telefonoValue.slice(0, 4) + "-" + telefonoValue.slice(4);
    }
    setClienteEditado(prev => ({ ...prev, telefono: telefonoValue }));

    const isValid = isValidTelefono(telefonoValue);
    setIsTelefonoValid(isValid);
  };

  const handleEmailChange = (e) => {
    const emailValue = e.target.value;
    setClienteEditado(prev => ({ ...prev, email: emailValue }));

    const isValid = isValidEmail(emailValue);
    setIsEmailValid(isValid);
  };

  const handleNitChange = (e) => {
    let nitValue = e.target.value.replace(/[^\d]/g, "");
    if (nitValue.length > 14) {
      nitValue = nitValue.slice(0, 14);
    }
    setClienteEditado(prev => ({ ...prev, nit: nitValue }));
  };

  const handleNrcChange = (e) => {
    let nrcValue = e.target.value.replace(/[^\d]/g, "");
    if (nrcValue.length > 8) {
      nrcValue = nrcValue.slice(0, 8);
    }
    setClienteEditado(prev => ({ ...prev, nrc: nrcValue }));
  };

  const handleNombreEmpresaChange = (e) => {
    setClienteEditado(prev => ({ ...prev, nombre_empresa: e.target.value }));
  };

  const handleNombreComercialChange = (e) => {
    setClienteEditado(prev => ({ ...prev, nombre_comercial: e.target.value }));
  };

  const handleGiroChange = (e) => {
    setClienteEditado(prev => ({ ...prev, giro: e.target.value }));
  };

  const handleFechaRegistroChange = (e) => {
    const fechaRegistro = e.target.value;
    setClienteEditado(prev => ({ ...prev, fecha_registro: fechaRegistro }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isDuiValid) {
      setError("El DUI ingresado no es válido. Por favor, revisa el formato.");
      return;
    }
    if (!isTelefonoValid) {
      setError("El teléfono ingresado no es válido. Por favor, revisa el formato.");
      return;
    }
    if (!isEmailValid) {
      setError("El correo electrónico ingresado no es válido.");
      return;
    }
    setError("");
    guardarCambiosCliente();
  };

  const esPersonaJuridica = clienteEditado?.id_tipo_persona === 2;

  return (
    <Modal 
      isOpen={modalEditar} 
      toggle={() => setModalEditar(false)} 
      size="lg" // Tamaño grande del modal
      className="modal-custom"
    >
      <ModalHeader toggle={() => setModalEditar(false)}>Editar Cliente</ModalHeader>
      <ModalBody>
        <form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <FormGroup>
                <Label for="nombre">Nombre</Label>
                <Input 
                  type="text" 
                  id="nombre" 
                  value={clienteEditado ? clienteEditado.nombre : ""} 
                  onChange={(e) => setClienteEditado({ ...clienteEditado, nombre: e.target.value })} 
                />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label for="apellido">Apellido</Label>
                <Input 
                  type="text" 
                  id="apellido" 
                  value={clienteEditado ? clienteEditado.apellido : ""} 
                  onChange={(e) => setClienteEditado({ ...clienteEditado, apellido: e.target.value })} 
                />
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <FormGroup>
                <Label for="dui">DUI</Label>
                <Input 
                  type="text" 
                  id="dui" 
                  value={clienteEditado ? clienteEditado.dui : ""} 
                  onChange={handleDuiChange} 
                  invalid={!isDuiValid}
                />
                <FormFeedback>{error}</FormFeedback>
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label for="email">Email</Label>
                <Input 
                  type="email" 
                  id="email" 
                  value={clienteEditado ? clienteEditado.email : ""} 
                  onChange={handleEmailChange} 
                  invalid={!isEmailValid}
                />
                <FormFeedback>El correo electrónico ingresado no es válido.</FormFeedback>
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <FormGroup>
                <Label for="telefono">Teléfono</Label>
                <Input 
                  type="text" 
                  id="telefono" 
                  value={clienteEditado ? clienteEditado.telefono : ""} 
                  onChange={handleTelefonoChange} 
                  invalid={!isTelefonoValid}
                />
                <FormFeedback>El teléfono ingresado no es válido. Debe tener el formato 1234-5678.</FormFeedback>
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label for="fecha_registro">Fecha de Registro</Label>
                <Input 
                  type="date" 
                  id="fecha_registro" 
                  value={clienteEditado ? formatDate(clienteEditado.fecha_registro) : ""} 
                  onChange={handleFechaRegistroChange} 
                />
              </FormGroup>
            </Col>
          </Row>
          {esPersonaJuridica && (
            <>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="nit">NIT</Label>
                    <Input 
                      type="text" 
                      id="nit" 
                      value={clienteEditado ? clienteEditado.nit : ""} 
                      onChange={handleNitChange} 
                    />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="nrc">NRC</Label>
                    <Input 
                      type="text" 
                      id="nrc" 
                      value={clienteEditado ? clienteEditado.nrc : ""} 
                      onChange={handleNrcChange} 
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="nombre_empresa">Nombre de la Empresa</Label>
                    <Input 
                      type="text" 
                      id="nombre_empresa" 
                      value={clienteEditado ? clienteEditado.nombre_empresa : ""} 
                      onChange={handleNombreEmpresaChange} 
                    />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="nombre_comercial">Nombre Comercial</Label>
                    <Input 
                      type="text" 
                      id="nombre_comercial" 
                      value={clienteEditado ? clienteEditado.nombre_comercial : ""} 
                      onChange={handleNombreComercialChange} 
                    />
                  </FormGroup>
                </Col>
              </Row>
              <FormGroup>
                <Label for="giro">Giro</Label>
                <Input 
                  type="text" 
                  id="giro" 
                  value={clienteEditado ? clienteEditado.giro : ""} 
                  onChange={handleGiroChange} 
                />
              </FormGroup>
            </>
          )}
        </form>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleSubmit}>Guardar</Button>
        <Button color="secondary" onClick={() => setModalEditar(false)}>Cancelar</Button>
      </ModalFooter>
    </Modal>
  );
};

ModalEditarCliente.propTypes = {
  modalEditar: PropTypes.bool.isRequired,
  clienteEditado: PropTypes.object.isRequired,
  setClienteEditado: PropTypes.func.isRequired,
  guardarCambiosCliente: PropTypes.func.isRequired,
  setModalEditar: PropTypes.func.isRequired,
};

export default ModalEditarCliente;
