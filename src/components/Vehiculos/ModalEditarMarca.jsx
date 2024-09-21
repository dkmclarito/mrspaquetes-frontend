import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input, Button } from "reactstrap";

const ModalEditarMarca = ({
  modalEditar,
  marcaEditada,
  setMarcaEditada,
  guardarCambiosMarca,
  setModalEditar
}) => {
  const [error, setError] = useState(null);

  useEffect(() => {
    if (modalEditar && marcaEditada) {
      setError(null);
    }
  }, [modalEditar, marcaEditada]);

  const handleGuardarCambios = () => {
    // Restablecer el mensaje de error en cada intento de guardado
    setError(null);

    if (!marcaEditada.nombre) {
      setError("El nombre de la marca no puede estar vacío.");
      return;
    }

    if (!marcaEditada.descripcion) {
      setError("La descripción de la marca no puede estar vacía.");
      return;
    }

    // Preparar datos de la marca para guardarlos
    const marcaActualizada = {
      ...marcaEditada,
    };

    guardarCambiosMarca(marcaActualizada);
  };

  return (
    <Modal isOpen={modalEditar} toggle={() => setModalEditar(false)}>
      <ModalHeader toggle={() => setModalEditar(false)}>Editar Marca</ModalHeader>
      <ModalBody>
        <FormGroup>
          <Label for="nombre">Nombre</Label>
          <Input
            type="text"
            id="nombre"
            value={marcaEditada ? marcaEditada.nombre : ""}
            onChange={(e) => setMarcaEditada(prevState => ({ ...prevState, nombre: e.target.value }))}
            required
          />
        </FormGroup>
        <FormGroup>
          <Label for="descripcion">Descripción</Label>
          <Input
            type="textarea"
            id="descripcion"
            value={marcaEditada ? marcaEditada.descripcion : ""}
            onChange={(e) => setMarcaEditada(prevState => ({ ...prevState, descripcion: e.target.value }))}
            required
          />
        </FormGroup>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleGuardarCambios}>Guardar Cambios</Button>
        <Button color="secondary" onClick={() => setModalEditar(false)}>Cancelar</Button>
      </ModalFooter>
    </Modal>
  );
};

ModalEditarMarca.propTypes = {
  modalEditar: PropTypes.bool.isRequired,
  marcaEditada: PropTypes.object,
  setMarcaEditada: PropTypes.func.isRequired,
  guardarCambiosMarca: PropTypes.func.isRequired,
  setModalEditar: PropTypes.func.isRequired
};

export default ModalEditarMarca;
