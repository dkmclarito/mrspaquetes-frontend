import React from "react";
import PropTypes from "prop-types";
import { Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input, Button } from "reactstrap";

// Función para convertir la fecha de YYYY-MM-DD HH:MM:SS a YYYY-MM-DD
const formatDate = (date) => {
  if (!date) return "";
  const [year, month, day] = date.split(' ')[0].split('-');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

// Función para manejar los cambios en los campos del formulario
const handleChange = (e, setClienteEditado, clienteEditado) => {
  const { id, value } = e.target;
  setClienteEditado({ ...clienteEditado, [id]: value });
};

// Función para manejar el cambio en el campo de fecha
const handleFechaRegistroChange = (e, setClienteEditado, clienteEditado) => {
  const fechaRegistro = e.target.value;
  setClienteEditado({ ...clienteEditado, fecha_registro: fechaRegistro });
};

const ModalEditarCliente = ({
  modalEditar,
  clienteEditado,
  setClienteEditado,
  guardarCambiosCliente,
  setModalEditar
}) => (
  <Modal isOpen={modalEditar} toggle={() => setModalEditar(false)}>
    <ModalHeader toggle={() => setModalEditar(false)}>Editar Cliente</ModalHeader>
    <ModalBody>
      <FormGroup>
        <Label for="nombre">Nombre</Label>
        <Input 
          type="text" 
          id="nombre" 
          value={clienteEditado ? clienteEditado.nombre : ""} 
          onChange={(e) => handleChange(e, setClienteEditado, clienteEditado)} 
        />
      </FormGroup>
      <FormGroup>
        <Label for="apellido">Apellido</Label>
        <Input 
          type="text" 
          id="apellido" 
          value={clienteEditado ? clienteEditado.apellido : ""} 
          onChange={(e) => handleChange(e, setClienteEditado, clienteEditado)} 
        />
      </FormGroup>
      <FormGroup>
        <Label for="email">Email</Label>
        <Input 
          type="email" 
          id="email" 
          value={clienteEditado ? clienteEditado.email : ""} 
          onChange={(e) => handleChange(e, setClienteEditado, clienteEditado)} 
        />
      </FormGroup>
      <FormGroup>
        <Label for="dui">DUI</Label>
        <Input 
          type="text" 
          id="dui" 
          value={clienteEditado ? clienteEditado.dui : ""} 
          onChange={(e) => handleChange(e, setClienteEditado, clienteEditado)} 
        />
      </FormGroup>
      <FormGroup>
        <Label for="telefono">Teléfono</Label>
        <Input 
          type="text" 
          id="telefono" 
          value={clienteEditado ? clienteEditado.telefono : ""} 
          onChange={(e) => handleChange(e, setClienteEditado, clienteEditado)} 
        />
      </FormGroup>
      <FormGroup>
        <Label for="fecha_registro">Fecha de Registro</Label>
        <Input 
          type="date" 
          id="fecha_registro" 
          value={clienteEditado ? formatDate(clienteEditado.fecha_registro) : ""} 
          onChange={(e) => handleFechaRegistroChange(e, setClienteEditado, clienteEditado)} 
        />
      </FormGroup>
    </ModalBody>
    <ModalFooter>
      <Button color="primary" onClick={guardarCambiosCliente}>Guardar Cambios</Button>
      <Button color="secondary" onClick={() => setModalEditar(false)}>Cancelar</Button>
    </ModalFooter>
  </Modal>
);

ModalEditarCliente.propTypes = {
  modalEditar: PropTypes.bool.isRequired,
  clienteEditado: PropTypes.object,
  setClienteEditado: PropTypes.func.isRequired,
  guardarCambiosCliente: PropTypes.func.isRequired,
  setModalEditar: PropTypes.func.isRequired,
};

export default ModalEditarCliente;
