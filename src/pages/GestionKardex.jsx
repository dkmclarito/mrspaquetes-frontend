"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Table,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Spinner,
} from "reactstrap";
import Pagination from "react-js-pagination";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import Breadcrumbs from "../components/Bodegas/Common/Breadcrumbs";
import AuthService from "../services/authService";

const API_URL = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 10;

export default function GestionKardex() {
  document.title = "Kardex | Gestión";
  const [kardexData, setKardexData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    searchQuery: "",
    startDate: "",
    endDate: "",
  });

  const fetchData = useCallback(
    async (page = 1) => {
      setIsLoading(true);
      try {
        const token = AuthService.getCurrentUser();
        const response = await axios.get(`${API_URL}/kardex`, {
          params: {
            page: page,
            per_page: ITEMS_PER_PAGE,
            search: filters.searchQuery,
            start_date: filters.startDate,
            end_date: filters.endDate,
          },
          headers: { Authorization: `Bearer ${token}` },
        });

        setKardexData(response.data.data || []);
        setTotalItems(response.data.pagination.total || 0);
        setCurrentPage(response.data.pagination.current_page || 1);
      } catch (error) {
        console.error("Error al obtener datos del Kardex:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (e) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [e.target.name]: e.target.value,
    }));
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchData(1);
  };

  const resetFilters = () => {
    setFilters({
      searchQuery: "",
      startDate: "",
      endDate: "",
    });
    setCurrentPage(1);
    fetchData(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    fetchData(pageNumber);
  };

  const filterData = (data) => {
    return data.filter((item) => {
      const matchesSearch =
        !filters.searchQuery ||
        item.numero_ingreso
          .toLowerCase()
          .includes(filters.searchQuery.toLowerCase()) ||
        item.uuid.toLowerCase().includes(filters.searchQuery.toLowerCase());

      const itemDate = new Date(item.fecha);
      const matchesStartDate =
        !filters.startDate || itemDate >= new Date(filters.startDate);
      const matchesEndDate =
        !filters.endDate || itemDate <= new Date(filters.endDate);

      return matchesSearch && matchesStartDate && matchesEndDate;
    });
  };

  const filteredData = filterData(kardexData);

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs
          title="Gestión de Kardex"
          breadcrumbItem="Listado de Kardex"
        />
        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <Form className="mb-4">
                  <Row>
                    <Col md={4}>
                      <FormGroup>
                        <Label for="searchQuery">
                          Buscar (N° Ingreso o QR)
                        </Label>
                        <Input
                          type="text"
                          name="searchQuery"
                          id="searchQuery"
                          placeholder="N° Ingreso o QR"
                          value={filters.searchQuery}
                          onChange={handleFilterChange}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup>
                        <Label for="startDate">Fecha Inicio</Label>
                        <Input
                          type="date"
                          name="startDate"
                          id="startDate"
                          value={filters.startDate}
                          onChange={handleFilterChange}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup>
                        <Label for="endDate">Fecha Fin</Label>
                        <Input
                          type="date"
                          name="endDate"
                          id="endDate"
                          value={filters.endDate}
                          onChange={handleFilterChange}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={1}>
                      <FormGroup style={{ marginTop: "32px" }}>
                        <Button
                          color="primary"
                          onClick={applyFilters}
                          className="mr-2"
                        >
                          Buscar
                        </Button>
                      </FormGroup>
                    </Col>
                    <Col md={1}>
                      <FormGroup style={{ marginTop: "32px" }}>
                        <Button color="secondary" onClick={resetFilters}>
                          Limpiar
                        </Button>
                      </FormGroup>
                    </Col>
                  </Row>
                </Form>

                <Table responsive striped className="table-centered">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>ID Orden</th>
                      <th>Cantidad</th>
                      <th>Número de Ingreso</th>
                      <th>Código QR del Paquete</th>
                      <th>Tipo de Movimiento</th>
                      <th>Tipo de Transacción</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center">
                          No hay traslados disponibles
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((item) => (
                        <tr key={item.id}>
                          <td>{item.id}</td>
                          <td>{item.id_orden}</td>
                          <td>{item.cantidad}</td>
                          <td>{item.numero_ingreso}</td>
                          <td>{item.uuid}</td>
                          <td>{item.tipo_movimiento}</td>
                          <td>{item.tipo_transaccion}</td>
                          <td>
                            {format(
                              parseISO(item.fecha.split("T")[0]),
                              "dd/MM/yyyy",
                              {
                                locale: es,
                              }
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
                <div className="d-flex justify-content-center mt-4">
                  <Pagination
                    activePage={currentPage}
                    itemsCountPerPage={ITEMS_PER_PAGE}
                    totalItemsCount={totalItems}
                    pageRangeDisplayed={5}
                    onChange={handlePageChange}
                    itemClass="page-item"
                    linkClass="page-link"
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
