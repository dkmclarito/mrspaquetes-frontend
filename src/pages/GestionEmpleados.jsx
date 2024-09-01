import React, { useState, useEffect, useCallback} from "react";
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

const API_URL = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 10;

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
    
  }
}, []);

  const navigate = useNavigate();
  const verDetallesEmpleado = (idEmpleado) => {
    navigate(`/DetallesEmpleado/${idEmpleado}`);
  };

  // Fetch initial data
  const fetchData = async () => {
    try {
      const token = AuthService.getCurrentUser();
      const empleadosResponse = await axios.get(`${API_URL}/empleados`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmpleados(empleadosResponse.data.empleados || []);

      const cargosResponse = await axios.get(`${API_URL}/dropdown/get_cargos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCargos(cargosResponse.data.cargos || []);

      const estadosResponse = await axios.get(`${API_URL}/dropdown/get_estado_empleados`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEstados(estadosResponse.data.estado_empleados || []);

      const departamentosResponse = await axios.get(`${API_URL}/dropdown/get_departamentos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDepartamentos(departamentosResponse.data || []);
    } catch (error) {
      console.error("Error al obtener datos:", error);
    }
  };

  const fetchMunicipios = async (idDepartamento) => {
    try {
      const token = AuthService.getCurrentUser();
      const response = await axios.get(`${API_URL}/dropdown/get_municipio/${idDepartamento}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMunicipios(response.data.municipio || []);
    } catch (error) {
      console.error("Error al obtener municipios:", error);
    }
  };

  useEffect(() => {
    fetchData();
    verificarEstadoUsuarioLogueado();
  }, [fetchData, verificarEstadoUsuarioLogueado]);

  useEffect(() => {

 

    if (departamentoSeleccionado) {
      fetchMunicipios(departamentoSeleccionado);
    } else {
      setMunicipios([]);
    }

    const interval = setInterval(() => {
      verificarEstadoUsuarioLogueado(); // Verifica el estado del usuario cada cierto tiempo
    }, 30000); // Verifica cada 30 segundos, ajusta según sea necesario

    return () => clearInterval(interval); // Limpia el intervalo al desmontar el componente

  }, [departamentoSeleccionado, verificarEstadoUsuarioLogueado]);

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
      fetchData();
      setModalEditar(false);
    } catch (error) {
      console.error('Error al actualizar empleado:', error);
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

      const nuevosEmpleados = empleados.filter(empleado => empleado.id !== empleadoAEliminar);
      setEmpleados(nuevosEmpleados);
    } catch (error) {
      console.error("Error al eliminar empleado:", error);
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
      obtenerNombreCargo(empleado.id_cargo).toLowerCase().includes(busquedaLower) ||
      obtenerNombreEstado(empleado.id_estado).toLowerCase().includes(busquedaLower)
    );
  };

  const obtenerNombreCargo = (id) => {
    const cargo = cargos.find(cargo => cargo.id === id);
    return cargo ? cargo.nombre : '';
  };

  const obtenerNombreEstado = (id) => {
    const estado = estados.find(estado => estado.id === id);
    return estado ? estado.estado : '';
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearchChange = (e) => {
    setBusqueda(e.target.value);
    setCurrentPage(1); // Resetear la página actual a 1 al cambiar la búsqueda
  };

  const empleadosFiltrados = filtrarEmpleados(empleados);
  const paginatedEmpleados = empleadosFiltrados.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
     
            </div>
          </Col>
        </Row>
        <br />
        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <TablaEmpleados
                  empleados={paginatedEmpleados}
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
              activePage={currentPage}
              itemsCountPerPage={ITEMS_PER_PAGE}
              totalItemsCount={empleadosFiltrados.length}
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
    </div>
  );
};

export default GestionEmpleados;