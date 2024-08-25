import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, Card, CardBody, Input, Label } from "reactstrap";
import { Link } from "react-router-dom";
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = AuthService.getCurrentUser();

        const [usuariosResponse, empleadosResponse] = await Promise.all([
          axios.get(`${API_URL}/auth/get_users`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }),
          axios.get(`${API_URL}/empleados`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
        ]);

        if (usuariosResponse.data && Array.isArray(usuariosResponse.data.users)) {
          const empleadosMap = new Map();
          empleadosResponse.data.empleados.forEach(empleado => {
            empleadosMap.set(empleado.id, `${empleado.nombres} ${empleado.apellidos}`);
          });

          const usuariosConEmpleados = usuariosResponse.data.users.map(usuario => ({
            ...usuario,
            nombre_completo_empleado: empleadosMap.get(usuario.id_empleado) || 'Desconocido'
          }));

          setUsuarios(usuariosConEmpleados);
          setEmpleados(empleadosResponse.data.empleados); 
        } else {
          console.error("Datos inesperados al obtener usuarios o empleados:", usuariosResponse.data);
        }
      } catch (error) {
        console.error("Error al obtener usuarios o empleados:", error);
      }
    };

    fetchData();
  }, []);

  const eliminarUsuario = (idUsuario) => {
    setConfirmarEliminar(true);
    setUsuarioAEliminar(idUsuario);
  };

  const confirmarEliminarUsuario = async () => {
    try {
      const token = AuthService.getCurrentUser();
      await axios.delete(`${API_URL}/auth/destroy/${usuarioAEliminar}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const nuevosUsuarios = usuarios.filter(usuario => usuario.id !== usuarioAEliminar);
      setUsuarios(nuevosUsuarios);
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
    } finally {
      setConfirmarEliminar(false);
      setUsuarioAEliminar(null);
    }
  };

  const toggleModalEditar = (usuario) => {
    setUsuarioEditado({
      ...usuario,
      id_empleado: usuario.id_empleado, 
      role_id: usuario.role_id 
    });
    setModalEditar(true);
  };

  const guardarCambiosUsuario = async (usuarioActualizado) => {
    try {
      const token = AuthService.getCurrentUser();
      const data = {
        email: usuarioActualizado.email,
        type: usuarioActualizado.type,
        status: usuarioActualizado.status,
        role_id: usuarioActualizado.role_id,
        id_empleado: usuarioActualizado.id_empleado,
        password: usuarioActualizado.password,
        password_confirmation: usuarioActualizado.password_confirmation
      };

      if (data.id_empleado === null) {
        delete data.id_empleado;
      }

      const response = await axios.put(`${API_URL}/auth/update/${usuarioActualizado.id}`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        setUsuarios((prevUsuarios) =>
          prevUsuarios.map((usuario) =>
            usuario.id === usuarioActualizado.id ? usuarioActualizado : usuario
          )
        );
        setModalEditar(false);
        setUsuarioEditado(null);
      } else {
        console.error("Error al actualizar usuario:", response.statusText);
      }
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      if (error.response) {
        console.log("Detalles del error:", error.response.data);
      }
    }
  };

  const filtrarUsuarios = () => {
    let usuariosFiltrados = usuarios;

    if (busqueda) {
      const busquedaLower = busqueda.toLowerCase();
      usuariosFiltrados = usuariosFiltrados.filter((usuario) =>
        usuario.email.toLowerCase().includes(busquedaLower) ||
        usuario.nombre_completo_empleado.toLowerCase().includes(busquedaLower)
      );
    }

    if (rolFiltro) {
      usuariosFiltrados = usuariosFiltrados.filter(usuario => usuario.role_id === parseInt(rolFiltro, 10));
    }

    if (estadoFiltro) {
      usuariosFiltrados = usuariosFiltrados.filter(usuario => usuario.status.toString() === estadoFiltro);
    }

    return usuariosFiltrados;
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [busqueda, rolFiltro, estadoFiltro]);

  const usuariosFiltrados = filtrarUsuarios(usuarios);
  const paginatedUsuarios = usuariosFiltrados.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
        clientes={[]}
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
