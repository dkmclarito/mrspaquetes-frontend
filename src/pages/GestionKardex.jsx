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
import { debounce } from "lodash";

const API_URL = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 10;

export default function GestionKardex() {
  document.title = "Kardex | Gestión";

  const [allKardexData, setAllKardexData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const [filters, setFilters] = useState({
    searchQuery: "",
    startDate: "",
    endDate: "",
  });

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = AuthService.getCurrentUser();
      const response = await axios.get(`${API_URL}/kardex`, {
        params: { per_page: 1000000 }, // Obtener todos los datos
        headers: { Authorization: `Bearer ${token}` },
      });

      setAllKardexData(response.data.data || []);
      setFilteredData(response.data.data || []);
      setTotalItems(response.data.data.length || 0);
    } catch (error) {
      console.error("Error al obtener todos los datos del Kardex:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const applyFilters = useCallback(() => {
    const filtered = allKardexData.filter((item) => {
      // Filtrar por búsqueda
      const matchesSearch =
        !filters.searchQuery ||
        (item.numero_entrada && item.numero_entrada.toLowerCase().includes(filters.searchQuery.toLowerCase())) ||
        (item.paquete_entrada && item.paquete_entrada.toLowerCase().includes(filters.searchQuery.toLowerCase())) ||
        (item.numero_salida && item.numero_salida.toLowerCase().includes(filters.searchQuery.toLowerCase())) ||
        (item.paquete_salida && item.paquete_salida.toLowerCase().includes(filters.searchQuery.toLowerCase()));
  
      // Filtrar por fechas
      const itemDateEntrada = item.fecha_entrada ? new Date(item.fecha_entrada) : null;
      const itemDateSalida = item.fecha_salida ? new Date(item.fecha_salida) : null;
  
      const matchesStartDate = (!filters.startDate || (itemDateEntrada && itemDateEntrada >= new Date(filters.startDate))) || 
                                (!filters.startDate || (itemDateSalida && itemDateSalida >= new Date(filters.startDate)));
      const matchesEndDate = (!filters.endDate || (itemDateEntrada && itemDateEntrada <= new Date(filters.endDate))) || 
                              (!filters.endDate || (itemDateSalida && itemDateSalida <= new Date(filters.endDate)));
  
      return matchesSearch && matchesStartDate && matchesEndDate;
    });
  
    setFilteredData(filtered);
    setTotalItems(filtered.length);
    setCurrentPage(1); // Reinicia a la primera página al filtrar
  }, [allKardexData, filters]);

  const debouncedFilterData = useCallback(debounce(applyFilters, 300), [filters, allKardexData]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    debouncedFilterData();
  }, [filters, debouncedFilterData]);

  const resetFilters = () => {
    setFilters({
      searchQuery: "",
      startDate: "",
      endDate: "",
    });
    setFilteredData(allKardexData); // Resetea a todos los datos
    setCurrentPage(1);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Gestión de Kardex" breadcrumbItem="Listado de Kardex" />
        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                {isLoading ? (
                  <div className="text-center">
                    <Spinner color="primary" />
                  </div>
                ) : (
                  <>
                    <Form className="mb-4">
                      <Row>
                        <Col md={4}>
                          <FormGroup>
                            <Label for="searchQuery">Buscar (N° Entrada o Paquete)</Label>
                            <Input
                              type="text"
                              name="searchQuery"
                              id="searchQuery"
                              placeholder="N° Entrada o Paquete"
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
                        <Col md={2}>
                          <FormGroup style={{ marginTop: "32px" }}>
                            <Button color="secondary" onClick={resetFilters}>
                              Limpiar Filtros
                            </Button>
                          </FormGroup>
                        </Col>
                      </Row>
                    </Form>

                    <Table responsive striped className="table-centered">
                      <thead>
                        <tr>
                          <th colSpan="6" className="text-center thEntrada">Entradas</th>
                          <th colSpan="6" className="text-center thSalida">Salidas</th>
                        </tr>
                        <tr>
                          <th>ID</th>
                          <th>Número de Entrada</th>
                          <th>Código QR</th>
                          <th>Cantidad</th>
                          <th>Tipo de Transacción</th>
                          <th>Fecha</th>
                          
                          <th>ID</th>
                          <th>Número de Salida</th>
                          <th>Código QR</th>
                          <th>Cantidad</th>
                          <th>Tipo de Transacción</th>
                          <th>Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentItems.length === 0 ? (
                          <tr>
                            <td colSpan="12" className="text-center">
                              No hay traslados disponibles
                            </td>
                          </tr>
                        ) : (
                          currentItems.map((item) => (
                            <tr key={item.id}>
                              {item.numero_entrada ? (
                                <>
                                  <td>{item.id}</td>
                                  <td>{item.numero_entrada}</td>
                                  <td>{item.paquete_entrada}</td>
                                  <td>{item.cantidad_entrada}</td>
                                  <td>{item.tipo_transaccion_entrada}</td>
                                  <td>{format(parseISO(item.fecha_entrada), "dd/MM/yyyy", { locale: es })}</td>
                                </>
                              ) : (
                                <td colSpan="6"></td>
                              )}

                              {item.numero_salida ? (
                                <>
                                  <td>{item.id}</td>
                                  <td>{item.numero_salida}</td>
                                  <td>{item.paquete_salida}</td>
                                  <td>{item.cantidad_salida}</td>
                                  <td>{item.tipo_transaccion_salida}</td>
                                  <td>{format(parseISO(item.fecha_salida), "dd/MM/yyyy", { locale: es })}</td>
                                </>
                              ) : (
                                <td colSpan="6"></td>
                              )}
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
                  </>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
