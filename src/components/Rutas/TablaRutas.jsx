import React from "react";
import PropTypes from "prop-types";
import { Button, Table } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faPencilAlt, faEye } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import "../../styles/Vehiculos.css";

const TablaRutas = ({ rutas, eliminarRuta, toggleModalEditar }) => {
  const navigate = useNavigate();

  const verDetallesRutas = (id) => {
    navigate(`/DetallesRutas/${id}`);
  };

  // Formatea la fecha como Día-Mes-Año
  const formatFecha = (fecha) => {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    const year = date.getFullYear();
    const month = (`0${date.getMonth() + 1}`).slice(-2);
    const day = (`0${date.getDate()}`).slice(-2);
    return `${day}-${month}-${year}`;
  };

  return (
    <div className="table-responsive" style={{ marginTop: "-10px" }}>
      <Table striped className="table-centered table-nowrap mb-0">
        <thead className="thead-light">
          <tr>
            <th className="text-center">ID</th>
            <th className="text-center">Nombre</th>
            <th className="text-center">Destino</th>
            <th className="text-center">Bodega</th>
            <th className="text-center">Estado</th>
            <th className="text-center">Fecha Programada</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rutas.length > 0 ? (
            rutas.map(ruta => (
              <tr key={ruta.id}>
                <td className="text-start">{ruta.id || 'N/A'}</td>
                <td className="text-start">{ruta.nombre || 'N/A'}</td>
                <td className="text-start">{ruta.destino || 'N/A'}</td>
                <td className="text-start">{ruta.bodega || 'N/A'}</td>
                <td className="text-start">{ruta.estado || 'N/A'}</td>
                <td className="text-start">{formatFecha(ruta.fecha_programada)}</td>
                <td className="text-start">
                  <div className="button-container">
                    <Button
                      className="me-2 btn-icon btn-danger"
                      onClick={() => eliminarRuta(ruta.id)}
                      aria-label="Eliminar Ruta"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </Button>
                    <Button
                      className="btn-icon btn-editar"
                      onClick={() => toggleModalEditar(ruta)}
                      aria-label="Editar Ruta"
                    >
                      <FontAwesomeIcon icon={faPencilAlt} />
                    </Button>
                    <Button
                      className="btn-icon btn-success"
                      onClick={() => verDetallesRutas(ruta.id)}                      
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
                No hay rutas disponibles
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

TablaRutas.propTypes = {
  rutas: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      id_destino: PropTypes.number,
      nombre: PropTypes.string,
      id_bodega: PropTypes.number,
      estado: PropTypes.string,
      distancia_km: PropTypes.number,
      duracion_aproximada: PropTypes.string,
      fecha_programada: PropTypes.string,
    })
  ).isRequired,
  destinos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      nombre: PropTypes.string.isRequired,
    })
  ).isRequired,
  bodegas: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      nombre: PropTypes.string.isRequired,
    })
  ).isRequired,
  eliminarRuta: PropTypes.func.isRequired,
  toggleModalEditar: PropTypes.func.isRequired,
};

export default TablaRutas;