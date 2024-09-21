import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Alert,
} from "reactstrap";
import Breadcrumbs from "../components/Reportes/Common/Breadcrumbs";
import axios from "axios";
import AuthService from "../services/authService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = import.meta.env.VITE_API_URL;

const Reportes = () => {
  const [reportType, setReportType] = useState("");
  const [fecha, setFecha] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFinal, setFechaFinal] = useState("");
  const [idConductor, setIdConductor] = useState("");
  const [trasladoId, setTrasladoId] = useState("");
  const [conductores, setConductores] = useState([]);
  const [error, setError] = useState("");
  const [trasladoType, setTrasladoType] = useState("individual");

  useEffect(() => {
    const fetchEmpleados = async () => {
      try {
        const token = AuthService.getCurrentUser();
        const response = await axios.get(`${API_URL}/empleados`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const filteredConductores = response.data.empleados.filter(
          (empleado) => empleado.id_cargo === 1
        );
        setConductores(filteredConductores);
      } catch (error) {
        console.error("Error al obtener empleados:", error);
        setError(
          "Error al cargar los conductores. Por favor, intente de nuevo."
        );
      }
    };

    fetchEmpleados();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const token = AuthService.getCurrentUser();
    let endpoint = "";
    let data = {};
    let method = "post";

    if (!reportType) {
      setError("Por favor, seleccione un tipo de reporte.");
      return;
    }

    switch (reportType) {
      case "asignacionesRutas":
        endpoint = `${API_URL}/reports/reporte_asignaciones_rutas_por_conductor`;
        data = { fecha, id_conductor: parseInt(idConductor, 10) };
        break;
      case "rutasRecoleccion":
        endpoint = `${API_URL}/reports/reporte_rutas_recoleccion_por_conductor`;
        data = { fecha, id_conductor: parseInt(idConductor, 10) };
        break;
      case "ventas":
        endpoint = `${API_URL}/reports/reporte_ventas`;
        data = { fecha_inicio: fechaInicio, fecha_final: fechaFinal };
        break;
      case "traslado":
        method = "get";
        if (trasladoType === "individual") {
          endpoint = `${API_URL}/traslado-pdf/${trasladoId || ""}`;
        } else {
          endpoint = `${API_URL}/traslado-pdf-general`;
        }
        break;
      default:
        setError("Por favor, seleccione un tipo de reporte válido.");
        return;
    }

    try {
      let response;
      if (method === "get") {
        response = await axios.get(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        response = await axios.post(endpoint, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }

      if (response.data && response.data.base64Encode) {
        downloadPDF(response.data.base64Encode, `${response.data.title}.pdf`);
        toast.success("Reporte generado y descargado con éxito.");
      } else {
        setError("El servidor no devolvió datos del PDF.");
      }
    } catch (error) {
      handleError(error);
    }
  };

  const downloadPDF = (base64Data, fileName) => {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const handleError = (error) => {
    console.error("Error al generar el reporte:", error);
    if (error.response) {
      if (error.response.status === 422) {
        setError("Datos inválidos. Por favor, verifique la información.");
      } else {
        setError(`Error del servidor: ${error.response.status}`);
      }
    } else {
      setError("Error de red. Por favor, intente de nuevo.");
    }
    toast.error("Error al generar el reporte. Por favor, intente de nuevo.");
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Reportes" breadcrumbItem="Generar Reporte" />
        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                {error && <Alert color="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <Label for="reportType">Tipo de Reporte</Label>
                        <Input
                          type="select"
                          name="reportType"
                          id="reportType"
                          value={reportType}
                          onChange={(e) => setReportType(e.target.value)}
                          required
                        >
                          <option value="">
                            Seleccione un tipo de reporte
                          </option>
                          <option value="asignacionesRutas">
                            Asignaciones de Rutas por Conductor
                          </option>
                          <option value="rutasRecoleccion">
                            Rutas de Recolección por Conductor
                          </option>
                          <option value="ventas">Reporte de Ventas</option>
                          <option value="traslado">Reporte de Traslado</option>
                        </Input>
                      </FormGroup>
                    </Col>

                    {(reportType === "asignacionesRutas" ||
                      reportType === "rutasRecoleccion") && (
                      <>
                        <Col md={3}>
                          <FormGroup>
                            <Label for="fecha">Fecha</Label>
                            <Input
                              type="date"
                              name="fecha"
                              id="fecha"
                              value={fecha}
                              onChange={(e) => setFecha(e.target.value)}
                              required
                            />
                          </FormGroup>
                        </Col>
                        <Col md={3}>
                          <FormGroup>
                            <Label for="idConductor">Conductor</Label>
                            <Input
                              type="select"
                              name="idConductor"
                              id="idConductor"
                              value={idConductor}
                              onChange={(e) => setIdConductor(e.target.value)}
                              required
                            >
                              <option value="">Seleccione un conductor</option>
                              {conductores.map((conductor) => (
                                <option key={conductor.id} value={conductor.id}>
                                  {`${conductor.nombres} ${conductor.apellidos}`}
                                </option>
                              ))}
                            </Input>
                          </FormGroup>
                        </Col>
                      </>
                    )}

                    {reportType === "ventas" && (
                      <>
                        <Col md={3}>
                          <FormGroup>
                            <Label for="fechaInicio">Fecha de Inicio</Label>
                            <Input
                              type="date"
                              name="fechaInicio"
                              id="fechaInicio"
                              value={fechaInicio}
                              onChange={(e) => setFechaInicio(e.target.value)}
                              required
                            />
                          </FormGroup>
                        </Col>
                        <Col md={3}>
                          <FormGroup>
                            <Label for="fechaFinal">Fecha Final</Label>
                            <Input
                              type="date"
                              name="fechaFinal"
                              id="fechaFinal"
                              value={fechaFinal}
                              onChange={(e) => setFechaFinal(e.target.value)}
                              required
                            />
                          </FormGroup>
                        </Col>
                      </>
                    )}

                    {reportType === "traslado" && (
                      <>
                        <Col md={3}>
                          <FormGroup>
                            <Label for="trasladoType">Tipo de Traslado</Label>
                            <Input
                              type="select"
                              name="trasladoType"
                              id="trasladoType"
                              value={trasladoType}
                              onChange={(e) => setTrasladoType(e.target.value)}
                              required
                            >
                              <option value="individual">
                                Individual/Múltiple
                              </option>
                              <option value="general">General</option>
                            </Input>
                          </FormGroup>
                        </Col>
                        {trasladoType === "individual" && (
                          <Col md={3}>
                            <FormGroup>
                              <Label for="trasladoId">
                                ID de Traslado (opcional)
                              </Label>
                              <Input
                                type="text"
                                name="trasladoId"
                                id="trasladoId"
                                value={trasladoId}
                                onChange={(e) => setTrasladoId(e.target.value)}
                                placeholder="Deje en blanco para todos los traslados"
                              />
                            </FormGroup>
                          </Col>
                        )}
                      </>
                    )}
                  </Row>

                  <Button color="primary" type="submit">
                    Generar Reporte
                  </Button>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Reportes;
