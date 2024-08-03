import React from "react";
import PropTypes from "prop-types";
import { Button } from "reactstrap";

const TablaRolesPermisos = ({ roles, onAssignPermissions }) => {
  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((rol) => (
            <tr key={rol.id}>
              <td>{rol.id}</td>
              <td>{rol.name}</td>
              <td>
          

                <Button onClick={() => onAssignPermissions(rol.id, rol.name)}>Asignar Permisos</Button>

              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

TablaRolesPermisos.propTypes = {
  roles: PropTypes.array.isRequired,
  onAssignPermissions: PropTypes.func.isRequired,
};

export default TablaRolesPermisos;
