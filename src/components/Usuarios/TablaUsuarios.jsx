import React from "react";
import PropTypes from "prop-types";
import { Button, Table } from "reactstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPencilAlt, faEye } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import "/src/styles/usuarios.css";

const TablaUsuarios = ({ usuarios, eliminarUsuario, toggleModalEditar }) => {
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

  return (
    <div className="table-responsive" style={{ marginTop: "-10px" }}>
      <Table striped className="table-centered table-nowrap mb-0">
        <thead className="thead-light">
          <tr>
            <th className="text-center">ID</th>
            <th className="text-center">Email</th>
            <th className="text-center">Estado</th>
            <th className="text-center">Empleado</th>
            <th className="text-center">Rol</th>
            <th className="text-center">Fecha de creación</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.length > 0 ? (
            usuarios.map(usuario => (
              <tr key={usuario.id}>
                <td className="text-center">{usuario.id}</td>
                <td className="text-center">{usuario.email}</td>
                <td className="text-center">{renderStatus(usuario.status)}</td>
                <td className="text-center">{usuario.nombre_completo_empleado}</td>
                <td className="text-center">
                  {usuario.role_id === 1 ? 'Admin' : usuario.role_id === 3 ? 'Conductor' : usuario.role_id === 4 ? 'Básico' : 'Desconocido'}
                </td>
                <td className="text-center">{usuario.created_at ? usuario.created_at.split(' ')[0] : '2024-06-20'}</td>
                <td className="text-center">
                  <div className="button-container">
                    <Button
                      className="me-2 btn-icon btn-danger"
                      onClick={() => eliminarUsuario(usuario.id)}
                      aria-label="Eliminar usuario"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </Button>
                    <Button
                      className="me-2 btn-icon btn-editar"
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
              <td colSpan="7" className="text-center">Sin usuarios.</td>
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
