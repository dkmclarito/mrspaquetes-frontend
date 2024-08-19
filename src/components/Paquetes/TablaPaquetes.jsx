import React from 'react';
import PropTypes from 'prop-types';
import { Button, Table } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
import '/src/styles/Paquetes.css'; // Asegúrate de que los estilos están en este archivo

const TablaPaquetes = ({ paquetes, onEdit, onDelete }) => {
  return (
    <div className="table-responsive" style={{ marginTop: "-10px" }}>
      <Table striped className="table-centered table-nowrap mb-0">
        <thead className="thead-light">
          <tr>
            <th className="text-center">ID</th>
            <th className="text-center">Tipo de Paquete</th>
            <th className="text-center">Empaque</th>
            <th className="text-center">Peso (Libras)</th>
            <th className="text-center">Estado</th>
            <th className="text-center">Fecha de Envío</th>
            <th className="text-center">Fecha de Entrega Estimada</th>
            <th className="text-center">Descripción</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {paquetes.length > 0 ? (
            paquetes.map((paquete) => (
              <tr key={paquete.id}>
                <td>{paquete.id}</td>
                <td>{paquete.tipo_paquete || 'N/A'}</td>
                <td>{paquete.empaque || 'N/A'}</td>
                <td>{paquete.peso}</td>
                <td>{paquete.estado_paquete || 'N/A'}</td>
                <td>{paquete.fecha_envio}</td>
                <td>{paquete.fecha_entrega_estimada}</td>
                <td>{paquete.descripcion_contenido}</td>
                <td>
                  <div className="button-container">
                    <Button
                      className="me-2 btn-icon btn-danger"
                      onClick={() => onDelete(paquete)}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </Button>
                    <Button
                      className="btn-icon btn-editar"
                      onClick={() => onEdit(paquete)}
                    >
                      <FontAwesomeIcon icon={faPencilAlt} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="text-center">Sin paquetes.</td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

TablaPaquetes.propTypes = {
  paquetes: PropTypes.array.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default TablaPaquetes;
