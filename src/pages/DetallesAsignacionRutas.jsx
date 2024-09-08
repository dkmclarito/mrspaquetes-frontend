import React, { useEffect, useState, useCallback } from "react"
import { Card, CardBody, Col, Row, Badge, Spinner } from "reactstrap"
import { Link, useParams } from "react-router-dom"
import Breadcrumbs from "../components/AsignacionRutas/Common/Breadcrumbs"
import axios from "axios"
import AuthService from "../services/authService"

const API_URL = import.meta.env.VITE_API_URL

const DetallesAsignacionRutas = () => {
  const { id } = useParams()
  const [asignacion, setAsignacion] = useState(null)
  const [paquete, setPaquete] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const verificarEstadoUsuarioLogueado = useCallback(async () => {
    try {
      const token = AuthService.getCurrentUser()
      const userId = localStorage.getItem("userId")
      if (userId && token) {
        const response = await fetch(`${API_URL}/auth/show/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const responseData = await response.json()
        console.log("Respuesta de verificación de usuario:", responseData)

        if (responseData.status === "Token is Invalid") {
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

  useEffect(() => {
    verificarEstadoUsuarioLogueado()

    const interval = setInterval(() => {
      verificarEstadoUsuarioLogueado()
    }, 30000)

    return () => clearInterval(interval)
  }, [verificarEstadoUsuarioLogueado])

  useEffect(() => {
    const fetchAsignacionDetails = async () => {
      setLoading(true)
      try {
        const token = AuthService.getCurrentUser()
        const response = await axios.get(`${API_URL}/asignacionrutas/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        console.log("Datos de la asignación recibidos:", response.data)
        setAsignacion(response.data.asignacionRuta)
        setLoading(false)
      } catch (error) {
        console.error("Error al obtener los detalles de la asignación:", error)
        setError("Error al obtener los detalles de la asignación. Por favor, intente nuevamente.")
        setLoading(false)
      }
    }

    fetchAsignacionDetails()
  }, [id])

  useEffect(() => {
    const fetchPaqueteDetails = async () => {
      if (asignacion) {
        try {
          const token = AuthService.getCurrentUser()
          const response = await axios.get(`${API_URL}/dropdown/get_paquetes_sin_asignar?id_asignacion_ruta=${asignacion.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          console.log("Datos del paquete recibidos:", response.data)
          // Assuming the API returns an array of packages, we'll use the first one
          setPaquete(response.data.paquetes[0])
        } catch (error) {
          console.error("Error al obtener los detalles del paquete:", error)
          setError("Error al obtener los detalles del paquete. Por favor, intente nuevamente.")
        }
      }
    }

    fetchPaqueteDetails()
  }, [asignacion])

  if (loading) {
    return (
      <div className="page-content">
        <Spinner color="primary" />
        <p>Cargando detalles de la asignación...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-content">
        <p>Error: {error}</p>
      </div>
    )
  }

  if (!asignacion) {
    return <p>No se encontraron detalles para esta asignación.</p>
  }

  console.log("Detalles de la asignación:", asignacion)
  console.log("Detalles del paquete:", paquete)

  const getEstadoLabel = (estado) => {
    return estado === 1 ? "Activo" : "Inactivo"
  }

  const getEstadoColor = (estado) => {
    return estado === 1 ? "success" : "danger"
  }

  return (
    <div className="page-content">
      <Breadcrumbs title="Gestión de Asignación de Rutas" breadcrumbItem="Detalles de Asignación" />
      <Card>
        <CardBody>
          <h5 className="card-title">Detalles de la Asignación de Ruta</h5>
          <Row>
            <Col sm="12">
              <div className="table-responsive">
                <table className="table table-bordered">
                  <tbody>
                    <tr>
                      <th scope="row" style={{ width: '200px', whiteSpace: 'nowrap' }}>ID:</th>
                      <td>
                        <Badge color="primary">{asignacion.id}</Badge>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">Código Único de Asignación:</th>
                      <td>{asignacion.codigo_unico_asignacion || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th scope="row">ID de Ruta:</th>
                      <td>{asignacion.id_ruta || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th scope="row">ID de Vehículo:</th>
                      <td>{asignacion.id_vehiculo || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th scope="row">Paquete:</th>
                      <td>{paquete ? paquete.asignacion : 'Cargando...'}</td>
                    </tr>
                    <tr>
                      <th scope="row">Fecha:</th>
                      <td>{asignacion.fecha ? new Date(asignacion.fecha).toLocaleDateString('es-ES') : 'N/A'}</td>
                    </tr>
                    <tr>
                      <th scope="row">Estado:</th>
                      <td>
                        <Badge color={getEstadoColor(asignacion.id_estado)}>
                          {getEstadoLabel(asignacion.id_estado)}
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">Fecha de Creación:</th>
                      <td>{asignacion.created_at ? new Date(asignacion.created_at).toLocaleString('es-ES') : 'N/A'}</td>
                    </tr>
                    <tr>
                      <th scope="row">Fecha de Actualización:</th>
                      <td>{asignacion.updated_at ? new Date(asignacion.updated_at).toLocaleString('es-ES') : 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Col>
          </Row>
          <div className="d-flex justify-content-between mt-4">
            <Link to="/GestionAsignarRutas" className="btn btn-secondary btn-regresar">
              <i className="fas fa-arrow-left"></i> Regresar
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

export default DetallesAsignacionRutas