import React from "react";
import PropTypes from "prop-types";
import { Button, Table } from "reactstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPencilAlt, faEye, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import "/src/styles/usuarios.css";

const TablaUsuarios = ({ usuarios, eliminarUsuario, toggleModalEditar }) => {
  const navigate = useNavigate();

  const renderStatus = (status) => {
    return (
      <span className="estatus-darkmode" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: status === 1 ? 'green' : 'red',
            marginRight: '8px'
          }}
        />
        {status === 1 ? 'Activo' : 'Inactivo'}
      </span>
    );
  };

  const renderEmpleado = (usuario) => {
    if (usuario.role_name === 'admin') {
      return "Usuario administrador";
    } else if (!usuario.id_empleado) {
      return (
        <>
          Sin asignar
          <Button
            color="primary"
            size="sm"
            onClick={() => navigate(`/AgregarEmpleado/${usuario.id}`)}
            style={{ marginLeft: '10px' }}
          >
            <FontAwesomeIcon icon={faUserPlus} /> Agregar
          </Button>
        </>
      );
    } else {
      return usuario.nombre_completo_empleado;
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
            <th style={{ width: '20%' }} className="text-center">Email</th>
            <th style={{ width: '10%' }} className="text-center">Estado</th>
      
            <th style={{ width: '10%' }} className="text-center">Rol</th>
            <th style={{ width: '10%' }} className="text-center">Creación</th>
            <th style={{ width: '15%' }} className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.length > 0 ? (
            usuarios.map(usuario => (
              <tr key={usuario.id}>
                <td style={{ width: '5%' }} className="text-center">{usuario.id}</td>
                <td style={{ width: '20%' }} className="text-center">{usuario.email}</td>
                <td style={{ width: '10%' }} className="text-center">{renderStatus(usuario.status)}</td>
         
                <td style={{ width: '10%' }} className="text-center">{usuario.role_name}</td>
                <td style={{ width: '10%' }} className="text-center">{formatDate(usuario.created_at)}</td>
                <td style={{ width: '15%' }} className="text-center">
                  <div className="button-container">
                    <Button
                      className="me-1 btn-icon btn-danger"
                      onClick={() => eliminarUsuario(usuario.id)}
                      aria-label="Eliminar usuario"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </Button>
                    <Button
                      className="me-1 btn-icon btn-editar"
                      onClick={() => toggleModalEditar(usuario)}
                      aria-label="Editar usuario"
                    >
                      <FontAwesomeIcon icon={faPencilAlt} />
                    </Button>
                    <Link
                      to={`/DataUsuario/${usuario.id}`}
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
              <td colSpan="8" className="text-center">Sin usuarios.</td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

TablaUsuarios.propTypes = {
  usuarios: PropTypes.array.isRequired,
  eliminarUsuario: PropTypes.func.isRequired,
  toggleModalEditar: PropTypes.func.isRequired,
};

export default TablaUsuarios;