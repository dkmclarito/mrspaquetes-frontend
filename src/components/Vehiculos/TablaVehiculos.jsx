import React from "react";
import PropTypes from "prop-types";
import { Button } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faPencilAlt, faEye } from "@fortawesome/free-solid-svg-icons";
import "/src/styles/Clientes.css";

const TablaVehiculos = ({ vehiculos, eliminarVehiculo, toggleModalEditar, verDetallesVehiculo }) => {
  return (
    <div className="table-responsive" style={{ marginTop: "-10px" }}>
      <table className="table table-centered table-nowrap mb-0">
        <thead className="thead-light">
          <tr>
            <th className="text-center">ID</th>
            <th className="text-center">Conductor</th>
            <th className="text-center">Apoyo</th>
            <th className="text-center">Placa</th>
            <th className="text-center">Capacidad de Carga</th>
            <th className="text-center">Estado</th>
            <th className="text-center">Marca</th>
            <th className="text-center">Modelo</th>
            <th className="text-center">Año de Fabricación</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {vehiculos.length > 0 ? (
            vehiculos.map((vehiculo) => (
              <tr key={vehiculo.id}>
                <td className="text-center">{vehiculo.id}</td>
                <td className="text-center">
                  {vehiculo.conductor || "Desconocido"}
                </td>
                <td className="text-center">
                  {vehiculo.apoyo || "Desconocido"}
                </td>
                <td className="text-center">{vehiculo.placa}</td>
                <td className="text-center">{vehiculo.capacidad_carga}</td>
                <td className="text-center">
                  {vehiculo.estado || "Desconocido"}
                </td>
                <td className="text-center">
                  {vehiculo.marca || "Desconocido"}
                </td>
                <td className="text-center">
                  {vehiculo.modelo || "Desconocido"}
                </td>
                <td className="text-center">{vehiculo.year_fabricacion}</td>
                <td className="text-center">
                  <div className="button-container">
                    <Button
                      className="me-2 btn-icon btn-danger"
                      onClick={() => eliminarVehiculo(vehiculo.id)}
                      aria-label="Eliminar vehiculo"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </Button>
                    <Button
                      className="btn-icon btn-editar"
                      onClick={() => toggleModalEditar(vehiculo)}
                      aria-label="Editar vehiculo"
                    >
                      <FontAwesomeIcon icon={faPencilAlt} />
                    </Button>
                    <Button
                      className="btn-icon btn-success"
                      onClick={() => verDetallesVehiculo(vehiculo.id)}
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
      </table>
    </div>
  );
};

TablaVehiculos.propTypes = {
  vehiculos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      conductor: PropTypes.string,
      apoyo: PropTypes.string,
      placa: PropTypes.string.isRequired,
      capacidad_carga: PropTypes.string.isRequired,
      estado: PropTypes.string,
      marca: PropTypes.string,
      modelo: PropTypes.string,
      year_fabricacion: PropTypes.number.isRequired,
    })
  ).isRequired,
  eliminarVehiculo: PropTypes.func.isRequired,
  toggleModalEditar: PropTypes.func.isRequired,
  verDetallesVehiculo: PropTypes.func.isRequired,
};

export default TablaVehiculos;
