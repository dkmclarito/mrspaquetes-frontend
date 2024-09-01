import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, CardBody, Input, Label } from 'reactstrap';
import { useNavigate, Link } from 'react-router-dom';
import Breadcrumbs from '../components/Empleados/Common/Breadcrumbs';
import Pagination from 'react-js-pagination';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/Paquetes.css';
import ModalEditarPaquete from '../components/Paquetes/ModalEditarPaquete';
import ModalConfirmarEliminarPaquete from '../components/Paquetes/ModalConfirmarEliminarPaquete';
import TablaPaquetes from '../components/Paquetes/TablaPaquetes';
import AuthService from "../services/authService";

const API_URL = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 7;

const GestionPaquetes = () => {
  document.title = 'Paquetes | Mr. Paquetes';

  const [paquetes, setPaquetes] = useState([]);
  const [paquetesFiltrados, setPaquetesFiltrados] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalEditar, setModalEditar] = useState(false);
  const [paqueteAEditar, setPaqueteAEditar] = useState(null);
  const [tiposPaquete, setTiposPaquete] = useState([]);
  const [empaques, setEmpaques] = useState([]);
  const [estadosPaquete, setEstadosPaquete] = useState([]);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [paqueteAEliminar, setPaqueteAEliminar] = useState(null);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('');

  const navigate = useNavigate();

  // Nueva función para verificar el estado del usuario logueado
  const verificarEstadoUsuarioLogueado = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userId");
      const token = AuthService.getCurrentUser();

      if (userId && token) {
        const response = await axios.get(`${API_URL}/auth/show/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Verifica si el token es inválido
        if (response.data.status === "Token is Invalid") {
          console.error("Token is invalid. Logging out...");
          AuthService.logout();
          window.location.href = "/login"; // Redirige a login si el token es inválido
          return;
        }
      }
    } catch (error) {
      console.error("Error al verificar el estado del usuario:", error);
      //AuthService.logout();
      //window.location.href = "/login";
    }
  }, []);

  useEffect(() => {
    verificarEstadoUsuarioLogueado(); // Verifica el estado del usuario al cargar la página
  }, [verificarEstadoUsuarioLogueado]);

  useEffect(() => {
    const interval = setInterval(() => {
      verificarEstadoUsuarioLogueado(); // Verifica el estado del usuario cada cierto tiempo
    }, 30000); // Verifica cada 30 segundos, ajusta según sea necesario

    return () => clearInterval(interval); // Limpia el intervalo al desmontar el componente
  }, [verificarEstadoUsuarioLogueado]);

  const fetchPaquetes = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      const response = await axios.get(`${API_URL}/paquete`, {
        params: {
          page: 1,
          per_page: 1000
        },
        ...config
      });
      setPaquetes(response.data.data || []);
    } catch (error) {
      console.error('Error fetching paquetes:', error);
    }
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };

      try {
        const responseTipos = await axios.get(`${API_URL}/dropdown/get_tipo_paquete`, config);
        setTiposPaquete(responseTipos.data.tipo_paquete || []);
      } catch (error) {
        console.error('Error fetching tipos de paquete:', error);
      }

      try {
        const responseEmpaques = await axios.get(`${API_URL}/dropdown/get_empaques`, config);
        setEmpaques(responseEmpaques.data.empaques || []);
      } catch (error) {
        console.error('Error fetching empaques:', error);
      }

      try {
        const responseEstados = await axios.get(`${API_URL}/dropdown/get_estado_paquete`, config);
        setEstadosPaquete(responseEstados.data.estado_paquetes || []);
      } catch (error) {
        console.error('Error fetching estados de paquete:', error);
      }
    } catch (error) {
      toast.error('Error al cargar datos adicionales');
      console.error('Error fetching additional data:', error);
    }
  };

  const handleAddPaquete = () => {
    navigate('/AgregarPaquete');
  };

  const eliminarPaquete = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };

      await axios.delete(`${API_URL}/paquete/${paqueteAEliminar.id}`, config);
      fetchPaquetes();
      setModalEliminar(false);
      toast.success('Paquete eliminado exitosamente');
    } catch (error) {
      toast.error('Error al eliminar el paquete');
      console.error('Error deleting paquete:', error);
    }
  };

  const actualizarPaquete = async (paqueteActualizado) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };

      await axios.put(`${API_URL}/paquete/${paqueteActualizado.id}`, paqueteActualizado, config);
      fetchPaquetes();
      setModalEditar(false);
      //toast.success('Paquete actualizado exitosamente');
    } catch (error) {
      console.error('Error updating paquete:', error.response ? error.response.data : error.message);
      toast.error(`Error al actualizar el paquete: ${error.response ? error.response.data.message : error.message}`);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to the first page when searching
  };

  const handleEstadoChange = (event) => {
    setEstadoSeleccionado(event.target.value);
    setCurrentPage(1); // Reset to the first page when changing the estado
  };

  const formatearFechaBusquedad = (fecha) => {
    if (!fecha) return '';
    const date = new Date(fecha);
    const dia = date.getDate().toString().padStart(2, '0');
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    const año = date.getFullYear();
    return `${dia} ${mes} ${año}`;
  };

  const normalizarBusqueda = (busqueda) => {
    if (!busqueda) return '';
    return busqueda.replace(/[-/]/g, ' ').toLowerCase();
  };

  const filtrarPaquetes = (paquetes) => {
    if (!searchTerm && !estadoSeleccionado) return paquetes;

    const searchLower = normalizarBusqueda(searchTerm);

    return paquetes.filter(paquete => {
      const tipoPaquete = paquete.tipo_paquete ? paquete.tipo_paquete.toLowerCase() : '';
      const estadoPaquete = paquete.estado_paquete ? paquete.estado_paquete.toLowerCase() : '';
      const fechaEnvio = formatearFechaBusquedad(paquete.fecha_envio).toLowerCase();
      const fechaEntrega = formatearFechaBusquedad(paquete.fecha_entrega_estimada).toLowerCase();

      return (tipoPaquete.includes(searchLower) ||
        estadoPaquete.includes(searchLower) ||
        fechaEnvio.includes(searchLower) ||
        fechaEntrega.includes(searchLower)) &&
        (!estadoSeleccionado || estadoPaquete === estadoSeleccionado);
    });
  };

  const getPaginatedPaquetes = (paquetes) => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return paquetes.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    fetchPaquetes();
    fetchData();
  }, []);

  useEffect(() => {
    const paquetesFiltrados = filtrarPaquetes(paquetes);
    setTotalItems(paquetesFiltrados.length);
    setPaquetesFiltrados(getPaginatedPaquetes(paquetesFiltrados));
  }, [searchTerm, paquetes, currentPage, estadoSeleccionado]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const paquetesFormateados = paquetesFiltrados.map(paquete => ({
    ...paquete,
    fecha_envio: formatDate(paquete.fecha_envio),
    fecha_entrega_estimada: formatDate(paquete.fecha_entrega_estimada)
  }));

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Gestión de Paquetes" breadcrumbItem="Listado de Paquetes" />
        <Row>
          <Col lg={12}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Label for="busqueda" style={{ marginRight: "10px" }}>Buscar:</Label>
              <Input
                type="text"
                id="busqueda"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Buscar por tipo, fecha de envío, fecha de entrega"
                style={{ width: "475px" }}
              />
              <Label for="estadoPaquete" style={{ marginRight: "10px", marginLeft: "20px" }}>Estado:</Label>
              <Input
                type="select"
                id="estadoPaquete"
                value={estadoSeleccionado}
                onChange={handleEstadoChange}
                style={{ width: "200px" }}
              >
                <option value="">Todos los estados</option>
                {estadosPaquete.map(estado => (
                  <option key={estado.id} value={estado.nombre.toLowerCase()}>
                    {estado.nombre}
                  </option>
                ))}
              </Input>
              <div style={{ marginLeft: "auto" }}>
                <Link to="/AgregarPaquete" className="btn btn-primary custom-button">
                  <i className="fas fa-plus"></i> Agregar Paquete
                </Link>
              </div>
            </div>
            <Card style={{ marginTop: '20px', marginBottom: '20px' }}>
              <CardBody>
                <TablaPaquetes
                  paquetes={paquetesFormateados}
                  onEdit={(paquete) => {
                    setPaqueteAEditar(paquete);
                    setModalEditar(true);
                  }}
                  onDelete={(paquete) => {
                    setPaqueteAEliminar(paquete);
                    setModalEliminar(true);
                  }}
                />
              </CardBody>
            </Card>
            <Col lg={12} style={{ marginTop: "20px", display: 'flex', justifyContent: 'center' }}>
              <Pagination
                activePage={currentPage}
                itemsCountPerPage={ITEMS_PER_PAGE}
                totalItemsCount={totalItems}
                pageRangeDisplayed={5}
                onChange={handlePageChange}
                innerClass="pagination"
                itemClass="page-item"
                linkClass="page-link"
              />
            </Col>
          </Col>
        </Row>
      </Container>
      <ModalEditarPaquete
        modalEditar={modalEditar}
        paqueteEditado={paqueteAEditar}
        setPaqueteEditado={setPaqueteAEditar}
        guardarCambiosPaquete={actualizarPaquete}
        setModalEditar={setModalEditar}
        tiposPaquete={tiposPaquete}
        empaques={empaques}
        estadosPaquete={estadosPaquete}
      />
      <ModalConfirmarEliminarPaquete
        isOpen={modalEliminar}
        toggle={() => setModalEliminar(!modalEliminar)}
        onConfirm={eliminarPaquete}
      />
    </div>
  );
};

export default GestionPaquetes;
