import React, { useEffect, useState, useCallback } from "react";
import { Card, CardBody, Col, Row, Button, Badge, Modal, ModalHeader, ModalBody, ModalFooter, Table, Collapse, Pagination, PaginationItem, PaginationLink } from "reactstrap";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthService from "../services/authService";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Breadcrumbs from "../components/Usuarios/Common/Breadcrumbs";
import { faCheck, faTimes, faEye, faEdit, faTrash, faPlus, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import FormularioDireccion from "../pages/FormularioDireccion";
import ModalEditarDireccion from "../components/Clientes/ModalEditarDireccion";

const API_URL = import.meta.env.VITE_API_URL;
const DIRECCIONES_POR_PAGINA = 5;

const DetallesCliente = () => {
  const { id } = useParams();
  const [cliente, setCliente] = useState(null);
  const [direcciones, setDirecciones] = useState([]);
  const [modalDireccion, setModalDireccion] = useState(false);
  const [modalEditarDireccion, setModalEditarDireccion] = useState(false);
  const [direccionSeleccionada, setDireccionSeleccionada] = useState(null);
  const [modalConfirmacion, setModalConfirmacion] = useState(false);
  const [direccionAEliminar, setDireccionAEliminar] = useState(null);
  const [direccionesExpandidas, setDireccionesExpandidas] = useState({});
  const [paginaActual, setPaginaActual] = useState(1);
  const [cargando, setCargando] = useState(true);

  const token = AuthService.getCurrentUser();

  const verificarEstadoUsuarioLogueado = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (userId && token) {
        const response = await fetch(`${API_URL}/auth/show/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const responseData = await response.json();

        if (responseData.status === "Token is Invalid") {
          console.error("Token is invalid. Logging out...");
          AuthService.logout();
          window.location.href = "/login";
          return;
        }
      }
    } catch (error) {
      console.error("Error al verificar el estado del usuario:", error);
      AuthService.logout();
      window.location.href = "/login";
    }
  }, [token]);

  useEffect(() => {
    verificarEstadoUsuarioLogueado();

    const interval = setInterval(() => {
      verificarEstadoUsuarioLogueado();
    }, 30000);

    return () => clearInterval(interval);
  }, [verificarEstadoUsuarioLogueado]);

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      const [clienteResponse, direccionesResponse, detallesResponse] = await Promise.all([
        axios.get(`${API_URL}/clientes/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/direcciones?id_cliente=${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/dropdown/get_direcciones/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setCliente(clienteResponse.data.cliente);

      const direccionesConDetalles = direccionesResponse.data.direcciones.map(dir => {
        const detalles = detallesResponse.data.find(d => d.id === dir.id);
        return {
          ...dir,
          departamento: detalles?.departamento || dir.id_departamento,
          municipio: detalles?.municipio || dir.id_municipio
        };
      });

      setDirecciones(direccionesConDetalles);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      toast.error("Error al cargar los datos del cliente y direcciones");
    } finally {
      setCargando(false);
    }
  }, [id, token]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const toggleModalDireccion = () => setModalDireccion(!modalDireccion);

  const toggleDireccion = (id) => {
    setDireccionesExpandidas(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const indicePrimeraDireccion = (paginaActual - 1) * DIRECCIONES_POR_PAGINA;
  const indiceUltimaDireccion = indicePrimeraDireccion + DIRECCIONES_POR_PAGINA;
  const direccionesActuales = direcciones.slice(indicePrimeraDireccion, indiceUltimaDireccion);
  const totalPaginas = Math.ceil(direcciones.length / DIRECCIONES_POR_PAGINA);

  const onDireccionGuardada = async () => {
    toggleModalDireccion();
    await cargarDatos();
    toast.success('Dirección guardada correctamente');
  };

  const editarDireccion = (direccion) => {
    setDireccionSeleccionada(direccion);
    setModalEditarDireccion(true);
  };

  const onDireccionEditada = async () => {
    setModalEditarDireccion(false);
    await cargarDatos();
    toast.success('Dirección actualizada correctamente');
  };

  const confirmarEliminarDireccion = (direccionId) => {
    setDireccionAEliminar(direccionId);
    setModalConfirmacion(true);
  };

  const eliminarDireccion = async () => {
    try {
      await axios.delete(`${API_URL}/direcciones/${direccionAEliminar}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await cargarDatos();
      toast.success('Dirección eliminada correctamente');
    } catch (error) {
      console.error('Error al eliminar dirección:', error);
      toast.error('Esta dirección no puede ser eliminada porque podría estar asociada a una orden u otros registros.');
    } finally {
      setModalConfirmacion(false);
      setDireccionAEliminar(null);
    }
  };

  if (cargando) {
    return <p>Cargando...</p>;
  }

  if (!cliente) {
    return <p>No se encontró información del cliente.</p>;
  }

  return (
    <div className="page-content">
      <Breadcrumbs title="Gestión de Clientes" breadcrumbItem="Datos de Cliente" />        
      <Card>
        <CardBody>
          <h5 className="card-title">Detalles del Cliente</h5>
          <Row>
            <Col sm="12">
              <div className="table-responsive">
                <table className="table table-bordered">
                  <tbody>
                    <tr>
                      <th scope="row" style={{ width: '150px', whiteSpace: 'nowrap' }}>ID:</th>
                      <td>
                      <Badge color="primary"> {cliente.id} </Badge>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">Nombre:</th>
                      <td>{cliente.nombre || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th scope="row">Apellido:</th>
                      <td>{cliente.apellido || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th scope="row">Nombre Comercial:</th>
                      <td>{cliente.nombre_comercial || 'N/A'}</td>
                    </tr>                    
                    <tr>
                      <th scope="row">DUI/NIT:</th>
                      <td>{cliente.id_tipo_persona === 1 ? cliente.dui || 'N/A' : cliente.nit || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th scope="row">Teléfono:</th>
                      <td>{cliente.telefono || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th scope="row">Tipo de Persona:</th>
                      <td>{cliente.id_tipo_persona === 1 ? 'Persona Natural' : 'Persona Jurídica'}</td>
                    </tr>
                    <tr>
                    <th scope="row">Contribuyente:</th>
                    <td>
                      {cliente.es_contribuyente === 0 ? (
                        <FontAwesomeIcon icon={faCheck} style={{ color: 'green' }} />
                      ) : (
                        <FontAwesomeIcon icon={faTimes} style={{ color: 'red' }} />
                      )}
                    </td>
                    </tr>
                    <tr>
                      <th scope="row">Fecha de Registro:</th>
                      <td>{new Date(cliente.fecha_registro).toLocaleDateString('es-ES')}</td>
                    </tr>
                    <tr>
                      <th scope="row">Estado:</th>
                      <td>
                        <Badge color={cliente.id_estado === 1 ? "success" : "danger"}>
                          {cliente.id_estado === 1 ? "Activo" : "Inactivo"}
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">Departamento:</th>
                      <td>{cliente.departamento || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th scope="row">Municipio:</th>
                      <td>{cliente.municipio || 'N/A'}</td>
                    </tr>
                    {cliente.id_tipo_persona === 2 && (
                      <>
                        <tr>
                          <th scope="row">Nombre de la Empresa:</th>
                          <td>{cliente.nombre_empresa || 'N/A'}</td>
                        </tr>
                        <tr>
                          <th scope="row">NRC:</th>
                          <td>{cliente.nrc || 'N/A'}</td>
                        </tr>
                        <tr>
                          <th scope="row">Giro:</th>
                          <td>{cliente.giro || 'N/A'}</td>
                        </tr>
                        <tr>
                          <th scope="row">Direccion:</th>
                          <td>{cliente.direccion || 'N/A'}</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </Col>
          </Row>
          <h5 className="mt-4">Direcciones del Cliente</h5>
          <div className="table-responsive">
            <Table className="table-hover" style={{ minWidth: '800px' }}>
              <thead>
                <tr>
                  <th style={{ width: '15%' }}>Contacto</th>
                  <th style={{ width: '10%' }}>Teléfono</th>
                  <th className="d-none d-md-table-cell" style={{ width: '10%' }}>Departamento</th>
                  <th className="d-none d-md-table-cell" style={{ width: '10%' }}>Municipio</th>
                  <th className="d-none d-lg-table-cell" style={{ width: '25%' }}>Dirección</th>
                  <th className="d-none d-lg-table-cell" style={{ width: '25%' }}>Referencia</th>
                  <th style={{ width: '5%' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {direccionesActuales.map((direccion) => (
                  <React.Fragment key={direccion.id}>
                    <tr>
                      <td style={{ width: '15%' }}>{direccion.nombre_contacto}</td>
                      <td style={{ width: '10%' }}>{direccion.telefono}</td>
                      <td className="d-none d-md-table-cell" style={{ width: '10%' }}>{direccion.departamento}</td>
                      <td className="d-none d-md-table-cell" style={{ width: '10%' }}>{direccion.municipio}</td>
                      <td className="d-none d-lg-table-cell" style={{ width: '25%' }}>{direccion.direccion}</td>
                      <td className="d-none d-lg-table-cell" style={{ width: '25%' }}>{direccion.referencia}</td>
                      <td style={{ width: '5%' }}>
                        <div className="d-flex justify-content-between">
                          <Button color="info" size="sm" className="me-1 btn-direcciones" onClick={() => editarDireccion(direccion)}>
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          <Button color="danger" size="sm" className="me-1" onClick={() => confirmarEliminarDireccion(direccion.id)}>
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                          <Button color="secondary" size="sm" className="d-md-none" onClick={() => toggleDireccion(direccion.id)}>
                            <FontAwesomeIcon icon={direccionesExpandidas[direccion.id] ? faChevronUp : faChevronDown} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                    <tr className="d-md-none">
                      <td colSpan="3">
                        <Collapse isOpen={direccionesExpandidas[direccion.id]}>
                          <div className="p-2">
                            <strong>Departamento:</strong> {direccion.departamento}<br />
                            <strong>Municipio:</strong> {direccion.municipio}<br />
                            <strong>Dirección:</strong> {direccion.direccion}<br />
                            <strong>Referencia:</strong> {direccion.referencia}
                          </div>
                        </Collapse>
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </Table>
          </div>
          <Pagination className="mt-3 justify-content-center pagination2">
            <PaginationItem disabled={paginaActual === 1}>
              <PaginationLink previous onClick={() => setPaginaActual(paginaActual - 1)} />
            </PaginationItem>
            {[...Array(totalPaginas).keys()].map(numero => (
              <PaginationItem key={numero + 1} active={paginaActual === numero + 1}>
                <PaginationLink onClick={() => setPaginaActual(numero + 1)}>
                  {numero + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem disabled={paginaActual === totalPaginas}>
              <PaginationLink next onClick={() => setPaginaActual(paginaActual + 1)} />
            </PaginationItem>
          </Pagination>
          <Button color="primary" onClick={toggleModalDireccion} className="mt-3">
            <FontAwesomeIcon icon={faPlus} /> Agregar Dirección
          </Button>

          <div className="d-flex justify-content-between mt-4">
            <Link to="/GestionClientes" className="btn btn-secondary btn-regresar">
              <i className="fas fa-arrow-left"></i> Regresar
            </Link>
          </div>
        </CardBody>
      </Card>

      {/* Modal para agregar dirección */}
      <Modal isOpen={modalDireccion} toggle={toggleModalDireccion}>
        <ModalHeader toggle={toggleModalDireccion}>Agregar Nueva Dirección</ModalHeader>
        <ModalBody>
          <FormularioDireccion
            clienteId={id}
            onDireccionGuardada={onDireccionGuardada}
            onCancel={toggleModalDireccion}
          />
        </ModalBody>
      </Modal>

      {/* Modal para editar dirección */}
      <ModalEditarDireccion
        isOpen={modalEditarDireccion}
        toggle={() => setModalEditarDireccion(!modalEditarDireccion)}
        direccion={direccionSeleccionada}
        onDireccionEditada={onDireccionEditada}
      />

      {/* Modal de confirmación para eliminar */}
      <Modal isOpen={modalConfirmacion} toggle={() => setModalConfirmacion(false)}>
        <ModalHeader toggle={() => setModalConfirmacion(false)}>Confirmar Eliminación</ModalHeader>
        <ModalBody>
          ¿Está seguro de que desea eliminar esta dirección?
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={eliminarDireccion}>Eliminar</Button>{' '}
          <Button color="secondary" onClick={() => setModalConfirmacion(false)}>Cancelar</Button>
        </ModalFooter>
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default DetallesCliente;
