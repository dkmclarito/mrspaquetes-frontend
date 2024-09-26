import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, CardBody, Input, Label, Button, Spinner } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import Breadcrumbs from '../components/Empleados/Common/Breadcrumbs';
import Pagination from 'react-js-pagination';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/Paquetes.css';
import TablaPaquetesAsignados from '../components/AsignacionRutas/TablaPaquetesAsignados';
import AuthService from "../services/authService";

const API_URL = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 10;

const tiposPaquete = {
  1: "Documentos",
  2: "Electronicos",
  3: "Ropa",
  4: "Alimentos"
};

const tamanosPaquete = {
  1: "Pequeño",
  2: "Mediano",
  3: "Grande"
};

const estadosPaquete = {
  1: "Recepción",
  2: "En Bodega",
  3: "En Espera de Recolección",
  4: "En Transito",
  5: "En Ruta de entrega"
};

const tiposEmpaque = {
  1: "Caja de cartón",
  2: "Bolsa de plástico",
  3: "Sobres acolchados",
  4: "Papel burbuja"
};

export default function SeleccionarPaquetes() {
  const [allPaquetes, setAllPaquetes] = useState([]);
  const [paquetesFiltrados, setPaquetesFiltrados] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [paquetesSeleccionados, setPaquetesSeleccionados] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState('');
  const [municipioSeleccionado, setMunicipioSeleccionado] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const filtrarPaquetes = useCallback((paquetes) => {
    return paquetes.filter(paquete => {
      const departamento = paquete.departamento || '';
      const municipio = paquete.municipio || '';

      return (!departamentoSeleccionado || departamento === departamentoSeleccionado) &&
             (!municipioSeleccionado || municipio === municipioSeleccionado);
    });
  }, [departamentoSeleccionado, municipioSeleccionado]);

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
          window.location.href = "/login";
          return;
        }
      }
    } catch (error) {
      console.error("Error al verificar el estado del usuario:", error);
    }
  }, []);

  const fetchPaquetes = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };

      const ordenesResponse = await axios.get(`${API_URL}/ordenes`, config);
      const ordenes = ordenesResponse.data.data || [];

      const paquetesDisponibles = ordenes.flatMap(orden => 
        orden.estado_pago === "pagado" ? orden.detalles.map(detalle => ({
          id_paquete: detalle.id_paquete,
          tipo_paquete: tiposPaquete[detalle.paquete.id_tipo_paquete] || 'Desconocido',
          empaquetado: tiposEmpaque[detalle.paquete.tipo_caja] || 'Desconocido',
          tamano_paquete: tamanosPaquete[detalle.paquete.id_tamano_paquete] || 'Desconocido',
          estado_paquete: estadosPaquete[detalle.paquete.id_estado_paquete] || 'Desconocido',
          departamento: orden.direccion_emisor.departamento,
          municipio: orden.direccion_emisor.municipio,
          direccion: orden.direccion_emisor.direccion,
          peso: parseFloat(detalle.paquete.peso) || 0,
          descripcion_contenido: detalle.paquete.descripcion_contenido,
          fecha_envio: detalle.paquete.fecha_envio,
          fecha_entrega_estimada: detalle.paquete.fecha_entrega_estimada,
          created_at: orden.created_at,
          paquete: detalle.paquete
        })) : []
      ).filter(paquete => paquete.paquete.id_estado_paquete === 2);

      console.log("Paquetes disponibles:", paquetesDisponibles);

      let allAsignaciones = [];
      let page = 1;
      let hasMorePages = true;

      while (hasMorePages) {
        const responseAsignaciones = await axios.get(`${API_URL}/asignacionrutas?page=${page}`, config);
        const asignaciones = responseAsignaciones.data.asignacionrutas.data || [];
        allAsignaciones = [...allAsignaciones, ...asignaciones];
        
        if (responseAsignaciones.data.asignacionrutas.next_page_url) {
          page++;
        } else {
          hasMorePages = false;
        }
      }

      const idsPaquetesAsignados = new Set(allAsignaciones.map(asignacion => asignacion.id_paquete));
      const paquetesNoAsignados = paquetesDisponibles.filter(paquete => !idsPaquetesAsignados.has(paquete.id_paquete));

      // Ordenar paquetes por fecha de registro (created_at)
      const paquetesOrdenados = paquetesNoAsignados.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

      console.log("Paquetes ordenados:", paquetesOrdenados);

      setAllPaquetes(paquetesOrdenados);
      setTotalItems(paquetesOrdenados.length);

      const uniqueDepartamentos = [...new Set(paquetesOrdenados.map(p => p.departamento).filter(Boolean))];
      setDepartamentos(uniqueDepartamentos);

      const uniqueMunicipios = [...new Set(paquetesOrdenados.map(p => p.municipio).filter(Boolean))];
      setMunicipios(uniqueMunicipios);

      const paquetesFiltradosIniciales = filtrarPaquetes(paquetesOrdenados);
      setPaquetesFiltrados(paquetesFiltradosIniciales);
    } catch (error) {
      console.error('Error fetching paquetes:', error);
      toast.error('Error al cargar los paquetes');
    } finally {
      setIsLoading(false);
    }
  }, [filtrarPaquetes]);

  useEffect(() => {
    verificarEstadoUsuarioLogueado();
    fetchPaquetes();
    const paquetesGuardados = JSON.parse(localStorage.getItem('paquetesParaAsignar') || '[]');
    setPaquetesSeleccionados(paquetesGuardados);
  }, [verificarEstadoUsuarioLogueado, fetchPaquetes]);

  useEffect(() => {
    const paquetesFiltrados = filtrarPaquetes(allPaquetes);
    setTotalItems(paquetesFiltrados.length);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setPaquetesFiltrados(paquetesFiltrados.slice(startIndex, endIndex));
  }, [allPaquetes, currentPage, filtrarPaquetes]);

  const handleDepartamentoChange = (event) => {
    setDepartamentoSeleccionado(event.target.value);
    setMunicipioSeleccionado('');
    setCurrentPage(1);
  };

  const handleMunicipioChange = (event) => {
    setMunicipioSeleccionado(event.target.value);
    setCurrentPage(1);
  };

  const handleSelectPaquete = (paquete, isSelected) => {
    setPaquetesSeleccionados(prev => {
      const updated = isSelected
        ? [...prev, { 
            id_paquete: parseInt(paquete.id_paquete, 10), 
            tamano_paquete: paquete.tamano_paquete,
            direccion: paquete.direccion,
            departamento: paquete.departamento,
            municipio: paquete.municipio,
            created_at: paquete.created_at
          }]
        : prev.filter(p => p.id_paquete !== parseInt(paquete.id_paquete, 10));
      localStorage.setItem('paquetesParaAsignar', JSON.stringify(updated));
      return updated;
    });
  };

  const handleAsignarRuta = () => {
    if (paquetesSeleccionados.length === 0) {
      toast.warning('Debe seleccionar al menos un paquete para asignar una ruta.');
      return;
    }
    navigate('/AgregarAsignacionRuta');
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleCancelar = () => {
    setPaquetesSeleccionados([]);
    localStorage.removeItem('paquetesParaAsignar');
    navigate('/GestionAsignarRutas');
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Selección de Paquetes" breadcrumbItem="Listado de Paquetes pendientes de asignar a ruta" />
        <Row>
          <Col lg={12}>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <Label for="departamento">Departamento:</Label>
              <Input
                type="select"
                id="departamento"
                value={departamentoSeleccionado}
                onChange={handleDepartamentoChange}
                style={{ width: "220px" }}
              >
                <option value="">Todos los departamentos</option>
                {departamentos.map((dep, index) => (
                  <option key={index} value={dep}>
                    {dep}
                  </option>
                ))}
              </Input>
              <Label for="municipio">Municipio:</Label>
              <Input
                type="select"
                id="municipio"
                value={municipioSeleccionado}
                onChange={handleMunicipioChange}
                style={{ width: "200px" }}
              >
                <option value="">Todos los municipios</option>
                {municipios.map((mun, index) => (
                  <option key={index} value={mun}>
                    {mun}
                  </option>
                ))}
              </Input>
              <div style={{ marginLeft: 'auto' }}>
                <Button color="primary" onClick={handleAsignarRuta} className="me-2">
                  <i className="fas fa-plus"></i> Asignar Ruta
                </Button>
                <Button className='btn-custom-red' onClick={handleCancelar}>
                  Cancelar
                </Button>
              </div>
            </div>
            <Card>
              <CardBody>
                {isLoading ? (
                  <div className="text-center">
                    <Spinner color="primary" />
                  </div>
                ) : (
                  <TablaPaquetesAsignados
                    paquetes={paquetesFiltrados}
                    onSelect={handleSelectPaquete}
                    paquetesSeleccionados={paquetesSeleccionados}
                  />
                )}
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
      <ToastContainer />
    </div>
  );
}