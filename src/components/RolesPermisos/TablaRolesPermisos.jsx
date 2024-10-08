import React from "react";
import { Table, Button } from "reactstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faEye, faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const TablaRolesPermisos = ({ roles, onAssignPermissions, onDeleteRole, onEditRole }) => {
  return (
    <Table striped hover responsive>
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {roles.map(role => (
          <tr key={role.id}>
            <td>{role.id}</td>
            <td>{role.name}</td>
            <td>
              <Button className="btn btn-secondary me-2" onClick={() => onAssignPermissions(role.id, role.name)}>
                Asignar Permisos
              </Button>
              <Link
                to={`/DataRol/${role.id}`}
                className="btn btn-success btn-icon me-2"
                title="Ver más detalles"
                aria-label="Ver más detalles"
              >
                <FontAwesomeIcon icon={faEye} />
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default TablaRolesPermisos;
