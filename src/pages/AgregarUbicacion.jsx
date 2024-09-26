import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { Container, Card, CardBody, Form, FormGroup, Label, Input, Button, Row, Col } from "reactstrap";
import Breadcrumbs from "../components/Bodegas/Common/Breadcrumbs";
import AuthService from "../services/authService";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import jsQR from "jsqr";
import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat } from '@zxing/library';

const API_URL = import.meta.env.VITE_API_URL;

const AgregarUbicacionPaquete = () => {
  const [codigoQRPaquete, setCodigoQRPaquete] = useState("");
  const [codigoNomenclaturaUbicacion, setCodigoNomenclaturaUbicacion] = useState("");
  const [paquetesDisponibles, setPaquetesDisponibles] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [escaneandoQR, setEscaneandoQR] = useState(false);
  const [escaneandoBarcode, setEscaneandoBarcode] = useState(false);
  const token = AuthService.getCurrentUser();
  const navigate = useNavigate();
  const videoRefQR = useRef(null);
  const canvasRefQR = useRef(null);
  const videoRefBarcode = useRef(null);
  const canvasRefBarcode = useRef(null);
  const codeReaderRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      const [paquetesResponse, ubicacionesResponse] = await Promise.all([
        axios.get(`${API_URL}/paquete/paquetes-asignables`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/dropdown/get_Ubicaciones_SinPaquetes`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setPaquetesDisponibles(paquetesResponse.data.data || []);
      setUbicaciones((ubicacionesResponse.data || []).filter(ubicacion => !ubicacion.paquete_asignado));
    } catch (error) {
      console.error("Error al obtener datos:", error);
      //toast.error("Error al cargar los datos");
    }
  }, [token]);

  useEffect(() => {
    fetchData();
    const hints = new Map();
    const formats = [BarcodeFormat.QR_CODE, BarcodeFormat.CODE_128, BarcodeFormat.EAN_13, BarcodeFormat.CODE_39];
    hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
    codeReaderRef.current = new BrowserMultiFormatReader(hints);
    return () => {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
    };
  }, [fetchData]);

  const iniciarEscaneo = useCallback((tipo) => {
    const setEscaneando = tipo === 'QR' ? setEscaneandoQR : setEscaneandoBarcode;
    const videoRef = tipo === 'QR' ? videoRefQR : videoRefBarcode;

    setEscaneando(true);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(function(stream) {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
            console.log(`Cámara activada para escaneo de ${tipo}`);
          }
        })
        .catch(function(error) {
          console.error(`No se pudo acceder a la cámara para ${tipo}`, error);
          toast.error(`No se pudo acceder a la cámara para escaneo de ${tipo}`);
        });
    }
  }, []);

  const detenerEscaneo = useCallback((tipo) => {
    const setEscaneando = tipo === 'QR' ? setEscaneandoQR : setEscaneandoBarcode;
    const videoRef = tipo === 'QR' ? videoRefQR : videoRefBarcode;

    setEscaneando(false);
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    console.log(`Escaneo de ${tipo} detenido`);
  }, []);

  const validarCodigoBarras = (codigo) => {
    console.log("Validando código:", codigo);
    if (/^B\d+P\d+E\d+AN\d+_[A-Z]+$/.test(codigo) || /^\d+$/.test(codigo)) {
      console.log("Código válido");
      return true;
    }
    console.log("Código no válido");
    return false;
  };

  const escanearFrame = useCallback((tipo) => {
    const videoRef = tipo === 'QR' ? videoRefQR : videoRefBarcode;
    const canvasRef = tipo === 'QR' ? canvasRefQR : canvasRefBarcode;
    const escaneando = tipo === 'QR' ? escaneandoQR : escaneandoBarcode;
    const setCodigo = tipo === 'QR' ? setCodigoQRPaquete : setCodigoNomenclaturaUbicacion;

    if (videoRef.current && canvasRef.current && escaneando) {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.log("Video no listo aún");
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        if (tipo === 'QR') {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code) {
            console.log("Código QR detectado:", code.data);
            setCodigo(code.data);
            detenerEscaneo(tipo);
           // toast.success("Código QR escaneado con éxito");
          }
        } else if (codeReaderRef.current) {
          codeReaderRef.current.decodeOnce(video)
            .then((result) => {
              const codigoDetectado = result.getText();
              console.log("Código de barras detectado:", codigoDetectado);
              if (validarCodigoBarras(codigoDetectado)) {
                setCodigo(codigoDetectado);
                detenerEscaneo(tipo);
                //toast.success("Código de barras escaneado con éxito");
              } else {
                console.log("Código de barras no válido:", codigoDetectado);
                toast.warning("Código de barras no válido, intente de nuevo");
              }
            })
            .catch((err) => {
              console.log("Error en decodeOnce:", err);
            });
        }
      }
    }
  }, [escaneandoQR, escaneandoBarcode, detenerEscaneo, setCodigoQRPaquete, setCodigoNomenclaturaUbicacion]);

  useEffect(() => {
    let intervalId;
    if (escaneandoQR || escaneandoBarcode) {
      intervalId = setInterval(() => {
        escanearFrame(escaneandoQR ? 'QR' : 'Barcode');
      }, 100); // Escanea cada 100ms
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [escaneandoQR, escaneandoBarcode, escanearFrame]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const paqueteDisponible = paquetesDisponibles?.find(paquete => paquete.uuid === codigoQRPaquete);
    if (!paqueteDisponible) {
      toast.error("El paquete no está disponible o ya está asignado.");
      return;
    }

    const ubicacionDisponible = ubicaciones?.find(ubicacion => ubicacion.nomenclatura === codigoNomenclaturaUbicacion);
    if (!ubicacionDisponible) {
      toast.error("La ubicación no existe o ya está en uso.");
      return;
    }

    const ubicacionPaqueteData = {
      codigo_qr_paquete: codigoQRPaquete,
      codigo_nomenclatura_ubicacion: codigoNomenclaturaUbicacion,
      estado: 1,
    };

    try {
      const response = await fetch(`${API_URL}/ubicaciones-paquetes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(ubicacionPaqueteData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al registrar la ubicación del paquete.");
      }

      toast.success("¡Ubicación registrada con éxito!", {
        autoClose: 3000,
        onClose: () => {
          navigate('/GestionUbicacion');
        }
      });
      
      setCodigoQRPaquete("");
      setCodigoNomenclaturaUbicacion("");
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }
  };

  return (
    <Container>
      <Breadcrumbs title="Registro de Ubicaciones" breadcrumbItem="Formulario" />
      <Card>
        <CardBody>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={12}>
                <FormGroup>
                  <Label for="codigoQR">Código QR del Paquete</Label>
                  <div className="d-flex">
                    <Input
                      type="text"
                      id="codigoQR"
                      value={codigoQRPaquete}
                      onChange={e => setCodigoQRPaquete(e.target.value)}
                      placeholder="Escanea el código QR"
                      required
                      style={{height: '80%', width: '70%'}}
                    />
                    <Button color="primary" onClick={() => iniciarEscaneo('QR')} disabled={escaneandoQR} style={{ marginLeft: '10px' }}>
                      Escanear QR
                    </Button>
                  </div>
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label for="codigoUbicacion">Código Nomenclatura Ubicación</Label>
                  <div className="d-flex">
                    <Input
                      type="text"
                      id="codigoUbicacion"
                      value={codigoNomenclaturaUbicacion}
                      onChange={e => setCodigoNomenclaturaUbicacion(e.target.value)}
                      placeholder="Escanea el código de barras"
                      required
                      style={{height: '80%', width: '70%'}}
                    />
                    <Button color="primary" onClick={() => iniciarEscaneo('Barcode')} disabled={escaneandoBarcode} style={{ marginLeft: '10px' }}>
                      Escanear Código de Barras
                    </Button>
                  </div>
                </FormGroup>
              </Col>
            </Row>
            {(escaneandoQR || escaneandoBarcode) && (
              <Row className="mt-3">
                <Col md={12}>
                  <div style={{ position: 'relative', width: '100%', maxWidth: '400px', margin: '0 auto' }}>
                    <video 
                      ref={escaneandoQR ? videoRefQR : videoRefBarcode} 
                      style={{ width: '100%', maxWidth: '400px', display: 'block' }}
                      playsInline
                    ></video>
                    <canvas 
                      ref={escaneandoQR ? canvasRefQR : canvasRefBarcode} 
                      style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        width: '100%', 
                        height: '100%',
                        opacity: 0.5
                      }}
                    ></canvas>
                  </div>
                  <Button color="danger" onClick={() => detenerEscaneo(escaneandoQR ? 'QR' : 'Barcode')} style={{ marginTop: '10px' }}>
                    Detener Escaneo {escaneandoQR ? 'QR' : 'Barcode'}
                  </Button>
                </Col>
              </Row>
            )}
            <Row className="mt-3">
              <Col md={12}>
                <Button color="primary" type="submit">Guardar</Button>
                <Button className="btn-custom-red" onClick={() => navigate('/GestionUbicacion')} style={{ marginLeft: '10px' }}>Salir</Button>
              </Col>
            </Row>
          </Form>
        </CardBody>
      </Card>
      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </Container>
  );
};

export default AgregarUbicacionPaquete;