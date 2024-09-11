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
          ...detalle,
          numero_seguimiento: orden.numero_seguimiento,
          cliente: `${orden.cliente.nombre} ${orden.cliente.apellido}`,
          departamento: detalle.departamento || 'Desconocido',
          municipio: detalle.municipio || 'Desconocido',
          estado_paquete: detalle.estado_paquete || 'Desconocido'
        }))
      );

      console.log('Total paquetes disponibles:', paquetesDisponibles.length);

      const responseAsignaciones = await axios.get(`${API_URL}/asignacionrutas`, config);
      const asignaciones = responseAsignaciones.data.asignacionrutas || [];

      console.log('Total asignaciones:', asignaciones.length);

      const idsPaquetesAsignados = new Set(asignaciones.map(asignacion => asignacion.id_paquete));
      console.log('IDs de paquetes asignados:', [...idsPaquetesAsignados]);

      const paquetesNoAsignados = paquetesDisponibles.filter(paquete => !idsPaquetesAsignados.has(paquete.id_paquete));
      console.log('Total paquetes no asignados:', paquetesNoAsignados.length);

      setAllPaquetes(paquetesNoAsignados);
      setTotalItems(paquetesNoAsignados.length);

      const uniqueDepartamentos = [...new Set(paquetesNoAsignados.map(p => p.departamento).filter(Boolean))];
      setDepartamentos(uniqueDepartamentos);

      const uniqueMunicipios = [...new Set(paquetesNoAsignados.map(p => p.municipio).filter(Boolean))];
      setMunicipios(uniqueMunicipios);
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
    setPaquetesSeleccionados(prev => {
      const updated = isSelected
        ? [...prev, { id_paquete: parseInt(paquete.id_paquete, 10), tamano_paquete: paquete.tamano_paquete }]
        : prev.filter(p => p.id_paquete !== parseInt(paquete.id_paquete, 10));
      console.log('Paquetes seleccionados:', updated.length);
      return updated;
    });
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
              <div style={{ marginLeft: "auto" }}>
                <Button color="primary" onClick={handleAsignarRuta}>
                  <i className="fas fa-plus"></i> Asignar Ruta
                </Button>
              </div>
            </div>
            <Card style={{ marginTop: '20px' }}>
              <CardBody>
                <TablaPaquetesAsignados
                  paquetes={paquetesFiltrados}
                  onSelect={handleSelectPaquete}
                />
              </CardBody>
            </Card>
            {totalItems > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
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
                </div>
              )}
            </Col>
          </Row>
      
      </Container>
    </div>
  );
}
