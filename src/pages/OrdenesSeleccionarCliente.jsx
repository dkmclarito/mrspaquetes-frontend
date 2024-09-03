import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, CardBody, Input, Label, Nav, NavItem, NavLink, Progress } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Breadcrumbs from '../components/Empleados/Common/Breadcrumbs';
import TablaSeleccionCliente from '../components/Ordenes/TablaSeleccionCliente';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faMapMarkerAlt, faBook, faDollarSign } from '@fortawesome/free-solid-svg-icons';
import Pagination from 'react-js-pagination';

const API_URL = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 9;

export default function OrdenesSeleccionarCliente() {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [tipoPersona, setTipoPersona] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [currentStep, setCurrentStep] = useState(1); // Estado para el paso actual
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/clientes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClientes(response.data.data || []);
      } catch (error) {
        console.error("Error al obtener clientes:", error);
      }
    };

    const fetchTipoPersona = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/dropdown/get_tipo_persona`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const tipoPersonaData = response.data.tipo_persona;
        if (Array.isArray(tipoPersonaData)) {
          const tipoPersonaObj = {};
          tipoPersonaData.forEach(tipo => {
            tipoPersonaObj[tipo.id] = tipo.nombre;
          });
          setTipoPersona(tipoPersonaObj);
        } else {
          throw new Error('Datos de tipoPersona no son un array');
        }
      } catch (error) {
        console.error("Error al obtener tipos de persona:", error);
      }
    };

    fetchClientes();
    fetchTipoPersona();
  }, []);

  const filteredClientes = useMemo(() => {
    return clientes.filter(cliente => {
      const searchText = busqueda.toLowerCase();
      return (
        (cliente.nombre || '').toLowerCase().includes(searchText) ||
        (cliente.apellido || '').toLowerCase().includes(searchText) ||
        (cliente.nombre_comercial || '').toLowerCase().includes(searchText) ||
        (cliente.dui || '').toLowerCase().includes(searchText) ||
        (cliente.nit || '').toLowerCase().includes(searchText) ||
        (tipoPersona[cliente.id_tipo_persona] || '').toLowerCase().includes(searchText)
      );
    });
  }, [clientes, busqueda, tipoPersona]);

  const paginatedClientes = filteredClientes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearchChange = (e) => {
    setBusqueda(e.target.value);
    setCurrentPage(1);
  };

  const generarOrden = (clienteId) => {
    navigate(`/OrdenesDirecciones/${clienteId}`);
  };

  const handleSelectAddress = (address) => {
    localStorage.setItem('selectedAddress', JSON.stringify(address));
    navigate(`/DatosPaquete/${clienteId}`);
  };

  const steps = [
    { step: 1, label: '', icon: faSearch },
    { step: 2, label: '', icon: faMapMarkerAlt },
    { step: 3, label: '', icon: faBook },
    { step: 4, label: '', icon: faDollarSign }
  ];

  return (
    <div className="page-content">
      <Container fluid>
        <h1 className='text-center titulo-pasos'>Seleccionar Cliente</h1>        
        <Row>
          <Col lg={12}>
            <Nav pills className="justify-content-center mb-4">
              {steps.map(({ step, label, icon }) => (
                <NavItem key={step}>
                  <NavLink
                    className={`stepperDark ${currentStep === step ? 'active' : ''}`}
                    href="#"
                    style={{
                      borderRadius: '50%',
                      padding: '10px 20px',
                      margin: '0 5px'
                      //display: 'flex',
                      //alignItems: 'center',
                      //justifyContent: 'space-between',
                      //minWidth: '110px'
                    }}                    
                  >
                    {/*<div style={{ flex: 1, textAlign: 'left' }}>{label}</div>*/}
                    <FontAwesomeIcon icon={icon} style={{ fontSize: '15px', marginBottom: '0px' }} />  
                    {label}                  
                  </NavLink>
                </NavItem>
              ))}
            </Nav>                     
            {/*<Breadcrumbs breadcrumbItem="Seleccionar Cliente" />*/                     }
            {/*<Progress value={(currentStep / steps.length) * 100} color="primary" />*/                     }            
            <Progress className="custom-progress barra-pasos" value={(0.25) * 100} />
            <br></br>
          </Col>
        </Row>

        <Row>
          <Col lg={12}>
            <div style={{ marginTop: "10px", display: 'flex', alignItems: 'center' }}>
              <Label for="busqueda" style={{ marginRight: "10px" }}>Buscar:</Label>
              <Input
                type="text"
                id="busqueda"
                value={busqueda}
                onChange={handleSearchChange}
                placeholder="Buscar por nombre, apellido, nombre comercial, DUI, NIT o tipo de persona"
                style={{ width: "600px" }}
              />
            </div>
          </Col>
        </Row>

        <br />

        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <TablaSeleccionCliente
                  clientes={paginatedClientes}
                  tipoPersona={tipoPersona}
                  generarOrden={generarOrden}
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
              totalItemsCount={filteredClientes.length}
              pageRangeDisplayed={5}
              onChange={handlePageChange}
              itemClass="page-item"
              linkClass="page-link"
              innerClass="pagination"
            />
          </Col>
        </Row>
      </Container>
    </div>
  );
}
