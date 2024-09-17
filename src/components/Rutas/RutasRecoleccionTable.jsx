import React from "react";
import { Table, Button, Badge } from "reactstrap";

const RutasRecoleccionTable = ({ rutas, onEditar, onAsignarOrdenes }) => {
  return (
    <Table responsive>
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Fecha Asignación</th>
          <th>Estado</th>
          <th>Órdenes Asignadas</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {rutas.map((ruta) => (
          <tr key={ruta.id}>
            <td>{ruta.id}</td>
            <td>{ruta.nombre}</td>
            <td>{new Date(ruta.fecha_asignacion).toLocaleDateString()}</td>
            <td>
              <Badge color={ruta.estado === "Activa" ? "success" : "secondary"}>
                {ruta.estado}
              </Badge>
            </td>
            <td>{ruta.ordenes_recolecciones?.length || 0}</td>
            <td>
              <Button
                color="info"
                size="sm"
                onClick={() => onEditar(ruta)}
                className="mr-2"
              >
                Editar
              </Button>
              <Button
                color="primary"
                size="sm"
                onClick={() => onAsignarOrdenes(ruta)}
              >
                Asignar Órdenes
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default RutasRecoleccionTable;
