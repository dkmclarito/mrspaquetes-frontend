import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Container, Row, Col, Card, CardBody, Input, Label, Button } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import Breadcrumbs from "../components/Empleados/Common/Breadcrumbs";
import TablaEmpleados from "../components/Empleados/TablaEmpleados";
import ModalEditarEmpleado from "../components/Empleados/ModalEditarEmpleado";
import ModalConfirmarEliminar from "../components/Empleados/ModalConfirmarEliminar";
import AuthService from "../services/authService";
import "../styles/Empleados.css";
import Pagination from 'react-js-pagination';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = import.meta.env.VITE_API_URL;

const GestionEmpleados = () => {
  document.title = "Empleados | Mr. Paquetes";

  const [empleados, setEmpleados] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [modalEditar, setModalEditar] = useState(false);
  const [empleadoEditado, setEmpleadoEditado] = useState(null);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [empleadoAEliminar, setEmpleadoAEliminar] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState('');
  const [paginationInfo, setPaginationInfo] = useState({
    total: 0,
    per_page: 10,
    current_page: 1,
    last_page: 1
  });

  const navigate = useNavigate();

  const verificarEstadoUsuarioLogueado = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userId");
      const token = AuthService.getCurrentUser();

      if (userId && token) {
        const response = await axios.get(`${API_URL}/auth/show/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.status === "Token is Invalid") {
          console.error("Token is invalid. Logging out...");
          AuthService.logout();
          navigate("/login");
          return;
        }
      }
    } catch (error) {
      console.error("Error al verificar estado del usuario:", error.response?.data || error.message);
      if (error.response?.status === 500) {
        console.error("Error 500: Problema en el servidor. Reintentando en 1 minuto...");
        // Implement exponential backoff here if needed
      }
    }
  }, [navigate]);

  const fetchData = useCallback(async (page = 1) => {
    try {
      const token = AuthService.getCurrentUser();
      const [empleadosResponse, cargosResponse, estadosResponse, departamentosResponse] = await Promise.all([
        axios.get(`${API_URL}/empleados?page=${page}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/dropdown/get_cargos`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/dropdown/get_estado_empleados`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/dropdown/get_departamentos`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setEmpleados(empleadosResponse.data.empleados || []);
      setPaginationInfo(empleadosResponse.data.pagination);
      setCargos(cargosResponse.data.cargos || []);
      setEstados(estadosResponse.data.estado_empleados || []);
      setDepartamentos(departamentosResponse.data || []);
    } catch (error) {
      console.error("Error al obtener datos:", error.response?.data || error.message);
      toast.error("Error al cargar los datos. Por favor, intente de nuevo.");
    }
  }, []);

  const fetchMunicipios = useCallback(async (idDepartamento) => {
    try {
      const token = AuthService.getCurrentUser();
      const response = await axios.get(`${API_URL}/dropdown/get_municipio/${idDepartamento}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMunicipios(response.data.municipio || []);
    } catch (error) {
      console.error("Error al obtener municipios:", error.response?.data || error.message);
      toast.error("Error al cargar los municipios. Por favor, intente de nuevo.");
    }
  }, []);

  useEffect(() => {
    fetchData(currentPage);
    verificarEstadoUsuarioLogueado();

    const interval = setInterval(verificarEstadoUsuarioLogueado, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [fetchData, verificarEstadoUsuarioLogueado, currentPage]);

  useEffect(() => {
    if (departamentoSeleccionado) {
      fetchMunicipios(departamentoSeleccionado);
    } else {
      setMunicipios([]);
    }
  }, [departamentoSeleccionado, fetchMunicipios]);

  const verDetallesEmpleado = (idEmpleado) => {
    navigate(`/DetallesEmpleado/${idEmpleado}`);
  };

  const guardarCambiosEmpleado = async () => {
    try {
      const empleadoParaGuardar = {
        ...empleadoEditado,
        telefono: empleadoEditado.telefono.replace("-", "")
      };

      const token = AuthService.getCurrentUser();
      const response = await axios.put(
        `${API_URL}/empleados/${empleadoParaGuardar.id}`,
        empleadoParaGuardar,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      await fetchData(currentPage);
      setModalEditar(false);
      toast.success("Empleado actualizado con éxito");
    } catch (error) {
      console.error('Error al actualizar empleado:', error);
      toast.error("Error al actualizar el empleado. Por favor, intente de nuevo.");
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
        headers: { Authorization: `Bearer ${token}` }
      });

      await fetchData(currentPage);
      toast.success("Empleado eliminado con éxito");
    } catch (error) {
      console.error("Error al eliminar empleado:", error);
      toast.error("No se puede eliminar un empleado, que tiene un usuario asignado.");
    } finally {
      setConfirmarEliminar(false);
    }
  };

  const toggleModalEditar = (empleado) => {
    setEmpleadoEditado(empleado);
    setModalEditar(!modalEditar);
  };

  const filtrarEmpleados = (empleados) => {
    if (!busqueda) return empleados;

    const busquedaLower = busqueda.toLowerCase();
    return empleados.filter(empleado =>
      `${empleado.nombres} ${empleado.apellidos}`.toLowerCase().includes(busquedaLower) ||
      empleado.cargo.toLowerCase().includes(busquedaLower)
    );
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    fetchData(pageNumber);
  };

  const handleSearchChange = (e) => {
    setBusqueda(e.target.value);
    setCurrentPage(1);
    fetchData(1);
  };

  const empleadosFiltrados = filtrarEmpleados(empleados);

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Gestión de Empleados" breadcrumbItem="Listado de Empleados" />
        <Row>
          <Col lg={12}>
            <div style={{ marginTop: "10px", display: 'flex', alignItems: 'center' }}>
              <Label for="busqueda" style={{ marginRight: "10px" }}>Buscar:</Label>
              <Input
                type="text"
                id="busqueda"
                value={busqueda}
                onChange={handleSearchChange}
                placeholder="Buscar por nombre, apellido o cargo"
                style={{ width: "400px" }}
              />
              <div style={{ marginLeft: "auto" }}>
                <Link to="/AgregarEmpleado" className="btn btn-primary custom-button">
                  <i className="fas fa-plus"></i> Agregar Empleado
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
                <TablaEmpleados
                  empleados={empleadosFiltrados}
                  cargos={cargos}
                  estados={estados}
                  eliminarEmpleado={eliminarEmpleado}
                  toggleModalEditar={toggleModalEditar}
                  verDetallesEmpleado={verDetallesEmpleado}
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col lg={12} style={{ marginTop: "20px", display: 'flex', justifyContent: 'center' }}>
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