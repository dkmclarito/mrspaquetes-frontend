import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Button, Table } from "reactstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPencilAlt, faEye } from '@fortawesome/free-solid-svg-icons';
import '/src/styles/Empleados.css';
import AuthService from "/src/services/authService"; 

const API_URL = import.meta.env.VITE_API_URL;

const TablaEmpleados = ({ empleados, cargos, verDetallesEmpleado, eliminarEmpleado, toggleModalEditar }) => {
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState(null);

  // Obtén el token usando AuthService
  const token = AuthService.getCurrentUser(); // Asegúrate de que esta función retorne el token correctamente

  useEffect(() => {
    const fetchRoles = async () => {
      if (!token) {
        setError('Token de autorización no encontrado.');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/empleados/relacion`, {
          headers: {
            Authorization: `Bearer ${token}`, // Incluye el token en el encabezado
          },
        });

        if (!response.ok) throw new Error(`Error: ${response.statusText}`);
        const responseData = await response.json();

        console.log('Datos de roles:', responseData); // Verifica los datos que recibes

        if (responseData && Array.isArray(responseData.empleados)) {
          setRoles(responseData.empleados); // Guarda los roles en el estado
        } else {
          console.error("Respuesta no válida para roles:", responseData);
        }
      } catch (error) {
        console.error("Error al obtener los roles:", error);
        setError(error.message);
      }
    };

    fetchRoles();
  }, [token]);

  const obtenerNombreRol = (id) => {
    const empleado = roles.find(emp => emp.id === id);
    return empleado ? empleado.rol : 'Sin Rol';
  };

// Function to get the name of the job based on ID
const obtenerNombreCargo = (id) => {
  const cargo = cargos.find(cargo => cargo.id === id);
  return cargo ? cargo.nombre : 'Sin Cargo';
};

// Function to format the date in DD-MM-YYYY format
const formatearFecha = (fecha) => {
  if (!fecha) return 'Fecha no disponible';
  const fechaObj = new Date(fecha);
  const dia = String(fechaObj.getDate()).padStart(2, '0');
  const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
  const año = fechaObj.getFullYear();
  return `${dia}-${mes}-${año}`;
};

// Function to format phone number in XXXX-XXXX format
const formatearTelefono = (telefono) => {
  return telefono ? telefono.replace(/(\d{4})(\d+)/, '$1-$2') : 'Teléfono no disponible';
};

return (
  <div className="table-responsive" style={{ marginTop: "-10px" }}>
    {error && <div className="alert alert-danger" role="alert">{error}</div>}
    <Table striped className="table-centered table-nowrap mb-0">
      <thead className="thead-light">
        <tr>
          <th className="text-center">ID</th>
          <th className="text-center">Nombres</th>
          <th className="text-center">Apellidos</th>
          <th className="text-center">Cargo</th>
          <th className="text-center">Rol</th>
          <th className="text-center">Teléfono</th>
          <th className="text-center">Fecha de Contratación</th>
          <th className="text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {empleados.length > 0 ? (
          empleados.map((empleado) => (
            <tr key={empleado.id}>
              <td>{empleado.id}</td>
              <td>{empleado.nombres}</td>
              <td>{empleado.apellidos}</td>
              <td>{obtenerNombreCargo(empleado.id_cargo)}</td>
              <td>{obtenerNombreRol(empleado.id)}</td>
              <td>{formatearTelefono(empleado.telefono)}</td>
              <td>{formatearFecha(empleado.fecha_contratacion)}</td>
              <td>
                <div className="button-container">
                  <Button
                    className="me-2 btn-icon btn-danger"
                    onClick={() => eliminarEmpleado(empleado.id)}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </Button>
                  <Button
                    className="btn-icon btn-editar"
                    onClick={() => toggleModalEditar(empleado)}
                  >
                    <FontAwesomeIcon icon={faPencilAlt} />
                  </Button>
                  <Button
                      className="btn-icon btn-success"
                      onClick={() => verDetallesEmpleado(empleado.id)}                      
                    >
                      <FontAwesomeIcon icon={faEye}  />
                    </Button>
                </div>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="8" className="text-center">No hay empleados disponibles</td>
          </tr>
        )}
      </tbody>
    </Table>
  </div>
);
};

TablaEmpleados.propTypes = {
empleados: PropTypes.array.isRequired,
cargos: PropTypes.array.isRequired,
eliminarEmpleado: PropTypes.func.isRequired,
verDetallesEmpleado: PropTypes.func.isRequired,
toggleModalEditar: PropTypes.func.isRequired,
};

export default TablaEmpleados;