import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Button, Table } from "reactstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPencilAlt, faEye } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Para hacer la solicitud de usuario
import "/src/styles/usuarios.css";

const API_URL = import.meta.env.VITE_API_URL; // Asegúrate de que la URL esté configurada correctamente

const TablaIncidencias = ({ incidencias, eliminarIncidencia, toggleModalEditar }) => {
  const [usuarioLogueado, setUsuarioLogueado] = useState(null); // Almacena los datos del usuario logueado
  const navigate = useNavigate();

  // Función para obtener el email del usuario logueado desde la API
  useEffect(() => {
    const fetchUsuarioLogueado = async () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId'); // Obtén el ID del usuario logueado
      if (userId && token) {
        try {
          const response = await axios.get(`${API_URL}/auth/show/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data && response.data.user) {
            setUsuarioLogueado(response.data.user); // Accede a los datos del usuario dentro del objeto `user`

            // Imprimir los datos del usuario logueado en la consola
            console.log("Datos del usuario logueado:", response.data.user);
          }
        } catch (error) {
          console.error("Error al obtener los datos del usuario logueado:", error);
        }
      }
    };

    fetchUsuarioLogueado();
  }, []);

  const renderEstado = (estadoId) => {
    let color = "";
    let estadoTexto = "";

    switch (estadoId) {
      case 1:
        color = "green";
        estadoTexto = "Abierta";
        break;
      case 2:
        color = "blue";
        estadoTexto = "En Proceso";
        break;
      case 3:
        color = "red";
        estadoTexto = "Cerrada";
        break;
      default:
        color = "gray";
        estadoTexto = "Desconocido";
        break;
    }

    return (
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: color,
            marginRight: '8px'
          }}
        />
        {estadoTexto}
      </span>
    );
  };

  const renderUsuarioAsignado = (incidencia) => {
    if (!incidencia.usuario_asignado) {
      return (
        <>
          <span style={{
            backgroundColor: 'red',
            color: 'white',
            padding: '1px 4px',
            borderRadius: '5px',
            display: 'inline-block',
            fontWeight: 'bold',
            fontSize: '12px'
          }}>
            Sin asignar
          </span>
          <Button
            color="primary"
            size="sm"
            onClick={() => navigate(`/AsignarUsuarioIncidencia/${incidencia.id}`)} // Pasamos el ID de la incidencia
            style={{ marginLeft: '10px' }}
          >
            Asignar
          </Button>
        </>
      );
    } else {
      return (
        <span>
          {incidencia.usuario_asignado ? incidencia.usuario_asignado : 'Asignado'}
        </span>
      );
    }
  };

  const renderSolucion = (incidencia) => {
    // Ajustamos para acceder correctamente al email del usuario logueado
    if (!incidencia.solucion && usuarioLogueado && usuarioLogueado.email === incidencia.usuario_asignado) {
      // Imprimir los datos de comparación
      console.log("Email del usuario logueado:", usuarioLogueado.email);
      console.log("Email del usuario asignado a la incidencia:", incidencia.usuario_asignado);

      return (
        <Button
          color="success"
          size="sm"
          onClick={() => navigate(`/DarSolucionIncidencia/${incidencia.id}`)} // Ruta para dar solución
        >
          Dar Solución
        </Button>
      );
    } else {
      return incidencia.solucion ? incidencia.solucion : "Sin solución";
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
            <th style={{ width: '10%' }} className="text-center">Usuario Reporta</th> {/* Nueva columna para mostrar usuario_reporta */}
            <th style={{ width: '15%' }} className="text-center">Descripción</th>
            <th style={{ width: '15%' }} className="text-center">Tipo Incidencia</th>
            <th style={{ width: '10%' }} className="text-center">Estado</th>
            <th style={{ width: '20%' }} className="text-center">Empleado asignado</th>
            <th style={{ width: '20%' }} className="text-center">Solución</th>
            <th style={{ width: '10%' }} className="text-center">Creación</th>
            <th style={{ width: '15%' }} className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {incidencias.length > 0 ? (
            incidencias.map(incidencia => (
              <tr key={incidencia.id}>
                <td style={{ width: '5%' }} className="text-center">{incidencia.id}</td>
                <td style={{ width: '10%' }} className="text-center">{incidencia.id_usuario_reporta}</td> {/* Mostrar usuario_reporta */}
                <td style={{ width: '15%' }} className="text-center">{incidencia.descripcion}</td>
                <td style={{ width: '15%' }} className="text-center">{incidencia.tipo_incidencia}</td>
                <td style={{ width: '10%' }} className="text-center">{incidencia.estado}</td>
                <td style={{ width: '20%' }} className="text-center">{renderUsuarioAsignado(incidencia)}</td>
                <td style={{ width: '20%' }} className="text-center">{renderSolucion(incidencia)}</td>
                <td style={{ width: '10%' }} className="text-center">{formatDate(incidencia.created_at)}</td>
                <td style={{ width: '15%' }} className="text-center">
                  <div className="button-container">
                    <Button
                      className="me-1 btn-icon btn-danger"
                      onClick={() => eliminarIncidencia(incidencia.id)}
                      aria-label="Eliminar incidencia"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </Button>
                    <Button
                      className="me-1 btn-icon btn-editar"
                      onClick={() => toggleModalEditar(incidencia)}
                      aria-label="Editar incidencia"
                    >
                      <FontAwesomeIcon icon={faPencilAlt} />
                    </Button>
                    <Link
                      to={`/DataIncidencia/${incidencia.id}`}
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
              <td colSpan="8" className="text-center">Sin incidencias.</td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

TablaIncidencias.propTypes = {
  incidencias: PropTypes.array.isRequired,
  eliminarIncidencia: PropTypes.func.isRequired,
  toggleModalEditar: PropTypes.func.isRequired,
};

export default TablaIncidencias;
