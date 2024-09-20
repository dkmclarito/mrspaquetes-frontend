import React from "react";
import { Table, Button} from "reactstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faEye } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';

const TablaRolesPermisos = ({ roles, onAssignPermissions, onDeleteRole }) => {
  return (
    <Table hover responsive>
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Alias</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {roles.map(role => (
          <tr key={role.id}>
            <td>{role.id}</td>
            <td>{role.name}</td>
            <td>{role.alias}</td>
            <td>
              <Button className="btn btn-secondary me-2" onClick={() => onAssignPermissions(role.id, role.name)}>
                Asignar Permisos
              </Button>
              <Button className="me-1 btn-icon btn-danger" onClick={() => onDeleteRole(role.id)}>
                <FontAwesomeIcon icon={faTimes} />
              </Button>
              <Link
                to={`/DataRol/${role.id}`}
                className="btn btn-success btn-icon"
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
