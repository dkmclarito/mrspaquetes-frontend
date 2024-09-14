import React from 'react'
import { Table } from 'reactstrap'

const TablaAsignacionRutas = ({ asignaciones, eliminarAsignacion, editarAsignacion }) => {
  if (!Array.isArray(asignaciones) || asignaciones.length === 0) {
    return <p>No hay asignaciones disponibles.</p>
  }

  return (
    <Table responsive striped>
      <thead>
        <tr>
          <th>Código</th>
          <th>Ruta</th>
          <th>Vehículo</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {asignaciones.map((asignacion) => (
          <tr key={asignacion.id}>
            <td>{asignacion.codigo_unico_asignacion}</td>
            <td>{asignacion.ruta?.nombre || 'N/A'}</td>
            <td>{asignacion.vehiculo?.placa || 'N/A'}</td>
            <td>{asignacion.estado?.nombre || 'N/A'}</td>
            <td>
              <button onClick={() => editarAsignacion(asignacion)}>Editar</button>
              <button onClick={() => eliminarAsignacion(asignacion.id)}>Eliminar</button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

export default TablaAsignacionRutas