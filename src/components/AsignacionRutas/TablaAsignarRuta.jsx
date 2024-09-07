import React from "react";
import PropTypes from "prop-types";
import { Button, Table } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faPencilAlt, faEye } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import "../../styles/Vehiculos.css";

const TablaAsignacionRutas = ({ asignaciones, eliminarAsignacion, editarAsignacion }) => {
  const navigate = useNavigate();

  const verDetallesAsignacion = (id) => {
    navigate(`/DetallesAsignacionRuta/${id}`);
  };

  // Formatea la fecha como Día-Mes-Año
  const formatFecha = (fecha) => {
    if (!fecha) return "N/A";
    const date = new Date(fecha);
    const year = date.getFullYear();
    const month = `0${date.getMonth() + 1}`.slice(-2);
    const day = `0${date.getDate()}`.slice(-2);
    return `${day}-${month}-${year}`;
  };

  return (
    <div className="table-responsive" style={{ marginTop: "-10px" }}>
      <Table striped className="table-centered table-nowrap mb-0">
        <thead className="thead-light">
          <tr>
            <th className="text-center">Código</th>
            <th className="text-center">Ruta</th>
            <th className="text-center">Vehículo</th>
            <th className="text-center">Paquete</th>
            <th className="text-center">Fecha</th>
            <th className="text-center">Estado</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {asignaciones.length > 0 ? (
            asignaciones.map((asignacion) => (
              <tr key={asignacion.id}>
                <td className="text-start">{asignacion.codigo_unico_asignacion || "N/A"}</td>
                <td className="text-start">{asignacion.id_ruta || "N/A"}</td>
                <td className="text-start">{asignacion.id_vehiculo || "N/A"}</td>
                <td className="text-start">{asignacion.id_paquete || "N/A"}</td>
                <td className="text-start">{formatFecha(asignacion.fecha)}</td>
                <td className="text-start">{asignacion.id_estado || "N/A"}</td>
                <td className="text-start">
                  <div className="button-container">
                    <Button
                      className="me-2 btn-icon btn-danger"
                      onClick={() => eliminarAsignacion(asignacion.id)}
                      aria-label="Eliminar Asignación"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </Button>
                    <Button
                      className="btn-icon btn-editar"
                      onClick={() => editarAsignacion(asignacion)}
                      aria-label="Editar Asignación"
                    >
                      <FontAwesomeIcon icon={faPencilAlt} />
                    </Button>
                    <Button
                      className="btn-icon btn-success"
                      onClick={() => verDetallesAsignacion(asignacion.id)}
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
                No hay asignaciones de rutas disponibles
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

TablaAsignacionRutas.propTypes = {
  asignaciones: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      codigo_unico_asignacion: PropTypes.string,
      id_ruta: PropTypes.number,
      id_vehiculo: PropTypes.number,
      id_paquete: PropTypes.number,
      fecha: PropTypes.string,
      id_estado: PropTypes.number,
    })
  ).isRequired,
  eliminarAsignacion: PropTypes.func.isRequired,
  editarAsignacion: PropTypes.func.isRequired,
};

export default TablaAsignacionRutas;