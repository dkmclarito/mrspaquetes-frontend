import React from "react";
import { Table, Button } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faPencilAlt } from "@fortawesome/free-solid-svg-icons";

const RutaTable = ({ rutas, vehiculosDetalle, handleEdit, handleDelete }) => {
  const formatVehicleInfo = (vehicleId) => {
    const vehicleDetails = vehiculosDetalle[vehicleId];
    if (!vehicleDetails) return "Cargando...";

    const { marca, modelo, capacidad_carga, placa, conductor } = vehicleDetails;
    return `${marca || "N/A"} ${modelo || "N/A"} - Carga: ${capacidad_carga || "N/A"} - Placa: ${placa || "N/A"} - Conductor: ${conductor || "N/A"}`;
  };

  return (
    <Table>
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
        {rutas.map((ruta) => (
          <tr key={ruta.id}>
            <td>{ruta.id}</td>
            <td>{ruta.ruta ? ruta.ruta.nombre : "N/A"}</td>
            <td>{formatVehicleInfo(ruta.id_vehiculo)}</td>
            <td>{ruta.fecha_asignacion}</td>
            <td>
              <div className="button-container">
                <Button
                  className="me-2 btn-icon btn-danger"
                  onClick={() => handleDelete(ruta.id)}
                  aria-label="Eliminar Ruta de Recolección"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </Button>
                <Button
                  className="me-2 btn-icon btn-editar"
                  onClick={() => handleEdit(ruta.id)}
                  aria-label="Editar Ruta de Recolección"
                >
                  <FontAwesomeIcon icon={faPencilAlt} />
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default RutaTable;
