import React from "react";
import { Table } from "reactstrap";

const TablaKardexPaquetes = ({ paquetes }) => {
  return (
    <Table responsive striped>
      <thead>
        <tr>
          <th>ID</th>
          <th>Paquete</th>
          <th>ID Paquete</th>
          <th>Ubicación</th>
          <th>ID Ubicación</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        {paquetes.length > 0 ? (
          paquetes.map((paquete) => (
            <tr key={paquete.id}>
              <td>{paquete.id}</td>
              <td>{paquete.paquete}</td>
              <td>{paquete.id_paquete}</td>
              <td>{paquete.ubicacion}</td>
              <td>{paquete.id_ubicacion}</td>
              <td>{paquete.estado === 1 ? "Activo" : "Inactivo"}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="6" className="text-center">
              No se encontraron paquetes ubicados.
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
};

export default TablaKardexPaquetes;
