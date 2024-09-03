import React from 'react';
import {
  Container, Row, Col, Card, CardBody, CardTitle, Button, Badge,
  Progress, Navbar, NavbarBrand, Nav, NavItem, NavLink, Table, ListGroup, ListGroupItem
} from 'reactstrap';
import BarChartComponent from './BarChartComponent';

const Dashboard = () => {
  return (
    <div className="page-content">      
      <Container fluid className="mt-4">
        <Row>
          <Col md="3">
            <Card>
              <CardBody>
                <CardTitle tag="h5">Paquetes Pendientes</CardTitle>
                <h3><Badge color="warning">12</Badge></h3>
                <Button color="primary" block>Ver Detalles</Button>
              </CardBody>
            </Card>
          </Col>

          <Col md="3">
            <Card>
              <CardBody>
                <CardTitle tag="h5">Paquetes Entregados</CardTitle>
                <h3><Badge color="success">24</Badge></h3>
                <Button color="primary" block>Ver Detalles</Button>
              </CardBody>
            </Card>
          </Col>

          <Col md="3">
            <Card>
              <CardBody>
                <CardTitle tag="h5">Usuarios Registrados</CardTitle>
                <h3><Badge color="info">10</Badge></h3>
                <Button color="primary" block>Ver Detalles</Button>
              </CardBody>
            </Card>
          </Col>

          <Col md="3">
            <Card>
              <CardBody>
                <CardTitle tag="h5">Clientes Registrados</CardTitle>
                <h3><Badge color="secondary">18</Badge></h3>
                <Button color="primary" block>Ver Detalles</Button>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col md="12">
            <Card>
              <CardBody>
                <BarChartComponent />
              </CardBody>
            </Card>
          </Col>
        </Row>
        <br></br>
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
          <br></br>
          <Row className="mt-12">
          <Col md="12">
            <Card>
              <CardBody>
                <CardTitle tag="h5">Últimas Actividades</CardTitle>
                <div className="table-responsive">
                  <Table bordered>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Descripción</th>
                        <th>Usuario</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th scope="row">1</th>
                        <td>Paquete #12345 entregado</td>
                        <td>Juan Pérez</td>
                        <td>2024-08-15</td>
                        <td><Badge color="success">Completado</Badge></td>
                      </tr>
                      <tr>
                        <th scope="row">2</th>
                        <td>Ruta asignada para paquete #12346</td>
                        <td>Maria López</td>
                        <td>2024-08-14</td>
                        <td><Badge color="info">Asignado</Badge></td>
                      </tr>
                      <tr>
                        <th scope="row">3</th>
                        <td>Nuevo cliente registrado</td>
                        <td>Carlos Sánchez</td>
                        <td>2024-08-13</td>
                        <td><Badge color="info">Nuevo</Badge></td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
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
                  <ListGroupItem>Pedro Gómez - <Badge color="primary">Activo</Badge></ListGroupItem>
                  <ListGroupItem>Laura Martínez - <Badge color="danger">Inactivo</Badge></ListGroupItem>
                  <ListGroupItem>Alberto Ruiz - <Badge color="primary">Activo</Badge></ListGroupItem>
                  <ListGroupItem>Claudia Fernández - <Badge color="primary">Activo</Badge></ListGroupItem>
                </ListGroup>
                <Button color="primary" block className="mt-3">Ver Todos</Button>
              </CardBody>
            </Card>
          </Col>

          <Col md="6">
            <Card>
              <CardBody>
                <CardTitle tag="h5">Tracking de Paquetes</CardTitle>
                <ListGroup>
                  <ListGroupItem>Paquete #12345 - <Badge color="success">Entregado</Badge></ListGroupItem>
                  <ListGroupItem>Paquete #12346 - <Badge color="warning">En Camino</Badge></ListGroupItem>
                  <ListGroupItem>Paquete #12347 - <Badge color="info">Preparando Envío</Badge></ListGroupItem>
                  <ListGroupItem>Paquete #12348 - <Badge color="danger">Pendiente</Badge></ListGroupItem>
                </ListGroup>
                <Button color="primary" block className="mt-3">Ver Detalles</Button>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col md="12">
            <Card>
              <CardBody>
                <CardTitle tag="h5">Órdenes Recientes</CardTitle>
                <div className="table-responsive">
                  <Table bordered>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Cliente</th>
                        <th>Paquete</th>
                        <th>Ruta Asignada</th>
                        <th>Fecha de Creación</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th scope="row">1</th>
                        <td>Juan Pérez</td>
                        <td>Paquete #12345</td>
                        <td>Ruta 1</td>
                        <td>2024-08-15</td>
                        <td><Badge color="success">Completada</Badge></td>
                      </tr>
                      <tr>
                        <th scope="row">2</th>
                        <td>Maria López</td>
                        <td>Paquete #12346</td>
                        <td>Ruta 2</td>
                        <td>2024-08-14</td>
                        <td><Badge color="warning">En Proceso</Badge></td>
                      </tr>
                      <tr>
                        <th scope="row">3</th>
                        <td>Carlos Sánchez</td>
                        <td>Paquete #12347</td>
                        <td>Ruta 3</td>
                        <td>2024-08-13</td>
                        <td><Badge color="danger">Pendiente</Badge></td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>        
      </Container>
    </div>
  );
};

export default Dashboard;
