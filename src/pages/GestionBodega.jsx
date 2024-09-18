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
} from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import Breadcrumbs from "../components/Bodegas/Common/Breadcrumbs";
import AuthService from "../services/authService";
import Pagination from "react-js-pagination";
import "../styles/Vehiculos.css";
import TablaBodegas from "../components/Bodegas/TablaBodegas";
import ModalEditarBodega from "../components/Bodegas/ModalEditarBodega";
import ModalConfirmarEliminarBodega from "../components/Bodegas/ModalConfirmarEliminarBodega";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 10;

const GestionBodega = () => {
  document.title = "Bodegas | Vehículos";
  const navigate = useNavigate();
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
  const [filtroTipo, setFiltroTipo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [departamentos, setDepartamentos] = useState([]);
  const [municipiosPorDepartamento, setMunicipiosPorDepartamento] = useState(
    {}
  );

  const verificarEstadoUsuarioLogueado = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userId");
      const token = AuthService.getCurrentUser();

      if (userId && token) {
        const response = await fetch(`${API_URL}/auth/show/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const responseData = await response.json();

        // Verifica si el token es inválido
        if (responseData.status === "Token is Invalid") {
          console.error("Token is invalid. Logging out...");
          AuthService.logout();
          window.location.href = "/login"; // Redirige a login si el token es inválido
          return;
        }
      }
    } catch (error) {
      console.error("Error al verificar el estado del usuario:", error);
     // AuthService.logout();
     // window.location.href = "/login";
    }
  }, [API_URL]);

  useEffect(() => {
    verificarEstadoUsuarioLogueado(); // Verifica el estado del usuario al cargar la página
  }, [verificarEstadoUsuarioLogueado]);

  useEffect(() => {
    const interval = setInterval(() => {
      verificarEstadoUsuarioLogueado(); // Verifica el estado del usuario cada cierto tiempo
    }, 30000); // Verifica cada 30 segundos, ajusta según sea necesario

    return () => clearInterval(interval); // Limpia el intervalo al desmontar el componente
  }, [verificarEstadoUsuarioLogueado]);

  const verDetallesBodega = (idBodega) => {
    navigate(`/DetallesBodega/${idBodega}`);
  };

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
  
      const bodegasRestantes = bodegas.filter((bodega) => bodega.id !== bodegaAEliminar);
  
      // Verificar si la página actual tiene elementos suficientes después de eliminar
      const totalItemsCount = bodegasRestantes.length;
      const maxPages = Math.ceil(totalItemsCount / ITEMS_PER_PAGE);
  
      // Si la página actual es mayor que el número máximo de páginas, ajusta la página
      if (currentPage > maxPages) {
        setCurrentPage(maxPages);
      }
  
      setBodegas(bodegasRestantes);
      setConfirmarEliminar(false);
      toast.success('Bodega eliminada con éxito');
      setBodegaAEliminar(null);
    } catch (error) {
      console.error("Error al eliminar bodega:", error);
      setConfirmarEliminar(false);
      toast.error('Error al eliminar la bodega');
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
      toast.success('Bodega actualizada con éxito')
    } catch (error) {
      console.error("Error al actualizar bodega:", error);
      toast.error('Error al actualizar la bodega')
    }
  };

  const filtrarBodegas = (bodegas) => {
    if (!Array.isArray(bodegas)) return [];
  
    return bodegas.filter((bodega) => {
      const coincideNombre = bodega.nombre.toLowerCase().includes(busqueda.toLowerCase());
      const coincideTipo = filtroTipo === "" || bodega.tipo_bodega.toLowerCase() === filtroTipo.toLowerCase();
      return coincideNombre && coincideTipo;
    });
  };

  
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearchChange = (e) => {
    setBusqueda(e.target.value);
    setCurrentPage(1);
  };

  const bodegasFiltradas = filtrarBodegas(bodegas)

  const bodegasConIdsNumericos = bodegasFiltradas.map(bodega => ({
    ...bodega,
    id_departamento: Number(bodega.id_departamento),
    id_municipio: Number(bodega.id_municipio),
  }))
  
  const paginatedBodegas = bodegasConIdsNumericos.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

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
                onChange={handleSearchChange}
                placeholder="Buscar por nombre de bodega"
                style={{ width: "300px" }}
              />
              <Label for="filtroTipo" style={{ marginLeft: "10px", marginRight: "10px" }}>
                Tipo:
              </Label>
              <Input
                type="select"
                id="filtroTipo"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                style={{ width: "200px" }}
              >
                <option value="">Todos</option>
                <option value="fisica">Física</option>
                <option value="movil">Móvil</option>
              </Input>
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
                  verDetallesBodega={verDetallesBodega} 
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
        municipiosPorDepartamento={municipiosPorDepartamento}
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
