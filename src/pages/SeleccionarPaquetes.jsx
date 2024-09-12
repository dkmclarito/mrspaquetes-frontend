import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, CardBody, Input, Label, Button } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import Breadcrumbs from '../components/Empleados/Common/Breadcrumbs';
import Pagination from 'react-js-pagination';
import { toast } from 'react-toastify';
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

export default function GestionPaquetes() {
  const [allPaquetes, setAllPaquetes] = useState([]);
  const [paquetesFiltrados, setPaquetesFiltrados] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [paquetesSeleccionados, setPaquetesSeleccionados] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState('');
  const [municipioSeleccionado, setMunicipioSeleccionado] = useState('');

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
          window.location.href = "/login";
          return;
        }
      }
    } catch (error) {
      console.error("Error al verificar el estado del usuario:", error);
    }
  }, []);

  const fetchPaquetes = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      
      const ordenesResponse = await axios.get(`${API_URL}/ordenes`, config);
      const ordenes = ordenesResponse.data.data || [];
      console.log('Total órdenes registradas:', ordenes.length);

      const paquetesDisponibles = ordenes.flatMap(orden => 
        orden.detalles.map(detalle => ({
          id_paquete: detalle.id_paquete,
          tipo_paquete: tiposPaquete[detalle.paquete.id_tipo_paquete] || 'Desconocido',
          empaquetado: tiposEmpaque[detalle.paquete.tipo_caja] || 'Desconocido',
          tamano_paquete: tamanosPaquete[detalle.paquete.id_tamano_paquete] || 'Desconocido',
          estado_paquete: estadosPaquete[detalle.id_estado_paquetes] || 'Desconocido',
          departamento: orden.direccion_emisor.departamento,
          municipio: orden.direccion_emisor.municipio,
          direccion: orden.direccion_emisor.direccion,
          peso: detalle.paquete.peso,
          descripcion_contenido: detalle.paquete.descripcion_contenido,
          fecha_envio: detalle.paquete.fecha_envio,
          fecha_entrega_estimada: detalle.paquete.fecha_entrega_estimada,
          paquete: detalle.paquete
          
        }))
      );
      
      console.log('Total paquetes disponibles:', paquetesDisponibles.length);

      setAllPaquetes(paquetesDisponibles);
      setTotalItems(paquetesDisponibles.length);

      const uniqueDepartamentos = [...new Set(paquetesDisponibles.map(p => p.departamento).filter(Boolean))];
      setDepartamentos(uniqueDepartamentos);

      const uniqueMunicipios = [...new Set(paquetesDisponibles.map(p => p.municipio).filter(Boolean))];
      setMunicipios(uniqueMunicipios);

      setPaquetesFiltrados(paquetesDisponibles.slice(0, ITEMS_PER_PAGE));
    } catch (error) {
      console.error('Error fetching paquetes:', error);
      toast.error('Error al cargar los paquetes');
    }
  };

  useEffect(() => {
    verificarEstadoUsuarioLogueado();
    fetchPaquetes();
  }, [verificarEstadoUsuarioLogueado]);

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
    if (isSelected) {
      setPaquetesSeleccionados([...paquetesSeleccionados, {
        id_paquete: paquete.id_paquete,
        tamano_paquete: paquete.tamano_paquete
      }]);
    } else {
      setPaquetesSeleccionados(paquetesSeleccionados.filter(p => p.id_paquete !== paquete.id_paquete));
    }
    console.log('Paquetes seleccionados:', paquetesSeleccionados.length + (isSelected ? 1 : -1));
  };

  const handleAsignarRuta = () => {
    if (paquetesSeleccionados.length === 0) {
      toast.warning('Por favor, seleccione al menos un paquete para asignar ruta.');
      return;
    }
    localStorage.setItem('paquetesParaAsignar', JSON.stringify(paquetesSeleccionados));
    navigate('/AgregarAsignacionRuta');
  };

  const filtrarPaquetes = useCallback(() => {
    return allPaquetes.filter(paquete => {
      const departamento = paquete.departamento || '';
      const municipio = paquete.municipio || '';

      return (!departamentoSeleccionado || departamento === departamentoSeleccionado) &&
             (!municipioSeleccionado || municipio === municipioSeleccionado);
    });
  }, [allPaquetes, departamentoSeleccionado, municipioSeleccionado]);

  useEffect(() => {
    const paquetesFiltrados = filtrarPaquetes();
    console.log('Paquetes filtrados:', paquetesFiltrados.length);
    setTotalItems(paquetesFiltrados.length);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setPaquetesFiltrados(paquetesFiltrados.slice(startIndex, endIndex));
  }, [allPaquetes, currentPage, filtrarPaquetes]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
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
              <div style={ {marginLeft: 'auto'}}>
              <Button color="primary" onClick={handleAsignarRuta}>
                <i className="fas fa-plus"></i> Asignar Ruta
              </Button>
              </div>
              </div>
              
            <Card>
              <CardBody>
                <TablaPaquetesAsignados
                  paquetes={paquetesFiltrados}
                  onSelect={handleSelectPaquete}
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
    </div>
  );
}