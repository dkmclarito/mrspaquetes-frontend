import React, { useState, useEffect, useCallback } from "react";
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
  const [paquetes, setPaquetes] = useState([]);
  const [incidenciasUbicadas, setIncidenciasUbicadas] = useState([]);

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

    const fetchPaquetes = async () => {
      try {
        const response = await axios.get(`${API_URL}/dropdown/get_paquetes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPaquetes(response.data.paquetes || []);
      } catch (error) {
        console.error("Error al obtener paquetes:", error);
        setAlertaError(true);
        setErrorMensaje("Error al obtener paquetes. Intente nuevamente más tarde.");
      }
    };

    const fetchUbicacionesIncidencias = async () => {
      try {
        const response = await axios.get(`${API_URL}/ubicacion-paquetes-danados`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIncidenciasUbicadas(response.data.data || []);
      } catch (error) {
        console.error("Error al obtener incidencias ubicadas:", error);
        setAlertaError(true);
        setErrorMensaje("Error al obtener incidencias ubicadas. Intente nuevamente más tarde.");
      }
    };

    fetchUbicaciones();
    fetchPaquetes();
    fetchUbicacionesIncidencias();
  }, [token]);

  const combineIncidenciasConPaquetes = useCallback(() => {
    return incidenciasUbicadas.map((incidencia) => {
      const paquete = paquetes.find((p) => p.id === incidencia.id_paquete);
      return {
        ...incidencia,
        uuid: paquete ? paquete.uuid : "UUID no disponible",
      };
    });
  }, [incidenciasUbicadas, paquetes]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!ubicacionSeleccionada) {
      setAlertaError(true);
      setErrorMensaje("Debe seleccionar una ubicación.");
      return;
    }

    const paquetesConUuid = combineIncidenciasConPaquetes();

    const paqueteEncontrado = paquetesConUuid.find(
      (item) => item.uuid === paqueteUuid
    );

    if (!paqueteEncontrado) {
      setAlertaError(true);
      setErrorMensaje("Paquete no encontrado para la actualización.");
      return;
    }

    const datosRegistro = {
      codigo_qr_paquete: paqueteUuid,
      codigo_nomenclatura_ubicacion: ubicacionSeleccionada.value,
      estado: true, // Campo requerido por la API
    };

    try {
      const response = await axios.put(`${API_URL}/ubicacion-paquetes-danados/${paqueteEncontrado.id}`, datosRegistro, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setAlertaExito(true);
        setTimeout(() => {
          setAlertaExito(false);
          window.location.reload(); // Refrescar la página
        }, 3000);
      } else {
        setAlertaError(true);
        setErrorMensaje("Error al actualizar la ubicación del paquete.");
      }
    } catch (error) {
      setAlertaError(true);
      const mensajeError = error.response ? error.response.data.message : "Error al actualizar la ubicación del paquete.";
      setErrorMensaje(mensajeError);
      console.error("Error al actualizar la ubicación del paquete:", error.response ? error.response.data : error);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={() => toggle(false)}>
      <ModalHeader toggle={() => toggle(false)}>Ubicar Paquete Dañado</ModalHeader>
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
        <Button color="secondary" onClick={() => toggle(false)}>
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
