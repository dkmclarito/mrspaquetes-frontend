import React from 'react';
import PropTypes from 'prop-types';
import { Button, Table } from 'reactstrap';

export default function TablaSeleccionCliente({ clientes, tipoPersona, generarOrden }) {
  const obtenerNombreTipoPersona = (idTipoPersona) => {
    return tipoPersona[idTipoPersona] || 'Desconocido';
  };

  const obtenerDocumento = (idTipoPersona, dui, nit) => {
    if (idTipoPersona === 1) {
      return dui || 'N/A';
    } else if (idTipoPersona === 2) {
      return nit || 'N/A';
    }
    return 'N/A';
  };

  return (
    <div className="table-responsive" style={{ marginTop: '-10px' }}>
      <Table striped className="table-centered table-nowrap mb-0">
        <thead className="thead-light">
          <tr>
            <th className="text-center">ID</th>
            <th className="text-center">Nombre</th>
            <th className="text-center">Apellido</th>
            <th className="text-center">Tipo de Persona</th>
            <th className="text-center">DUI/NIT</th>
            <th className="text-center">Teléfono</th>
            <th className="text-center">Nombre de la Empresa</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.length > 0 ? (
            clientes.map(cliente => (
              <tr key={cliente.id}>
                <td className="text-center">{cliente.id}</td>
                <td className="text-center">{cliente.nombre}</td>
                <td className="text-center">{cliente.apellido}</td>
                <td className="text-center">{obtenerNombreTipoPersona(cliente.id_tipo_persona)}</td>
                <td className="text-center">{obtenerDocumento(cliente.id_tipo_persona, cliente.dui, cliente.nit)}</td>
                <td className="text-center">{cliente.telefono || 'N/A'}</td>
                <td className="text-center">{cliente.nombre_empresa || 'N/A'}</td>
                <td className="text-center">
                  <Button
                    color="primary"
                    onClick={() => generarOrden(cliente.id)}
                    aria-label="Generar orden"
                  >
                    Generar Orden
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center">No hay datos disponibles</td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}

TablaSeleccionCliente.propTypes = {
  clientes: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    nombre: PropTypes.string.isRequired,
    apellido: PropTypes.string.isRequired,
    id_tipo_persona: PropTypes.number.isRequired,
    dui: PropTypes.string,
    nit: PropTypes.string,
    telefono: PropTypes.string,
    nombre_empresa: PropTypes.string
  })).isRequired,
  tipoPersona: PropTypes.objectOf(PropTypes.string).isRequired,
  generarOrden: PropTypes.func.isRequired
};