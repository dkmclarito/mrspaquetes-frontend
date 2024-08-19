import React from "react";
import PropTypes from "prop-types";
import { Button, Table } from "reactstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import "/src/styles/usuarios.css"; 
const TablaUsuarios = ({ usuarios, eliminarUsuario, toggleModalEditar }) => {
  return (
    <div className="table-responsive" style={{ marginTop: "-10px" }}>
      <Table striped className="table-centered table-nowrap mb-0">
        <thead className="thead-light">
          <tr>
            <th className="text-center">ID</th>
          
            <th className="text-center">Email</th>
            <th className="text-center">Tipo de usuario</th>
            <th className="text-center">Fecha de creación</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.length > 0 ? (
            usuarios.map(usuario => (
              <tr key={usuario.id}>
                <td>{usuario.id}</td>
          
                <td>{usuario.email}</td>
                <td>{usuario.type === 0 ? 'Empleado' : 'Cliente'}</td>
                <td>{usuario.created_at ? usuario.created_at.split('T')[0] : '2024-06-20'}</td>
                <td>
                  <div className="button-container">
                    <Button
                      className="me-2 btn-icon btn-danger"
                      onClick={() => eliminarUsuario(usuario.id)}
                      aria-label="Eliminar usuario"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </Button>
                    <Button
                      className="btn-icon btn-editar"
                      onClick={() => toggleModalEditar(usuario)}
                      aria-label="Editar usuario"
                    >
                      <FontAwesomeIcon icon={faPencilAlt} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">Sin usuarios.</td>
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
