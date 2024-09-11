import React from "react";
import PropTypes from "prop-types";
import { Button, Table } from "reactstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPencilAlt, faEye } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import "/src/styles/usuarios.css";

const TablaIncidencias = ({ incidencias, eliminarIncidencia, toggleModalEditar }) => {
  const navigate = useNavigate();

  const renderEstado = (estadoId) => {
    let color = "";
    let estadoTexto = "";

    switch (estadoId) {
      case 1:
        color = "green";
        estadoTexto = "Abierta";
        break;
      case 2:
        color = "blue";
        estadoTexto = "En Proceso";
        break;
      case 3:
        color = "red";
        estadoTexto = "Cerrada";
        break;
      default:
        color = "gray";
        estadoTexto = "Desconocido";
        break;
    }

    return (
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: color,
            marginRight: '8px'
          }}
        />
        {estadoTexto}
      </span>
    );
  };

  const renderUsuarioAsignado = (incidencia) => {
    if (!incidencia.id_usuario_asignado) {
      return (
        <>
          Sin asignar
          <Button
            color="primary"
            size="sm"
            onClick={() => navigate(`/AsignarUsuarioIncidencia/${incidencia.id}`)} // Pasamos el ID de la incidencia
            style={{ marginLeft: '10px' }}
          >
            Asignar
          </Button>
        </>
      );
    } else {
      return incidencia.id_usuario_asignado.nombre_completo; // Asegúrate de que `nombre_completo` exista en tu objeto usuario
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="table-responsive" style={{ marginTop: "-10px" }}>
      <Table striped className="table-centered table-nowrap mb-0">
        <thead className="thead-light">
          <tr>
            <th style={{ width: '5%' }} className="text-center">ID</th>
            <th style={{ width: '15%' }} className="text-center">Descripción</th>
            <th style={{ width: '15%' }} className="text-center">Tipo Incidencia</th>
            <th style={{ width: '10%' }} className="text-center">Estado</th>
            <th style={{ width: '20%' }} className="text-center">Usuario Asignado</th>
            <th style={{ width: '20%' }} className="text-center">Solución</th>
            <th style={{ width: '10%' }} className="text-center">Creación</th>
            <th style={{ width: '15%' }} className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {incidencias.length > 0 ? (
            incidencias.map(incidencia => (
              <tr key={incidencia.id}>
                <td style={{ width: '5%' }} className="text-center">{incidencia.id}</td>
                <td style={{ width: '15%' }} className="text-center">{incidencia.paquete_descripcion}</td>
                <td style={{ width: '15%' }} className="text-center">{incidencia.tipo_incidencia}</td>
                <td style={{ width: '10%' }} className="text-center">{incidencia.estado}</td>
                <td style={{ width: '20%' }} className="text-center">{renderUsuarioAsignado(incidencia)}</td>
                <td style={{ width: '20%' }} className="text-center">{incidencia.solucion ? incidencia.solucion : "Sin solución"}</td>
                <td style={{ width: '10%' }} className="text-center">{formatDate(incidencia.created_at)}</td>
                <td style={{ width: '15%' }} className="text-center">
                  <div className="button-container">
                    <Button
                      className="me-1 btn-icon btn-danger"
                      onClick={() => eliminarIncidencia(incidencia.id)}
                      aria-label="Eliminar incidencia"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </Button>
                    <Button
                      className="me-1 btn-icon btn-editar"
                      onClick={() => toggleModalEditar(incidencia)}
                      aria-label="Editar incidencia"
                    >
                      <FontAwesomeIcon icon={faPencilAlt} />
                    </Button>
                    <Link
                      to={`/DataIncidencia/${incidencia.id}`}
                      className="btn btn-success btn-icon"
                      title="Ver más detalles"
                      aria-label="Ver más detalles"
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center">Sin incidencias.</td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

TablaIncidencias.propTypes = {
  incidencias: PropTypes.array.isRequired,
  eliminarIncidencia: PropTypes.func.isRequired,
  toggleModalEditar: PropTypes.func.isRequired,
};

export default TablaIncidencias;
