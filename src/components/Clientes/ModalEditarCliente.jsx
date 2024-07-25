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
  return dui.length === 10 && dui.match(/^0\d{7}-\d{1}$/);
};

// Función para validar el formato de teléfono
const isValidTelefono = (telefono) => {
  return telefono.length === 9 && telefono.match(/^\d{4}-\d{4}$/);
};

const isValidNIT = (nit) => {
  return nit.length === 14 && nit.match(/^\d{4}-\d{6}-\d{3}-\d$/);
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
  const [isNitValid, setIsNitValid] = useState(true);

  useEffect(() => {
    if (clienteEditado) {
      const esPersonaJuridica = clienteEditado.id_tipo_persona === 2;
      setIsDuiValid(!esPersonaJuridica || isValidDUI(clienteEditado.dui || ""));
      setIsTelefonoValid(isValidTelefono(clienteEditado.telefono || ""));
      setIsNitValid(esPersonaJuridica || !clienteEditado.nit || isValidNIT(clienteEditado.nit || ""));
      setError("");
    }
  }, [clienteEditado]);

  const handleDuiChange = (e) => {
    if (clienteEditado?.id_tipo_persona === 2) return; // No permitir cambios en el DUI si es persona jurídica

    let duiValue = e.target.value.replace(/[^\d]/g, "");
    if (duiValue.length > 9) {
        duiValue = duiValue.slice(0, 8) + "-" + duiValue.slice(8, 9);
    }
    duiValue = duiValue.startsWith('0') ? duiValue : '0' + duiValue;
    setClienteEditado(prev => ({ ...prev, dui: duiValue }));

    const isValid = isValidDUI(duiValue);
    setIsDuiValid(isValid);
    if (!isValid) {
        setError("El DUI ingresado no es válido. Por favor, revisa el formato.");
    } else {
        setError("");
    }
  };

  const handleNitChange = (e) => {
    if (clienteEditado?.id_tipo_persona === 1) return; // No permitir cambios en el NIT si es persona natural
  
    let nitValue = e.target.value.replace(/[^\d]/g, ""); // Eliminar caracteres no numéricos
  
    // Formatear el NIT según el formato requerido
    if (nitValue.length <= 4) {
      nitValue = nitValue;
    } else if (nitValue.length <= 10) {
      nitValue = `${nitValue.slice(0, 4)}-${nitValue.slice(4)}`;
    } else if (nitValue.length <= 13) {
      nitValue = `${nitValue.slice(0, 4)}-${nitValue.slice(4, 10)}-${nitValue.slice(10)}`;
    } else {
      nitValue = `${nitValue.slice(0, 4)}-${nitValue.slice(4, 10)}-${nitValue.slice(10, 13)}-${nitValue.slice(13, 14)}`;
    }
  
    setClienteEditado(prev => ({ ...prev, nit: nitValue }));
  
    const isValid = isValidNIT(nitValue);
    setIsNitValid(isValid);
    if (!isValid) {
      setError("El NIT ingresado no es válido. Por favor, revisa el formato.");
    } else {
      setError("");
    }  
  };

  const handleTelefonoChange = (e) => {
    let telefonoValue = e.target.value.replace(/[^\d]/g, "");
    if (telefonoValue.length > 8) {
      telefonoValue = telefonoValue.slice(0, 4) + "-" + telefonoValue.slice(4, 8);
    }
    setClienteEditado(prev => ({ ...prev, telefono: telefonoValue }));

    const isValid = isValidTelefono(telefonoValue);
    setIsTelefonoValid(isValid);
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

  const handleDireccionChange = (e) => {
    setClienteEditado(prev => ({ ...prev, direccion: e.target.value }));
  };

  const handleFechaRegistroChange = (e) => {
    const fechaRegistro = e.target.value;
    setClienteEditado(prev => ({ ...prev, fecha_registro: fechaRegistro }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (clienteEditado?.id_tipo_persona === 2) {
      if (!isNitValid) {
        setError("El NIT ingresado no es válido. Por favor, revisa el formato.");
        return;
      }
    } else {
      if (!isDuiValid) {
        setError("El DUI ingresado no es válido. Por favor, revisa el formato.");
        return;
      }
    }
  
    if (!isTelefonoValid) {
      setError("El teléfono ingresado no es válido. Por favor, revisa el formato.");
      return;
    }
  
    setError("");
    try {
      await guardarCambiosCliente();
    } catch (err) {
      setError("Error al guardar los cambios. Por favor, intenta nuevamente.");
    }
  };
  

  const esPersonaJuridica = clienteEditado?.id_tipo_persona === 2;
  const currentYear = new Date().getFullYear();
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const minDate = `${currentYear}-${currentMonth}-01`;
  const maxDate = new Date(currentYear, new Date().getMonth() + 1, 0).toISOString().split('T')[0]; // Last day of the current month

  return (
    <Modal
      isOpen={modalEditar}
      toggle={() => setModalEditar(false)}
      size="lg"
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
            {!esPersonaJuridica && (
              <Col md={6}>
                <FormGroup>
                  <Label for="dui">DUI</Label>
                  <Input
                    type="text"
                    id="dui"
                    value={clienteEditado ? clienteEditado.dui : ""}
                    onChange={handleDuiChange}
                    invalid={!isDuiValid && !esPersonaJuridica}
                  />
                  <FormFeedback>{error}</FormFeedback>
                </FormGroup>
              </Col>
            )}
            {esPersonaJuridica && (
              <Col md={6}>
                <FormGroup>
                  <Label for="nit">NIT</Label>
                  <Input
                    type="text"
                    id="nit"
                    value={clienteEditado ? clienteEditado.nit : ""}
                    onChange={handleNitChange}
                    invalid={!isNitValid && esPersonaJuridica}
                  />
                  <FormFeedback>{error}</FormFeedback>
                </FormGroup>
              </Col>
            )}
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
                <FormFeedback>{error}</FormFeedback>
              </FormGroup>
            </Col>
            {esPersonaJuridica && (
              <>
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
                <Col md={6}>
                  <FormGroup>
                    <Label for="nombre_empresa">Nombre de Empresa</Label>
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
                <Col md={6}>
                  <FormGroup>
                    <Label for="giro">Giro</Label>
                    <Input
                      type="text"
                      id="giro"
                      value={clienteEditado ? clienteEditado.giro : ""}
                      onChange={handleGiroChange}
                    />
                  </FormGroup>
                </Col>
              </>
            )}
            <Col md={6}>
                  <FormGroup>
                    <Label for="direccion">Dirección</Label>
                    <Input
                      type="text"
                      id="direccion"
                      value={clienteEditado ? clienteEditado.direccion : ""}
                      onChange={handleDireccionChange}
                    />
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
                  min={minDate}
                  max={maxDate}
                />
              </FormGroup>
            </Col>
          </Row>
        </form>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={() => setModalEditar(false)}>Cancelar</Button>
        <Button color="primary" onClick={handleSubmit}>Guardar Cambios</Button>
      </ModalFooter>
    </Modal>
  );
};

ModalEditarCliente.propTypes = {
  modalEditar: PropTypes.bool.isRequired,
  clienteEditado: PropTypes.object.isRequired,
  setClienteEditado: PropTypes.func.isRequired,
  guardarCambiosCliente: PropTypes.func.isRequired,
  setModalEditar: PropTypes.func.isRequired
};

export default ModalEditarCliente;
