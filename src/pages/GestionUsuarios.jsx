import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, Card, CardBody, Input, Label, Button } from "reactstrap";
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
  const [modalEditar, setModalEditar] = useState(false);
  const [usuarioEditado, setUsuarioEditado] = useState(null);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState(""); // "" para todos, 0 para empleados, 1 para clientes
  const [currentPage, setCurrentPage] = useState(1);
  const [clientes, setClientes] = useState([]);
  const [empleados, setEmpleados] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = AuthService.getCurrentUser();
        const response = await axios.get(`${API_URL}/auth/get_users`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data && Array.isArray(response.data.users)) {
          setUsuarios(response.data.users);
        } else {
          console.error("Datos inesperados al obtener usuarios:", response.data);
        }
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
      }
    };

    const fetchClientes = async () => {
      try {
        const response = await axios.get(`${API_URL}/clientes`, {
          headers: {
            Authorization: `Bearer ${AuthService.getCurrentUser()}`
          }
        });
        if (response.data && response.data.data) {
          setClientes(response.data.data); // Suponiendo que los datos están en response.data.data
        } else {
          console.error("Datos inesperados al obtener clientes:", response.data);
        }
      } catch (error) {
        console.error("Error al obtener clientes:", error);
      }
    };

    const fetchEmpleados = async () => {
      try {
        const response = await axios.get(`${API_URL}/empleados`, {
          headers: {
            Authorization: `Bearer ${AuthService.getCurrentUser()}`
          }
        });
        if (response.data && Array.isArray(response.data.empleados)) {
          setEmpleados(response.data.empleados); // Ajusta según el formato de respuesta
        } else {
          console.error("Datos inesperados al obtener empleados:", response.data);
        }
      } catch (error) {
        console.error("Error al obtener empleados:", error);
      }
    };

    fetchData();
    fetchClientes();
    fetchEmpleados();
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
    setUsuarioEditado(usuario);
    setModalEditar(!modalEditar);
  };

  const guardarCambiosUsuario = async (usuarioActualizado) => {
    try {
      const token = AuthService.getCurrentUser();
      const data = {
        name: usuarioActualizado.name,
        email: usuarioActualizado.email,
        type: usuarioActualizado.type,
        status: usuarioActualizado.status,
        role_id: usuarioActualizado.role_id,
        id_empleado: usuarioActualizado.type === "0" ? usuarioActualizado.id_empleado : null,
        id_cliente: usuarioActualizado.type === "1" ? usuarioActualizado.id_cliente : null,
        password: usuarioActualizado.password,
        password_confirmation: usuarioActualizado.password_confirmation
      };
  
      // Opcionalmente, elimina las propiedades `id_empleado` o `id_cliente` si son nulas
      if (data.id_empleado === null) {
        delete data.id_empleado;
      }
      if (data.id_cliente === null) {
        delete data.id_cliente;
      }
  
      const response = await axios.put(`${API_URL}/auth/update/${usuarioActualizado.id}`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
  
      if (response.status === 200) {
        setUsuarios((prevUsuarios) => prevUsuarios.map(usuario =>
          usuario.id === usuarioActualizado.id ? usuarioActualizado : usuario
        ));
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

  const filtrarUsuarios = (usuarios) => {
    let usuariosFiltrados = usuarios;

    if (tipoUsuario) {
      usuariosFiltrados = usuariosFiltrados.filter(usuario => usuario.type === parseInt(tipoUsuario));
    }

    if (busqueda) {
      const busquedaLower = busqueda.toLowerCase();
      usuariosFiltrados = usuariosFiltrados.filter(usuario =>
        `${usuario.name}`.toLowerCase().includes(busquedaLower)
      );
    }

    return usuariosFiltrados;
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [tipoUsuario, busqueda]);

  const usuariosFiltrados = filtrarUsuarios(usuarios);
  const paginatedUsuarios = usuariosFiltrados.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(usuariosFiltrados.length / ITEMS_PER_PAGE);

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Gestión de Usuarios" breadcrumbItem="Lista de usuarios" />
        <Row>
          <Col lg={12}>
            <div style={{ marginTop: "10px", display: 'flex', alignItems: 'center' }}>
              <Label for="tipoUsuario" style={{ marginRight: "10px" }}>Tipo de Usuario:</Label>
              <Input
                type="select"
                id="tipoUsuario"
                value={tipoUsuario}
                onChange={(e) => setTipoUsuario(e.target.value)}
                style={{ width: "200px" }}
              >
                <option value="">Todos</option>
                <option value="0">Empleados</option>
                <option value="1">Clientes</option>
              </Input>
              <Label for="busqueda" style={{ marginRight: "10px", marginLeft: "20px" }}>Buscar:</Label>
              <Input
                type="text"
                id="busqueda"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre"
                style={{ width: "300px" }}
              />
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
          <Col lg={12} style={{ marginTop: "20px", display: 'flex', justifyContent: 'center' }}>
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
        clientes={clientes}
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
