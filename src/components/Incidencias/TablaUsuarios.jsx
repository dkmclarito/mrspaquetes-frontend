import React from "react";
import PropTypes from "prop-types";
import { Button, Table } from "reactstrap";
import axios from 'axios'; // Importamos axios para realizar la solicitud a la API
import { useNavigate } from 'react-router-dom'; // Importa useNavigate para redirigir
import "/src/styles/usuarios.css";

const API_URL = import.meta.env.VITE_API_URL; // URL de la API

const TablaUsuarios = ({ usuarios, incidencia, actualizarIncidencia }) => {
  const navigate = useNavigate(); // Definir navigate para usar en la función

  // Función para asignar el usuario a la incidencia
  const asignarUsuario = async (usuarioId) => {
    if (!incidencia) {
        console.error("La incidencia no está definida. No se puede asignar el usuario.");
        return;
    }

    try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId"); // Obtén el ID del usuario logueado desde el localStorage

        const incidenciaActualizada = {
            id_paquete: incidencia.id_paquete,
            fecha_hora: incidencia.fecha_hora,
            id_tipo_incidencia: incidencia.tipo_incidencia === 'Retraso' ? 1 : 2, // Ajusta según sea necesario
            descripcion: incidencia.descripcion,
            estado: 2,  // Estado fijo "En Proceso"
            fecha_resolucion: incidencia.fecha_resolucion,
            id_usuario_reporta: userId, // Usar el ID del usuario logueado
            id_usuario_asignado: usuarioId,
            solucion: incidencia.solucion || ""
        };

        // Imprimir los datos que estás enviando
        console.log("Datos enviados en la solicitud PUT:", incidenciaActualizada);

        const response = await axios.put(`${API_URL}/incidencias/${incidencia.id}`, incidenciaActualizada, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.status === 200) {
            alert("Usuario asignado exitosamente a la incidencia.");
            navigate("/GestionIncidencias");
        }
    } catch (error) {
        console.error("Error al asignar usuario:", error);
        if (error.response) {
            console.log("Respuesta de error del servidor:", error.response.data);
        }
        navigate("/GestionIncidencias");
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
