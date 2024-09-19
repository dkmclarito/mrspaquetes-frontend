import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'reactstrap';
import '/src/styles/Paquetes.css';

export default function TablaPaquetesAsignados({ paquetes, onSelect, paquetesSeleccionados }) {
  const isSelected = (id_paquete) => {
    return paquetesSeleccionados.some(p => p.id_paquete === id_paquete);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
        return 'Fecha inválida';
      }
      return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Error en fecha';
    }
  };

  return (
    <div className="table-responsive">
      <Table striped className="table-centered table-nowrap mb-0">
        <thead className="thead-light">
          <tr>
            <th className="text-center">ID</th>
            <th className="text-center">Tipo de Paquete</th>
            <th className="text-center">Empaque</th>
            <th className="text-center">Tamaño de Paquete</th>
            <th className="text-center">Estado</th>
            <th className="text-center">Departamento</th>
            <th className="text-center">Municipio</th>
            <th className="text-center">Fecha de registro</th>
            <th className="text-center">Seleccionar</th>
          </tr>
        </thead>
        <tbody>
          {paquetes.length > 0 ? (
            paquetes.map((paquete) => {
              console.log('Fecha de registro para paquete', paquete.id_paquete, ':', paquete.created_at);
              return (
                <tr 
                  key={paquete.id_paquete}
                  style={{ backgroundColor: isSelected(paquete.id_paquete) ? '#ffcccb' : 'inherit' }}
                >
                  <td>{paquete.id_paquete}</td>
                  <td>{paquete.tipo_paquete}</td>
                  <td>{paquete.empaquetado}</td>
                  <td>{paquete.tamano_paquete}</td>
                  <td>{paquete.estado_paquete}</td>
                  <td>{paquete.departamento}</td>
                  <td>{paquete.municipio}</td>
                  <td>{formatDate(paquete.created_at)}</td>
                  <td className="text-center">
                    <input
                      type="checkbox"
                      onChange={(e) => onSelect(paquete, e.target.checked)}
                      checked={isSelected(paquete.id_paquete)}
                      className="form-check-input"
                      style={{ transform: 'scale(1.5)', margin: '0 auto' }} 
                    />
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="9" className="text-center">No hay paquetes disponibles para asignar.</td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}

TablaPaquetesAsignados.propTypes = {
  paquetes: PropTypes.arrayOf(PropTypes.shape({
    id_paquete: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    tipo_paquete: PropTypes.string.isRequired,
    empaquetado: PropTypes.string.isRequired,
    tamano_paquete: PropTypes.string.isRequired,
    estado_paquete: PropTypes.string.isRequired,
    departamento: PropTypes.string,
    municipio: PropTypes.string,
    peso: PropTypes.number,
    created_at: PropTypes.string.isRequired,
    paquete: PropTypes.object
  })).isRequired,
  onSelect: PropTypes.func.isRequired,
  paquetesSeleccionados: PropTypes.arrayOf(PropTypes.shape({
    id_paquete: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  })).isRequired,
};