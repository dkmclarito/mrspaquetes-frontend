"use client"

import React, { useState, useEffect, useCallback } from "react"
import axios from "axios"
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
} from "reactstrap"
import Pagination from "react-js-pagination"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import Breadcrumbs from "../components/Bodegas/Common/Breadcrumbs"
import AuthService from "../services/authService"
import { debounce } from "lodash"

const API_URL = import.meta.env.VITE_API_URL
const ITEMS_PER_PAGE = 10

export default function GestionKardex() {
  document.title = "Kardex | Gestión"
  const [allKardexData, setAllKardexData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState({
    searchQuery: "",
    startDate: "",
    endDate: "",
  })
  const [isFiltered, setIsFiltered] = useState(false)

  const fetchAllData = useCallback(async () => {
    setIsLoading(true)
    try {
      const token = AuthService.getCurrentUser()
      const response = await axios.get(`${API_URL}/kardex`, {
        params: {
          per_page: 1000000, // Un número grande para obtener todos los datos
        },
        headers: { Authorization: `Bearer ${token}` },
      })

      setAllKardexData(response.data.data || [])
      setTotalItems(response.data.data.length || 0)
    } catch (error) {
      console.error("Error al obtener todos los datos del Kardex:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchPagedData = useCallback(async (page = 1) => {
    setIsLoading(true)
    try {
      const token = AuthService.getCurrentUser()
      const response = await axios.get(`${API_URL}/kardex`, {
        params: {
          page: page,
          per_page: ITEMS_PER_PAGE,
        },
        headers: { Authorization: `Bearer ${token}` },
      })

      setFilteredData(response.data.data || [])
      setTotalItems(response.data.pagination.total || 0)
      setCurrentPage(response.data.pagination.current_page || 1)
    } catch (error) {
      console.error("Error al obtener datos paginados del Kardex:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPagedData()
  }, [fetchPagedData])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }))
  }

  const filterData = useCallback(() => {
    if (allKardexData.length === 0) {
      fetchAllData().then(() => {
        applyFilters()
      })
    } else {
      applyFilters()
    }
  }, [allKardexData, filters, fetchAllData])

  const applyFilters = () => {
    const filtered = allKardexData.filter((item) => {
      const matchesSearch =
        !filters.searchQuery ||
        item.numero_ingreso.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        item.uuid.toLowerCase().includes(filters.searchQuery.toLowerCase())

      const itemDate = new Date(item.fecha)
      const matchesStartDate = !filters.startDate || itemDate >= new Date(filters.startDate)
      const matchesEndDate = !filters.endDate || itemDate <= new Date(filters.endDate)

      return matchesSearch && matchesStartDate && matchesEndDate
    })

    setFilteredData(filtered)
    setTotalItems(filtered.length)
    setIsFiltered(true)
    setCurrentPage(1)
  }

  const debouncedFilterData = useCallback(debounce(filterData, 300), [filterData])

  useEffect(() => {
    debouncedFilterData()
  }, [filters, debouncedFilterData])

  const resetFilters = () => {
    setFilters({
      searchQuery: "",
      startDate: "",
      endDate: "",
    })
    setIsFiltered(false)
    setCurrentPage(1)
    fetchPagedData(1)
  }

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
    if (!isFiltered) {
      fetchPagedData(pageNumber)
    }
  }

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE
  const currentItems = isFiltered
    ? filteredData.slice(indexOfFirstItem, indexOfLastItem)
    : filteredData

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Gestión de Kardex" breadcrumbItem="Listado de Kardex" />
        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <Form className="mb-4">
                  <Row>
                    <Col md={4}>
                      <FormGroup>
                        <Label for="searchQuery">Buscar (N° Ingreso o QR)</Label>
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
                      {currentItems.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="text-center">
                            No hay traslados disponibles
                          </td>
                        </tr>
                      ) : (
                        currentItems.map((item) => (
                          <tr key={item.id}>
                            <td>{item.id}</td>
                            <td>{item.id_orden}</td>
                            <td>{item.cantidad}</td>
                            <td>{item.numero_ingreso}</td>
                            <td>{item.uuid}</td>
                            <td>{item.tipo_movimiento}</td>
                            <td>{item.tipo_transaccion}</td>
                            <td>
                              {format(parseISO(item.fecha.split("T")[0]), "dd/MM/yyyy", {
                                locale: es,
                              })}
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
  )
}