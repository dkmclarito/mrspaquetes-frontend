import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Button, Table, Tooltip } from "reactstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPencilAlt, faEye, faCopy } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import "/src/styles/usuarios.css";

const API_URL = import.meta.env.VITE_API_URL;

const TablaIncidencias = ({ incidencias, eliminarIncidencia, toggleModalEditar }) => {
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);
  const [paquetes, setPaquetes] = useState([]);
  const [tooltipOpen, setTooltipOpen] = useState({});
  const navigate = useNavigate();

  // Obtener paquetes con UUID
  useEffect(() => {
    const fetchPaquetes = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/dropdown/get_paquetes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data && Array.isArray(response.data.paquetes)) {
          setPaquetes(response.data.paquetes);
        }
      } catch (error) {
        console.error("Error al obtener los paquetes:", error);
      }
    };
    fetchPaquetes();
  }, []);

  // Obtener UUID del paquete basado en el id_paquete
  const getUUIDByPaqueteId = (id_paquete) => {
    const paquete = paquetes.find((pkg) => pkg.id === id_paquete);
    return paquete ? paquete.uuid : "UUID no disponible";
  };

  const toggleTooltip = (uuid) => {
    setTooltipOpen((prev) => ({ ...prev, [uuid]: !prev[uuid] }));
  };

  const handleCopy = (uuid) => {
    navigator.clipboard.writeText(uuid);
  };

  // Función para truncar texto y agregar puntos suspensivos si excede un límite
  const truncateText = (text, maxLength = 10) => {
    if (text.length > maxLength) {
      return text.slice(0, maxLength) + '...';
    }
    return text;
  };

  const renderEstado = (estadoId) => {
    let color = "";
    let estadoTexto = "";

    switch (estadoId) {
      case "Abierta":
        color = "green";
        estadoTexto = "Abierta";
        break;
      case "En Proceso":
        color = "blue";
        estadoTexto = "En Proceso";
        break;
      case "Cerrada":
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

  // Renderizar el usuario asignado y permitir asignar uno si no existe
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
            onClick={() => navigate(`/AsignarUsuarioIncidencia/${incidencia.id}`)} // Redirige a la página de asignación
            style={{ marginLeft: '10px' }}
          >
            Asignar
          </Button>
        </>
      );
    } else {
      return <span>{incidencia.usuario_asignado}</span>;
    }
  };

  return (
    <div className="table-responsive" style={{ marginTop: "-10px" }}>
      <Table striped className="table-centered table-nowrap mb-0">
        <thead className="thead-light">
          <tr>
            <th style={{ width: '5%' }} className="text-center">ID</th>
            <th style={{ width: '5%' }} className="text-center">UUID Paquete</th>
            <th style={{ width: '15%' }} className="text-center">Descripción</th>
            <th style={{ width: '15%' }} className="text-center">Tipo Incidencia</th>
            <th style={{ width: '10%' }} className="text-center">Estado</th>
            <th style={{ width: '20%' }} className="text-center">Empleado asignado</th>
            <th style={{ width: '10%' }} className="text-center">Usuario Reporta</th>
            <th style={{ width: '20%' }} className="text-center">Solución</th>
            <th style={{ width: '15%' }} className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {incidencias.length > 0 ? (
            incidencias.map(incidencia => {
              const uuid = getUUIDByPaqueteId(incidencia.id_paquete);
              return (
                <tr key={incidencia.id}>
                  <td style={{ width: '5%' }} className="text-center">{incidencia.id}</td>
                  <td style={{ width: '5%' }} className="text-center">
                    {truncateText(uuid)}{" "}
                    {uuid !== "UUID no disponible" && (
                      <>
                        <FontAwesomeIcon
                          icon={faCopy}
                          style={{ cursor: "pointer", marginLeft: "5px" }}
                          id={`copy-${uuid}`}
                          onClick={() => handleCopy(uuid)}
                        />
                        <Tooltip
                          isOpen={tooltipOpen[uuid]}
                          target={`copy-${uuid}`}
                          toggle={() => toggleTooltip(uuid)}
                        >
                          Copiar UUID
                        </Tooltip>
                      </>
                    )}
                  </td>
                  <td style={{ width: '15%' }} className="text-center">{truncateText(incidencia.descripcion)}</td>
                  <td style={{ width: '15%' }} className="text-center">{incidencia.tipo_incidencia}</td>
                  <td style={{ width: '10%' }} className="text-center">{renderEstado(incidencia.estado)}</td>
                  <td style={{ width: '20%' }} className="text-center">{renderUsuarioAsignado(incidencia)}</td>
                  <td style={{ width: '10%' }} className="text-center">{incidencia.id_usuario_reporta}</td>
                  <td style={{ width: '20%' }} className="text-center">{truncateText(incidencia.solucion || "Sin solución")}</td>
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
              );
            })
          ) : (
            <tr>
              <td colSpan="9" className="text-center">Sin incidencias.</td>
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
