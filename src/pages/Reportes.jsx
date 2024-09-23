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
  InputGroup,
  InputGroupText,
} from "reactstrap";
import {
  FaFileAlt,
  FaCalendarAlt,
  FaUser,
  FaTruck,
  FaDownload,
  FaSearch,
  FaTimes,
} from "react-icons/fa";
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
  const [trasladoType, setTrasladoType] = useState("individual");
  const [isLoading, setIsLoading] = useState(false);
  const [traslados, setTraslados] = useState([]);
  const [filteredTraslados, setFilteredTraslados] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [trasladoSearch, setTrasladoSearch] = useState("");

  useEffect(() => {
    const fetchEmpleados = async () => {
      try {
        setIsLoading(true);
        const token = AuthService.getCurrentUser();
        const response = await axios.get(`${API_URL}/empleados`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const filteredConductores = response.data.empleados.filter(
          (empleado) => empleado.id_cargo === 1
        );
        setConductores(filteredConductores);
      } catch (error) {
        handleError(error, "Error al obtener empleados");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmpleados();
  }, []);

  useEffect(() => {
    if (reportType === "traslado" && trasladoType === "individual") {
      fetchTraslados();
    }
  }, [reportType, trasladoType]);

  const fetchTraslados = async () => {
    try {
      setIsLoading(true);
      const token = AuthService.getCurrentUser();
      const response = await axios.get(`${API_URL}/traslados`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sortedTraslados = response.data.data.sort(
        (a, b) => new Date(b.fecha_traslado) - new Date(a.fecha_traslado)
      );
      setTraslados(sortedTraslados);
      setFilteredTraslados(sortedTraslados.slice(0, 5));
    } catch (error) {
      handleError(error, "Error al obtener traslados");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const filtered = traslados
      .filter(
        (traslado) =>
          traslado.numero_traslado
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          traslado.bodega_origen
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          traslado.bodega_destino
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      )
      .filter(
        (traslado) =>
          !dateFilter ||
          new Date(traslado.fecha_traslado).toISOString().split("T")[0] ===
            dateFilter
      );
    setFilteredTraslados(filtered);
  }, [searchTerm, dateFilter, traslados]);

  const filteredTrasladoOptions = traslados.filter(
    (traslado) =>
      traslado.numero_traslado
        .toLowerCase()
        .includes(trasladoSearch.toLowerCase()) ||
      traslado.bodega_origen
        .toLowerCase()
        .includes(trasladoSearch.toLowerCase()) ||
      traslado.bodega_destino
        .toLowerCase()
        .includes(trasladoSearch.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const token = AuthService.getCurrentUser();
    let endpoint = "";
    let data = {};
    let method = "post";

    if (!reportType) {
      toast.error("Seleccione un tipo de reporte");
      setIsLoading(false);
      return;
    }

    try {
      switch (reportType) {
        case "asignacionesRutas":
        case "rutasRecoleccion":
          endpoint =
            reportType === "asignacionesRutas"
              ? `${API_URL}/reports/reporte_asignaciones_rutas_por_conductor`
              : `${API_URL}/reports/reporte_rutas_recoleccion_por_conductor`;
          data = { fecha, id_conductor: parseInt(idConductor, 10) };
          break;
        case "ventas":
          endpoint = `${API_URL}/reports/reporte_ventas`;
          data = { fecha_inicio: fechaInicio, fecha_final: fechaFinal };
          break;
        case "traslado":
          method = "get";
          endpoint =
            trasladoType === "individual"
              ? `${API_URL}/traslado-pdf${trasladoId ? `/${trasladoId}` : ""}`
              : `${API_URL}/traslado-pdf-general`;
          break;
        default:
          throw new Error("Tipo de reporte no válido");
      }

      let response;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      if (method === "get") {
        response = await axios.get(endpoint, config);
      } else {
        response = await axios.post(endpoint, data, config);
      }

      if (
        response.data &&
        response.data.message === "No se encontraron datos"
      ) {
        throw new Error("No hay datos para este reporte");
      }

      let pdfBase64;
      let fileName;

      if (response.data && response.data.base64Encode) {
        pdfBase64 = response.data.base64Encode;
        fileName = generateFileName(reportType, response.data.title);
      } else if (
        response.data &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        pdfBase64 = response.data[0];
        fileName = generateFileName(reportType);
      } else {
        throw new Error("Formato de respuesta inválido");
      }

      if (typeof pdfBase64 === "string" && pdfBase64.length > 0) {
        downloadPDF(pdfBase64, fileName);
        toast.success(`Reporte descargado: ${fileName}`);
      } else {
        throw new Error("Datos del PDF inválidos");
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateFileName = (reportType, baseTitle = "") => {
    const currentDate = new Date().toISOString().split("T")[0];
    let fileName = baseTitle || "Reporte";

    switch (reportType) {
      case "asignacionesRutas":
        const conductorAsignaciones = conductores.find(
          (c) => c.id === parseInt(idConductor, 10)
        );
        fileName = `Asignaciones_Rutas_${
          conductorAsignaciones
            ? conductorAsignaciones.nombres.split(" ")[0]
            : "Conductor"
        }_${fecha}`;
        break;
      case "rutasRecoleccion":
        const conductorRutas = conductores.find(
          (c) => c.id === parseInt(idConductor, 10)
        );
        fileName = `Rutas_Recoleccion_${
          conductorRutas ? conductorRutas.nombres.split(" ")[0] : "Conductor"
        }_${fecha}`;
        break;
      case "ventas":
        fileName = `Ventas_${fechaInicio}_a_${fechaFinal}`;
        break;
      case "traslado":
        if (trasladoType === "individual" && trasladoId) {
          const trasladoSeleccionado = traslados.find(
            (t) => t.id === parseInt(trasladoId, 10)
          );
          if (trasladoSeleccionado) {
            const fechaTraslado = new Date(trasladoSeleccionado.fecha_traslado)
              .toISOString()
              .split("T")[0];
            fileName = `Traslado_${trasladoSeleccionado.numero_traslado}_${trasladoSeleccionado.bodega_origen}_a_${trasladoSeleccionado.bodega_destino}_${fechaTraslado}`;
          } else {
            fileName = `Traslado_${trasladoId}_${currentDate}`;
          }
        } else {
          fileName = `Traslado_${trasladoType === "individual" ? "Multiple" : "General"}_${currentDate}`;
        }
        break;
      default:
        fileName = `${fileName}_${currentDate}`;
    }

    return `${fileName}.pdf`;
  };

  const downloadPDF = (base64Data, fileName) => {
    try {
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
    } catch (error) {
      handleError(error, `Error al descargar ${fileName}`);
    }
  };

  const handleError = (error, context = "Error") => {
    console.error(`${context}:`, error);
    let errorMessage = "";

    if (axios.isAxiosError(error)) {
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = "No hay datos para este reporte";
        } else if (error.response.status === 422) {
          errorMessage = "Datos inválidos. Verifique los campos";
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = `Error ${error.response.status}`;
        }
      } else if (error.request) {
        errorMessage = "Sin respuesta del servidor. Verifique su conexión";
      } else {
        errorMessage = "Error en la solicitud";
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = "Error desconocido";
    }

    toast.error(errorMessage);
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Reportes" breadcrumbItem="Generar Reporte" />
        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <Label for="reportType">
                          <FaFileAlt className="mr-1" /> Tipo de Reporte
                        </Label>
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
                            <Label for="fecha">
                              <FaCalendarAlt className="mr-1" /> Fecha
                            </Label>
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
                            <Label for="idConductor">
                              <FaUser className="mr-1" /> Conductor
                            </Label>
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
                            <Label for="fechaInicio">
                              <FaCalendarAlt className="mr-1" /> Fecha de Inicio
                            </Label>
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
                            <Label for="fechaFinal">
                              <FaCalendarAlt className="mr-1" /> Fecha Final
                            </Label>
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
                            <Label for="trasladoType">
                              <FaTruck className="mr-1" /> Tipo de Traslado
                            </Label>
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
                          <Col md={6}>
                            <FormGroup>
                              <Label for="trasladoId">
                                <FaTruck className="mr-1" /> Traslado (opcional)
                              </Label>
                              <Input
                                type="date"
                                name="dateFilter"
                                id="dateFilter"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="mb-2"
                              />
                              <InputGroup>
                                <Input
                                  type="text"
                                  placeholder="Buscar traslado..."
                                  value={trasladoSearch}
                                  onChange={(e) =>
                                    setTrasladoSearch(e.target.value)
                                  }
                                />
                                <InputGroupText>
                                  {trasladoSearch ? (
                                    <FaTimes
                                      style={{ cursor: "pointer" }}
                                      onClick={() => setTrasladoSearch("")}
                                    />
                                  ) : (
                                    <FaSearch />
                                  )}
                                </InputGroupText>
                              </InputGroup>
                              <Input
                                type="select"
                                name="trasladoId"
                                id="trasladoId"
                                value={trasladoId}
                                onChange={(e) => setTrasladoId(e.target.value)}
                                className="mt-2"
                              >
                                <option value="">Seleccione un traslado</option>
                                {filteredTrasladoOptions.map((traslado) => (
                                  <option key={traslado.id} value={traslado.id}>
                                    {`${traslado.numero_traslado} - ${traslado.bodega_origen} a ${traslado.bodega_destino}`}
                                  </option>
                                ))}
                              </Input>
                            </FormGroup>
                          </Col>
                        )}
                      </>
                    )}
                  </Row>

                  <Button color="primary" type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm mr-1"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Generando...
                      </>
                    ) : (
                      <>
                        <FaDownload className="mr-1" /> Generar Reporte
                      </>
                    )}
                  </Button>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default Reportes;
