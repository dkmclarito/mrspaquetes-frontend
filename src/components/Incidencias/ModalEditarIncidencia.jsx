import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input, Button } from "reactstrap";
import axios from "axios";
import AuthService from "../../services/authService";

const API_URL = import.meta.env.VITE_API_URL;

const ModalEditarIncidencia = ({
  modalEditar,
  incidenciaEditada,
  setIncidenciaEditada,
  guardarCambiosIncidencia,
  setModalEditar
}) => {
  const [tipoIncidencias, setTipoIncidencias] = useState([]);

  useEffect(() => {
    // Cargar los tipos de incidencias desde la API
    const fetchTipoIncidencias = async () => {
      try {
        const token = AuthService.getCurrentUser();
        const response = await axios.get(`${API_URL}/dropdown/get_tipo_incidencia`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.data && Array.isArray(response.data.tipo_incidencia)) {
          setTipoIncidencias(response.data.tipo_incidencia);
        }
      } catch (error) {
        console.error("Error al obtener tipos de incidencias:", error);
      }
    };

    if (modalEditar) {
      fetchTipoIncidencias();
    }
  }, [modalEditar]);

  const handleGuardarCambios = async () => {
    try {
      const token = AuthService.getCurrentUser();
  
      // Convertimos el estado en número antes de enviarlo
      const estadoConvertido = 
        incidenciaEditada.estado === "Abierta" ? 1 : 
        incidenciaEditada.estado === "En Proceso" ? 2 : 
        incidenciaEditada.estado === "Cerrada" ? 3 : null;
  
      if (estadoConvertido === null) {
        console.error("El estado es inválido.");
        return;
      }
  
      // Actualiza solo la descripción y el tipo de incidencia, mantén el resto de los datos
      const incidenciaActualizada = {
        id_paquete: incidenciaEditada.id_paquete,
        descripcion: incidenciaEditada.descripcion,
        fecha_hora: incidenciaEditada.fecha_hora,
        id_tipo_incidencia: parseInt(incidenciaEditada.id_tipo_incidencia, 10),
        estado: estadoConvertido,  // Se envía el estado como número
        fecha_resolucion: incidenciaEditada.fecha_resolucion,
        usuario_reporta: incidenciaEditada.usuario_reporta,
        usuario_asignado: incidenciaEditada.usuario_asignado,
        solucion: incidenciaEditada.solucion
      };
  
      const response = await axios.put(`${API_URL}/incidencias/${incidenciaEditada.id}`, incidenciaActualizada, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
  
      if (response.status === 200) {
        guardarCambiosIncidencia(incidenciaActualizada);
        setModalEditar(false);
        window.location.reload();  // Recarga la página para reflejar los cambios
      } else {
        console.error("Error al actualizar la incidencia");
      }
    } catch (error) {
      console.error("Error al actualizar incidencia:", error);
      if (error.response) {
        console.log("Mensaje de error del servidor:", error.response.data);
      }
    }
  };
  
  

  return (
    <Modal isOpen={modalEditar} toggle={() => setModalEditar(false)}>
      <ModalHeader toggle={() => setModalEditar(false)}>Editar Incidencia</ModalHeader>
      <ModalBody>
        <FormGroup>
          <Label for="descripcion">Descripción</Label>
          <Input
            type="textarea"
            id="descripcion"
            value={incidenciaEditada ? incidenciaEditada.descripcion : ""}
            onChange={(e) => setIncidenciaEditada(prevState => ({ ...prevState, descripcion: e.target.value }))}
            required
          />
        </FormGroup>
        <FormGroup>
          <Label for="tipoIncidencia">Tipo de Incidencia</Label>
          <Input
            type="select"
            id="tipoIncidencia"
            value={incidenciaEditada ? incidenciaEditada.id_tipo_incidencia : ""}
            onChange={(e) => setIncidenciaEditada(prevState => ({ ...prevState, id_tipo_incidencia: e.target.value }))}
            required
          >
            <option value="">Seleccione un tipo de incidencia</option>
            {tipoIncidencias.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
          </Input>
        </FormGroup>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleGuardarCambios}>Guardar Cambios</Button>
        <Button color="secondary" onClick={() => setModalEditar(false)}>Cancelar</Button>
      </ModalFooter>
    </Modal>
  );
};

ModalEditarIncidencia.propTypes = {
  modalEditar: PropTypes.bool.isRequired,
  incidenciaEditada: PropTypes.object,
  setIncidenciaEditada: PropTypes.func.isRequired,
  guardarCambiosIncidencia: PropTypes.func.isRequired,
  setModalEditar: PropTypes.func.isRequired
};

export default ModalEditarIncidencia;
