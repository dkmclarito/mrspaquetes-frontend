import React from "react";
import PropTypes from "prop-types";
import { Button, Table } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faPencilAlt,
  faEye,
  faPlay,
  faStop,
} from "@fortawesome/free-solid-svg-icons";

const TablaRutasRecoleccion = ({
  rutas,
  vehiculos,
  estados,
  eliminarRuta,
  verDetallesRuta,
  editarRuta,
  iniciarRecoleccion,
  finalizarRecoleccion,
}) => {
  const obtenerNombreVehiculo = (id) => {
    const vehiculo = vehiculos.find((v) => v.id === id);
    return vehiculo ? vehiculo.placa : "Vehículo no asignado";
  };

  const obtenerNombreEstado = (id) => {
    const estado = estados.find((e) => e.id === id);
    return estado ? estado.estado : "Estado desconocido";
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "Fecha no disponible";
    const fechaObj = new Date(fecha);
    const dia = String(fechaObj.getDate()).padStart(2, "0");
    const mes = String(fechaObj.getMonth() + 1).padStart(2, "0");
    const año = fechaObj.getFullYear();
    return `${dia}-${mes}-${año}`;
  };

  return (
    <div className="table-responsive" style={{ marginTop: "-10px" }}>
      <Table striped className="table-centered table-nowrap mb-0">
        <thead className="thead-light">
          <tr>
            <th className="text-center">Código de Ruta</th>
            <th className="text-center">Vehículo</th>
            <th className="text-center">Fecha de Asignación</th>
            <th className="text-center">Estado</th>
            <th className="text-center">Número de Órdenes</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rutas.length > 0 ? (
            rutas.map((ruta) => (
              <tr key={ruta.id}>
                <td>{ruta.nombre}</td>
                <td>{obtenerNombreVehiculo(ruta.id_vehiculo)}</td>
                <td>{formatearFecha(ruta.fecha_asignacion)}</td>
                <td>{obtenerNombreEstado(ruta.estado)}</td>
                <td>{ruta.ordenes_recolecciones?.length || 0}</td>
                <td>
                  <div className="button-container">
                    <Button
                      className="me-2 btn-icon btn-danger"
                      onClick={() => eliminarRuta(ruta.id)}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </Button>
                    <Button
                      className="btn-icon btn-editar"
                      onClick={() => editarRuta(ruta.id)}
                    >
                      <FontAwesomeIcon icon={faPencilAlt} />
                    </Button>
                    <Button
                      className="btn-icon btn-success"
                      onClick={() => verDetallesRuta(ruta.id)}
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </Button>
                    <Button
                      className="btn-icon btn-primary"
                      onClick={() => iniciarRecoleccion(ruta.id)}
                      disabled={!ruta.puedeIniciar}
                    >
                      <FontAwesomeIcon icon={faPlay} />
                    </Button>
                    <Button
                      className="btn-icon btn-warning"
                      onClick={() => finalizarRecoleccion(ruta.id)}
                      disabled={!ruta.puedeFinalizar}
                    >
                      <FontAwesomeIcon icon={faStop} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">
                No hay rutas de recolección disponibles
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

TablaRutasRecoleccion.propTypes = {
  rutas: PropTypes.array.isRequired,
  vehiculos: PropTypes.array.isRequired,
  estados: PropTypes.array.isRequired,
  eliminarRuta: PropTypes.func.isRequired,
  verDetallesRuta: PropTypes.func.isRequired,
  editarRuta: PropTypes.func.isRequired,
  iniciarRecoleccion: PropTypes.func.isRequired,
  finalizarRecoleccion: PropTypes.func.isRequired,
};

export default TablaRutasRecoleccion;
