import React from "react";
import PropTypes from "prop-types";
import { Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input, Button } from "reactstrap";

const ModalEditarEmpleado = ({
  modalEditar,
  empleadoEditado,
  setEmpleadoEditado,
  guardarCambiosEmpleado,
  setModalEditar
}) => (
  <Modal isOpen={modalEditar} toggle={() => setModalEditar(false)}>
    <ModalHeader toggle={() => setModalEditar(false)}>Editar Empleado</ModalHeader>
    <ModalBody>
      <FormGroup>
        <Label for="nombre">Nombres</Label>
        <Input type="text" id="nombre" value={empleadoEditado ? empleadoEditado.nombres : ""} onChange={(e) => setEmpleadoEditado({...empleadoEditado, nombres: e.target.value})} />
      </FormGroup>
      <FormGroup>
        <Label for="apellido">Apellidos</Label>
        <Input type="text" id="apellido" value={empleadoEditado ? empleadoEditado.apellidos : ""} onChange={(e) => setEmpleadoEditado({...empleadoEditado, apellidos: e.target.value})} />
      </FormGroup>
      <FormGroup>
        <Label for="email">Email</Label>
        <Input type="email" id="email" value={empleadoEditado ? empleadoEditado.email : ""} onChange={(e) => setEmpleadoEditado({...empleadoEditado, email: e.target.value})} />
      </FormGroup>
      <FormGroup>
        <Label for="telefono">Teléfono</Label>
        <Input type="text" id="telefono" value={empleadoEditado ? empleadoEditado.telefono : ""} onChange={(e) => setEmpleadoEditado({...empleadoEditado, telefono: e.target.value})} />
      </FormGroup>
      <FormGroup>
        <Label for="cargo">Cargo</Label>
        <Input type="text" id="cargo" value={empleadoEditado ? empleadoEditado.id_cargo : ""} onChange={(e) => setEmpleadoEditado({...empleadoEditado, id_cargo: e.target.value})} />
      </FormGroup>
      <FormGroup>
        <Label for="fecha_contratacion">Fecha de Contratación</Label>
        <Input type="date" id="fecha_contratacion" value={empleadoEditado ? empleadoEditado.fecha_contratacion : ""} onChange={(e) => setEmpleadoEditado({...empleadoEditado, fecha_contratacion: e.target.value})} />
      </FormGroup>
    </ModalBody>
    <ModalFooter>
      <Button color="primary" onClick={guardarCambiosEmpleado}>Guardar Cambios</Button>
      <Button color="secondary" onClick={() => setModalEditar(false)}>Cancelar</Button>
    </ModalFooter>
  </Modal>
);

ModalEditarEmpleado.propTypes = {
  modalEditar: PropTypes.bool.isRequired,
  empleadoEditado: PropTypes.object,
  setEmpleadoEditado: PropTypes.func.isRequired,
  guardarCambiosEmpleado: PropTypes.func.isRequired,
  setModalEditar: PropTypes.func.isRequired,
};

export default ModalEditarEmpleado;
