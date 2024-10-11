import React, { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { Button, Table } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faPencilAlt, faEye } from "@fortawesome/free-solid-svg-icons";
import "/src/styles/Empleados.css";
import AuthService from "/src/services/authService";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const TablaEmpleados = ({
  empleados,
  cargos,
  estados,
  verDetallesEmpleado,
  eliminarEmpleado,
  toggleModalEditar,
}) => {
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = AuthService.getCurrentUser();

  const fetchRoles = useCallback(async () => {
    if (!token) {
      setError("Token de autorización no encontrado.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/empleados/relacion`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && Array.isArray(response.data.empleados)) {
        setRoles(response.data.empleados);
      } else {
        throw new Error("Los datos recibidos no son válidos.");
      }
    } catch (error) {
      console.error("Error al obtener los roles:", error);
      setError("Error al obtener los roles. Por favor, intente más tarde.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const obtenerNombreRol = useCallback(
    (id) => {
      const empleado = roles.find((emp) => emp.id === id);
      return empleado ? empleado.rol : "Sin Rol";
    },
    [roles]
  );

  const obtenerNombreCargo = useCallback(
    (id) => {
      const cargo = cargos.find((cargo) => cargo.id === id);
      return cargo ? cargo.nombre : "Sin Cargo";
    },
    [cargos]
  );

  const obtenerNombreEstado = useCallback(
    (id) => {
      const estado = estados.find((estado) => estado.id === id);
      return estado ? estado.nombre : "Estado Desconocido";
    },
    [estados]
  );

  const formatearFecha = (fecha) => {
    if (!fecha) return "Fecha no disponible";
    return new Date(fecha).toLocaleDateString("es-ES");
  };

  const formatearTelefono = (telefono) => {
    return telefono
      ? telefono.replace(/(\d{4})(\d+)/, "$1-$2")
      : "Teléfono no disponible";
  };

  if (loading) return <p>Cargando datos de empleados...</p>;
  if (error)
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );

  return (
    <div className="table-responsive" style={{ marginTop: "-10px" }}>
      <Table striped className="table-centered table-nowrap mb-0">
        <thead className="thead-light">
          <tr>
            <th className="text-center">ID</th>
            <th className="text-center">Nombres</th>
            <th className="text-center">Apellidos</th>
            <th className="text-center">Cargo</th>
            <th className="text-center">Rol</th>
            <th className="text-center">Estado</th>
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
                <td>{obtenerNombreEstado(empleado.id_estado)}</td>
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
                      <FontAwesomeIcon icon={faEye} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="text-center">
                No hay empleados disponibles
              </td>
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
  estados: PropTypes.array.isRequired,
  eliminarEmpleado: PropTypes.func.isRequired,
  verDetallesEmpleado: PropTypes.func.isRequired,
  toggleModalEditar: PropTypes.func.isRequired,
};

export default TablaEmpleados;
