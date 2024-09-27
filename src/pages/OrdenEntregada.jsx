import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  CardBody,
  Col,
  Row,
  Container,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Table,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import Breadcrumbs from "../components/Vehiculos/Common/Breadcrumbs";
import AuthService from "../services/authService";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "../styles/Vehiculos.css";
import { FaUpload, FaQrcode, FaCamera, FaCheck } from "react-icons/fa";
import jsQR from "jsqr";

const API_URL = import.meta.env.VITE_API_URL;

const OrdenEntregada = () => {
  const [idPaquete, setIdPaquete] = useState("");
  const [imagen, setImagen] = useState(null);
  const [escaneandoQR, setEscaneandoQR] = useState(false);
  const [ordenInfo, setOrdenInfo] = useState(null);
  const [modalFinalizarVisible, setModalFinalizarVisible] = useState(false);
  const [paquetesPendientes, setPaquetesPendientes] = useState(false);
  const navigate = useNavigate();
  const token = AuthService.getCurrentUser();
  const videoRefQR = useRef(null);
  const canvasRefQR = useRef(null);

  const verificarEstadoUsuarioLogueado = useCallback(async () => {
    try {
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
  }, [token]);

  useEffect(() => {
    verificarEstadoUsuarioLogueado();
    const interval = setInterval(verificarEstadoUsuarioLogueado, 30000);
    return () => clearInterval(interval);
  }, [verificarEstadoUsuarioLogueado]);

  const handleIdPaqueteChange = (e) => {
    setIdPaquete(e.target.value);
  };

  const handleImagenChange = (e) => {
    if (e.target.files[0]) {
      setImagen(e.target.files[0]);
    }
  };

  const iniciarEscaneoQR = useCallback(() => {
    setEscaneandoQR(true);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "environment" } })
        .then(function (stream) {
          if (videoRefQR.current) {
            videoRefQR.current.srcObject = stream;
            videoRefQR.current.play();
          }
        })
        .catch(function (error) {
          console.error("No se pudo acceder a la cámara para QR", error);
          toast.error("No se pudo acceder a la cámara para escaneo de QR");
        });
    }
  }, []);

  const detenerEscaneoQR = useCallback(() => {
    setEscaneandoQR(false);
    if (videoRefQR.current && videoRefQR.current.srcObject) {
      videoRefQR.current.srcObject.getTracks().forEach((track) => track.stop());
    }
  }, []);

  const escanearFrameQR = useCallback(() => {
    if (videoRefQR.current && canvasRefQR.current && escaneandoQR) {
      const canvas = canvasRefQR.current;
      const video = videoRefQR.current;
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code) {
          console.log("Código QR detectado:", code.data);
          setIdPaquete(code.data);
          detenerEscaneoQR();
          toast.success("Código QR escaneado con éxito");
        }
      }
    }
  }, [escaneandoQR, detenerEscaneoQR]);

  useEffect(() => {
    let intervalId;
    if (escaneandoQR) {
      intervalId = setInterval(escanearFrameQR, 100); // Escanea cada 100ms
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [escaneandoQR, escanearFrameQR]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!idPaquete || !imagen) {
      toast.error(
        "Por favor, proporciona el código QR del paquete y selecciona una imagen.",
        {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
      return;
    }

    const formData = new FormData();
    formData.append("uuid", idPaquete);
    formData.append("validacion_entrega", imagen);

    try {
      const response = await axios.post(
        `${API_URL}/validacion-entrega`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Paquete validado exitosamente!", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Obtener información de la orden después de validar el paquete
      await fetchOrdenInfo(idPaquete);

      resetForm();
    } catch (error) {
      handleError(error);
    }
  };

  const fetchOrdenInfo = async (uuid) => {
    try {
      // Primero, obtener el paquete usando el UUID
      const paqueteResponse = await axios.get(`${API_URL}/paquete/${uuid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const paqueteId = paqueteResponse.data.id;

      // Luego, buscar la orden que contiene este paquete
      let allOrdenes = [];
      let currentPage = 1;
      let hasNextPage = true;
      let ordenEncontrada = null;

      while (hasNextPage && !ordenEncontrada) {
        const response = await axios.get(`${API_URL}/ordenes`, {
          params: { page: currentPage },
          headers: { Authorization: `Bearer ${token}` },
        });

        ordenEncontrada = response.data.data.find((orden) =>
          orden.detalles.some((detalle) => detalle.id_paquete === paqueteId)
        );

        if (ordenEncontrada) {
          // Obtener todos los paquetes de la orden
          const paquetesPromises = ordenEncontrada.detalles.map((detalle) =>
            axios.get(`${API_URL}/paquete/${detalle.id_paquete}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          );
          const paquetesResponses = await Promise.all(paquetesPromises);
          const paquetes = paquetesResponses.map((response) => response.data);

          setOrdenInfo({
            ...ordenEncontrada,
            paquetes: paquetes,
          });
          setPaquetesPendientes(
            paquetes.some((paquete) => paquete.estado_paquete !== "Entregado")
          );
          break;
        }

        if (response.data.next_page_url) {
          currentPage++;
        } else {
          hasNextPage = false;
        }
      }

      if (!ordenEncontrada) {
        toast.error("No se encontró la orden asociada a este paquete");
      }
    } catch (error) {
      console.error("Error al obtener información de la orden:", error);
      toast.error("Error al obtener información de la orden");
    }
  };

  const resetForm = () => {
    setIdPaquete("");
    setImagen(null);
  };

  const handleError = (error) => {
    let errorMessage = "Hubo un error al validar el paquete.";
    if (error.response && error.response.data) {
      errorMessage = error.response.data.message || errorMessage;
    }
    toast.error(errorMessage, { position: "bottom-right", autoClose: 5000 });
  };

  const handleFinalizarOrden = () => {
    if (paquetesPendientes) {
      setModalFinalizarVisible(true);
    } else {
      finalizarOrden();
    }
  };

  const finalizarOrden = async () => {
    try {
      await axios.post(
        `${API_URL}/finalizar-orden`,
        {
          numero_seguimiento: ordenInfo.numero_seguimiento,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Orden finalizada con éxito");
      setOrdenInfo(null);
      setModalFinalizarVisible(false);
    } catch (error) {
      console.error("Error al finalizar la orden:", error);
      toast.error("Error al finalizar la orden");
    }
  };

  return (
    <Container>
      <Breadcrumbs
        title="Validación de la Entrega del Paquete"
        breadcrumbItem="Validar Entrega"
      />
      <Row>
        <Col lg="12">
          <Card>
            <CardBody>
              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <FaQrcode style={{ marginRight: "8px" }} />
                  <Label for="idPaquete">Codigo Qr del Paquete</Label>
                  <div className="d-flex">
                    <Input
                      type="text"
                      id="idPaquete"
                      value={idPaquete}
                      onChange={handleIdPaqueteChange}
                      required
                      style={{ width: "60%" }}
                    />
                    <Button
                      color="primary"
                      onClick={iniciarEscaneoQR}
                      disabled={escaneandoQR}
                      style={{
                        marginLeft: "10px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <FaCamera style={{ marginRight: "5px" }} />
                      Escanear QR
                    </Button>
                  </div>
                </FormGroup>
                <FormGroup>
                  <FaUpload style={{ marginRight: "8px" }} />
                  <Label for="imagen">Imagen de Entrega</Label>
                  <Input
                    type="file"
                    id="imagen"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImagenChange}
                    required
                    style={{ width: "70%" }}
                  />
                </FormGroup>
                <Button type="submit" color="primary">
                  Validar Entrega
                </Button>
              </Form>
              {escaneandoQR && (
                <Row className="mt-3">
                  <Col md={12}>
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        maxWidth: "400px",
                        margin: "0 auto",
                      }}
                    >
                      <video
                        ref={videoRefQR}
                        style={{
                          width: "100%",
                          maxWidth: "400px",
                          display: "block",
                        }}
                        playsInline
                      ></video>
                      <canvas
                        ref={canvasRefQR}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          opacity: 0.5,
                        }}
                      ></canvas>
                    </div>
                    <Button
                      color="danger"
                      onClick={detenerEscaneoQR}
                      style={{ marginTop: "10px" }}
                    >
                      Detener Escaneo QR
                    </Button>
                  </Col>
                </Row>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      {ordenInfo && (
        <Row className="mt-4">
          <Col lg="12">
            <Card>
              <CardBody>
                <h4>Información de la Orden</h4>
                <p>
                  <strong>Número de Seguimiento:</strong>{" "}
                  {ordenInfo.numero_seguimiento}
                </p>
                <Table responsive>
                  <thead>
                    <tr>
                      <th>ID Paquete</th>
                      <th>Descripción</th>
                      <th>Estado</th>
                      <th>Tipo</th>
                      <th>Peso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordenInfo.paquetes.map((paquete) => (
                      <tr
                        key={paquete.id}
                        className={
                          paquete.estado_paquete === "Entregado"
                            ? "table-success"
                            : ""
                        }
                      >
                        <td>{paquete.id}</td>
                        <td>{paquete.descripcion_contenido}</td>
                        <td>{paquete.estado_paquete}</td>
                        <td>{paquete.tipo_paquete}</td>
                        <td>{paquete.peso} kg</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <Button
                  color="success"
                  onClick={handleFinalizarOrden}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <FaCheck style={{ marginRight: "5px" }} />
                  Finalizar Orden
                </Button>
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}

      <Modal
        isOpen={modalFinalizarVisible}
        toggle={() => setModalFinalizarVisible(!modalFinalizarVisible)}
      >
        <ModalHeader
          toggle={() => setModalFinalizarVisible(!modalFinalizarVisible)}
        >
          Confirmar Finalización de Orden
        </ModalHeader>
        <ModalBody>
          <p>
            Hay paquetes pendientes de entrega. ¿Está seguro de que desea
            finalizar la orden?
          </p>
          <p>Si hubo un problema al entregar, debe reportar la incidencia.</p>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={finalizarOrden}>
            Finalizar Orden
          </Button>{" "}
          <Button
            color="secondary"
            onClick={() => setModalFinalizarVisible(false)}
          >
            Cancelar
          </Button>
        </ModalFooter>
      </Modal>

      <ToastContainer />
    </Container>
  );
};

export default OrdenEntregada;
