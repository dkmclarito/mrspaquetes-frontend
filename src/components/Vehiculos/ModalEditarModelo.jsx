import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input, Button, Row, Col } from "reactstrap";

const ModalEditarModelo = ({
  modalEditar,
  modeloEditado,
  setModeloEditado,
  guardarCambiosModelo,
  setModalEditar,
  marcas = []
}) => {
  const [error, setError] = useState(null);
  const [marcaSeleccionada, setMarcaSeleccionada] = useState("");

  useEffect(() => {
    if (modalEditar && modeloEditado) {
      setError(null);
      // Buscar la marca seleccionada en el array de marcas
      const marca = marcas.find(marca => marca.id === modeloEditado.id_marca);
      setMarcaSeleccionada(marca ? marca.nombre : "");
    }
  }, [modalEditar, modeloEditado, marcas]);

  const handleGuardarCambios = () => {
    setError(null);

    if (!modeloEditado.nombre) {
      setError("El nombre del modelo no puede estar vacío.");
      return;
    }

    if (!modeloEditado.id_marca) {
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
    setModalEditar(false); // Cerrar el modal después de guardar
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setModeloEditado((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    // Si se selecciona una nueva marca, actualizar el nombre de la marca seleccionada
    if (name === "id_marca") {
      const marca = marcas.find(marca => marca.id === value);
      setMarcaSeleccionada(marca ? marca.nombre : "");
    }
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
            name="nombre"
            value={modeloEditado?.nombre || ""}
            onChange={handleInputChange}
            required
          />
        </FormGroup>

        <Row>
          <FormGroup>
            <Label for="marca">Marca</Label>
            <Input
              type="select"
              id="marca"
              name="id_marca"
              value={modeloEditado?.id_marca || ""}
              onChange={handleInputChange}
              required
            >
              <option value="">Seleccione Marca</option>
              {marcas.map((marca) => (
                <option key={marca.id} value={marca.id}>
                  {marca.nombre}
                </option>
              ))}
            </Input>
          </FormGroup>
        </Row>

        <FormGroup>
          <Label for="descripcion">Descripción</Label>
          <Input
            type="textarea"
            id="descripcion"
            name="descripcion"
            value={modeloEditado?.descripcion || ""}
            onChange={handleInputChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label for="status">Estado</Label>
          <Input
            type="select"
            id="status"
            name="status"
            value={modeloEditado?.status || ""}
            onChange={handleInputChange}
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
  marcas: PropTypes.array
};

export default ModalEditarModelo;
