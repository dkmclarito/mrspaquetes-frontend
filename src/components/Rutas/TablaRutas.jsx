import React from "react";
import PropTypes from "prop-types";
import { Button, Table } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import "../../styles/Vehiculos.css";

const TablaRutas = ({ rutas, destinos, bodegas, eliminarRuta, toggleModalEditar }) => {
  const getEstadoTexto = (estado) => {
    return estado === 1 ? "Activo" : "Inactivo";
  };

  const formatFecha = (fecha) => {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    const year = date.getFullYear();
    const month = (`0${date.getMonth() + 1}`).slice(-2); // getMonth() is zero-based
    const day = (`0${date.getDate()}`).slice(-2);
    return `${year}-${month}-${day}`;
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
            <th className="text-center">Distancia (Km)</th>
            <th className="text-center">Duración Aproximada</th>
            <th className="text-center">Fecha Programada</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rutas.length > 0 ? (
            rutas.map(ruta => {
              const destinoNombre = destinos.find(dest => dest.id === Number(ruta.id_destino))?.nombre;
              const bodegaNombre = bodegas.find(bod => bod.id === Number(ruta.id_bodega))?.nombre;
              return (
                <tr key={ruta.id}>
                  <td className="text-center">{ruta.id}</td>
                  <td className="text-center">{ruta.nombre || 'N/A'}</td>
                  <td className="text-center">{destinoNombre || 'N/A'}</td>
                  <td className="text-center">{bodegaNombre || 'N/A'}</td>
                  <td className="text-center">{getEstadoTexto(ruta.estado) || 'N/A'}</td>
                  <td className="text-center">{ruta.distancia_km || 'N/A'}</td>
                  <td className="text-center">{ruta.duracion_aproximada || 'N/A'}</td>
                  <td className="text-center">{formatFecha(ruta.fecha_programada)}</td>
                  <td className="text-center">
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
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="9" className="text-center">
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
      id: PropTypes.number.isRequired,
      id_destino: PropTypes.number.isRequired,
      nombre: PropTypes.string.isRequired,
      id_bodega: PropTypes.number.isRequired,
      estado: PropTypes.number.isRequired,
      distancia_km: PropTypes.number.isRequired,
      duracion_aproximada: PropTypes.string.isRequired,
      fecha_programada: PropTypes.string.isRequired,
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
