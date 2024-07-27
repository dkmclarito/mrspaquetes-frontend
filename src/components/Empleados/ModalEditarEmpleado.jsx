import React, { useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import "/src/styles/Empleados.css";
import { toast } from 'react-toastify';

const ModalEditarEmpleado = ({
  modalEditar,
  empleadoEditado,
  setEmpleadoEditado,
  guardarCambiosEmpleado,
  setModalEditar,
  cargos 
}) => {
  const [isTelefonoValid, setIsTelefonoValid] = useState(true);
  const [isFechaContratacionValida, setIsFechaContratacionValida] = useState(true);
  const [isNombreValido, setIsNombreValido] = useState(true);
  const [isApellidoValido, setIsApellidoValido] = useState(true);

  const validateTelefono = (telefono) => {
    return telefono.length === 9 && telefono.match(/^\d{4}-\d{4}$/);
  };

  const validateFechaContratacion = (fecha) => {
    const [anio, mes, dia] = fecha.split("-");
    const anioActual = new Date().getFullYear();
    const fechaContratacionDate = new Date(`${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`);
    const fechaActual = new Date();
    return (
      parseInt(anio) === anioActual &&
      fechaContratacionDate <= fechaActual
    );
  };

  const validateNombre = (nombre) => {
    const maxLength = 80;
    const regex = /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]*$/; // Permite solo letras y espacios
    return nombre.length > 0 && nombre.length <= maxLength && regex.test(nombre);
  };

  const validateApellido = (apellido) => {
    const maxLength = 80;
    const regex = /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]*$/; // Permite solo letras y espacios
    return apellido.length > 0 && apellido.length <= maxLength && regex.test(apellido);
  };

  const formatTelefono = (telefono) => {
    const value = telefono.replace(/[^\d]/g, "").slice(0, 8);
    let formattedTelefono = "";
    if (value.length > 4) {
      formattedTelefono = value.slice(0, 4) + "-" + value.slice(4);
    } else {
      formattedTelefono = value;
    }
    return formattedTelefono;
  };

  const handleTelefonoChange = (e) => {
    const value = e.target.value;
    const formattedTelefono = formatTelefono(value);
    setEmpleadoEditado((prevState) => ({ ...prevState, telefono: formattedTelefono }));
    setIsTelefonoValid(validateTelefono(formattedTelefono));
  };

  const handleFechaContratacionChange = (e) => {
    const fecha = e.target.value;
    const [anio, mes, dia] = fecha.split("-");
    const anioActual = new Date().getFullYear();
    const fechaContratacionDate = new Date(`${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`);
    const fechaActual = new Date();
    const esFechaValida = parseInt(anio) === anioActual && fechaContratacionDate <= fechaActual;
    setIsFechaContratacionValida(esFechaValida);
    if (esFechaValida) {
      setEmpleadoEditado((prevState) => ({ ...prevState, fecha_contratacion: fecha }));
    }
  };

  const handleNombreChange = (e) => {
    const nombre = e.target.value;
    const cleanedNombre = nombre.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ\s]/g, ''); // Filtra caracteres no permitidos
    setEmpleadoEditado((prevState) => ({ ...prevState, nombres: cleanedNombre }));
    setIsNombreValido(validateNombre(cleanedNombre));
  };

  const handleApellidoChange = (e) => {
    const apellido = e.target.value;
    const cleanedApellido = apellido.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ\s]/g, ''); // Filtra caracteres no permitidos
    setEmpleadoEditado((prevState) => ({ ...prevState, apellidos: cleanedApellido }));
    setIsApellidoValido(validateApellido(cleanedApellido));
  };

  const handleGuardarCambios = () => {
    const isNombreValido = validateNombre(empleadoEditado.nombres);
    const isApellidoValido = validateApellido(empleadoEditado.apellidos);
    
    if (!isTelefonoValid) {
      toast.error("El número de teléfono ingresado no es válido. Debe tener el formato 0000-0000.", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });
      return;
    }

    if (!isFechaContratacionValida) {
      toast.error("La fecha de contratación debe estar en el año actual y no puede ser posterior a la fecha actual.", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });
      return;
    }

    if (!isNombreValido) {
      toast.error("El nombre no puede estar vacío, contener números ni caracteres especiales, y debe tener menos de 80 caracteres.", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });
      return;
    }

    if (!isApellidoValido) {
      toast.error("El apellido no puede estar vacío, contener números ni caracteres especiales, y debe tener menos de 80 caracteres.", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });
      return;
    }

    guardarCambiosEmpleado();
  };

  useEffect(() => {
    if (empleadoEditado && empleadoEditado.telefono) {
      const formattedTelefono = formatTelefono(empleadoEditado.telefono);
      if (empleadoEditado.telefono !== formattedTelefono) {
        setEmpleadoEditado((prevState) => ({ ...prevState, telefono: formattedTelefono }));
      }
      setIsTelefonoValid(validateTelefono(formattedTelefono));
    }
  }, [empleadoEditado]);

  return (
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
              onChange={handleNombreChange}
              isInvalid={!isNombreValido}
            />
            <Form.Control.Feedback type="invalid">
              El nombre no puede estar vacío, contener números ni caracteres especiales, y debe tener menos de 80 caracteres.
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="apellido">
            <Form.Label>Apellidos</Form.Label>
            <Form.Control
              type="text"
              value={empleadoEditado ? empleadoEditado.apellidos : ''}
              onChange={handleApellidoChange}
              isInvalid={!isApellidoValido}
            />
            <Form.Control.Feedback type="invalid">
              El apellido no puede estar vacío, contener números ni caracteres especiales, y debe tener menos de 80 caracteres.
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="telefono">
            <Form.Label>Teléfono</Form.Label>
            <Form.Control
              type="text"
              value={empleadoEditado ? empleadoEditado.telefono : ''}
              onChange={handleTelefonoChange}
              isInvalid={!isTelefonoValid}
              placeholder="0000-0000"
            />
            <Form.Control.Feedback type="invalid">
              El teléfono ingresado no es válido. Debe tener el formato 0000-0000.
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="cargo">
            <Form.Label>Cargo</Form.Label>
            <Form.Control
              as="select"
              value={empleadoEditado ? empleadoEditado.id_cargo : ''}
              onChange={(e) => setEmpleadoEditado((prevState) => ({ ...prevState, id_cargo: e.target.value }))}
            >
              <option value="">Seleccionar cargo</option>
              {cargos.map(cargo => (
                <option key={cargo.id} value={cargo.id}>
                  {cargo.nombre}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="fechaContratacion">
            <Form.Label>Fecha de Contratación</Form.Label>
            <Form.Control
              type="date"
              value={empleadoEditado ? empleadoEditado.fecha_contratacion : ''}
              onChange={handleFechaContratacionChange}
              isInvalid={!isFechaContratacionValida}
              max={new Date().toISOString().split("T")[0]} 
            />
            <Form.Control.Feedback type="invalid">
              La fecha de contratación debe estar en el año actual y no puede ser posterior a la fecha actual.
            </Form.Control.Feedback>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setModalEditar(false)}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleGuardarCambios}>
          Guardar Cambios
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEditarEmpleado;
