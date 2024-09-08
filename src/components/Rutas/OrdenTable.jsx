import React from "react";
import { Table, Button } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faPencilAlt } from "@fortawesome/free-solid-svg-icons";

const OrdenTable = ({
  ordenes,
  getOrdenInfo,
  getEstadoTexto,
  handleEdit,
  handleDelete,
}) => {
  return (
    <Table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Ruta de Recolección</th>
          <th>Orden</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {ordenes.map((orden) => (
          <tr key={orden.id}>
            <td>{orden.id}</td>
            <td>{orden.id_ruta_recoleccion}</td>
            <td>{getOrdenInfo(orden.id_orden)}</td>
            <td>{getEstadoTexto(orden.estado)}</td>
            <td>
              <div className="button-container">
                <Button
                  className="me-2 btn-icon btn-danger"
                  onClick={() => handleDelete(orden.id)}
                  aria-label="Eliminar Orden de Recolección"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </Button>
                <Button
                  className="me-2 btn-icon btn-editar"
                  onClick={() => handleEdit(orden.id)}
                  aria-label="Editar Orden de Recolección"
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

export default OrdenTable;
