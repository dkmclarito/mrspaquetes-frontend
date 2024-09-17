import React from "react";
import PropTypes from "prop-types";
import { Button, Table } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faPencilAlt, faEye } from "@fortawesome/free-solid-svg-icons";

const TablaUbicacion = ({ ubicaciones, eliminarUbicacion, toggleModalEditar, verDetallesUbicacion }) => {
    return (
    <div className="table-responsive" style={{ marginTop: "-10px" }}>
      <Table striped className="table-centered table-nowrap mb-0">
        <thead className="thead-light">
          <tr>
            <th className="text-center">ID</th>
            <th className="text-center">Id Paquete</th>
            <th className="text-center">Paquete</th>
            <th className="text-center">Id Ubicación</th>
            <th className="text-center">Ubicación</th>
            <th className="text-center">Estado</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ubicaciones.length > 0 ? (
            ubicaciones.map(ubicacion => (
              <tr key={ubicacion.id}>
                <td className="text-center">{ubicacion.id}</td>
                <td className="text-center">{ubicacion.id_paquete || 'N/A'}</td>
                <td className="text-center">{ubicacion.paquete || 'N/A'}</td>
                <td className="text-center">{ubicacion.id_ubicacion || 'N/A'}</td>
                <td className="text-center">{ubicacion.ubicacion || 'N/A'}</td>
                <td className="text-center">{ubicacion.estado === 1 ? 'Activo' : 'Inactivo'}</td>
                <td className="text-center">
                  <div className="button-container">
                    <Button
                      className="me-2 btn-icon btn-danger"
                      onClick={() => eliminarUbicacion(ubicacion.id)}
                      aria-label="Eliminar Ubicacion"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </Button>
                    <Button
                      className="btn-icon btn-editar"
                      onClick={() => toggleModalEditar(ubicacion)}
                      aria-label="Editar Ubicacion"
                    >
                      <FontAwesomeIcon icon={faPencilAlt} />
                    </Button>
                    <Button
                      className="btn-icon btn-success"
                      onClick={() => verDetallesUbicacion(ubicacion.id)}
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center">
                No hay paquetes disponibles
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

TablaUbicacion.propTypes = {
  ubicaciones: PropTypes.array.isRequired,
  eliminarUbicacion: PropTypes.func.isRequired,
  toggleModalEditar: PropTypes.func.isRequired,
  verDetallesUbicacion: PropTypes.func.isRequired,
};

export default TablaUbicacion;
