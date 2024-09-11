import React from 'react';
import { Table, Button } from 'reactstrap';
import { useNavigate } from 'react-router-dom';

const TablaPaquetesIncidencias = ({ paquetes }) => {
  const navigate = useNavigate();

  const handleSelectPaquete = (idPaquete) => {
    navigate(`/AgregarIncidenciaPaqueteSeleccionado/${idPaquete}`);
  };

  return (
    <Table responsive bordered>
      <thead>
        <tr>
          <th>ID</th>
          <th>Tipo</th>
          <th>Estado</th>
          <th>Fecha de Envío</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {paquetes.map((paquete) => (
          <tr key={paquete.id}>
            <td>{paquete.id}</td>
            <td>{paquete.tipo_paquete}</td>
            <td>{paquete.estado_paquete}</td>
            <td>{paquete.fecha_envio}</td>
            <td>
              <Button color="primary" onClick={() => handleSelectPaquete(paquete.id)}>
                Seleccionar Paquete
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default TablaPaquetesIncidencias;
