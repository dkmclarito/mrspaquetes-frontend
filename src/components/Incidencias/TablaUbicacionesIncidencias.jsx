import React from "react";
import { Table } from "reactstrap";

const TablaUbicacionesIncidencias = ({ incidencias }) => {
  return (
    <Table bordered>
      <thead>
        <tr>
          <th>ID Paquete</th>
          <th>UUID</th> {/* Nueva columna para el UUID */}
          <th>Descripción Paquete</th>
          <th>Ubicación</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        {incidencias.map((incidencia) => (
          <tr key={incidencia.id}>
            <td>{incidencia.id_paquete}</td>
            <td>{incidencia.uuid}</td> {/* Muestra el UUID del paquete */}
            <td>{incidencia.paquete}</td>
            <td>{incidencia.ubicacion}</td>
            <td>{incidencia.estado === 1 ? "Abierta" : "Cerrada"}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default TablaUbicacionesIncidencias;
