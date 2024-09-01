import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, Card, CardBody, Input, Label } from "reactstrap";
import { Link } from "react-router-dom";
import Breadcrumbs from "../components/Empleados/Common/Breadcrumbs";
import TablaOrdenes from "../components/Ordenes/TablaOrdenes";
import Pagination from 'react-js-pagination';

const API_URL = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 7;

export default function GestionOrdenesExpress() {
  const [ordenes, setOrdenes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchOrdenes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/ordenes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Ordenes recibidas desde API:", response.data);
      setOrdenes(response.data.data || []);
    } catch (error) {
      console.error("Error al obtener órdenes:", error);
    }
  };

  useEffect(() => {
    fetchOrdenes();
  }, []);

  const eliminarOrden = (id) => {
    console.log("Eliminar orden", id);
    // Implement deletion logic here
  };

  const toggleModalEditar = (orden) => {
    console.log("Editar orden", orden);
    // Implement edit logic here
  };

  const handleSearchChange = (e) => {
    setBusqueda(e.target.value);
    setCurrentPage(1);
  };

  const filtrarOrdenes = (ordenes) => {
    if (!busqueda) return ordenes;
    return ordenes.filter(orden =>
      orden.cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      orden.numero_seguimiento.toLowerCase().includes(busqueda.toLowerCase())
    );
  };

  const ordenesFiltradas = filtrarOrdenes(ordenes);
  const paginatedOrdenes = ordenesFiltradas.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Gestión de Órdenes Express" breadcrumbItem="Listado de Órdenes" />
        <Row>
          <Col lg={12}>
            <div style={{ marginTop: "10px", display: 'flex', alignItems: 'center' }}>
              <Label for="busqueda" style={{ marginRight: "10px" }}>Buscar:</Label>
              <Input
                type="text"
                id="busqueda"
                value={busqueda}
                onChange={handleSearchChange}
                placeholder="Buscar por nombre del cliente o número de seguimiento"
                style={{ width: "500px" }}
              />
              <div style={{ marginLeft: "auto" }}>
                <Link to="/OrdenesSeleccionarClienteExpress" className="btn btn-primary custom-button">
                  <i className="fas fa-plus"></i> Agregar Orden
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
                <TablaOrdenes
                  ordenes={paginatedOrdenes}
                  eliminarOrden={eliminarOrden}
                  toggleModalEditar={toggleModalEditar}
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
              totalItemsCount={ordenesFiltradas.length}
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


