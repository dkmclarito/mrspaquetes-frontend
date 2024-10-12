import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardBody,
  Col,
  Row,
  Button,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
  Collapse,
  Pagination,
  PaginationItem,
  PaginationLink,
} from "reactstrap";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AuthService from "../services/authService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Breadcrumbs from "../components/Usuarios/Common/Breadcrumbs";
import {
  faCheck,
  faTimes,
  faEdit,
  faTrash,
  faPlus,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
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

      const clienteResponse = await axios.get(`${API_URL}/clientes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (clienteResponse.data && clienteResponse.data.cliente) {
        setCliente(clienteResponse.data.cliente);

        const direccionesResponse = await axios.get(
          `${API_URL}/direcciones?id_cliente=${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const detallesResponse = await axios.get(
          `${API_URL}/dropdown/get_direcciones/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const direccionesConDetalles = direccionesResponse.data.direcciones.map(
          (dir) => {
            const detalles = detallesResponse.data.find((d) => d.id === dir.id);
            return {
              ...dir,
              departamento: detalles?.departamento || "N/A",
              municipio: detalles?.municipio || "N/A",
            };
          }
        );

        setDirecciones(direccionesConDetalles);
      } else {
        setCliente({});
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setCargando(false);
    }
  }, [id, token]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const toggleModalDireccion = () => setModalDireccion(!modalDireccion);

  const toggleDireccion = (id) => {
    setDireccionesExpandidas((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const indicePrimeraDireccion = (paginaActual - 1) * DIRECCIONES_POR_PAGINA;
  const indiceUltimaDireccion = indicePrimeraDireccion + DIRECCIONES_POR_PAGINA;
  const direccionesActuales = direcciones.slice(
    indicePrimeraDireccion,
    indiceUltimaDireccion
  );
  const totalPaginas = Math.ceil(direcciones.length / DIRECCIONES_POR_PAGINA);

  const onDireccionGuardada = async () => {
    toggleModalDireccion();
    await cargarDatos();
    toast.success("Dirección guardada correctamente");
  };

  const editarDireccion = (direccion) => {
    setDireccionSeleccionada(direccion);
    setModalEditarDireccion(true);
  };

  const onDireccionEditada = async () => {
    setModalEditarDireccion(false);
    await cargarDatos();
    toast.success("Dirección actualizada correctamente");
  };

  const confirmarEliminarDireccion = (direccionId) => {
    setDireccionAEliminar(direccionId);
    setModalConfirmacion(true);
  };

  const eliminarDireccion = async () => {
    try {
      await axios.delete(`${API_URL}/direcciones/${direccionAEliminar}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Filtrar la dirección eliminada del estado local
      setDirecciones((prevDirecciones) =>
        prevDirecciones.filter(
          (direccion) => direccion.id !== direccionAEliminar
        )
      );

      // Actualizar el estado de direcciones expandidas en caso de que estuviera expandida
      setDireccionesExpandidas((prevExpandidas) => {
        const nuevasExpandidas = { ...prevExpandidas };
        delete nuevasExpandidas[direccionAEliminar];
        return nuevasExpandidas;
      });

      toast.success("Dirección eliminada correctamente");
    } catch (error) {
      console.error("Error al eliminar dirección:", error);
      toast.error(
        "Esta dirección no puede ser eliminada porque podría estar asociada a una orden u otros registros."
      );
    } finally {
      setModalConfirmacion(false);
      setDireccionAEliminar(null);
    }
  };

  if (cargando) {
    return <p>Cargando...</p>;
  }

  const renderClienteInfo = (title, value, isBadge = false) => (
    <tr>
      <th scope="row" style={{ width: "150px", whiteSpace: "nowrap" }}>
        {title}:
      </th>
      <td>
        {isBadge ? (
          <Badge color={value === "Activo" ? "success" : "danger"}>
            {value}
          </Badge>
        ) : (
          value || "-"
        )}
      </td>
    </tr>
  );

  return (
    <div className="page-content">
      <Breadcrumbs
        title="Gestión de Clientes"
        breadcrumbItem="Datos de Cliente"
      />
      <Card>
        <CardBody>
          <h5 className="card-title mb-4">Detalles del Cliente</h5>
          <Row>
            <Col md={4}>
              <table className="table table-bordered">
                <tbody>
                  {renderClienteInfo(
                    "ID",
                    <Badge color="primary">{cliente?.id || "N/A"}</Badge>
                  )}
                  {renderClienteInfo("Nombre", cliente?.nombre)}
                  {renderClienteInfo("Apellido", cliente?.apellido)}
                  {renderClienteInfo(
                    "Nombre Comercial",
                    cliente?.nombre_comercial
                  )}
                </tbody>
              </table>
            </Col>
            <Col md={4}>
              <table className="table table-bordered">
                <tbody>
                  {renderClienteInfo(
                    "DUI/NIT",
                    cliente?.id_tipo_persona === 1 ? cliente?.dui : cliente?.nit
                  )}
                  {renderClienteInfo("Teléfono", cliente?.telefono)}
                  {renderClienteInfo(
                    "Tipo de Persona",
                    cliente?.id_tipo_persona === 1
                      ? "Persona Natural"
                      : "Persona Jurídica"
                  )}
                  {renderClienteInfo(
                    "Contribuyente",
                    cliente?.es_contribuyente === 1 ? (
                      <FontAwesomeIcon
                        icon={faCheck}
                        style={{ color: "green" }}
                      />
                    ) : (
                      <FontAwesomeIcon
                        icon={faTimes}
                        style={{ color: "red" }}
                      />
                    )
                  )}
                </tbody>
              </table>
            </Col>
            <Col md={4}>
              <table className="table table-bordered">
                <tbody>
                  {renderClienteInfo(
                    "Fecha de Registro",
                    new Date(cliente?.fecha_registro).toLocaleDateString(
                      "es-ES"
                    )
                  )}
                  {renderClienteInfo(
                    "Estado",
                    cliente?.id_estado === 1 ? "Activo" : "Inactivo",
                    true
                  )}
                  {renderClienteInfo("Departamento", cliente?.departamento)}
                  {renderClienteInfo("Municipio", cliente?.municipio)}
                </tbody>
              </table>
            </Col>
          </Row>

          {cliente?.id_tipo_persona === 2 && (
            <Row className="mt-4">
              <Col md={12}>
                <h6>Información Adicional para Persona Jurídica</h6>
                <table className="table table-bordered">
                  <tbody>
                    {renderClienteInfo(
                      "Nombre de la Empresa",
                      cliente?.nombre_empresa
                    )}
                    {renderClienteInfo("NRC", cliente?.nrc)}
                    {renderClienteInfo("Giro", cliente?.giro)}
                    {renderClienteInfo("Dirección", cliente?.direccion)}
                  </tbody>
                </table>
              </Col>
            </Row>
          )}

          <h5 className="mt-4">Direcciones del Cliente</h5>
          <div className="table-responsive">
            <Table className="table-hover" style={{ minWidth: "800px" }}>
              <thead>
                <tr>
                  <th style={{ width: "15%" }}>Contacto</th>
                  <th style={{ width: "10%" }}>Teléfono</th>
                  <th
                    className="d-none d-md-table-cell"
                    style={{ width: "10%" }}
                  >
                    Departamento
                  </th>
                  <th
                    className="d-none d-md-table-cell"
                    style={{ width: "10%" }}
                  >
                    Municipio
                  </th>
                  <th
                    className="d-none d-lg-table-cell"
                    style={{ width: "25%" }}
                  >
                    Dirección
                  </th>
                  <th
                    className="d-none d-lg-table-cell"
                    style={{ width: "25%" }}
                  >
                    Referencia
                  </th>
                  <th style={{ width: "5%" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {direcciones.length > 0 ? (
                  direccionesActuales.map((direccion) => (
                    <React.Fragment key={direccion.id}>
                      <tr>
                        <td style={{ width: "15%" }}>
                          {direccion.nombre_contacto}
                        </td>
                        <td style={{ width: "10%" }}>{direccion.telefono}</td>
                        <td
                          className="d-none d-md-table-cell"
                          style={{ width: "10%" }}
                        >
                          {direccion.departamento}
                        </td>
                        <td
                          className="d-none d-md-table-cell"
                          style={{ width: "10%" }}
                        >
                          {direccion.municipio}
                        </td>
                        <td
                          className="d-none d-lg-table-cell"
                          style={{ width: "25%" }}
                        >
                          {direccion.direccion}
                        </td>
                        <td
                          className="d-none d-lg-table-cell"
                          style={{ width: "25%" }}
                        >
                          {direccion.referencia}
                        </td>
                        <td style={{ width: "5%" }}>
                          <div className="d-flex justify-content-between">
                            <Button
                              color="info"
                              size="sm"
                              className="me-1 btn-direcciones"
                              onClick={() => editarDireccion(direccion)}
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </Button>
                            <Button
                              color="danger"
                              size="sm"
                              className="me-1"
                              onClick={() =>
                                confirmarEliminarDireccion(direccion.id)
                              }
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </Button>
                            <Button
                              color="secondary"
                              size="sm"
                              className="d-md-none"
                              onClick={() => toggleDireccion(direccion.id)}
                            >
                              <FontAwesomeIcon
                                icon={
                                  direccionesExpandidas[direccion.id]
                                    ? faChevronUp
                                    : faChevronDown
                                }
                              />
                            </Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="d-md-none">
                        <td colSpan="3">
                          <Collapse
                            isOpen={direccionesExpandidas[direccion.id]}
                          >
                            <div className="p-2">
                              <strong>Departamento:</strong>{" "}
                              {direccion.departamento}
                              <br />
                              <strong>Municipio:</strong> {direccion.municipio}
                              <br />
                              <strong>Dirección:</strong> {direccion.direccion}
                              <br />
                              <strong>Referencia:</strong>{" "}
                              {direccion.referencia}
                            </div>
                          </Collapse>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7">
                      No hay direcciones registradas para este cliente.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          {/* Paginación y botones de acción */}
          {direcciones.length > 0 && (
            <Pagination className="mt-3 justify-content-center pagination2">
              <PaginationItem disabled={paginaActual === 1}>
                <PaginationLink
                  previous
                  onClick={() => setPaginaActual(paginaActual - 1)}
                />
              </PaginationItem>
              {[...Array(totalPaginas).keys()].map((numero) => (
                <PaginationItem
                  key={numero + 1}
                  active={paginaActual === numero + 1}
                >
                  <PaginationLink onClick={() => setPaginaActual(numero + 1)}>
                    {numero + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem disabled={paginaActual === totalPaginas}>
                <PaginationLink
                  next
                  onClick={() => setPaginaActual(paginaActual + 1)}
                />
              </PaginationItem>
            </Pagination>
          )}

          <Button
            color="primary"
            onClick={toggleModalDireccion}
            className="mt-3"
          >
            <FontAwesomeIcon icon={faPlus} /> Agregar Dirección
          </Button>

          <div className="d-flex justify-content-between mt-4">
            <Link
              to="/GestionClientes"
              className="btn btn-secondary btn-regresar"
            >
              <i className="fas fa-arrow-left"></i> Regresar
            </Link>
          </div>
        </CardBody>
      </Card>

      {/* Modal para agregar dirección */}
      <Modal isOpen={modalDireccion} toggle={toggleModalDireccion}>
        <ModalHeader toggle={toggleModalDireccion}>
          Agregar Nueva Dirección
        </ModalHeader>
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
      <Modal
        isOpen={modalConfirmacion}
        toggle={() => setModalConfirmacion(false)}
      >
        <ModalHeader toggle={() => setModalConfirmacion(false)}>
          Confirmar Eliminación
        </ModalHeader>
        <ModalBody>
          ¿Está seguro de que desea eliminar esta dirección?
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={eliminarDireccion}>
            Eliminar
          </Button>{" "}
          <Button color="secondary" onClick={() => setModalConfirmacion(false)}>
            Cancelar
          </Button>
        </ModalFooter>
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default DetallesCliente;
