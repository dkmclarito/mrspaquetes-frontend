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

  return (
    <div className="table-responsive" style={{ marginTop: "-10px" }}>
      <table className="table table-centered table-nowrap mb-0">
        <thead className="thead-light">
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Tipo de Persona</th>
            <th>Email</th>
            <th>DUI</th>
            <th>Teléfono</th>
            <th>Fecha de Registro</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.length > 0 ? (
            clientes.map(cliente => (
              <tr key={cliente.id}>
                <td>{cliente.id}</td>
                <td>{cliente.nombre}</td>
                <td>{cliente.apellido}</td>
                <td>{obtenerNombreTipoPersona(cliente.id_tipo_persona)}</td>
                <td>{cliente.email}</td>
                <td>{cliente.dui}</td>
                <td>{cliente.telefono}</td>
                <td>{cliente.fecha_registro}</td>
                <td>
                  <div className="button-container">
                    <Button
                      className="me-2 btn-icon btn-danger"
                      onClick={() => eliminarCliente(cliente.id)}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </Button>
                    <Button
                      className="btn-icon btn-editar"
                      onClick={() => toggleModalEditar(cliente)}
                    >
                      <FontAwesomeIcon icon={faPencilAlt} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="text-center">No hay datos disponibles</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

TablaClientes.propTypes = {
  clientes: PropTypes.array.isRequired,
  eliminarCliente: PropTypes.func.isRequired,
  toggleModalEditar: PropTypes.func.isRequired,
  tipoPersona: PropTypes.object.isRequired,
};

export default TablaClientes;
