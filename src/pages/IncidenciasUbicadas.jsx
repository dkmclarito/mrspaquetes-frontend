import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Container, Row, Col, Card, CardBody } from "reactstrap";
import Breadcrumbs from "../components/Incidencias/Common/Breadcrumbs";
import TablaUbicacionesIncidencias from "../components/Incidencias/TablaUbicacionesIncidencias"; // Nueva tabla para incidencias ubicadas
import AuthService from "../services/authService";
import Pagination from "react-js-pagination";

const API_URL = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 5;

const IncidenciasUbicadas = () => {
  const [incidenciasUbicadas, setIncidenciasUbicadas] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const token = AuthService.getCurrentUser();

  const fetchUbicacionesIncidencias = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/ubicacion-paquetes-danados`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Datos inesperados al obtener incidencias ubicadas:", response.data);

      if (response.data && Array.isArray(response.data.data)) {
        setIncidenciasUbicadas(response.data.data);
      } else {
        console.error("Datos inesperados al obtener incidencias ubicadas:", response.data);
      }
    } catch (error) {
      console.error("Error al obtener incidencias ubicadas:", error);
    }
  }, [token]);

  useEffect(() => {
    fetchUbicacionesIncidencias();
  }, [fetchUbicacionesIncidencias]);

  const paginatedIncidenciasUbicadas = useCallback(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return incidenciasUbicadas.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [incidenciasUbicadas, currentPage]);

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Gestión de Incidencias" breadcrumbItem="Incidencias Ubicadas" />
        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <TablaUbicacionesIncidencias incidencias={paginatedIncidenciasUbicadas()} />
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col lg={12} style={{ marginTop: "20px", display: "flex", justifyContent: "center" }}>
            <Pagination
              activePage={currentPage}
              itemsCountPerPage={ITEMS_PER_PAGE}
              totalItemsCount={incidenciasUbicadas.length}
              pageRangeDisplayed={5}
              onChange={setCurrentPage}
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

export default IncidenciasUbicadas;
