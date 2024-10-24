import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Card, CardBody, Input, Label } from "reactstrap";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Breadcrumbs from "../components/Recoleccion/Common/Breadcrumbs";
import TablaRutasRecoleccion from "../components/Recoleccion/TablaRutasRecoleccion";
import Pagination from "react-js-pagination";
import AuthService from "../services/authService";

const API_URL = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 10;

const GestionOrdenesDeRecoleccion = () => {
  document.title = "Ordenes de Recolección | Mr. Paquetes";
  const [rutasRecoleccion, setRutasRecoleccion] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalOrdenes, setTotalOrdenes] = useState(0);
  const [vehiculos, setVehiculos] = useState([]);
  const [estados, setEstados] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();

  const verificarEstadoUsuarioLogueado = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userId");
      const token = AuthService.getCurrentUser()?.token;

      if (userId && token) {
        const response = await axios.get(`${API_URL}/auth/show/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.status === "Token is Invalid") {
          console.error("Token is invalid. Logging out...");
          AuthService.logout();
          window.location.href = "/login";
          return;
        }
      }
    } catch (error) {
      console.error("Error al verificar el estado del usuario:", error);
      toast.error("Error al verificar el estado del usuario.");
    }
  }, []);

  const fetchData = useCallback(async (page = 1) => {
    try {
      const token = localStorage.getItem("token");

      const [rutasRes, vehiculosRes, estadosRes] = await Promise.all([
        axios.get(
          `${API_URL}/rutas-recolecciones?page=${page}&per_page=${ITEMS_PER_PAGE}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.get(`${API_URL}/dropdown/get_vehiculos`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/dropdown/get_estado_rutas`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const rutasData = rutasRes.data.data || [];
      const rutasConEstado = await Promise.all(
        rutasData.map(async (ruta) => {
          const ordenesRes = await axios.get(
            `${API_URL}/rutas-recolecciones/${ruta.id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const ordenes = ordenesRes.data.ordenes_recolecciones || [];

          const puedeIniciar = ordenes.some(
            (orden) => orden.estado !== 0 && !orden.recoleccion_iniciada
          );

          const puedeFinalizar = ordenes.some(
            (orden) =>
              orden.estado !== 0 &&
              orden.recoleccion_iniciada &&
              !orden.recoleccion_finalizada
          );

          return { ...ruta, puedeIniciar, puedeFinalizar };
        })
      );

      setRutasRecoleccion(rutasConEstado);
      setTotalItems(rutasRes.data.total || 0);

      const totalOrdenes = rutasConEstado.reduce(
        (total, ruta) => total + (ruta.ordenes_recolecciones?.length || 0),
        0
      );
      setTotalOrdenes(totalOrdenes);

      setVehiculos(vehiculosRes.data.vehiculos || []);
      setEstados(estadosRes.data.estado_rutas || []);
    } catch (error) {
      console.error("Error al obtener datos:", error);
      toast.error("Error al cargar los datos.");
    }
  }, []);

  useEffect(() => {
    verificarEstadoUsuarioLogueado();
    fetchData();
  }, [verificarEstadoUsuarioLogueado, fetchData]);

  const handleSearchChange = (e) => {
    setBusqueda(e.target.value);
    setCurrentPage(1);
  };

  const filtrarRutas = useCallback(() => {
    if (!busqueda) return rutasRecoleccion;
    return rutasRecoleccion.filter(
      (ruta) =>
        ruta.nombre &&
        ruta.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [rutasRecoleccion, busqueda]);

  const rutasFiltradas = filtrarRutas();

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    fetchData(pageNumber);
  };

  const verDetallesRuta = (id) => {
    navigate(`/detalles-ruta-recoleccion/${id}`, {
      state: { from: "/gestion-de-ordenes-recoleccion" },
    });
  };

  const iniciarRecoleccion = async (rutaId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/rutas-recolecciones/${rutaId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const rutaConPaquetes = {
        ...response.data,
        ordenes_recolecciones: await Promise.all(
          response.data.ordenes_recolecciones.map(async (orden) => {
            const detallesOrden = await axios.get(
              `${API_URL}/ordenes/${orden.id_orden}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            return { ...orden, paquetes: detallesOrden.data.detalles };
          })
        ),
      };

      console.log("Información de la ruta y sus órdenes:", rutaConPaquetes);

      if (
        !rutaConPaquetes.ordenes_recolecciones ||
        rutaConPaquetes.ordenes_recolecciones.length === 0
      ) {
        toast.warning("No hay órdenes de recolección asociadas a esta ruta.");
        return;
      }

      let ordenesIniciadas = 0;
      let errores = 0;

      for (const orden of rutaConPaquetes.ordenes_recolecciones) {
        try {
          await axios.post(
            `${API_URL}/orden-recoleccion/asignar-recoleccion/${orden.id}`,
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          ordenesIniciadas++;
        } catch (ordenError) {
          console.error(
            `Error al iniciar la recolección para la orden ${orden.id}:`,
            ordenError
          );
          errores++;
        }
      }

      if (ordenesIniciadas > 0) {
        toast.success(
          `Recolección iniciada con éxito para ${ordenesIniciadas} órdenes de la ruta ${rutaConPaquetes.nombre}`
        );
      } else if (errores > 0) {
        toast.error(
          `No se pudo iniciar la recolección para ninguna orden. Se encontraron ${errores} errores.`
        );
      } else {
        toast.info(
          `No se iniciaron nuevas recolecciones para la ruta ${rutaConPaquetes.nombre}.`
        );
      }

      fetchData(currentPage);
    } catch (error) {
      console.error("Error al iniciar la recolección:", error);
      toast.error(
        "Error al iniciar la recolección: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const finalizarRecoleccion = async (rutaId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/rutas-recolecciones/${rutaId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const rutaConPaquetes = {
        ...response.data,
        ordenes_recolecciones: await Promise.all(
          response.data.ordenes_recolecciones.map(async (orden) => {
            const detallesOrden = await axios.get(
              `${API_URL}/ordenes/${orden.id_orden}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            return { ...orden, paquetes: detallesOrden.data.detalles };
          })
        ),
      };

      console.log(
        "Información de la ruta y sus órdenes para finalizar:",
        rutaConPaquetes
      );

      if (
        !rutaConPaquetes.ordenes_recolecciones ||
        rutaConPaquetes.ordenes_recolecciones.length === 0
      ) {
        toast.warning(
          "No hay órdenes de recolección asociadas a esta ruta para finalizar."
        );
        return;
      }

      let ordenesFInalizadas = 0;
      let errores = 0;

      for (const orden of rutaConPaquetes.ordenes_recolecciones) {
        try {
          await axios.post(
            `${API_URL}/orden-recoleccion/finalizar-orden-recoleccion/${orden.id}`,
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          ordenesFInalizadas++;
        } catch (ordenError) {
          console.error(
            `Error al finalizar la recolección para la orden ${orden.id}:`,
            ordenError
          );
          errores++;
        }
      }

      if (ordenesFInalizadas > 0) {
        toast.success(
          `Recolección finalizada con éxito para ${ordenesFInalizadas} órdenes de la ruta ${rutaConPaquetes.nombre}`
        );
      } else if (errores > 0) {
        toast.error(
          `No se pudo finalizar la recolección para ninguna orden. Se encontraron ${errores} errores.`
        );
      } else {
        toast.info(
          `No se finalizaron nuevas recolecciones para la ruta ${rutaConPaquetes.nombre}.`
        );
      }

      fetchData(currentPage);
    } catch (error) {
      console.error("Error al finalizar la recolección:", error);
      toast.error(
        "Error al finalizar la recolección: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs
          title="Gestión de Rutas de Recolección"
          breadcrumbItem="Listado de Rutas"
        />
        <Row>
          <Col lg={12}>
            <div
              style={{
                marginTop: "10px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Label for="busqueda" style={{ marginRight: "10px" }}>
                Buscar:
              </Label>
              <Input
                type="text"
                id="busqueda"
                value={busqueda}
                onChange={handleSearchChange}
                placeholder="Buscar por código de ruta"
                style={{ width: "300px" }}
              />
            </div>
          </Col>
        </Row>
        <br />
        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <TablaRutasRecoleccion
                  rutas={rutasFiltradas}
                  vehiculos={vehiculos}
                  estados={estados}
                  verDetallesRuta={verDetallesRuta}
                  iniciarRecoleccion={iniciarRecoleccion}
                  finalizarRecoleccion={finalizarRecoleccion}
                  totalOrdenes={totalOrdenes}
                  userPermissions="acompanante"
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col
            lg={12}
            style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "center",
            }}
          >
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
    </div>
  );
};

export default GestionOrdenesDeRecoleccion;
