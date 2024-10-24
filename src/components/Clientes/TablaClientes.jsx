import React from "react";
import PropTypes from "prop-types";
import { Button, Table } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faPencilAlt,
  faMapMarkerAlt,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import "/src/styles/Clientes.css";

const TablaClientes = ({
  clientes,
  eliminarCliente,
  toggleModalEditar,
  verDetallesCliente,
  tipoPersona,
  verDirecciones,
}) => {
  const obtenerNombreTipoPersona = (idTipoPersona) => {
    return tipoPersona[idTipoPersona] || "Desconocido";
  };

  const obtenerDocumento = (idTipoPersona, dui, nit) => {
    if (idTipoPersona === 1) {
      return dui || "N/A";
    } else if (idTipoPersona === 2) {
      return nit || "N/A";
    }
    return "N/A";
  };

  const formatearFecha = (fecha) => {
    const opciones = { year: "numeric", month: "2-digit", day: "2-digit" };
    return new Date(fecha).toLocaleDateString("es-ES", opciones);
  };

  return (
    <div className="table-responsive" style={{ marginTop: "-10px" }}>
      <Table striped className="table-centered table-nowrap mb-0">
        <thead className="thead-light">
          <tr>
            <th className="text-center">ID</th>
            <th className="text-center">Nombre</th>
            <th className="text-center">Apellido</th>
            <th className="text-center">Nombre Comercial</th>
            <th className="text-center">Tipo de Persona</th>
            <th className="text-center">DUI/NIT</th>
            <th className="text-center">Teléfono</th>
            <th className="text-center">Fecha de Registro</th>
            <th className="text-center">Direcciones</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.length > 0 ? (
            clientes.map((cliente) => (
              <tr key={cliente.id}>
                <td>{cliente.id}</td>
                <td>{cliente.nombre}</td>
                <td>{cliente.apellido}</td>
                <td>{cliente.nombre_comercial || "-"}</td>
                <td>{obtenerNombreTipoPersona(cliente.id_tipo_persona)}</td>
                <td>
                  {obtenerDocumento(
                    cliente.id_tipo_persona,
                    cliente.dui,
                    cliente.nit
                  )}
                </td>
                <td>{cliente.telefono || "N/A"}</td>
                <td>{formatearFecha(cliente.fecha_registro)}</td>
                <td>
                  <Button
                    color="info"
                    className="btn-sm d-flex align-items-center justify-content-center mx-auto btn-direcciones"
                    onClick={() => verDirecciones(cliente.id)}
                    style={{ width: "fit-content" }}
                  >
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />
                    Ver Direcciones
                  </Button>
                </td>
                <td>
                  <div className="d-flex justify-content-center">
                    <Button
                      color="danger"
                       className="me-2 btn-icon btn-danger"
                      onClick={() => eliminarCliente(cliente.id)}
                      title="Eliminar cliente"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </Button>
                    <Button
                      color="warning"
                      className="btn-sm me-2 btn-icon btn-editar"
                      onClick={() => toggleModalEditar(cliente)}
                      title="Editar cliente"
                    >
                      <FontAwesomeIcon icon={faPencilAlt} />
                    </Button>
                    <Button
                      className="btn-sm me-2 btn-icon btn-success"
                      onClick={() => verDetallesCliente(cliente.id)}
                      title="Ver detalles del cliente"
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="10" className="text-center">
                No hay datos disponibles
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

TablaClientes.propTypes = {
  clientes: PropTypes.array.isRequired,
  eliminarCliente: PropTypes.func.isRequired,
  toggleModalEditar: PropTypes.func.isRequired,
  verDetallesCliente: PropTypes.func.isRequired,
  tipoPersona: PropTypes.objectOf(PropTypes.string).isRequired,
  verDirecciones: PropTypes.func.isRequired,
};

export default TablaClientes;
