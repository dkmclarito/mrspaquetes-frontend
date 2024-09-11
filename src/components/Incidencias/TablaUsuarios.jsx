import React from "react";
import PropTypes from "prop-types";
import { Button, Table } from "reactstrap";
import axios from 'axios'; // Importamos axios para realizar la solicitud a la API
import "/src/styles/usuarios.css";

const API_URL = import.meta.env.VITE_API_URL; // URL de la API

const TablaUsuarios = ({ usuarios, incidencia, actualizarIncidencia }) => {
  // Función para asignar el usuario a la incidencia
  const asignarUsuario = async (usuarioId) => {
    if (!incidencia || !incidencia.id) {
        console.error("La incidencia o su ID no están definidas.");
        return;
    }

    try {
        // Asegúrate de obtener el token aquí
        const token = localStorage.getItem("token");

        const incidenciaActualizada = {
            ...incidencia,
            id_usuario_asignado: usuarioId,
        };

        // Imprime los datos que estás enviando a la API
        console.log("Datos enviados en la solicitud PUT desde TablaUsuarios:", incidenciaActualizada);

        const response = await axios.put(`${API_URL}/incidencias/${incidencia.id}`, incidenciaActualizada, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.status === 200) {
            alert("Usuario asignado exitosamente a la incidencia.");
            if (actualizarIncidencia) {
                actualizarIncidencia();
            }
        }
    } catch (error) {
        console.error("Error al asignar usuario:", error);
        alert("Error al asignar el usuario a la incidencia.");
    }
};

  

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
            <th style={{ width: '5%' }} className="text-center">ID</th>
            <th style={{ width: '30%' }} className="text-center">Email</th>
            <th style={{ width: '10%' }} className="text-center">Estado</th>
            <th style={{ width: '10%' }} className="text-center">Rol</th>
            <th style={{ width: '15%' }} className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.length > 0 ? (
            usuarios.map(usuario => (
              <tr key={usuario.id}>
                <td style={{ width: '5%' }} className="text-center">{usuario.id}</td>
                <td style={{ width: '30%' }} className="text-center">{usuario.email}</td>
                <td style={{ width: '10%' }} className="text-center">{renderStatus(usuario.status)}</td>
                <td style={{ width: '10%' }} className="text-center">{usuario.role_name}</td>
                <td style={{ width: '15%' }} className="text-center">
                  <Button
                    color="primary"
                    size="sm"
                    onClick={() => asignarUsuario(usuario.id)} // Llamamos a la función para asignar el usuario a la incidencia
                  >
                    Asignar este usuario
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">Sin usuarios.</td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

TablaUsuarios.propTypes = {
  usuarios: PropTypes.array.isRequired,
  incidencia: PropTypes.object.isRequired, // Se espera que la incidencia también se pase como prop
  actualizarIncidencia: PropTypes.func, // Función opcional para actualizar la lista de incidencias
};

export default TablaUsuarios;
