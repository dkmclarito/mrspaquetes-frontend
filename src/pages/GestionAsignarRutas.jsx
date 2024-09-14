import React, { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { Container, Row, Col, Card, CardBody, Input, Label } from "reactstrap"
import { Link } from "react-router-dom"
import Breadcrumbs from "../components/AsignacionRutas/Common/Breadcrumbs"
import TablaAsignacionRutas from "../components/AsignacionRutas/TablaAsignarRuta"
import Pagination from 'react-js-pagination'
import { toast } from "react-toastify"
import ModalConfirmarEliminar from "../components/AsignacionRutas/ModalConfirmarEliminarAR"
import ModalEditarAsignacionRuta from "../components/AsignacionRutas/ModalEditarAsignarRuta"
import AuthService from "../services/authService"

const API_URL = import.meta.env.VITE_API_URL
const ITEMS_PER_PAGE = 10

export default function GestionAsignarRutas() {
  const [asignaciones, setAsignaciones] = useState([])
  const [busqueda, setBusqueda] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [modalEliminar, setModalEliminar] = useState(false)
  const [modalEditar, setModalEditar] = useState(false)
  const [asignacionSeleccionada, setAsignacionSeleccionada] = useState(null)
  const [rutas, setRutas] = useState([])
  const [vehiculos, setVehiculos] = useState([])
  const [paquetes, setPaquetes] = useState([])
  const [estados, setEstados] = useState([])

  const verificarEstadoUsuarioLogueado = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userId")
      const token = AuthService.getCurrentUser()

      if (userId && token) {
        const response = await axios.get(`${API_URL}/auth/show/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (response.data.status === "Token is Invalid") {
          console.error("Token is invalid. Logging out...")
          AuthService.logout()
          window.location.href = "/login"
          return
        }
      }
    } catch (error) {
      console.error("Error al verificar el estado del usuario:", error)
    }
  }, [])

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token")
      const [asignacionesRes, rutasRes, vehiculosRes, paquetesRes, estadosRes] = await Promise.all([
        axios.get(`${API_URL}/asignacionrutas`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/dropdown/get_rutas`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/dropdown/get_vehiculos`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/dropdown/get_paquetes_sin_asignar`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/dropdown/get_estado_rutas`, { headers: { Authorization: `Bearer ${token}` } })
      ])

      const asignacionesData = asignacionesRes.data.asignacionrutas || []
      console.log("Asignaciones fetched:", asignacionesData)
      setAsignaciones(asignacionesData)
      setRutas(rutasRes.data.rutas || [])
      setVehiculos(vehiculosRes.data.vehiculos || [])
      setPaquetes(paquetesRes.data.paquetes || [])
      setEstados(estadosRes.data.estado_rutas || [])
    } catch (error) {
      console.error("Error al obtener asignaciones:", error)
      toast.error("Error al cargar las asignaciones de rutas")
    }
  }, [])

  useEffect(() => {
    verificarEstadoUsuarioLogueado()
    fetchData()
  }, [verificarEstadoUsuarioLogueado, fetchData])

  const iniciarEliminarAsignacion = useCallback((id) => {
    setAsignacionSeleccionada(id)
    setModalEliminar(true)
  }, [])

  const confirmarEliminarAsignacion = async () => {
    try {
      const token = localStorage.getItem("token")
      await axios.delete(`${API_URL}/asignacionrutas/${asignacionSeleccionada}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success("Asignación eliminada con éxito")
      await fetchData()
      setModalEliminar(false)
    } catch (error) {
      console.error("Error al eliminar la asignación:", error)
      toast.error("Error al eliminar la asignación")
    }
  }

  const iniciarEditarAsignacion = (asignacion) => {
    setAsignacionSeleccionada(asignacion)
    setModalEditar(true)
  }

  const guardarCambiosAsignacion = async (asignacionEditada) => {
    try {
      const token = localStorage.getItem("token")
      await axios.put(`${API_URL}/asignacionrutas/${asignacionEditada.id}`, asignacionEditada, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success("Asignación actualizada con éxito")
      await fetchData()
      setModalEditar(false)
    } catch (error) {
      console.error("Error al actualizar la asignación:", error)
      toast.error("Error al actualizar la asignación")
    }
  }

  const handleSearchChange = (e) => {
    setBusqueda(e.target.value)
    setCurrentPage(1)
  }

  const filtrarAsignaciones = useCallback(() => {
    console.log("Filtering asignaciones. Current asignaciones:", asignaciones)
    console.log("Current búsqueda:", busqueda)
    if (!busqueda) return asignaciones
    return asignaciones.filter(
      (asignacion) =>
        asignacion.codigo_unico_asignacion &&
        asignacion.codigo_unico_asignacion.toLowerCase().includes(busqueda.toLowerCase())
    )
  }, [asignaciones, busqueda])

  const asignacionesFiltradas = filtrarAsignaciones()
  console.log("Asignaciones filtradas:", asignacionesFiltradas)

  const totalItems = Array.isArray(asignacionesFiltradas) ? asignacionesFiltradas.length : 0
  const paginatedAsignaciones = Array.isArray(asignacionesFiltradas) 
    ? asignacionesFiltradas.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
    : []

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Gestión de Asignación de Rutas" breadcrumbItem="Listado de Asignaciones" />
        <Row>
          <Col lg={12}>
            <div style={{ marginTop: "10px", display: "flex", alignItems: "center" }}>
              <Label for="busqueda" style={{ marginRight: "10px" }}>Buscar:</Label>
              <Input
                type="text"
                id="busqueda"
                value={busqueda}
                onChange={handleSearchChange}
                placeholder="Buscar por código de asignación"
                style={{ width: "500px" }}
              />
              <div style={{ marginLeft: "auto" }}>
                <Link to="/SeleccionarPaquetes" className="btn btn-primary">
                  <i className="fas fa-plus"></i> Agregar Asignación
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
                <TablaAsignacionRutas
                  asignaciones={paginatedAsignaciones}
                  eliminarAsignacion={iniciarEliminarAsignacion}
                  editarAsignacion={iniciarEditarAsignacion}
                  rutas={rutas}
                  vehiculos={vehiculos}
                  paquetes={paquetes}
                  estados={estados}
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col lg={12} style={{ marginTop: "20px", display: "flex", justifyContent: "center" }}>
            <Pagination
              activePage={currentPage}
              itemsCountPerPage={ITEMS_PER_PAGE}
              totalItemsCount={totalItems}
              pageRangeDisplayed={5}
              onChange={handlePageChange}
              itemClass="page-item"
              linkClass="page-link"
              innerClass="pagination"
            />
          </Col>
        </Row>
      </Container>
      <ModalConfirmarEliminar
        isOpen={modalEliminar}
        toggle={() => setModalEliminar(!modalEliminar)}
        confirmarEliminar={confirmarEliminarAsignacion}
      />
      <ModalEditarAsignacionRuta
        isOpen={modalEditar}
        toggle={() => setModalEditar(!modalEditar)}
        asignacion={asignacionSeleccionada}
        guardarCambios={guardarCambiosAsignacion}
        rutas={rutas}
        vehiculos={vehiculos}
        paquetes={paquetes}
        estados={estados}
      />
    </div>
  )
}