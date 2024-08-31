import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { Container, Row, Col, Card, CardBody, Input, Label } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import Breadcrumbs from "../components/Usuarios/Common/Breadcrumbs";
import TablaUsuarios from "../components/Usuarios/TablaUsuarios";
import ModalEditarUsuario from "../components/Usuarios/ModalEditarUsuario";
import ModalConfirmarEliminar from "../components/Usuarios/ModalConfirmarEliminar";
import AuthService from "../services/authService";
import "../styles/usuarios.css";
import Pagination from 'react-js-pagination';

const API_URL = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 5;

const GestionUsuarios = () => {
  document.title = "Usuarios | Mr. Paquetes";
  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [modalEditar, setModalEditar] = useState(false);
  const [usuarioEditado, setUsuarioEditado] = useState(null);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [rolFiltro, setRolFiltro] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

// Nueva función para verificar el estado del usuario logueado
const verificarEstadoUsuarioLogueado = useCallback(async () => {
  try {
    const userId = localStorage.getItem("userId");
   
    const token = AuthService.getCurrentUser();

    if (userId && token) {
      const response = await axios.get(`${API_URL}/auth/show/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

    //  console.log("Response Data:", response.data); 

      // Verifica si el token es inválido
      if (response.data.status === "Token is Invalid") {
        console.error("Token is invalid. Logging out...");
        AuthService.logout();
        window.location.href = "/login"; // Redirige a login si el token es inválido
        return;
      }
      // Si el token es válido y el usuario está activo, no se hace nada
    }
  } catch (error) {
    console.error("Error 500 DKM:", );
    //AuthService.logout();
    //window.location.href = "/login";
  }
}, []);



  const fetchData = useCallback(async () => {
    try {
      const token = AuthService.getCurrentUser();
      const [usuariosResponse, empleadosResponse] = await Promise.all([
        axios.get(`${API_URL}/auth/get_users`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/empleados`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const empleadosMap = new Map(empleadosResponse.data.empleados.map(emp => [emp.id, `${emp.nombres} ${emp.apellidos}`]));
      setEmpleados(empleadosResponse.data.empleados);

      if (usuariosResponse.data && Array.isArray(usuariosResponse.data.users)) {
        const usuariosConEmpleados = usuariosResponse.data.users.map(usuario => ({
          ...usuario,
          nombre_completo_empleado: usuario.role_name === 'admin'
            ? 'Usuario administrador'
            : (usuario.id_empleado ? empleadosMap.get(usuario.id_empleado) : 'Sin asignar')
        }));
        setUsuarios(usuariosConEmpleados);
      } else {
        console.error("Datos inesperados al obtener usuarios:", usuariosResponse.data);
      }
    } catch (error) {
      console.error("Error al obtener datos:", error);
    }
  }, []);

  useEffect(() => {
    verificarEstadoUsuarioLogueado(); // Verifica el estado del usuario al cargar la página
    fetchData();
  }, [fetchData, verificarEstadoUsuarioLogueado]);

  useEffect(() => {
    const interval = setInterval(() => {
      verificarEstadoUsuarioLogueado(); // Verifica el estado del usuario cada cierto tiempo
    }, 30000); // Verifica cada 30 segundos, ajusta según sea necesario

    return () => clearInterval(interval); // Limpia el intervalo al desmontar el componente
  }, [verificarEstadoUsuarioLogueado]);

  const eliminarUsuario = useCallback((idUsuario) => {
    setConfirmarEliminar(true);
    setUsuarioAEliminar(idUsuario);
  }, []);

  const confirmarEliminarUsuario = useCallback(async () => {
    try {
      const token = AuthService.getCurrentUser();
      await axios.delete(`${API_URL}/auth/destroy/${usuarioAEliminar}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsuarios(prevUsuarios => prevUsuarios.filter(usuario => usuario.id !== usuarioAEliminar));
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
    } finally {
      setConfirmarEliminar(false);
      setUsuarioAEliminar(null);
    }
  }, [usuarioAEliminar]);

  const toggleModalEditar = useCallback((usuario) => {
    setUsuarioEditado({
      ...usuario,
      id_empleado: usuario.id_empleado,
      role_id: usuario.role_id
    });
    setModalEditar(true);
  }, []);

  const guardarCambiosUsuario = useCallback(async (usuarioActualizado) => {
    try {
      const token = AuthService.getCurrentUser();
      const { id, email, type, status, role_id, id_empleado, password, password_confirmation } = usuarioActualizado;
      const data = { email, type, status, role_id, password, password_confirmation };
      if (id_empleado) data.id_empleado = id_empleado;

      const response = await axios.put(`${API_URL}/auth/update/${id}`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        setUsuarios(prevUsuarios =>
          prevUsuarios.map(usuario => usuario.id === id ? usuarioActualizado : usuario)
        );
        setModalEditar(false);
        setUsuarioEditado(null);
      }
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
    }
  }, []);

  const filtrarUsuarios = useCallback(() => {
    return usuarios.filter(usuario => {
      const cumpleBusqueda = !busqueda ||
        usuario.email.toLowerCase().includes(busqueda.toLowerCase()) ||
        usuario.nombre_completo_empleado.toLowerCase().includes(busqueda.toLowerCase());
      const cumpleRol = !rolFiltro || usuario.role_id === parseInt(rolFiltro, 10);
      const cumpleEstado = !estadoFiltro || usuario.status.toString() === estadoFiltro;
      return cumpleBusqueda && cumpleRol && cumpleEstado;
    });
  }, [usuarios, busqueda, rolFiltro, estadoFiltro]);

  const usuariosFiltrados = useMemo(() => filtrarUsuarios(), [filtrarUsuarios]);

  const paginatedUsuarios = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return usuariosFiltrados.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [usuariosFiltrados, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [busqueda, rolFiltro, estadoFiltro]);

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Gestión de Usuarios" breadcrumbItem="Lista de usuarios Empleados" />
        <Row>
          <Col lg={12}>
            <div style={{ marginTop: "10px", display: "flex", alignItems: "center" }}>
              <Label for="busqueda" style={{ marginRight: "10px", marginLeft: "20px" }}>
                Buscar:
              </Label>
              <Input
                type="text"
                id="busqueda"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Escriba email o nombre de empleado"
                style={{ width: "300px" }}
              />
              <Label for="rolFiltro" style={{ marginRight: "10px", marginLeft: "20px" }}>
                Rol:
              </Label>
              <Input
                type="select"
                id="rolFiltro"
                value={rolFiltro}
                onChange={(e) => setRolFiltro(e.target.value)}
                style={{ width: "150px" }}
              >
                <option value="">Todos</option>
                <option value="1">Administrador</option>
                <option value="3">Conductor</option>
                <option value="4">Básico</option>
              </Input>
              <Label for="estadoFiltro" style={{ marginRight: "10px", marginLeft: "20px" }}>
                Estado:
              </Label>
              <Input
                type="select"
                id="estadoFiltro"
                value={estadoFiltro}
                onChange={(e) => setEstadoFiltro(e.target.value)}
                style={{ width: "150px" }}
              >
                <option value="">Todos</option>
                <option value="1">Activo</option>
                <option value="0">Inactivo</option>
              </Input>
              <div style={{ marginLeft: "auto" }}>
                <Link to="/AgregarUsuario" className="btn btn-primary custom-button">
                  <i className="fas fa-plus"></i> Agregar Usuario
                </Link>
              </div>
            </div>
          </Col>
        </Row>
        <br />
        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <TablaUsuarios
                  usuarios={paginatedUsuarios}
                  eliminarUsuario={eliminarUsuario}
                  toggleModalEditar={toggleModalEditar}
                  agregarEmpleado={(usuarioId) => navigate(`/AgregarEmpleado/${usuarioId}`)}
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col lg={12} style={{ marginTop: "20px", display: "flex", justifyContent: "center" }}>
            <Pagination
              activePage={currentPage}
              itemsCountPerPage={ITEMS_PER_PAGE}
              totalItemsCount={usuariosFiltrados.length}
              pageRangeDisplayed={5}
              onChange={setCurrentPage}
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
