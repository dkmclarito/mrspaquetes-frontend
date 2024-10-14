import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import Breadcrumbs from "../components/Usuarios/Common/Breadcrumbs";
import TablaUsuarios from "../components/Usuarios/TablaUsuarios";
import ModalEditarUsuario from "../components/Usuarios/ModalEditarUsuario";
import ModalConfirmarEliminar from "../components/Usuarios/ModalConfirmarEliminar";
import AuthService from "../services/authService";
import "../styles/usuarios.css";
import Pagination from "react-js-pagination";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 10;

const GestionUsuarios = () => {
  document.title = "Usuarios | Mr. Paquetes";
  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [roles, setRoles] = useState([]);
  const [modalEditar, setModalEditar] = useState(false);
  const [usuarioEditado, setUsuarioEditado] = useState(null);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filtros, setFiltros] = useState({
    email: "",
    nombreEmpleado: "",
    rolFiltro: "",
    estadoFiltro: "",
  });
  const [loading, setLoading] = useState(true);

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
          window.location.href = "/login";
          return;
        }
      }
    } catch (error) {
      console.error("Error 500 DKM:", error);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = AuthService.getCurrentUser();
      
      // Funcion para obtener todos los empleados
      const fetchAllEmpleados = async (page = 1, allEmpleados = []) => {
        const response = await axios.get(`${API_URL}/empleados?page=${page}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const newEmpleados = response.data.empleados;
        allEmpleados = [...allEmpleados, ...newEmpleados];
        
        if (page < response.data.pagination.last_page) {
          return fetchAllEmpleados(page + 1, allEmpleados);
        }
        return allEmpleados;
      };
  
      const [usuariosResponse, empleadosResponse] = await Promise.all([
        axios.get(`${API_URL}/auth/get_users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetchAllEmpleados(),
      ]);
  
      setEmpleados(empleadosResponse);
  
      const empleadosMap = new Map(
        empleadosResponse.map((emp) => [
          emp.id,
          `${emp.nombres} ${emp.apellidos}`,
        ])
      );
  
      if (usuariosResponse.data && Array.isArray(usuariosResponse.data.users)) {
        const usuariosConEmpleados = usuariosResponse.data.users.map(
          (usuario) => ({
            ...usuario,
            nombre_completo_empleado:
              usuario.role_name === "admin"
                ? "Usuario administrador"
                : usuario.id_empleado
                  ? empleadosMap.get(usuario.id_empleado) || "Empleado no encontrado"
                  : "Sin asignar",
          })
        );
        setUsuarios(usuariosConEmpleados);
      } else {
        console.error(
          "Datos inesperados al obtener usuarios:",
          usuariosResponse.data
        );
      }
    } catch (error) {
      console.error("Error al obtener datos:", error);
      toast.error("Error al cargar los usuarios");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const token = AuthService.getCurrentUser();
      const response = await axios.get(`${API_URL}/roles`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && Array.isArray(response.data)) {
        const rolesFiltrados = response.data.filter((rol) => rol.id !== 2);
        setRoles(rolesFiltrados);
      } else {
        console.error("Datos inesperados al obtener roles:", response.data);
      }
    } catch (error) {
      console.error("Error al obtener roles:", error);
    }
  }, []);

  useEffect(() => {
    verificarEstadoUsuarioLogueado();
    fetchData();
    fetchRoles();
  }, [verificarEstadoUsuarioLogueado, fetchData, fetchRoles]);

  useEffect(() => {
    const interval = setInterval(() => {
      verificarEstadoUsuarioLogueado();
    }, 30000);

    return () => clearInterval(interval);
  }, [verificarEstadoUsuarioLogueado]);

  const toggleFiltros = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const limpiarFiltros = () => {
    setFiltros({
      email: "",
      nombreEmpleado: "",
      rolFiltro: "",
      estadoFiltro: "",
    });
    setCurrentPage(1);
  };

  const filtrarUsuarios = useCallback(() => {
    return usuarios.filter((usuario) => {
      const emailMatch =
        !filtros.email ||
        (usuario.email &&
          usuario.email.toLowerCase().includes(filtros.email.toLowerCase()));
      const nombreMatch =
        !filtros.nombreEmpleado ||
        (usuario.nombre_completo_empleado &&
          usuario.nombre_completo_empleado
            .toLowerCase()
            .includes(filtros.nombreEmpleado.toLowerCase()));
      const cumpleRol =
        !filtros.rolFiltro ||
        usuario.role_id === parseInt(filtros.rolFiltro, 10);
      const cumpleEstado =
        !filtros.estadoFiltro ||
        usuario.status.toString() === filtros.estadoFiltro;

      return emailMatch && nombreMatch && cumpleRol && cumpleEstado;
    });
  }, [usuarios, filtros]);

  const usuariosFiltrados = useMemo(() => filtrarUsuarios(), [filtrarUsuarios]);

  const paginatedUsuarios = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return usuariosFiltrados.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [usuariosFiltrados, currentPage]);

  const eliminarUsuario = useCallback((idUsuario) => {
    setConfirmarEliminar(true);
    setUsuarioAEliminar(idUsuario);
  }, []);

  const confirmarEliminarUsuario = useCallback(async () => {
    try {
      const token = AuthService.getCurrentUser();
      await axios.delete(`${API_URL}/auth/destroy/${usuarioAEliminar}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsuarios((prevUsuarios) =>
        prevUsuarios.filter((usuario) => usuario.id !== usuarioAEliminar)
      );
      toast.success("Usuario eliminado con éxito");
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      toast.error("Error al eliminar el usuario");
    } finally {
      setConfirmarEliminar(false);
      setUsuarioAEliminar(null);
    }
  }, [usuarioAEliminar]);

  const toggleModalEditar = useCallback((usuario) => {
    setUsuarioEditado({
      ...usuario,
      id_empleado: usuario.id_empleado,
      role_id: usuario.role_id,
    });
    setModalEditar(true);
  }, []);

  const guardarCambiosUsuario = useCallback(async (usuarioActualizado) => {
    try {
      const token = AuthService.getCurrentUser();
      const {
        id,
        email,
        type,
        status,
        role_id,
        id_empleado,
        password,
        password_confirmation,
      } = usuarioActualizado;
      const data = {
        email,
        type,
        status,
        role_id,
        password,
        password_confirmation,
      };
      if (id_empleado) data.id_empleado = id_empleado;

      const response = await axios.put(`${API_URL}/auth/update/${id}`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setUsuarios((prevUsuarios) =>
          prevUsuarios.map((usuario) =>
            usuario.id === id ? usuarioActualizado : usuario
          )
        );
        setModalEditar(false);
        setUsuarioEditado(null);
        toast.success("Usuario actualizado con éxito");
      }
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      toast.error("Error al actualizar el usuario");
    }
  }, []);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs
          title="Gestión de Usuarios"
          breadcrumbItem="Lista de usuarios Empleados"
        />
        <Row>
          <Col lg={12}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <Button color="primary" onClick={toggleFiltros}>
                <FontAwesomeIcon icon={faFilter} />{" "}
                {isFilterOpen ? "Ocultar Filtros" : "Mostrar Filtros"}
              </Button>
              <Link to="/AgregarUsuario" className="btn btn-primary">
                <i className="fas fa-plus"></i> Agregar Usuario
              </Link>
            </div>
            <Collapse isOpen={isFilterOpen}>
              <Card>
                <CardBody>
                  <Row>
                    <Col md={3}>
                      <Label for="email">Email:</Label>
                      <Input
                        type="text"
                        name="email"
                        id="email"
                        value={filtros.email}
                        onChange={handleFiltroChange}
                        placeholder="Buscar por email"
                      />
                    </Col>
                    <Col md={3}>
                      <Label for="nombreEmpleado">Nombre del Empleado:</Label>
                      <Input
                        type="text"
                        name="nombreEmpleado"
                        id="nombreEmpleado"
                        value={filtros.nombreEmpleado}
                        onChange={handleFiltroChange}
                        placeholder="Buscar por nombre"
                      />
                    </Col>
                    <Col md={3}>
                      <Label for="rolFiltro">Rol:</Label>
                      <Input
                        type="select"
                        name="rolFiltro"
                        id="rolFiltro"
                        value={filtros.rolFiltro}
                        onChange={handleFiltroChange}
                      >
                        <option value="">Todos los roles</option>
                        {roles.map((rol) => (
                          <option key={rol.id} value={rol.id}>
                            {rol.name}
                          </option>
                        ))}
                      </Input>
                    </Col>
                    <Col md={3}>
                      <Label for="estadoFiltro">Estado:</Label>
                      <Input
                        type="select"
                        name="estadoFiltro"
                        id="estadoFiltro"
                        value={filtros.estadoFiltro}
                        onChange={handleFiltroChange}
                      >
                        <option value="">Todos los estados</option>
                        <option value="1">Activo</option>
                        <option value="0">Inactivo</option>
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
                  <p>Cargando usuarios...</p>
                ) : (
                  <TablaUsuarios
                    usuarios={paginatedUsuarios}
                    eliminarUsuario={eliminarUsuario}
                    toggleModalEditar={toggleModalEditar}
                    agregarEmpleado={(usuarioId) =>
                      navigate(`/AgregarEmpleado/${usuarioId}`)
                    }
                  />
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
              activePage={currentPage}
              itemsCountPerPage={ITEMS_PER_PAGE}
              totalItemsCount={usuariosFiltrados.length}
              pageRangeDisplayed={5}
              onChange={handlePageChange}
              itemClass="page-item"
              linkClass="page-link"
              innerClass="pagination"
            />
          </Col>
        </Row>
      </Container>
      <ModalEditarUsuario
        modalEditar={modalEditar}
        usuarioEditado={usuarioEditado}
        setUsuarioEditado={setUsuarioEditado}
        guardarCambiosUsuario={guardarCambiosUsuario}
        setModalEditar={setModalEditar}
        empleados={empleados}
      />
      <ModalConfirmarEliminar
        confirmarEliminar={confirmarEliminar}
        confirmarEliminarUsuario={confirmarEliminarUsuario}
        setConfirmarEliminar={setConfirmarEliminar}
      />
    </div>
  );
};

export default GestionUsuarios;
