import React from "react";
import PropTypes from "prop-types";
import { Button } from "reactstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import "/src/styles/Empleados.css";

const TablaEmpleados = ({ empleados, cargos, eliminarEmpleado, toggleModalEditar }) => {
  const obtenerNombreCargo = (id) => {
    const cargo = cargos.find(cargo => cargo.id === id);
    return cargo ? cargo.nombre : '';
  };

  const obtenerNombreRol = (empleado) => {
    const roles = empleado.user?.roles || [];
    return roles.length > 0 ? roles.map(role => role.name).join(', ') : 'Sin Rol';
  };

  const formatearFecha = (fecha) => {
    const fechaObj = new Date(fecha);
    const dia = String(fechaObj.getDate()).padStart(2, '0');
    const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
    const año = fechaObj.getFullYear();
    return `${dia}-${mes}-${año}`;
  };

  const formatearTelefono = (telefono) => {
    return telefono.replace(/(\d{4})(\d+)/, '$1-$2');
  };

  return (
    <div className="table-responsive" style={{ marginTop: "-10px" }}>
      <table className="table table-centered table-nowrap mb-0">
        <thead className="thead-light">
          <tr>
            <th className="text-center">ID</th>
            <th className="text-center">Nombres</th>
            <th className="text-center">Apellidos</th>
            <th className="text-center">Cargo</th>
            <th className="text-center">Rol</th>
            <th className="text-center">Teléfono</th>
            <th className="text-center">Fecha de Contratación</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {empleados.map((empleado, index) => (
            <tr key={index}>
              <td className="text-center">{empleado.id}</td>
              <td className="text-center">{empleado.nombres}</td>
              <td className="text-center">{empleado.apellidos}</td>
              <td className="text-center">{obtenerNombreCargo(empleado.id_cargo)}</td>
              <td className="text-center">{obtenerNombreRol(empleado)}</td>
              <td className="text-center">{formatearTelefono(empleado.telefono)}</td>
              <td className="text-center">{formatearFecha(empleado.fecha_contratacion)}</td>
              <td className="text-center">
                <div className="button-container">
                  <Button
                    className="me-2 btn-icon btn-danger"
                    onClick={() => eliminarEmpleado(empleado.id)}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </Button>
                  <Button
                    className="btn-icon btn-editar"
                    onClick={() => toggleModalEditar(empleado)}
                  >
                    <FontAwesomeIcon icon={faPencilAlt} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

TablaEmpleados.propTypes = {
  empleados: PropTypes.array.isRequired,
  cargos: PropTypes.array.isRequired,
  eliminarEmpleado: PropTypes.func.isRequired,
  toggleModalEditar: PropTypes.func.isRequired,
};

export default TablaEmpleados;


