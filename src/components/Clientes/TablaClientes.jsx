import React from "react";
import PropTypes from "prop-types";
import { Button } from "reactstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import "/src/styles/Clientes.css";

const TablaClientes = ({ clientes, eliminarCliente, toggleModalEditar, tipoPersona }) => {

  // Función para obtener el nombre del tipo de persona
  const obtenerNombreTipoPersona = (idTipoPersona) => {
    return tipoPersona[idTipoPersona] || 'Desconocido';
  };

  // Función para obtener el DUI o el NIT según el tipo de persona
  const obtenerDocumento = (idTipoPersona, dui, nit) => {
    if (idTipoPersona === 1) { // Persona Natural
      return dui || 'N/A';
    } else if (idTipoPersona === 2) { // Persona Jurídica
      return nit || 'N/A';
    }
    return 'N/A';
  };

  // Función para formatear la fecha sin la hora
  const formatearFecha = (fecha) => {
    const opciones = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const fechaFormateada = new Date(fecha).toLocaleDateString('es-ES', opciones);
    return fechaFormateada;
  };

  return (
    <div className="table-responsive" style={{ marginTop: "-10px" }}>
      <table className="table table-centered table-nowrap mb-0">
        <thead className="thead-light">
          <tr>
            <th className="text-center">ID</th>
            <th className="text-center">Nombre</th>
            <th className="text-center">Apellido</th>
            <th className="text-center">Tipo de Persona</th>
            <th className="text-center">DUI/NIT</th>
            <th className="text-center">Teléfono</th>
            <th className="text-center">Fecha de Registro</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.length > 0 ? (
            clientes.map(cliente => (
              <tr key={cliente.id}>
                <td className="text-center">{cliente.id}</td>
                <td className="text-center">{cliente.nombre}</td>
                <td className="text-center">{cliente.apellido}</td>
                <td className="text-center">{obtenerNombreTipoPersona(cliente.id_tipo_persona)}</td>
                <td className="text-center">{obtenerDocumento(cliente.id_tipo_persona, cliente.dui, cliente.nit)}</td>
                <td className="text-center">{cliente.telefono || 'N/A'}</td>
                <td className="text-center">{formatearFecha(cliente.fecha_registro)}</td>
                <td className="text-center">
                  <div className="button-container">
                    <Button
                      className="me-2 btn-icon btn-danger"
                      onClick={() => eliminarCliente(cliente.id)}
                      aria-label="Eliminar cliente"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </Button>
                    <Button
                      className="btn-icon btn-editar"
                      onClick={() => toggleModalEditar(cliente)}
                      aria-label="Editar cliente"
                    >
                      <FontAwesomeIcon icon={faPencilAlt} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center">No hay datos disponibles</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

TablaClientes.propTypes = {
  eliminarCliente: PropTypes.func.isRequired,
  toggleModalEditar: PropTypes.func.isRequired,
  tipoPersona: PropTypes.objectOf(PropTypes.string).isRequired,
};

export default TablaClientes;
