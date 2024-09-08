import React from "react"
import PropTypes from "prop-types"
import { Button, Table } from "reactstrap"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTimes, faPencilAlt, faEye } from "@fortawesome/free-solid-svg-icons"
import { useNavigate } from "react-router-dom"

const TablaAsignacionRutas = ({ asignaciones, eliminarAsignacion, editarAsignacion, rutas, vehiculos, estados }) => {
  const navigate = useNavigate()

  const verDetallesAsignacion = (id) => {
    navigate(`/DetallesAsignacionRutas/${id}`)
  }

  const formatFecha = (fecha) => {
    if (!fecha) return "N/A"
    const date = new Date(fecha)
    return date.toLocaleDateString('es-ES')
  }

  const getNombreRuta = (id_ruta) => {
    const ruta = rutas.find(r => r.id === id_ruta)
    return ruta ? ruta.nombre : "N/A"
  }

  const getPlacaVehiculo = (id_vehiculo) => {
    const vehiculo = vehiculos.find(v => v.id === id_vehiculo)
    return vehiculo ? vehiculo.placa : "N/A"
  }

  const getNombreEstado = (id_estado) => {
    const estado = estados.find(e => e.id === id_estado)
    return estado ? estado.estado : "N/A"
  }

  return (
    <div className="table-responsive">
      <Table striped className="table-centered table-nowrap mb-0">
        <thead className="thead-light">
          <tr>
            <th className="text-center">Código</th>
            <th className="text-center">Ruta</th>
            <th className="text-center">Vehículo</th>
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
                <td className="text-start">{getNombreRuta(asignacion.id_ruta)}</td>
                <td className="text-start">{getPlacaVehiculo(asignacion.id_vehiculo)}</td>
                <td className="text-start">{formatFecha(asignacion.fecha)}</td>
                <td className="text-start">{getNombreEstado(asignacion.id_estado)}</td>
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
              <td colSpan="6" className="text-center">
                No hay asignaciones de rutas disponibles
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  )
}

TablaAsignacionRutas.propTypes = {
  asignaciones: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      codigo_unico_asignacion: PropTypes.string,
      id_ruta: PropTypes.number,
      id_vehiculo: PropTypes.number,
      fecha: PropTypes.string,
      id_estado: PropTypes.number,
    })
  ).isRequired,
  eliminarAsignacion: PropTypes.func.isRequired,
  editarAsignacion: PropTypes.func.isRequired,
  rutas: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      nombre: PropTypes.string,
    })
  ).isRequired,
  vehiculos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      placa: PropTypes.string,
    })
  ).isRequired,
  estados: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      estado: PropTypes.string,
    })
  ).isRequired,
}

export default TablaAsignacionRutas