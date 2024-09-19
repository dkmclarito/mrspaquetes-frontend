import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, CardBody, CardTitle, Button, Badge,
  Progress, Navbar, NavbarBrand, Nav, NavItem, NavLink, Table, ListGroup, ListGroupItem
} from 'reactstrap';
import axios from 'axios';
import AuthService from '../../services/authService';
import BarChartComponent from './BarChartComponent';
import PieChartComponent from './PieChartComponent';
import BrushBarChartComponent from './BrushBarChartComponent';
import { useNavigate } from 'react-router-dom';



const API_URL = import.meta.env.VITE_API_URL;

const Dashboard = () => {
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [totalClientes, setTotalClientes] = useState(0);
  const [totalEmpleados, setTotalEmpleados] = useState(0);
  const [totalBodegas, setTotalBodegas] = useState(0);  
  const [empleados, setEmpleados] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [estado1, setEstado1] = useState([]);
  const [estado2, setEstado2] = useState([]);
  const [estado3, setEstado3] = useState([]);
  const [estado4, setEstado4] = useState([]);
  const navigate = useNavigate();  
  const [packageData, setPackageData] = useState([]);

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const token = AuthService.getCurrentUser();

        const usuarios = await axios.get(`${API_URL}/auth/get_users`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }); 

        const empleadosResponse = await axios.get(`${API_URL}/empleados`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const ordenesResponse = await axios.get(`${API_URL}/ordenes`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const Totales = await axios.get(`${API_URL}/dashboard/card_summary`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const porcentajes = await axios.get(`${API_URL}/dashboard/packages_by_status`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });


        //console.log('Datos del Dashboard:', porcentajes.data.estados[9].paquetes);
        //console.log('Respuesta de la API: ',ordenesResponse);

        //console.log('Respuesta de la API:', porcentajes.data);

        setTotalUsuarios(usuarios.data.users.length);
        setTotalClientes(Totales.data.totales.clientes);   
        setTotalBodegas(Totales.data.totales.bodegas);   
        setTotalEmpleados(Totales.data.totales.empleados);
        setEmpleados(empleadosResponse.data.empleados);
        setOrdenes(ordenesResponse.data.data);
        setEstado1(porcentajes.data.estados[9].paquetes);
        setEstado2(porcentajes.data.estados[7].paquetes);
        setEstado3(porcentajes.data.estados[4].paquetes);
        setEstado4(porcentajes.data.estados[8].paquetes);
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };

    fetchDatos();
  }, []);


  const UsuariosRedirect = () => {
    navigate('/GestionUsuarios');
  };
  
  const ClientesRedirect = () => {
    navigate('/GestionClientes');
  };

  const EmpleadosRedirect = () => {
    navigate('/GestionEmpleados');
  };

  const BodegasRedirect = () => {
    navigate('/GestionBodegas');
  };

  const empleadosRecientes = empleados.slice(-4);
  const ordenesRecientes =ordenes.slice(-4);

  return (
    <div className="page-content">      
      <Container fluid className="mt-4">      
        <Row>          
        <Col md="3">
            <Card>
              <CardBody>
                <CardTitle style={{ textAlign: 'center' }} tag="h5">Usuarios Registrados</CardTitle>
                <div className="d-flex justify-content-between align-items-center">
                  <h3>
                    <Badge color="info">{totalUsuarios || 0}</Badge>
                  </h3>
                  <Button color="primary" onClick={UsuariosRedirect} style={{ width: '150px' }}>
                    Ver Detalles
                  </Button>
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col md="3">
            <Card>
              <CardBody>
                <CardTitle style={{ textAlign: 'center' }} tag="h5">Clientes Registrados</CardTitle>
                <div className="d-flex justify-content-between align-items-center">
                  <h3>
                    <Badge 
                    color="warning" 
                    style={{ color: '#696969' }}
                    className="badgeWarningDark">
                      {totalClientes || 0}
                    </Badge>
                    </h3>
                  <Button color="primary"  onClick={ClientesRedirect} style={{ width: '150px' }}>Ver Detalles</Button>
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col md="3">
            <Card>
              <CardBody>
                <CardTitle style={{ textAlign: 'center' }} tag="h5">Empleados Registrados</CardTitle>
                <div className="d-flex justify-content-between align-items-center">
                  <h3><Badge color="secondary">{totalEmpleados || 0}</Badge></h3>
                  <Button color="primary" onClick={EmpleadosRedirect} style={{ width: '150px' }}>Ver Detalles</Button>
                </div>
              </CardBody>
            </Card>
          </Col>        

          <Col md="3">
            <Card>
              <CardBody>
                <CardTitle style={{ textAlign: 'center' }} tag="h5">Bodegas Registradas</CardTitle>
                <div className="d-flex justify-content-between align-items-center">
                  <h3><Badge color="success">{totalBodegas || 0}</Badge></h3>
                  <Button color="primary" onClick={BodegasRedirect} style={{ width: '150px' }}>Ver Detalles</Button>
                </div>
              </CardBody>
            </Card>
          </Col>       
        </Row>                     
        
        <br></br>

        <Row>
        <Col md="5">
        <PieChartComponent data={packageData} />
        </Col>
        <Col md="7">
            <Card>
              <CardBody>
                <BarChartComponent />
              </CardBody>
            </Card>
          </Col>
      </Row>

      <br></br>
      <Row>
        <Col md="12">
            <Card>
              <CardBody>
                <BrushBarChartComponent />
              </CardBody>
            </Card>
          </Col>
      </Row>
<br></br>
          <Card>
          <CardBody style={{ textAlign: 'center' }}>
            <CardTitle tag="h4">Órdenes Mensuales</CardTitle>
            <Row className="mt-4">
              <Col md="3">
                <Card>
                  <CardBody style={{ textAlign: 'center' }}>
                    <h5>Completadas:<Badge color="success">{estado1}</Badge></h5>
                  </CardBody>
                </Card>
              </Col>

              <Col md="3">
                <Card>
                  <CardBody style={{ textAlign: 'center' }}>
                    <h5>En Ruta de Entrega:<Badge color="info">{estado4}</Badge></h5>
                  </CardBody>
                </Card>
              </Col>

              <Col md="3">
                <Card>
                  <CardBody style={{ textAlign: 'center' }}>
                   <h5>En Proceso:<Badge color="warning" style={{ color: '#515151' }}>{estado2}</Badge></h5>
                  </CardBody>
                </Card>
              </Col>

              <Col md="3">
                <Card>
                  <CardBody style={{ textAlign: 'center' }}>
                    <h5>Pendientes:<Badge color="danger">{estado3}</Badge></h5>
                  </CardBody>
                </Card>
              </Col>          
            </Row>
          </CardBody>
        </Card>

        <Row className="mt-4">
        <Col md="6">
            <Card>
              <CardBody>
                <CardTitle tag="h5">Empleados Recientes</CardTitle>
                <ListGroup>
                  {empleadosRecientes.length > 0 ? (
                    empleadosRecientes.map((empleado) => (
                      <ListGroupItem key={empleado.id}>
                        {empleado.nombres} {empleado.apellidos} -{' '}
                        <Badge color={empleado.activo ? 'danger' : 'success'}>
                          {empleado.activo ? 'Inactivo' : 'Activo'}
                        </Badge>
                      </ListGroupItem>
                    ))
                  ) : (
                    <ListGroupItem>No hay empleados recientes</ListGroupItem>
                  )}
                </ListGroup>
              </CardBody>
            </Card>
          </Col>

          <Col md="6">
          <Card>
              <CardBody>
                <CardTitle tag="h5">Órdenes Recientes</CardTitle>
                <ListGroup>
                  {ordenesRecientes.length > 0 ? (
                    ordenesRecientes.map((orden) => (
                      <ListGroupItem key={orden.id}>
                        {orden.cliente.nombre} {orden.cliente.apellido} - {' '}
                        {orden.tipo_orden}    {' '}
                        {orden.detalles.length > 0 ? (
                        <Badge color={
                          orden.detalles[0].tipo_entrega === 'Entrega Normal' ? 'success' :
                          orden.detalles[0].tipo_entrega === 'Entrega Express' ? 'primary' : 'secondary'
                        }>
                          {orden.detalles[0].tipo_entrega}
                        </Badge>
                      ) : (
                        <Badge color="danger">Sin entrega</Badge>
                      )}  {' '}

                      <Badge color={'secondary'}>
                        {orden.numero_seguimiento || 'Desconocido'}
                      </Badge>
                    </ListGroupItem>
                    ))
                  ) : (
                    <ListGroupItem>No hay paquetes recientes</ListGroupItem>
                  )}
                </ListGroup>
              </CardBody>
            </Card>
          </Col>
        </Row>   

                    
      </Container>
    </div>
  );
};

export default Dashboard;

