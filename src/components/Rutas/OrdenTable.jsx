import React from "react";
import { Table, Button } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faShippingFast } from "@fortawesome/free-solid-svg-icons";

const OrdenTable = ({
  ordenes = [],
  onSelectOrden,
  onFinalizarOrden,
  seleccionadas = [],
  tipo,
}) => {
  const esPreorden = tipo === "preorden";

  return (
    <Table responsive striped>
      <thead>
        <tr>
          <th>ID</th>
          <th>Cliente</th>
          <th>Número de Seguimiento</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {ordenes && ordenes.length > 0 ? (
          ordenes.map((orden) => (
            <tr key={orden.id}>
              <td>{orden.id}</td>
              <td>
                {orden.cliente
                  ? `${orden.cliente.nombre} ${orden.cliente.apellido}`
                  : "N/A"}
              </td>
              <td>{orden.numero_seguimiento}</td>
              <td>{orden.estado}</td>
              <td>
                {esPreorden ? (
                  <Button
                    color={
                      seleccionadas.includes(orden) ? "success" : "primary"
                    }
                    onClick={() => onSelectOrden(orden)}
                  >
                    {seleccionadas.includes(orden) ? (
                      <FontAwesomeIcon icon={faCheck} />
                    ) : (
                      "Seleccionar"
                    )}
                  </Button>
                ) : (
                  <Button
                    color="success"
                    onClick={() => onFinalizarOrden(orden)}
                    disabled={orden.estado === "Completada"}
                  >
                    <FontAwesomeIcon icon={faShippingFast} /> Finalizar
                  </Button>
                )}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="5" className="text-center">
              No hay órdenes disponibles
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
};

export default OrdenTable;
