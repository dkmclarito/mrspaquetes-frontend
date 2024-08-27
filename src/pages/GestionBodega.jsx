import React, { useState, useEffect } from "react";
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
} from "reactstrap";
import { Link } from "react-router-dom";
import Breadcrumbs from "../components/Bodegas/Common/Breadcrumbs";
import AuthService from "../services/authService";
import Pagination from "react-js-pagination";
import "../styles/Vehiculos.css";
import TablaBodegas from "../components/Bodegas/TablaBodegas";
import ModalEditarBodega from "../components/Bodegas/ModalEditarBodega";
import ModalConfirmarEliminarBodega from "../components/Bodegas/ModalConfirmarEliminarBodega";

const API_URL = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 5;

const GestionBodega = () => {
  document.title = "Bodegas | Vehículos";

  const [bodegas, setBodegas] = useState([]);
  const [modalEditar, setModalEditar] = useState(false);
  const [bodegaEditado, setBodegaEditado] = useState({
    id: null,
    nombre: "",
    id_departamento: "",
    id_municipio: "",
    direccion: "",
  });
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [bodegaAEliminar, setBodegaAEliminar] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [departamentos, setDepartamentos] = useState([]);
  const [municipiosPorDepartamento, setMunicipiosPorDepartamento] = useState(
    {}
  );
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = AuthService.getCurrentUser();

        const [responseBodegas, responseDepartamentos] = await Promise.all([
          axios.get(`${API_URL}/bodegas`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          axios.get(`${API_URL}/dropdown/get_departamentos`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        setBodegas(responseBodegas.data.bodegas || []);
        setDepartamentos(responseDepartamentos.data || []);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchMunicipiosPorDepartamento = async (departamentos) => {
      try {
        const token = AuthService.getCurrentUser();
    
        const municipiosPorDepartamentoPromises = departamentos.map(
          (departamento) =>
            axios.get(`${API_URL}/dropdown/get_municipio/${departamento.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
        );
    
        const municipiosResponses = await Promise.all(municipiosPorDepartamentoPromises);
    
        const municipiosPorDepartamentoCargados = {};
        municipiosResponses.forEach((response, index) => {
          municipiosPorDepartamentoCargados[departamentos[index].id] = response.data.municipio || [];
        });
    
        setMunicipiosPorDepartamento(municipiosPorDepartamentoCargados);
      } catch (error) {
        console.error("Error al obtener municipios:", error.response ? error.response.data : error.message);
      }
    };
    

    if (departamentos.length > 0) {
      fetchMunicipiosPorDepartamento(departamentos);
    }
  }, [departamentos]);

  const confirmarEliminarBodega = async () => {
    try {
      const token = AuthService.getCurrentUser();
      await axios.delete(`${API_URL}/bodegas/${bodegaAEliminar}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setBodegas(bodegas.filter((bodega) => bodega.id !== bodegaAEliminar));
      setConfirmarEliminar(false);
      setBodegaAEliminar(null);
    } catch (error) {
      console.error("Error al eliminar bodega:", error);
      setConfirmarEliminar(false);
    }
  };

  const toggleModalEditar = (bodega) => {
    setBodegaEditado(
      bodega || {
        id: null,
        nombre: "",
        id_departamento: "",
        id_municipio: "",
        direccion: "",
      }
    );
    setModalEditar(!modalEditar);
  };

  const eliminarBodega = (id) => {
    setBodegaAEliminar(id);
    setConfirmarEliminar(true);
  };

  const guardarCambiosBodega = async () => {
    try {
      const token = AuthService.getCurrentUser();
      await axios.put(`${API_URL}/bodegas/${bodegaEditado.id}`, bodegaEditado, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      setBodegas(
        bodegas.map((bodega) =>
          bodega.id === bodegaEditado.id ? bodegaEditado : bodega
        )
      );
      setModalEditar(false);
      setBodegaEditado({
        id: null,
        nombre: "",
        id_departamento: "",
        id_municipio: "",
        direccion: "",
      });
    } catch (error) {
      console.error("Error al actualizar bodega:", error);
    }
  };

  const filtrarBodegas = (bodegas) => {
    if (!Array.isArray(bodegas)) return [];
    if (!busqueda) return bodegas;
    return bodegas.filter((bodega) =>
      bodega.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const bodegasFiltradas = filtrarBodegas(bodegas);
  // Filtrar bodegas según el filtro actual
  const bodegasFiltrados = bodegas.filter((bodega) =>
    bodega.nombre.toLowerCase().includes(filtro.toLowerCase())
  );

  if (!Array.isArray(bodegasFiltrados)) {
    console.error("bodegasFiltrados no es un arreglo:", bodegasFiltrados);
    return null; // O maneja el error de alguna manera
  }
  const bodegasConIdsNumericos = bodegas.map(bodega => ({
    ...bodega,
    id_departamento: Number(bodega.id_departamento),
    id_municipio: Number(bodega.id_municipio),
  }));
  
  const paginatedBodegas = bodegasConIdsNumericos.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs
          title="Gestión de Bodega"
          breadcrumbItem="Listado de Bodegas"
        />
        <Row>
          <Col lg={12}>
            <div
              style={{
                marginTop: "10px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Label for="busqueda" style={{ marginRight: "10px" }}>
                Buscar:
              </Label>
              <Input
                type="text"
                id="busqueda"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre de bodega"
                style={{ width: "300px" }}
              />
              <div style={{ marginLeft: "auto" }}>
                <Link
                  to="/AgregarBodega"
                  className="btn btn-primary custom-button"
                >
                  <i className="fas fa-plus"></i> Agregar Bodega
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
                <TablaBodegas
                  bodegas={paginatedBodegas}
                  departamentos={departamentos}
                  municipios={Object.values(municipiosPorDepartamento).flat()}
                  eliminarBodega={eliminarBodega}
                  toggleModalEditar={toggleModalEditar}
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
              totalItemsCount={bodegasFiltradas.length}
              pageRangeDisplayed={5}
              onChange={handlePageChange}
              itemClass="page-item"
              linkClass="page-link"
              innerClass="pagination"
            />
          </Col>
        </Row>
      </Container>
      <ModalEditarBodega
        modalEditar={modalEditar}
        bodegaEditado={bodegaEditado}
        setBodegaEditado={setBodegaEditado}
        guardarCambiosBodega={guardarCambiosBodega}
        setModalEditar={setModalEditar}
        departamentos={departamentos}
        municipiosPorDepartamento={municipiosPorDepartamento} // Asegúrate de pasar esto
      />

      <ModalConfirmarEliminarBodega
        confirmarEliminar={confirmarEliminar}
        confirmarEliminarBodega={confirmarEliminarBodega}
        setConfirmarEliminar={setConfirmarEliminar}
      />
    </div>
  );
};

export default GestionBodega;
