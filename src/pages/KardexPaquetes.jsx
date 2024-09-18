import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Container, Row, Col, Card, CardBody } from "reactstrap";
import Breadcrumbs from "../components/kardex/Common/Breadcrumbs"; // Ajusta el path si es necesario
//import TablaKardexPaquetes from "../components/Kardex/TablaKardexPaquetes"; // Nueva tabla para mostrar los paquetes en el Kardex
import AuthService from "../services/authService";
import Pagination from "react-js-pagination";

const API_URL = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 5;

const KardexPaquetes = () => {
  const [paquetesUbicados, setPaquetesUbicados] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const token = AuthService.getCurrentUser();

  const fetchUbicacionesPaquetes = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/ubicaciones-paquetes`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && Array.isArray(response.data.data)) {
        setPaquetesUbicados(response.data.data);
      } else {
        console.error("Datos inesperados al obtener ubicaciones de paquetes:", response.data);
      }
    } catch (error) {
      console.error("Error al obtener ubicaciones de paquetes:", error);
    }
  }, [token]);

  useEffect(() => {
    fetchUbicacionesPaquetes();
  }, [fetchUbicacionesPaquetes]);

  const paginatedPaquetesUbicados = useCallback(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return paquetesUbicados.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [paquetesUbicados, currentPage]);

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Gestión de Kardex" breadcrumbItem="Kardex de Paquetes" />
        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <TablaKardexPaquetes paquetes={paginatedPaquetesUbicados()} />
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col lg={12} style={{ marginTop: "20px", display: "flex", justifyContent: "center" }}>
            <Pagination
              activePage={currentPage}
              itemsCountPerPage={ITEMS_PER_PAGE}
              totalItemsCount={paquetesUbicados.length}
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

export default KardexPaquetes;
