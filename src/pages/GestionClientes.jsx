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
import Breadcrumbs from "../components/Clientes/Common/Breadcrumbs";
import TablaClientes from "../components/Clientes/TablaClientes";
import ModalEditarCliente from "../components/Clientes/ModalEditarCliente";
import ModalConfirmarEliminar from "../components/Clientes/ModalConfirmarEliminar";
import ModalDirecciones from "../components/Clientes/ModalDirecciones";
import AuthService from "../services/authService";
import "../styles/Clientes.css";
import { toast } from "react-toastify";
import Pagination from "react-js-pagination";

const API_URL = import.meta.env.VITE_API_URL;

const TIPO_PERSONA = {
  "": "Todos",
  1: "Persona Natural",
  2: "Persona Jurídica",
};

const ITEMS_PER_PAGE = 10;

const GestionClientes = () => {
  document.title = "Clientes | Mr. Paquetes";

  const [clientes, setClientes] = useState([]);
  const [modalEditar, setModalEditar] = useState(false);
  const [clienteEditado, setClienteEditado] = useState(null);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [clienteAEliminar, setClienteAEliminar] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalClientes, setTotalClientes] = useState(0);
  const [modalDirecciones, setModalDirecciones] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [departamentos, setDepartamentos] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [filtrosAvanzados, setFiltrosAvanzados] = useState({
    nombre: "",
    apellido: "",
    nombre_comercial: "",
    dui: "",
    telefono: "",
    id_tipo_persona: "",
    es_contribuyente: "",
    fecha_registro: "",
    id_estado: "",
    id_departamento: "",
    id_municipio: "",
    nit: "",
    nrc: "",
    giro: "",
    nombre_empresa: "",
    direccion: "",
  });

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
          window.location.href = "/login";
          return;
        }
      }
    } catch (error) {
      console.error("Error al verificar estado del usuario:", error);
    }
  }, []);

  const fetchData = useCallback(async (pageNumber = 1, filters = {}) => {
    try {
      const token = AuthService.getCurrentUser();
      const cleanFilters = Object.entries(filters).reduce(
        (acc, [key, value]) => {
          if (value !== "") {
            acc[key] = value;
          }
          return acc;
        },
        {}
      );

      const response = await axios.get(`${API_URL}/clientes`, {
        params: {
          page: pageNumber,
          limit: ITEMS_PER_PAGE,
          ...cleanFilters,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.data) {
        setClientes(response.data.data);
        setTotalClientes(response.data.total);
      } else {
        console.error("Respuesta no válida para clientes:", response.data);
      }
    } catch (error) {
      console.error("Error al obtener datos:", error);
      toast.error("Error al cargar los clientes. Por favor, intente de nuevo.");
    }
  }, []);

  const fetchDepartamentos = useCallback(async () => {
    try {
      const token = AuthService.getCurrentUser();
      const response = await axios.get(
        `${API_URL}/dropdown/get_departamentos`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDepartamentos(response.data);
    } catch (error) {
      console.error("Error al obtener departamentos:", error);
    }
  }, []);

  const fetchMunicipios = useCallback(async (idDepartamento) => {
    if (!idDepartamento) {
      setMunicipios([]);
      return;
    }
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
    }
  }, []);

  useEffect(() => {
    verificarEstadoUsuarioLogueado();
    fetchData(currentPage);
    fetchDepartamentos();
  }, [
    verificarEstadoUsuarioLogueado,
    currentPage,
    fetchData,
    fetchDepartamentos,
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      verificarEstadoUsuarioLogueado();
    }, 300000);

    return () => clearInterval(interval);
  }, [verificarEstadoUsuarioLogueado]);

  useEffect(() => {
    if (filtrosAvanzados.id_departamento) {
      fetchMunicipios(filtrosAvanzados.id_departamento);
    }
  }, [filtrosAvanzados.id_departamento, fetchMunicipios]);

  const eliminarCliente = (idCliente) => {
    setConfirmarEliminar(true);
    setClienteAEliminar(idCliente);
  };

  const confirmarEliminarCliente = async () => {
    try {
      const token = AuthService.getCurrentUser();
      await axios.delete(`${API_URL}/clientes/${clienteAEliminar}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchData(currentPage, filtrosAvanzados);
      toast.success("Cliente eliminado correctamente.");
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      toast.error("Error al eliminar el cliente.");
    } finally {
      setConfirmarEliminar(false);
      setClienteAEliminar(null);
    }
  };

  const toggleModalEditar = (cliente) => {
    setClienteEditado(cliente);
    setModalEditar(!modalEditar);
  };

  const guardarCambiosCliente = async () => {
    try {
      const token = AuthService.getCurrentUser();
      await axios.put(
        `${API_URL}/clientes/${clienteEditado.id}`,
        clienteEditado,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchData(currentPage, filtrosAvanzados);
      setModalEditar(false);
      setClienteEditado(null);
      toast.success("Cliente actualizado correctamente.");
    } catch (error) {
      console.error("Error al actualizar cliente:", error);
      toast.error("Error al actualizar el cliente.");
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    fetchData(pageNumber, filtrosAvanzados);
  };

  const handleFiltroAvanzadoChange = (e) => {
    const { name, value } = e.target;
    setFiltrosAvanzados((prev) => ({ ...prev, [name]: value }));
    if (name === "id_departamento") {
      setFiltrosAvanzados((prev) => ({ ...prev, id_municipio: "" }));
    }
    setCurrentPage(1);
    fetchData(1, { ...filtrosAvanzados, [name]: value });
  };

  const limpiarFiltrosAvanzados = () => {
    setFiltrosAvanzados({
      nombre: "",
      apellido: "",
      nombre_comercial: "",
      dui: "",
      telefono: "",
      id_tipo_persona: "",
      es_contribuyente: "",
      fecha_registro: "",
      id_estado: "",
      id_departamento: "",
      id_municipio: "",
      nit: "",
      nrc: "",
      giro: "",
      nombre_empresa: "",
      direccion: "",
    });
    setCurrentPage(1);
    fetchData(1, {});
  };

  const verDirecciones = (idCliente) => {
    setClienteSeleccionado(idCliente);
    setModalDirecciones(true);
  };

  const verDetallesCliente = (idCliente) => {
    navigate(`/DetallesCliente/${idCliente}`);
  };

  const renderCamposFiltro = () => {
    return (
      <Row>
        <Col md={2}>
          <Label for="id_tipo_persona">Tipo de Persona:</Label>
          <Input
            type="select"
            name="id_tipo_persona"
            id="id_tipo_persona"
            value={filtrosAvanzados.id_tipo_persona}
            onChange={handleFiltroAvanzadoChange}
          >
            {Object.entries(TIPO_PERSONA).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </Input>
        </Col>
        <Col md={2}>
          <Label for="nombre">Nombre:</Label>
          <Input
            type="text"
            name="nombre"
            id="nombre"
            value={filtrosAvanzados.nombre}
            onChange={handleFiltroAvanzadoChange}
            placeholder="Nombre"
          />
        </Col>
        <Col md={2}>
          <Label for="apellido">Apellido:</Label>
          <Input
            type="text"
            name="apellido"
            id="apellido"
            value={filtrosAvanzados.apellido}
            onChange={handleFiltroAvanzadoChange}
            placeholder="Apellido"
          />
        </Col>
        <Col md={2}>
          <Label for="nombre_comercial">Nombre Comercial:</Label>
          <Input
            type="text"
            name="nombre_comercial"
            id="nombre_comercial"
            value={filtrosAvanzados.nombre_comercial}
            onChange={handleFiltroAvanzadoChange}
            placeholder="Nombre comercial"
          />
        </Col>
        <Col md={2}>
          <Label for="telefono">Teléfono:</Label>
          <Input
            type="text"
            name="telefono"
            id="telefono"
            value={filtrosAvanzados.telefono}
            onChange={handleFiltroAvanzadoChange}
            placeholder="Teléfono"
          />
        </Col>
        <Col md={2}>
          <Label for="fecha_registro">Fecha de Registro:</Label>
          <Input
            type="date"
            name="fecha_registro"
            id="fecha_registro"
            value={filtrosAvanzados.fecha_registro}
            onChange={handleFiltroAvanzadoChange}
          />
        </Col>
        <Col md={2}>
          <Label for="es_contribuyente">Es Contribuyente:</Label>
          <Input
            type="select"
            name="es_contribuyente"
            id="es_contribuyente"
            value={filtrosAvanzados.es_contribuyente}
            onChange={handleFiltroAvanzadoChange}
          >
            <option value="">Todos</option>
            <option value="1">Sí</option>
            <option value="0">No</option>
          </Input>
        </Col>
        {filtrosAvanzados.id_tipo_persona === "1" && (
          <Col md={2}>
            <Label for="dui">DUI:</Label>
            <Input
              type="text"
              name="dui"
              id="dui"
              value={filtrosAvanzados.dui}
              onChange={handleFiltroAvanzadoChange}
              placeholder="DUI"
            />
          </Col>
        )}
        {(filtrosAvanzados.id_tipo_persona === "2" ||
          filtrosAvanzados.id_tipo_persona === "") && (
          <>
            <Col md={2}>
              <Label for="nit">NIT:</Label>
              <Input
                type="text"
                name="nit"
                id="nit"
                value={filtrosAvanzados.nit}
                onChange={handleFiltroAvanzadoChange}
                placeholder="NIT"
              />
            </Col>
            <Col md={2}>
              <Label for="nrc">NRC:</Label>
              <Input
                type="text"
                name="nrc"
                id="nrc"
                value={filtrosAvanzados.nrc}
                onChange={handleFiltroAvanzadoChange}
                placeholder="NRC"
              />
            </Col>
            <Col md={2}>
              <Label for="giro">Giro:</Label>
              <Input
                type="text"
                name="giro"
                id="giro"
                value={filtrosAvanzados.giro}
                onChange={handleFiltroAvanzadoChange}
                placeholder="Giro"
              />
            </Col>
          </>
        )}
        <Col md={2}>
          <Label for="id_departamento">Departamento:</Label>
          <Input
            type="select"
            name="id_departamento"
            id="id_departamento"
            value={filtrosAvanzados.id_departamento}
            onChange={handleFiltroAvanzadoChange}
          >
            <option value="">Todos los departamentos</option>
            {departamentos.map((dep) => (
              <option key={dep.id} value={dep.id}>
                {dep.nombre}
              </option>
            ))}
          </Input>
        </Col>
        <Col md={2}>
          <Label for="id_municipio">Municipio:</Label>
          <Input
            type="select"
            name="id_municipio"
            id="id_municipio"
            value={filtrosAvanzados.id_municipio}
            onChange={handleFiltroAvanzadoChange}
            disabled={!filtrosAvanzados.id_departamento}
          >
            <option value="">Todos los municipios</option>
            {municipios.map((mun) => (
              <option key={mun.id} value={mun.id}>
                {mun.nombre}
              </option>
            ))}
          </Input>
        </Col>
      </Row>
    );
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs
          title="Gestión de Clientes"
          breadcrumbItem="Listado de Clientes"
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
              <Button
                color="primary"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <FontAwesomeIcon icon={faFilter} />{" "}
                {isFilterOpen ? "Ocultar Filtros" : "Mostrar Filtros"}
              </Button>
              <Link
                to="/AgregarCliente"
                className="btn btn-primary custom-button"
              >
                <i className="fas fa-plus"></i> Agregar Cliente
              </Link>
            </div>
          </Col>
        </Row>
        <Collapse isOpen={isFilterOpen}>
          <Card>
            <CardBody>
              {renderCamposFiltro()}
              <Row className="mt-3">
                <Col>
                  <Button color="secondary" onClick={limpiarFiltrosAvanzados}>
                    Limpiar Filtros
                  </Button>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Collapse>
        <br />
        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <TablaClientes
                  clientes={clientes}
                  eliminarCliente={eliminarCliente}
                  toggleModalEditar={toggleModalEditar}
                  verDetallesCliente={verDetallesCliente}
                  tipoPersona={TIPO_PERSONA}
                  verDirecciones={verDirecciones}
                />
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
              totalItemsCount={totalClientes}
              pageRangeDisplayed={5}
              onChange={handlePageChange}
              itemClass="page-item"
              linkClass="page-link"
              innerClass="pagination"
            />
          </Col>
        </Row>
      </Container>
      <ModalEditarCliente
        modalEditar={modalEditar}
        clienteEditado={clienteEditado}
        setClienteEditado={setClienteEditado}
        guardarCambiosCliente={guardarCambiosCliente}
        setModalEditar={setModalEditar}
      />
      <ModalConfirmarEliminar
        confirmarEliminar={confirmarEliminar}
        confirmarEliminarCliente={confirmarEliminarCliente}
        setConfirmarEliminar={setConfirmarEliminar}
      />
      <ModalDirecciones
        isOpen={modalDirecciones}
        toggle={() => setModalDirecciones(!modalDirecciones)}
        clienteId={clienteSeleccionado}
      />
    </div>
  );
};

export default GestionClientes;
