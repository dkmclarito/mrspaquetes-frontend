import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Input,
  Label,
  Button,
  Collapse,
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import Breadcrumbs from "../components/Empleados/Common/Breadcrumbs";
import TablaEmpleados from "../components/Empleados/TablaEmpleados";
import ModalEditarEmpleado from "../components/Empleados/ModalEditarEmpleado";
import ModalConfirmarEliminar from "../components/Empleados/ModalConfirmarEliminar";
import AuthService from "../services/authService";
import "../styles/Empleados.css";
import Pagination from "react-js-pagination";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = import.meta.env.VITE_API_URL;

const GestionEmpleados = () => {
  document.title = "Empleados | Mr. Paquetes";

  const [empleados, setEmpleados] = useState([]);
  const [empleadosFiltrados, setEmpleadosFiltrados] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [estados] = useState([
    { id: 1, nombre: "Activo" },
    { id: 2, nombre: "Inactivo" },
    { id: 3, nombre: "Suspendido" },
  ]);
  const [departamentos, setDepartamentos] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [modalEditar, setModalEditar] = useState(false);
  const [empleadoEditado, setEmpleadoEditado] = useState(null);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [empleadoAEliminar, setEmpleadoAEliminar] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState("");
  const [paginationInfo, setPaginationInfo] = useState({
    total: 0,
    per_page: 10,
    current_page: 1,
    last_page: 1,
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filtros, setFiltros] = useState({
    nombres: "",
    apellidos: "",
    fecha_contratacion_inicio: "",
    fecha_contratacion_fin: "",
    id_estado: "",
  });
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const verificarEstadoUsuarioLogueado = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userId");
      const token = AuthService.getCurrentUser();

      if (userId && token) {
        const response = await axios.get(`${API_URL}/auth/show/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.status === "Token is Invalid") {
          console.error("Token is invalid. Logging out...");
          AuthService.logout();
          navigate("/login");
          return;
        }
      }
    } catch (error) {
      console.error(
        "Error al verificar estado del usuario:",
        error.response?.data || error.message
      );
    }
  }, [navigate]);

  const fetchEmpleados = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const token = AuthService.getCurrentUser();
      const response = await axios.get(`${API_URL}/empleados`, {
        params: { page },
        headers: { Authorization: `Bearer ${token}` },
      });

      setEmpleados(response.data.empleados);
      setEmpleadosFiltrados(response.data.empleados);
      setPaginationInfo(response.data.pagination);
    } catch (error) {
      console.error("Error al obtener empleados:", error);
      toast.error(
        "Error al cargar los empleados. Por favor, intente de nuevo."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDropdownData = useCallback(async () => {
    try {
      const token = AuthService.getCurrentUser();
      const [cargosResponse, departamentosResponse] = await Promise.all([
        axios.get(`${API_URL}/dropdown/get_cargos`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/dropdown/get_departamentos`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setCargos(cargosResponse.data.cargos || []);
      setDepartamentos(departamentosResponse.data || []);
    } catch (error) {
      console.error("Error al obtener datos de dropdown:", error);
      toast.error(
        "Error al cargar datos adicionales. Algunas funciones pueden estar limitadas."
      );
    }
  }, []);

  const fetchMunicipios = useCallback(async (idDepartamento) => {
    if (!idDepartamento) return;
    try {
      const token = AuthService.getCurrentUser();
      const response = await axios.get(
        `${API_URL}/dropdown/get_municipio/${idDepartamento}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMunicipios(response.data.municipio || []);
    } catch (error) {
      console.error("Error al obtener municipios:", error);
      toast.error("Error al cargar los municipios.");
    }
  }, []);

  useEffect(() => {
    verificarEstadoUsuarioLogueado();
    fetchEmpleados(currentPage);
    fetchDropdownData();
  }, [
    verificarEstadoUsuarioLogueado,
    fetchEmpleados,
    fetchDropdownData,
    currentPage,
  ]);

  useEffect(() => {
    const interval = setInterval(verificarEstadoUsuarioLogueado, 300000); // Verificar cada 5 minutos
    return () => clearInterval(interval);
  }, [verificarEstadoUsuarioLogueado]);

  useEffect(() => {
    if (departamentoSeleccionado) {
      fetchMunicipios(departamentoSeleccionado);
    } else {
      setMunicipios([]);
    }
  }, [departamentoSeleccionado, fetchMunicipios]);

  useEffect(() => {
    filtrarEmpleados();
  }, [filtros, empleados]);

  const toggleFiltros = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      nombres: "",
      apellidos: "",
      fecha_contratacion_inicio: "",
      fecha_contratacion_fin: "",
      id_estado: "",
    });
  };

  const filtrarEmpleados = () => {
    let resultados = empleados;

    if (filtros.nombres) {
      resultados = resultados.filter((empleado) =>
        empleado.nombres.toLowerCase().includes(filtros.nombres.toLowerCase())
      );
    }

    if (filtros.apellidos) {
      resultados = resultados.filter((empleado) =>
        empleado.apellidos
          .toLowerCase()
          .includes(filtros.apellidos.toLowerCase())
      );
    }

    if (filtros.fecha_contratacion_inicio) {
      resultados = resultados.filter(
        (empleado) =>
          new Date(empleado.fecha_contratacion) >=
          new Date(filtros.fecha_contratacion_inicio)
      );
    }

    if (filtros.fecha_contratacion_fin) {
      resultados = resultados.filter(
        (empleado) =>
          new Date(empleado.fecha_contratacion) <=
          new Date(filtros.fecha_contratacion_fin)
      );
    }

    if (filtros.id_estado) {
      resultados = resultados.filter(
        (empleado) => empleado.id_estado === parseInt(filtros.id_estado)
      );
    }

    setEmpleadosFiltrados(resultados);
  };

  const verDetallesEmpleado = (idEmpleado) => {
    navigate(`/DetallesEmpleado/${idEmpleado}`);
  };

  const guardarCambiosEmpleado = async () => {
    try {
      const empleadoParaGuardar = {
        ...empleadoEditado,
        telefono: empleadoEditado.telefono.replace("-", ""),
      };

      const token = AuthService.getCurrentUser();
      await axios.put(
        `${API_URL}/empleados/${empleadoParaGuardar.id}`,
        empleadoParaGuardar,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchEmpleados(currentPage);
      setModalEditar(false);
      toast.success("Empleado actualizado con éxito");
    } catch (error) {
      console.error("Error al actualizar empleado:", error);
      toast.error(
        "Error al actualizar el empleado. Por favor, intente de nuevo."
      );
    }
  };

  const eliminarEmpleado = (idEmpleado) => {
    setConfirmarEliminar(true);
    setEmpleadoAEliminar(idEmpleado);
  };

  const confirmarEliminarEmpleado = async () => {
    try {
      const token = AuthService.getCurrentUser();
      await axios.delete(`${API_URL}/empleados/${empleadoAEliminar}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchEmpleados(currentPage);
      toast.success("Empleado eliminado con éxito");
    } catch (error) {
      console.error("Error al eliminar empleado:", error);
      toast.error(
        "No se puede eliminar un empleado que tiene un usuario asignado."
      );
    } finally {
      setConfirmarEliminar(false);
    }
  };

  const toggleModalEditar = (empleado) => {
    setEmpleadoEditado(empleado);
    setModalEditar(!modalEditar);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    fetchEmpleados(pageNumber);
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs
          title="Gestión de Empleados"
          breadcrumbItem="Listado de Empleados"
        />
        <Row>
          <Col lg={12}>
            <div
              style={{
                marginTop: "10px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Button color="primary" onClick={toggleFiltros}>
                <FontAwesomeIcon icon={faFilter} />{" "}
                {isFilterOpen ? "Ocultar Filtros" : "Mostrar Filtros"}
              </Button>
              <Link
                to="/AgregarEmpleado"
                className="btn btn-primary custom-button"
              >
                <i className="fas fa-plus"></i> Agregar Empleado
              </Link>
            </div>
            <Collapse isOpen={isFilterOpen}>
              <Card>
                <CardBody>
                  <h5>Filtros</h5>
                  <Row>
                    <Col md={3}>
                      <Label for="nombres">Nombres:</Label>
                      <Input
                        type="text"
                        name="nombres"
                        id="nombres"
                        value={filtros.nombres}
                        onChange={handleFiltroChange}
                        placeholder="Buscar por nombres"
                      />
                    </Col>
                    <Col md={3}>
                      <Label for="apellidos">Apellidos:</Label>
                      <Input
                        type="text"
                        name="apellidos"
                        id="apellidos"
                        value={filtros.apellidos}
                        onChange={handleFiltroChange}
                        placeholder="Buscar por apellidos"
                      />
                    </Col>
                    <Col md={2}>
                      <Label for="fecha_contratacion_inicio">Desde:</Label>
                      <Input
                        type="date"
                        name="fecha_contratacion_inicio"
                        id="fecha_contratacion_inicio"
                        value={filtros.fecha_contratacion_inicio}
                        onChange={handleFiltroChange}
                      />
                    </Col>
                    <Col md={2}>
                      <Label for="fecha_contratacion_fin">Hasta:</Label>
                      <Input
                        type="date"
                        name="fecha_contratacion_fin"
                        id="fecha_contratacion_fin"
                        value={filtros.fecha_contratacion_fin}
                        onChange={handleFiltroChange}
                      />
                    </Col>
                    <Col md={2}>
                      <Label for="id_estado">Estado:</Label>
                      <Input
                        type="select"
                        name="id_estado"
                        id="id_estado"
                        value={filtros.id_estado}
                        onChange={handleFiltroChange}
                      >
                        <option value="">Todos los estados</option>
                        {estados.map((estado) => (
                          <option key={estado.id} value={estado.id}>
                            {estado.nombre}
                          </option>
                        ))}
                      </Input>
                    </Col>
                  </Row>
                  <Row className="mt-3">
                    <Col>
                      <Button color="secondary" onClick={limpiarFiltros}>
                        Limpiar filtros
                      </Button>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Collapse>
          </Col>
        </Row>
        <br />
        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                {loading ? (
                  <p>Cargando empleados...</p>
                ) : empleadosFiltrados.length > 0 ? (
                  <TablaEmpleados
                    empleados={empleadosFiltrados}
                    cargos={cargos}
                    estados={estados}
                    eliminarEmpleado={eliminarEmpleado}
                    toggleModalEditar={toggleModalEditar}
                    verDetallesEmpleado={verDetallesEmpleado}
                  />
                ) : (
                  <p>No hay empleados disponibles</p>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col
            lg={12}
            style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Pagination
              activePage={paginationInfo.current_page}
              itemsCountPerPage={paginationInfo.per_page}
              totalItemsCount={paginationInfo.total}
              pageRangeDisplayed={5}
              onChange={handlePageChange}
              itemClass="page-item"
              linkClass="page-link"
              innerClass="pagination"
            />
          </Col>
        </Row>
      </Container>

      <ModalEditarEmpleado
        modalEditar={modalEditar}
        empleadoEditado={empleadoEditado}
        setEmpleadoEditado={setEmpleadoEditado}
        guardarCambiosEmpleado={guardarCambiosEmpleado}
        setModalEditar={setModalEditar}
        cargos={cargos}
        estados={estados}
        departamentos={departamentos}
        municipios={municipios}
        setDepartamentoSeleccionado={setDepartamentoSeleccionado}
      />
      <ModalConfirmarEliminar
        confirmarEliminar={confirmarEliminar}
        confirmarEliminarEmpleado={confirmarEliminarEmpleado}
        setConfirmarEliminar={setConfirmarEliminar}
      />
      <ToastContainer />
    </div>
  );
};

export default GestionEmpleados;
