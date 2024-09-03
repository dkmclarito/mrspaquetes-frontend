import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, CardBody, CardTitle, Button, Badge,
  Progress, Navbar, NavbarBrand, Nav, NavItem, NavLink, Table, ListGroup, ListGroupItem
} from 'reactstrap';
import axios from 'axios';
import AuthService from '../../services/authService';
import BarChartComponent from './BarChartComponent';
import PieChartComponent from './PieChartComponent';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const Dashboard = () => {
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [totalClientes, setTotalClientes] = useState(0);
  const [totalEmpleados, setTotalEmpleados] = useState(0);
  const [totalBodegas, setTotalBodegas] = useState(0);  
  const [empleados, setEmpleados] = useState([]);
  const [paquetes, setPaquetes] = useState([]);
  const [paquetesRecientes, setPaquetesRecientes] = useState([]);
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

        const clientes = await axios.get(`${API_URL}/clientes`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });     
        
        const bodegas = await axios.get(`${API_URL}/bodegas`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }); 

        const empleados = await axios.get(`${API_URL}/empleados`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const empleadosResponse = await axios.get(`${API_URL}/empleados`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const paquetesResponse = await axios.get(`${API_URL}/paquete`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        //console.log('Respuesta de la API paquetes:', paquetesResponse.data.data);

        setTotalUsuarios(usuarios.data.users.length);
        setTotalClientes(clientes.data.data.length);   
        setTotalBodegas(bodegas.data.bodegas.length);   
        setTotalEmpleados(empleados.data.empleados.length);
        setEmpleados(empleadosResponse.data.empleados);
        setPaquetes(paquetesResponse.data.data || []);
        
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

  useEffect(() => {
    if (paquetes.length > 0) {
      const paquetesOrdenados = [...paquetes].sort((a, b) => b.id - a.id); 
      setPaquetesRecientes(paquetesOrdenados.slice(0, 4)); 
    } else {
      setPaquetesRecientes([]);
    }
  }, [paquetes]);

  const empleadosRecientes = empleados.slice(-4);

  return (
    <div className="page-content">      
      <Container fluid className="mt-4">      
        <Row>          
          <Col md="3">
            <Card>
              <CardBody>
                <CardTitle tag="h5">Usuarios Registrados</CardTitle>
                <h3><Badge color="info">{totalUsuarios || 0}</Badge></h3>
                <Button color="primary" block onClick={UsuariosRedirect}>Ver Detalles</Button>
              </CardBody>
            </Card>
          </Col>

          <Col md="3">
            <Card>
              <CardBody>
                <CardTitle tag="h5">Clientes Registrados</CardTitle>
                <h3><Badge color="warning">{totalClientes || 0}</Badge></h3>
                <Button color="primary" block onClick={ClientesRedirect}>Ver Detalles</Button>
              </CardBody>
            </Card>
          </Col>

          <Col md="3">
            <Card>
              <CardBody>
                <CardTitle tag="h5">Empleados Registrados</CardTitle>
                <h3><Badge color="secondary">{totalEmpleados || 0}</Badge></h3>
                <Button color="primary" block onClick={EmpleadosRedirect}>Ver Detalles</Button>
              </CardBody>
            </Card>
          </Col>        

          <Col md="3">
            <Card>
              <CardBody>
                <CardTitle tag="h5">Bodegas Registradas</CardTitle>
                <h3><Badge color="success">{totalBodegas || 0}</Badge></h3>
                <Button color="primary" block onClick={BodegasRedirect}>Ver Detalles</Button>
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
                <CardTitle tag="h5">Paquetes Recientes</CardTitle>
                <ListGroup>
                  {paquetesRecientes.length > 0 ? (
                    paquetesRecientes.map((paquete) => (
                      <ListGroupItem key={paquete.id}>
                        {paquete.tipo_paquete} - {' '}
                        <Badge color={paquete.estado_paquete ? 'primary' : 'primary'}>
                          {paquete.estado_paquete || 'Desconocido'}
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

        <Row className="mt-12">
          <Col md="12">
            <Card>
              <CardBody>
                <CardTitle tag="h5">Progreso de Órdenes</CardTitle>
                <Progress multi>
                  <Progress bar color="success" value="40">Completadas (40%)</Progress>
                  <Progress bar color="warning" value="35">En Proceso (35%)</Progress>
                  <Progress bar color="danger" value="25">Pendientes (25%)</Progress>
                </Progress>
              </CardBody>
            </Card>
          </Col>
          </Row>                            
      </Container>
    </div>
  );
};

export default Dashboard;
