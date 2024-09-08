import React, { useEffect, useState, useCallback } from "react";
import { Card, CardBody, Col, Row, Badge } from "reactstrap";
import { Link, useParams } from "react-router-dom";
import Breadcrumbs from "../components/Usuarios/Common/Breadcrumbs";
import axios from "axios";
import AuthService from "../services/authService";

const API_URL = import.meta.env.VITE_API_URL;

const DetallesBodega = () => {
  const { id } = useParams(); 
  const [bodega, setBodega] = useState(null);
  const [departamentos, setDepartamentos] = useState([]); // Estado para almacenar todos los departamentos
  const [municipios, setMunicipios] = useState([]); // Estado para almacenar los municipios filtrados
  const [departamentoNombre, setDepartamentoNombre] = useState(""); // Estado para el nombre del departamento
  const [municipioNombre, setMunicipioNombre] = useState(""); // Estado para el nombre del municipio

  // Verificar el estado del usuario logueado
  const verificarEstadoUsuarioLogueado = useCallback(async () => {
    try {
      const token = AuthService.getCurrentUser();
      const userId = localStorage.getItem("userId");
      if (userId && token) {
        const response = await fetch(`${API_URL}/auth/show/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const responseData = await response.json();

        if (responseData.status === "Token is Invalid") {
          console.error("Token is invalid. Logging out...");
          AuthService.logout();
          window.location.href = "/login";
          return;
        }
      }
    } catch (error) {
      console.error("Error al verificar el estado del usuario:", error);
    }
  }, []);

  useEffect(() => {
    verificarEstadoUsuarioLogueado();

    const interval = setInterval(() => {
      verificarEstadoUsuarioLogueado();
    }, 30000);

    return () => clearInterval(interval);
  }, [verificarEstadoUsuarioLogueado]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = AuthService.getCurrentUser();

        // Obtener los detalles de la bodega
        const bodegaResponse = await axios.get(`${API_URL}/bodegas/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const bodegaData = bodegaResponse.data.bodegas;
        setBodega(bodegaData);

        // Obtener todos los departamentos
        const departamentosResponse = await axios.get(`${API_URL}/dropdown/get_departamentos`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const departamentosData = departamentosResponse.data;
        setDepartamentos(departamentosData);

        // Filtrar el nombre del departamento basado en el id_departamento de la bodega
        const departamento = departamentosData.find(d => d.id === bodegaData.id_departamento);
        if (departamento) {
          setDepartamentoNombre(departamento.nombre);

          // Obtener los municipios del departamento seleccionado
          const municipiosResponse = await axios.get(`${API_URL}/dropdown/get_municipio/${departamento.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setMunicipios(municipiosResponse.data.municipio);
        }
        
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (bodega && municipios.length > 0) {
      // Filtrar el nombre del municipio basado en el id_municipio de la bodega
      const municipio = municipios.find(m => m.id === bodega.id_municipio);
      if (municipio) {
        setMunicipioNombre(municipio.nombre);
      }
    }
  }, [bodega, municipios]);

  if (!bodega) {
    return <p>Cargando...</p>;
  }

  return (
    <div className="page-content">
      <Breadcrumbs title="Gestión de Bodegas" breadcrumbItem="Datos de la Bodega" />        
      <Card>
        <CardBody>
          <h5 className="card-title">Detalles de la Bodega</h5>
          <Row>
            <Col sm="12">
              <div className="table-responsive">
                <table className="table table-bordered">
                  <tbody>
                    <tr>
                      <th scope="row" style={{ width: '150px', whiteSpace: 'nowrap' }}>ID:</th>
                      <td>
                        <Badge color="primary"> {bodega.id} </Badge>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">Nombre:</th>
                      <td>{bodega.nombre || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th scope="row">Tipo bodega:</th>
                      <td>{bodega.tipo_bodega || 'N/A'}</td>
                    </tr>  
                    <tr>
                      <th scope="row">Departamento:</th>
                      <td>{departamentoNombre || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th scope="row">Municipio:</th>
                      <td>{municipioNombre || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th scope="row">Dirección:</th>
                      <td>{bodega.direccion || 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Col>
          </Row>
          <div className="d-flex justify-content-between mt-4">
            <Link to="/GestionBodegas" className="btn btn-secondary btn-regresar">
              <i className="fas fa-arrow-left"></i> Regresar
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default DetallesBodega;
