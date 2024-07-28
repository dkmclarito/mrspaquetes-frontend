import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, Card, CardBody, Input, Label, Button } from "reactstrap";
import { Link } from "react-router-dom";
import Breadcrumbs from "../components/Empleados/Common/Breadcrumbs";
import TablaEmpleados from "../components/Empleados/TablaEmpleados";
import ModalEditarEmpleado from "../components/Empleados/ModalEditarEmpleado";
import ModalConfirmarEliminar from "../components/Empleados/ModalConfirmarEliminar";
import AuthService from "../services/authService";
import "../styles/Empleados.css";
import Pagination from 'react-js-pagination';

const API_URL = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 8;

const GestionEmpleados = () => {
  document.title = "Empleados | Mr. Paquetes";

  const [empleados, setEmpleados] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [modalEditar, setModalEditar] = useState(false);
  const [empleadoEditado, setEmpleadoEditado] = useState(null);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [empleadoAEliminar, setEmpleadoAEliminar] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = async () => {
    try {
      const token = AuthService.getCurrentUser();
      const empleadosResponse = await axios.get(`${API_URL}/empleados`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (empleadosResponse.data && Array.isArray(empleadosResponse.data.empleados)) {
        setEmpleados(empleadosResponse.data.empleados);
      } else {
        console.error("Respuesta no válida para empleados:", empleadosResponse.data);
      }

      const cargosResponse = await axios.get(`${API_URL}/dropdown/get_cargos`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (cargosResponse.data && Array.isArray(cargosResponse.data.cargos)) {
        setCargos(cargosResponse.data.cargos);
      } else {
        console.error("Respuesta no válida para cargos:", cargosResponse.data);
      }
    } catch (error) {
      console.error("Error al obtener datos:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const guardarCambiosEmpleado = async () => {
    try {
      // Quitar el guion del teléfono antes de enviar
      const empleadoParaGuardar = {
        ...empleadoEditado,
        telefono: empleadoEditado.telefono.replace("-", "")
      };

      const token = localStorage.getItem('token');
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
      console.log('Empleado actualizado:', response.data);
      fetchData(); // Actualiza los datos después de guardar los cambios
      setModalEditar(false); // Cierra el modal
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
        headers: {
          Authorization: `Bearer ${token}`
        }
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
      obtenerNombreCargo(empleado.id_cargo).toLowerCase().includes(busquedaLower)
    );
  };

  const obtenerNombreCargo = (id) => {
    const cargo = cargos.find(cargo => cargo.id === id);
    return cargo ? cargo.nombre : '';
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const empleadosFiltrados = filtrarEmpleados(empleados);
  const paginatedEmpleados = empleadosFiltrados.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Gestión de Empleados " breadcrumbItem="Listado de Empleados" />
        <Row>
          <Col lg={12}>
            <div style={{ marginTop: "10px", display: 'flex', alignItems: 'center' }}>
              <Label for="busqueda" style={{ marginRight: "10px" }}>Buscar:</Label>
              <Input
                type="text"
                id="busqueda"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre, apellido o cargo"
                style={{ width: "300px" }}
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
                  empleados={paginatedEmpleados}
                  cargos={cargos}
                  eliminarEmpleado={eliminarEmpleado}
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
