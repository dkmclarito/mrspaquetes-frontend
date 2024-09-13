import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input, Button, FormFeedback, Row, Col } from "reactstrap";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import AuthService from "../../services/authService";  // Servicio de autenticación para obtener el token
import "/src/styles/Clientes.css";

const API_URL = import.meta.env.VITE_API_URL;  // Definir la URL de la API

const formatDate = (date) => {
  if (!date) return "";
  const [year, month, day] = date.split(' ')[0].split('-');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

const isValidDUI = (formattedDui) => formattedDui.length === 10 && formattedDui.match(/^0\d{7}-\d{1}$/);
const isValidTelefono = (telefono) => telefono.length === 9 && telefono.match(/^\d{4}-\d{4}$/);
const isValidNIT = (nit) => nit.length === 14 && nit.match(/^\d{4}-\d{6}-\d{3}-\d$/);

const generateErrorMessage = (errorData) => {
  let errorMessage = "Error al guardar los cambios.";

  if (errorData.errors) {
    const errorKeys = Object.keys(errorData.errors);

    if (errorKeys.includes("dui") && errorKeys.includes("telefono")) {
      errorMessage = "El DUI y el teléfono ya están registrados.";
    } else if (errorKeys.includes("nit") && errorKeys.includes("telefono")) {
      errorMessage = "El NIT y el teléfono ya están registrados.";
    } else if (errorKeys.includes("dui") && errorKeys.includes("email")) {
      errorMessage = "El DUI y el correo electrónico ya están registrados.";
    } else if (errorKeys.includes("dui")) {
      errorMessage = "El DUI ya está registrado.";
    } else if (errorKeys.includes("nit")) {
      errorMessage = "El NIT ya está registrado.";
    } else if (errorKeys.includes("telefono")) {
      errorMessage = "El teléfono ya está registrado.";
    } else {
      errorMessage = errorData.message || "Error al guardar los cambios.";
    }
  } else if (errorData.error) {
    errorMessage = errorData.error.join(", ");
  }

  return errorMessage;
};

const ModalEditarCliente = ({
  modalEditar,
  clienteEditado,
  setClienteEditado,
  guardarCambiosCliente,
  setModalEditar
}) => {
  const [telefonoError, setTelefonoError] = useState("");
  const [error, setError] = useState("");
  const [isDuiValid, setIsDuiValid] = useState(true);
  const [isTelefonoValid, setIsTelefonoValid] = useState(true);
  const [isNitValid, setIsNitValid] = useState(true);

  // Estados relacionados con el giro
  const [giros, setGiros] = useState([]);
  const [filteredGiros, setFilteredGiros] = useState([]);
  const [searchGiro, setSearchGiro] = useState(""); // Mostrar el giro seleccionado inicialmente
  const [selectedGiro, setSelectedGiro] = useState(clienteEditado?.giro || "");

  useEffect(() => {
    if (clienteEditado) {
      const esPersonaJuridica = clienteEditado.id_tipo_persona === 2;
      setIsDuiValid(!esPersonaJuridica || isValidDUI(clienteEditado.dui || ""));
      setIsTelefonoValid(isValidTelefono(clienteEditado.telefono || ""));
      setIsNitValid(esPersonaJuridica || !clienteEditado.nit || isValidNIT(clienteEditado.nit || ""));
      setError("");

      // Aquí estableces el valor inicial del giro
      setSearchGiro(clienteEditado.giro || ""); 
      setSelectedGiro(clienteEditado.giro || "");
    }
  }, [clienteEditado]);

  // Cargar giros desde la API usando el token de autenticación
  useEffect(() => {
    const cargarGiros = async () => {
      try {
        const token = AuthService.getCurrentUser();  // Obtener el token desde el servicio de autenticación
        const response = await axios.get(`${API_URL}/dropdown/giros`, {
          headers: {
            Authorization: `Bearer ${token}`,  // Añadir el token en los headers
          },
        });

        console.log("Datos recibidos de giros:", response.data);

        if (Array.isArray(response.data.actividadEconomica)) {
          setGiros(response.data.actividadEconomica);
        } else {
          console.error("Formato inesperado de la respuesta de giros:", response.data);
          setGiros([]);  // En caso de error, asignar un array vacío
        }
      } catch (error) {
        console.error("Error al cargar los giros", error);
        setGiros([]);  // Asignar un array vacío en caso de error
      }
    };

    cargarGiros();
  }, []);

  const handleGiroSelect = (giro) => {
    setSelectedGiro(`${giro.st_codigo} - ${giro.st_descripcion}`);
    setSearchGiro(giro.st_descripcion);
    setClienteEditado((prev) => ({ ...prev, giro: giro.st_descripcion }));
    setFilteredGiros([]);  // Limpiar los giros después de la selección
  };

  const handleSearchGiro = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearchGiro(searchTerm);

    if (Array.isArray(giros) && searchTerm.length > 0) {
      const filtered = giros.filter((giro) =>
        giro.st_codigo.toString().toLowerCase().includes(searchTerm) ||  // Convertir st_codigo a string antes de usar toLowerCase
        giro.st_descripcion.toLowerCase().includes(searchTerm)
      );
      setFilteredGiros(filtered);
    } else {
      setFilteredGiros([]);
    }
  };

  const clearGiroSelection = () => {
    setSearchGiro("");
    setSelectedGiro("");
    setClienteEditado((prev) => ({ ...prev, giro: "" }));
  };

  const handleDuiChange = (e) => {
    if (clienteEditado?.id_tipo_persona === 2) return; // No permitir cambios en el DUI si es persona jurídica

    let duiValue = e.target.value.replace(/[^\d]/g, "");
    if (duiValue.length > 9) {
      duiValue = duiValue.slice(0, 8) + "-" + duiValue.slice(8, 9);
    }
    duiValue = duiValue.startsWith('0') ? duiValue : '0' + duiValue;
    setClienteEditado((prev) => ({ ...prev, dui: duiValue }));

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

    let nitValue = e.target.value.replace(/[^\d]/g, "");

    if (nitValue.length <= 4) {
      nitValue = nitValue;
    } else if (nitValue.length <= 10) {
      nitValue = `${nitValue.slice(0, 4)}-${nitValue.slice(4)}`;
    } else if (nitValue.length <= 13) {
      nitValue = `${nitValue.slice(0, 4)}-${nitValue.slice(4, 10)}-${nitValue.slice(10)}`;
    } else {
      nitValue = `${nitValue.slice(0, 4)}-${nitValue.slice(4, 10)}-${nitValue.slice(10, 13)}-${nitValue.slice(13, 14)}`;
    }

    setClienteEditado((prev) => ({ ...prev, nit: nitValue }));

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

    if (telefonoValue.length > 0 && !["6", "7"].includes(telefonoValue[0])) {
      setTelefonoError("El número de teléfono debe comenzar con 6 o 7");
      setIsTelefonoValid(false);
    } else {
      setTelefonoError("");
      setIsTelefonoValid(true);

      if (telefonoValue.length > 4) {
        telefonoValue = telefonoValue.slice(0, 4) + "-" + telefonoValue.slice(4);
      }

      setClienteEditado((prev) => ({ ...prev, telefono: telefonoValue }));
    }
  };

  const handleNrcChange = (e) => {
    let nrcValue = e.target.value.replace(/[^\d]/g, "");
    if (nrcValue.length > 7) {
      nrcValue = nrcValue.slice(0, 7);
    }
    if (nrcValue.length > 6) {
      nrcValue = nrcValue.slice(0, 6) + "-" + nrcValue.slice(6);
    }

    setClienteEditado((prev) => ({ ...prev, nrc: nrcValue }));
  };

  const handleNombreEmpresaChange = (e) => {
    setClienteEditado((prev) => ({ ...prev, nombre_empresa: e.target.value }));
  };

  const handleNombreComercialChange = (e) => {
    setClienteEditado((prev) => ({ ...prev, nombre_comercial: e.target.value }));
  };

  const handleDireccionChange = (e) => {
    setClienteEditado((prev) => ({ ...prev, direccion: e.target.value }));
  };

  const handleFechaRegistroChange = (e) => {
    const fechaRegistro = e.target.value;
    setClienteEditado((prev) => ({ ...prev, fecha_registro: fechaRegistro }));
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
      setModalEditar(false);
    } catch (err) {
      const errorMessage = generateErrorMessage(err.response?.data || {});
      setError(errorMessage);
      toast.error(errorMessage);
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
                <FormFeedback>{telefonoError}</FormFeedback>
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
                    <div className="position-relative">
                      <Input
                        type="text"
                        id="searchGiro"
                        value={searchGiro}  // Aquí se muestra el valor del giro del cliente o el valor buscado
                        onChange={handleSearchGiro}
                        placeholder="Buscar giro por código o descripción"
                      />
                      {searchGiro && (
                        <Button
                          className="position-absolute top-0 end-0 btn-sm"
                          style={{ marginTop: '5px' }}
                          onClick={clearGiroSelection}
                        >
                          X
                        </Button>
                      )}
                      {filteredGiros.length > 0 && (
                        <div className="dropdown-menu show" style={{ maxHeight: "200px", overflowY: "auto" }}>
                          {filteredGiros.map((giro) => (
                            <Button
                              key={giro.sk_actividadeco}
                              className="dropdown-item"
                              onClick={() => handleGiroSelect(giro)}
                            >
                              {giro.st_codigo} - {giro.st_descripcion}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
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
  clienteEditado: PropTypes.shape({
    id_tipo_persona: PropTypes.number,
    dui: PropTypes.string,
    telefono: PropTypes.string,
    nit: PropTypes.string,
    nrc: PropTypes.string,
    nombre_empresa: PropTypes.string,
    nombre_comercial: PropTypes.string,
    giro: PropTypes.string,
    direccion: PropTypes.string,
    fecha_registro: PropTypes.string,
    nombre: PropTypes.string,
    apellido: PropTypes.string
  }),
  setClienteEditado: PropTypes.func.isRequired,
  guardarCambiosCliente: PropTypes.func.isRequired,
  setModalEditar: PropTypes.func.isRequired
};

export default ModalEditarCliente;
