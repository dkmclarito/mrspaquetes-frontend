import React from "react";
import { Table, Button } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faPencilAlt, faEye } from "@fortawesome/free-solid-svg-icons";

const TablaTraslados = ({ traslados, verDetallesTraslado, editarTraslado, eliminarTraslado }) => {
  return (
    <div className="table-responsive" style={{ marginTop: "-10px" }}>
      <Table striped className="table-centered table-nowrap mb-0">
        <thead className="thead-light">
          <tr>
            <th className="text-center">Número de Traslado</th>
            <th className="text-center">Bodega Origen</th>
            <th className="text-center">Bodega Destino</th>
            <th className="text-center">Total de Paquete</th>
            <th className="text-center">Fecha de Traslado</th>
            <th className="text-center">Estado</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {traslados.length > 0 ? (
            traslados.map((traslado) => (
              <tr key={traslado.id}>
                <td>{traslado.numero_traslado}</td>
                <td>{traslado.bodega_origen}</td>
                <td>{traslado.bodega_destino}</td>
                <td>{traslado.cantidad_paquetes}</td>
                <td>{traslado.fecha_traslado}</td>
                <td>{traslado.estado}</td>
                <td className="text-center">
                  <div className="button-container">
                    <Button
                      className="me-2 btn-icon btn-danger"
                      onClick={() => eliminarTraslado(traslado.id)}
                      aria-label="Eliminar Traslado"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </Button>
                    <Button
                      className="btn-icon btn-editar"
                      onClick={() => editarTraslado(traslado.id)}
                      aria-label="Editar Traslado"
                    >
                      <FontAwesomeIcon icon={faPencilAlt} />
                    </Button>
                    <Button
                      className="btn-icon btn-success"
                      onClick={() => verDetallesTraslado(traslado.id)}
                      aria-label="Ver Traslado"
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
                No hay traslados disponibles
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default TablaTraslados;