import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input, Button } from "reactstrap";

const ModalEditarModelo = ({
  modalEditar,
  modeloEditado,
  setModeloEditado,
  guardarCambiosModelo,
  setModalEditar,
  marcas
}) => {
  const [error, setError] = useState(null);

  useEffect(() => {
    if (modalEditar && modeloEditado) {
      setError(null);
    }
  }, [modalEditar, modeloEditado]);

  const handleGuardarCambios = () => {
    setError(null);

    if (!modeloEditado.nombre) {
      setError("El nombre del modelo no puede estar vacío.");
      return;
    }

    if (!modeloEditado.marca_id) {
      setError("Debe seleccionar una marca.");
      return;
    }

    if (!modeloEditado.descripcion) {
      setError("La descripción del modelo no puede estar vacía.");
      return;
    }

    const modeloActualizado = {
      ...modeloEditado,
    };

    guardarCambiosModelo(modeloActualizado);
  };

  return (
    <Modal isOpen={modalEditar} toggle={() => setModalEditar(false)}>
      <ModalHeader toggle={() => setModalEditar(false)}>Editar Modelo</ModalHeader>
      <ModalBody>
        <FormGroup>
          <Label for="nombre">Nombre</Label>
          <Input
            type="text"
            id="nombre"
            value={modeloEditado ? modeloEditado.nombre : ""}
            onChange={(e) => setModeloEditado(prevState => ({ ...prevState, nombre: e.target.value }))}
            required
          />
        </FormGroup>
        <FormGroup>
          <Label for="descripcion">Descripción</Label>
          <Input
            type="textarea"
            id="descripcion"
            value={modeloEditado ? modeloEditado.descripcion : ""}
            onChange={(e) => setModeloEditado(prevState => ({ ...prevState, descripcion: e.target.value }))}
            required
          />
        </FormGroup>
        <FormGroup>
          <Label for="status">Estado</Label>
          <Input
            type="select"
            id="status"
            value={modeloEditado ? modeloEditado.status : ""}
            onChange={(e) => setModeloEditado(prevState => ({ ...prevState, status: e.target.value }))}
            required
          >
            <option value="1">Activo</option>
            <option value="0">Inactivo</option>
          </Input>
        </FormGroup>
        {error && <p className="text-danger">{error}</p>}
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleGuardarCambios}>Guardar Cambios</Button>
        <Button color="secondary" onClick={() => setModalEditar(false)}>Cancelar</Button>
      </ModalFooter>
    </Modal>
  );
};

ModalEditarModelo.propTypes = {
  modalEditar: PropTypes.bool.isRequired,
  modeloEditado: PropTypes.object,
  setModeloEditado: PropTypes.func.isRequired,
  guardarCambiosModelo: PropTypes.func.isRequired,
  setModalEditar: PropTypes.func.isRequired,
  marcas: PropTypes.array.isRequired
};

export default ModalEditarModelo;
