import React from "react";
import { Table, Button } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

const RutaTable = ({ rutas = [], onSelectRuta, rutaSeleccionada }) => {
  return (
    <Table responsive striped>
      <thead>
        <tr>
          <th>ID</th>
          <th>Ruta</th>
          <th>Vehículo</th>
          <th>Fecha Asignación</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {rutas && rutas.length > 0 ? (
          rutas.map((ruta) => (
            <tr key={ruta.id}>
              <td>{ruta.id}</td>
              <td>{ruta.ruta ? ruta.ruta.nombre : "N/A"}</td>
              <td>
                {ruta.vehiculo
                  ? `${ruta.vehiculo.marca} ${ruta.vehiculo.modelo}`
                  : "N/A"}
              </td>
              <td>{new Date(ruta.fecha_asignacion).toLocaleDateString()}</td>
              <td>
                <Button
                  color={
                    rutaSeleccionada && rutaSeleccionada.id === ruta.id
                      ? "success"
                      : "primary"
                  }
                  onClick={() => onSelectRuta(ruta)}
                >
                  {rutaSeleccionada && rutaSeleccionada.id === ruta.id ? (
                    <FontAwesomeIcon icon={faCheck} />
                  ) : (
                    "Seleccionar"
                  )}
                </Button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="5" className="text-center">
              No hay rutas de recolección disponibles
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
};

export default RutaTable;
