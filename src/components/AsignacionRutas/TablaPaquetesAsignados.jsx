import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'reactstrap';
import '/src/styles/Paquetes.css';

// Función para capitalizar la primera letra de una cadena y reemplazar caracteres especiales
const formatTamanoPaquete = (string) => {
  if (!string) return 'N/A';
  
  // Reemplazar los valores específicos
  const replacements = {
    'pequeno': 'Pequeño',
    'mediano': 'Mediano',
    'grande': 'Grande'
  };

  return replacements[string.toLowerCase()] || string;
};

export default function TablaPaquetesAsignados({ paquetes, onSelect }) {
  return (
    <div className="table-responsive" style={{ marginTop: "-10px" }}>
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
            <th className="text-center">Dirección</th>
            <th className="text-center">Seleccionar</th>
          </tr>
        </thead>
        <tbody>
          {paquetes.length > 0 ? (
            paquetes.map((paquete) => (
              <tr key={paquete.id_paquete}>
                <td>{paquete.id_paquete}</td>
                <td>{paquete.tipo_paquete || 'N/A'}</td>
                <td>{paquete.tipo_caja || 'N/A'}</td>
                <td>{formatTamanoPaquete(paquete.tamano_paquete) || 'N/A'}</td>
                <td>{paquete.estado_paquete || 'N/A'}</td>
                <td>{paquete.departamento || 'N/A'}</td>
                <td>{paquete.municipio || 'N/A'}</td>
                <td>{paquete.direccion || 'N/A'}</td>
                <td className="text-center">
                  <input
                    type="checkbox"
                    onChange={(e) => onSelect(paquete, e.target.checked)}
                    className="form-check-input"
                    style={{ transform: 'scale(1.5)', margin: '0 auto' }} 
                  />
                </td>
              </tr>
            ))
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
  paquetes: PropTypes.array.isRequired,
  onSelect: PropTypes.func.isRequired,
};