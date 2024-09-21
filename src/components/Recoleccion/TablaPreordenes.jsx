import React from "react";
import { Table, Input } from "reactstrap";

const TablaPreordenes = ({
  preordenes,
  preordenesSeleccionadas,
  onTogglePreorden,
}) => {
  return (
    <Table>
      <thead>
        <tr>
          <th>Seleccionar</th>
          <th>ID Preorden</th>
          <th>Número de Seguimiento</th>
          <th>Cliente</th>
          <th>Dirección de Recolección</th>
        </tr>
      </thead>
      <tbody>
        {preordenes.map((preorden) => (
          <tr key={preorden.id}>
            <td>
              <Input
                type="checkbox"
                checked={preordenesSeleccionadas.includes(preorden.id)}
                onChange={() => onTogglePreorden(preorden.id)}
              />
            </td>
            <td>{preorden.id}</td>
            <td>{preorden.numero_seguimiento || "N/A"}</td>
            <td>{`${preorden.cliente?.nombre || ""} ${preorden.cliente?.apellido || ""}`}</td>
            <td>{`${preorden.direccion_emisor?.direccion || ""}, ${preorden.direccion_emisor?.municipio || ""}`}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default TablaPreordenes;
