import React from "react";
import { Table, Button } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faPencilAlt, faEye } from "@fortawesome/free-solid-svg-icons";

const TablaOrdenes = ({
  ordenes,
  eliminarOrden,
  navegarAEditar,
  verDetallesOrden,
}) => {
  return (
    <Table responsive striped>
      <thead>
        <tr>
          <th>Nombre del Cliente</th>
          <th>Teléfono</th>
          <th>Tipo de Pago</th>
          <th>Total a Pagar</th>
          <th>Estado de la Orden</th>
          <th>Número de Seguimiento</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {ordenes.length > 0 ? (
          ordenes.map((orden) => (
            <tr key={orden.id}>
              <td>
                {orden.cliente.nombre} {orden.cliente.apellido}
              </td>
              <td>{orden.detalles[0]?.telefono || "N/A"}</td>
              <td>{orden.tipo_pago}</td>
              <td>${orden.total_pagar}</td>
              <td>{orden.detalles[0]?.estado_paquete || "N/A"}</td>
              <td>{orden.numero_seguimiento}</td>
              <td>
                <div className="button-container">
                  <Button
                    className="me-2 btn-icon btn-danger"
                    onClick={() => eliminarOrden(orden.id)}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </Button>
                  <Button
                    className="me-2 btn-icon btn-editar"
                    onClick={() => navegarAEditar(orden.id)}
                  >
                    <FontAwesomeIcon icon={faPencilAlt} />
                  </Button>
                  <Button
                    className="btn-sm me-2 btn-icon btn-success"
                    onClick={() => verDetallesOrden(orden.id)}
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </Button>
                </div>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="7" className="text-center">
              No hay órdenes disponibles
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
};

export default TablaOrdenes;
