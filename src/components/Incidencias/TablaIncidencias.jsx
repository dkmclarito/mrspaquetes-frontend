import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Button, Table, Tooltip } from "reactstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPencilAlt, faEye, faCopy } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import "/src/styles/usuarios.css";

import UbicarPaqueteModal from "../UbicarPaqueteModal/UbicarPaqueteModal";

const API_URL = import.meta.env.VITE_API_URL;

const TablaIncidencias = ({ eliminarIncidencia, toggleModalEditar }) => {
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);
  const [paquetes, setPaquetes] = useState([]);
  const [incidenciasAsignadas, setIncidenciasAsignadas] = useState([]);
  const [paquetesUbicados, setPaquetesUbicados] = useState([]); // Paquetes ubicados
  const [tooltipOpen, setTooltipOpen] = useState({});
  const [modalUbicar, setModalUbicar] = useState({ open: false, paqueteUuid: null }); // Modal state
  const navigate = useNavigate();

  // Obtener ID del usuario logueado
  const userId = localStorage.getItem("userId");

  // Obtener la información del usuario logueado
  useEffect(() => {
    const fetchUsuarioLogueado = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/auth/show/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data && response.data.user) {
          setUsuarioLogueado(response.data.user);
        }
      } catch (error) {
        console.error("Error al obtener los datos del usuario logueado:", error);
      }
    };
    fetchUsuarioLogueado();
  }, [userId]);

  // Obtener incidencias asignadas al usuario logueado
  useEffect(() => {
    const fetchIncidenciasAsignadas = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/incidencias`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data && Array.isArray(response.data.data)) {
          let incidenciasFiltradas;

          if (usuarioLogueado?.role_name === 'conductor') {
            incidenciasFiltradas = response.data.data.filter(
              (incidencia) => incidencia.id_usuario_asignado === usuarioLogueado?.id_empleado
            );
          } else if (usuarioLogueado?.role_name === 'admin') {
            incidenciasFiltradas = response.data.data.filter(
              (incidencia) => !incidencia.usuario_asignado
            );
          } else {
            incidenciasFiltradas = []; // Por defecto, ninguna incidencia si no es admin o conductor
          }

          setIncidenciasAsignadas(incidenciasFiltradas);
        }
      } catch (error) {
        console.error("Error al obtener las incidencias asignadas:", error);
      }
    };

    if (usuarioLogueado) {
      fetchIncidenciasAsignadas();
    }
  }, [usuarioLogueado]);

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

  // Obtener paquetes ubicados
  useEffect(() => {
    const fetchPaquetesUbicados = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/ubicacion-paquetes-danados`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data && Array.isArray(response.data.data)) {
          setPaquetesUbicados(response.data.data);
        }
      } catch (error) {
        console.error("Error al obtener los paquetes ubicados:", error);
      }
    };
    fetchPaquetesUbicados();
  }, []);

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

  // Función para truncar texto largo
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
            onClick={() => navigate(`/AsignarUsuarioIncidencia/${incidencia.id}`)} 
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

  const handleDarSolucion = (idIncidencia) => {
    navigate(`/DarSolucionIncidencia/${idIncidencia}`);
  };

  const renderSolucion = (incidencia) => {
    if (usuarioLogueado && usuarioLogueado.id_empleado === incidencia.id_usuario_asignado) {
      const paqueteUuid = getUUIDByPaqueteId(incidencia.id_paquete);
      const paquete = paquetesUbicados.find((paquete) => paquete.id_paquete === incidencia.id_paquete);
      const paqueteYaUbicado = paquete && /^B\d+P\d+E\d+AN\d+DA$/.test(paquete.ubicacion);

      return (
        <>
          {!paqueteYaUbicado && (
            <Button color="info" size="sm" onClick={() => setModalUbicar({ open: true, paqueteUuid })}>
              Ubicar
            </Button>
          )}
          {paqueteYaUbicado && (
            <Button color="success" size="sm" onClick={() => handleDarSolucion(incidencia.id)} style={{ marginLeft: '10px' }}>
              Dar Solución
            </Button>
          )}
          {incidencia.solucion !== "Pendiente" && (
            <span>{incidencia.solucion}</span>
          )}
        </>
      );
    } else {
      return <span>{truncateText(incidencia.solucion)}</span>;
    }
  };

  const handleCloseModal = () => {
    setModalUbicar({ open: false, paqueteUuid: null });
    // Refrescar la página después de ubicar un paquete
   // window.location.reload();
  };

  return (
    <div className="table-responsive" style={{ marginTop: "-10px" }}>
      <div className="d-flex justify-content-between mb-3">
        <Button color="primary" onClick={() => navigate('/MisIncidencias')}>
          Mis incidencias reportadas
        </Button>
      </div>

      <h5>Incidencias a dar solución</h5>
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
          {incidenciasAsignadas.length > 0 ? (
            incidenciasAsignadas.map(incidencia => {
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
                  <td style={{ width: '10%' }} className="text-center">{incidencia.usuario_reporta}</td>
                  <td style={{ width: '20%' }} className="text-center">{renderSolucion(incidencia)}</td>
                  <td style={{ width: '15%' }} className="text-center">
                    <div className="button-container">
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
              <td colSpan="9" className="text-center">Sin incidencias asignadas.</td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Modal para ubicar paquete */}
      {modalUbicar.open && (
        <UbicarPaqueteModal
          isOpen={modalUbicar.open}
          toggle={handleCloseModal}
          paqueteUuid={modalUbicar.paqueteUuid}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

TablaIncidencias.propTypes = {
  eliminarIncidencia: PropTypes.func.isRequired,
  toggleModalEditar: PropTypes.func.isRequired,
};

export default TablaIncidencias;
