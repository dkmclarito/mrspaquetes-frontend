import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import "/src/styles/Empleados.css";

const ModalEditarEmpleado = ({
  modalEditar,
  empleadoEditado,
  setEmpleadoEditado,
  guardarCambiosEmpleado,
  setModalEditar,
  cargos 
}) => (
  <Modal show={modalEditar} onHide={() => setModalEditar(false)} className="modal-editar-empleado">
    <Modal.Header closeButton>
      <Modal.Title>Editar Empleado</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Form>
        <Form.Group controlId="nombre">
          <Form.Label>Nombres</Form.Label>
          <Form.Control
            type="text"
            value={empleadoEditado ? empleadoEditado.nombres : ''}
            onChange={(e) => setEmpleadoEditado({ ...empleadoEditado, nombres: e.target.value })}
          />
        </Form.Group>
        <Form.Group controlId="apellido">
          <Form.Label>Apellidos</Form.Label>
          <Form.Control
            type="text"
            value={empleadoEditado ? empleadoEditado.apellidos : ''}
            onChange={(e) => setEmpleadoEditado({ ...empleadoEditado, apellidos: e.target.value })}
          />
        </Form.Group>
        <Form.Group controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            value={empleadoEditado ? empleadoEditado.email : ''}
            onChange={(e) => setEmpleadoEditado({ ...empleadoEditado, email: e.target.value })}
          />
        </Form.Group>
        <Form.Group controlId="telefono">
          <Form.Label>Teléfono</Form.Label>
          <Form.Control
            type="text"
            value={empleadoEditado ? empleadoEditado.telefono : ''}
            onChange={(e) => setEmpleadoEditado({ ...empleadoEditado, telefono: e.target.value })}
          />
        </Form.Group>
        <Form.Group controlId="cargo">
          <Form.Label>Cargo</Form.Label>
          <Form.Control
            as="select"
            value={empleadoEditado ? empleadoEditado.id_cargo : ''}
            onChange={(e) => setEmpleadoEditado({ ...empleadoEditado, id_cargo: e.target.value })}
          >
            <option value="">Seleccionar cargo</option>
            {cargos.map(cargo => (
              <option key={cargo.id} value={cargo.id}>
                {cargo.nombre}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        <Form.Group controlId="fecha_contratacion">
          <Form.Label>Fecha de Contratación</Form.Label>
          <Form.Control
            type="date"
            value={empleadoEditado ? empleadoEditado.fecha_contratacion : ''}
            onChange={(e) => setEmpleadoEditado({ ...empleadoEditado, fecha_contratacion: e.target.value })}
          />
        </Form.Group>
      </Form>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="primary" onClick={guardarCambiosEmpleado}>Guardar Cambios</Button>
      <Button variant="secondary" onClick={() => setModalEditar(false)}>Cancelar</Button>
    </Modal.Footer>
  </Modal>
);
export default ModalEditarEmpleado;