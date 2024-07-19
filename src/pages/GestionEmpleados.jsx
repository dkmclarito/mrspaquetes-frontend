import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, CardBody, Input, Label } from "reactstrap";
import { Link } from "react-router-dom";
import Breadcrumbs from "../components/Empleados/Common/Breadcrumbs";
import TablaEmpleados from "../components/Empleados/TablaEmpleados";
import ModalEditarEmpleado from "../components/Empleados/ModalEditarEmpleado";
import ModalConfirmarEliminar from "../components/Empleados/ModalConfirmarEliminar";
import AuthService from "../services/authService";
import "../styles/Empleados.css";

const GestionEmpleados = () => {
  document.title = "Empleados | Mr. Paquetes";

  const [empleados, setEmpleados] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [modalEditar, setModalEditar] = useState(false);
  const [empleadoEditado, setEmpleadoEditado] = useState(null);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [empleadoAEliminar, setEmpleadoAEliminar] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = AuthService.getCurrentUser();

        // Fetch empleados
        const empleadosResponse = await fetch("http://127.0.0.1:8000/api/empleados", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const empleadosData = await empleadosResponse.json();
        if (empleadosData.hasOwnProperty('empleados') && Array.isArray(empleadosData.empleados)) {
          setEmpleados(empleadosData.empleados);
        } else {
          console.error("Respuesta no válida para empleados:", empleadosData);
        }

        // Fetch cargos
        const cargosResponse = await fetch("http://127.0.0.1:8000/api/dropdown/get_cargos", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const cargosData = await cargosResponse.json();
        if (cargosData.hasOwnProperty('cargos') && Array.isArray(cargosData.cargos)) {
          setCargos(cargosData.cargos);
        } else {
          console.error("Respuesta no válida para cargos:", cargosData);
        }
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };

    fetchData();
  }, []);

  const eliminarEmpleado = async (idEmpleado) => {
    try {
      setConfirmarEliminar(true);
      setEmpleadoAEliminar(idEmpleado);
    } catch (error) {
      console.error("Error al eliminar empleado:", error);
    }
  };

  const confirmarEliminarEmpleado = async () => {
    try {
      const token = AuthService.getCurrentUser();
      const response = await fetch(`http://127.0.0.1:8000/api/empleados/${empleadoAEliminar}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.ok) {
        const nuevosEmpleados = empleados.filter(empleado => empleado.id !== empleadoAEliminar);
        setEmpleados(nuevosEmpleados);
      } else {
        console.error("Error al eliminar empleado:", response.statusText);
      }
    } catch (error) {
      console.error("Error al eliminar empleado:", error);
    } finally {
      setConfirmarEliminar(false);
      setEmpleadoAEliminar(null);
    }
  };

  const toggleModalEditar = (empleado) => {
    setEmpleadoEditado(empleado);
    setModalEditar(!modalEditar);
  };

  const guardarCambiosEmpleado = async () => {
    try {
      const token = AuthService.getCurrentUser();
      const response = await fetch(`http://127.0.0.1:8000/api/empleados/${empleadoEditado.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(empleadoEditado)
      });
      if (response.ok) {
        const nuevosEmpleados = empleados.map(empleado => {
          if (empleado.id === empleadoEditado.id) {
            return empleadoEditado;
          }
          return empleado;
        });
        setEmpleados(nuevosEmpleados);
        setModalEditar(false);
        setEmpleadoEditado(null);
      } else {
        console.error("Error al actualizar empleado:", response.statusText);
      }
    } catch (error) {
      console.error("Error al actualizar empleado:", error);
    }
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
    return cargo ? cargo.nombre : 'Desconocido';
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Empleados" breadcrumbItem="Listado" />
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
                style={{ width: "300px" }} // Ajusta el ancho del input aquí
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
                  empleados={filtrarEmpleados(empleados)}
                  cargos={cargos}
                  eliminarEmpleado={eliminarEmpleado}
                  toggleModalEditar={toggleModalEditar}
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
      <ModalEditarEmpleado
        modalEditar={modalEditar}
        empleadoEditado={empleadoEditado}
        setEmpleadoEditado={setEmpleadoEditado}
        guardarCambiosEmpleado={guardarCambiosEmpleado}
        setModalEditar={setModalEditar}
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
