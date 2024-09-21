import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, FormGroup, Label, Alert } from "reactstrap";
import Select from "react-select";
import AuthService from "../../services/authService";

const API_URL = import.meta.env.VITE_API_URL;

const UbicarPaqueteModal = ({ isOpen, toggle, paqueteUuid }) => {
  const [ubicaciones, setUbicaciones] = useState([]);
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState(null);
  const [alertaExito, setAlertaExito] = useState(false);
  const [alertaError, setAlertaError] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState("");

  const token = AuthService.getCurrentUser();

  const customStyles = {
    option: (provided) => ({
      ...provided,
      color: "black",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "black",
    }),
  };

  useEffect(() => {
    const fetchUbicaciones = async () => {
      try {
        const response = await axios.get(`${API_URL}/dropdown/get_Ubicaciones_paquetes_da`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUbicaciones(response.data || []);
      } catch (error) {
        console.error("Error al obtener ubicaciones:", error);
        setAlertaError(true);
        setErrorMensaje("Error al obtener ubicaciones. Intente nuevamente más tarde.");
      }
    };

    fetchUbicaciones();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!ubicacionSeleccionada) {
      setAlertaError(true);
      setErrorMensaje("Debe seleccionar una ubicación.");
      return;
    }

    const datosRegistro = {
      codigo_qr_paquete: paqueteUuid,
      codigo_nomenclatura_ubicacion: ubicacionSeleccionada.value,
    };

    try {
      const response = await axios.post(`${API_URL}/ubicacion-paquetes-danados`, datosRegistro, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        setAlertaExito(true);
        setTimeout(() => {
          setAlertaExito(false);
          toggle(); // Cerrar modal después de la operación exitosa
        }, 3000);
      } else {
        setAlertaError(true);
        setErrorMensaje("Error al registrar la ubicación del paquete.");
      }
    } catch (error) {
      setAlertaError(true);
      const mensajeError = error.response ? error.response.data.message : "Error al registrar la ubicación del paquete.";
      setErrorMensaje(mensajeError);
      console.error("Error al registrar la ubicación del paquete:", error.response ? error.response.data : error);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Ubicar Paquete Dañado</ModalHeader>
      <ModalBody>
        {alertaExito && <Alert color="success">Paquete dañado ubicado exitosamente</Alert>}
        {alertaError && <Alert color="danger">{errorMensaje}</Alert>}
        <FormGroup>
          <Label for="ubicacion">Ubicación</Label>
          <Select
            id="ubicacion"
            value={ubicacionSeleccionada}
            onChange={setUbicacionSeleccionada}
            options={ubicaciones.map((ubicacion) => ({
              value: ubicacion.nomenclatura,
              label: ubicacion.nomenclatura,
            }))}
            placeholder="Buscar por nomenclatura"
            isSearchable
            required
            styles={customStyles}
          />
        </FormGroup>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleSubmit}>
          Ubicar Paquete
        </Button>{" "}
        <Button color="secondary" onClick={toggle}>
          Cancelar
        </Button>
      </ModalFooter>
    </Modal>
  );
};

UbicarPaqueteModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  paqueteUuid: PropTypes.string.isRequired,
};

export default UbicarPaqueteModal;
