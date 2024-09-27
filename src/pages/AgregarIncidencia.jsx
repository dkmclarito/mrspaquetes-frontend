import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, FormGroup, Label, Input, Button, Alert, Modal, ModalHeader, ModalBody, Table } from 'reactstrap';
import Select from 'react-select';
import AuthService from '../services/authService';
import { useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from "react-toastify";
import jsQR from "jsqr";
import "react-toastify/dist/ReactToastify.css";
import Pagination from 'react-js-pagination'; // Importar la librería de paginación

const API_URL = import.meta.env.VITE_API_URL;

const ITEMS_PER_PAGE = 5; // Define cuántos elementos por página

const AgregarIncidencia = () => {
  const navigate = useNavigate();

  const [uuidPaquete, setUuidPaquete] = useState(null);
  const [idTipoIncidencia, setIdTipoIncidencia] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipoIncidencias, setTipoIncidencias] = useState([]);
  const [paquetesDanio, setPaquetesDanio] = useState([]);
  const [alertaExito, setAlertaExito] = useState(false);
  const [alertaError, setAlertaError] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState('');
  const [modalPaquetes, setModalPaquetes] = useState(false);
  const [paquetesDisponibles, setPaquetesDisponibles] = useState([]);
  const [roleName, setRoleName] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // Estado para la búsqueda
  const [currentPage, setCurrentPage] = useState(1); // Estado para la paginación

  const token = AuthService.getCurrentUser();
  const userId = localStorage.getItem('userId');

  // Estado y refs para la funcionalidad de escaneo
  const [escaneandoQR, setEscaneandoQR] = useState(false);
  const videoRefQR = useRef(null);
  const canvasRefQR = useRef(null);

  const customStyles = {
    option: (provided) => ({
      ...provided,
      color: 'black',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'black',
    }),
  };

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await axios.get(`${API_URL}/auth/show/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRoleName(response.data.user.role_name);
      } catch (error) {
        console.error('Error al obtener el rol del usuario:', error);
      }
    };

    fetchUserRole();
  }, [userId, token]);

  useEffect(() => {
    const fetchTipoIncidencias = async () => {
      try {
        const response = await axios.get(`${API_URL}/dropdown/get_tipo_incidencia`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTipoIncidencias(response.data.tipo_incidencia || []);
      } catch (error) {
        console.error('Error al obtener tipos de incidencias:', error);
        setAlertaError(true);
        setErrorMensaje('Error al obtener tipos de incidencias. Intente nuevamente más tarde.');
      }
    };

    fetchTipoIncidencias();
  }, [token]);

  useEffect(() => {
    if (roleName === "acompanante") {
      const fetchPaquetesDanio = async () => {
        try {
          const response = await axios.get(`${API_URL}/dropdown/get_paquetes_usuario/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.status === 200 && Array.isArray(response.data)) {
            setPaquetesDanio(response.data);
          } else {
            throw new Error('Datos inesperados al obtener paquetes');
          }
        } catch (error) {
          console.error('Error al obtener paquetes:', error);
          setAlertaError(true);
          setErrorMensaje('Error al obtener paquetes. Intente nuevamente más tarde.');
        }
      };

      fetchPaquetesDanio();
    } else {
      const fetchPaquetesDisponibles = async () => {
        try {
          const response = await axios.get(`${API_URL}/paquete`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setPaquetesDisponibles(response.data.data || []);
        } catch (error) {
          console.error('Error al obtener paquetes disponibles:', error);
          setAlertaError(true);
          setErrorMensaje('Error al obtener paquetes. Intente nuevamente más tarde.');
        }
      };

      fetchPaquetesDisponibles();
    }
  }, [roleName, token, userId]);

  // Función para iniciar el escaneo de QR
  const iniciarEscaneoQR = useCallback(() => {
    setEscaneandoQR(true);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(function (stream) {
          if (videoRefQR.current) {
            videoRefQR.current.srcObject = stream;
            videoRefQR.current.play();
          }
        })
        .catch(function (error) {
          console.error("No se pudo acceder a la cámara para escanear QR", error);
          toast.error("No se pudo acceder a la cámara para escanear QR");
        });
    }
  }, []);

  const detenerEscaneoQR = useCallback(() => {
    setEscaneandoQR(false);
    if (videoRefQR.current && videoRefQR.current.srcObject) {
      videoRefQR.current.srcObject.getTracks().forEach(track => track.stop());
    }
  }, []);

  const escanearFrameQR = useCallback(() => {
    if (videoRefQR.current && canvasRefQR.current && escaneandoQR) {
      const canvas = canvasRefQR.current;
      const video = videoRefQR.current;

      if (video.videoWidth === 0 || video.videoHeight === 0) {
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code) {
          const paqueteSeleccionado = paquetesDanio.find(paquete => paquete.uuid === code.data);
          if (paqueteSeleccionado) {
            setUuidPaquete({ value: paqueteSeleccionado.id, label: paqueteSeleccionado.uuid });
            toast.success("Código QR escaneado con éxito");
            detenerEscaneoQR();
          } else {
            toast.error("El paquete escaneado no está disponible para incidencia");
          }
        }
      }
    }
  }, [escaneandoQR, paquetesDanio, detenerEscaneoQR]);

  useEffect(() => {
    let intervalId;
    if (escaneandoQR) {
      intervalId = setInterval(() => {
        escanearFrameQR();
      }, 100); // Escanea cada 100ms
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [escaneandoQR, escanearFrameQR]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fechaHoraActual = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const incidenciaData = {
      id_paquete: uuidPaquete ? uuidPaquete.value : '',
      id_tipo_incidencia: idTipoIncidencia,
      descripcion,
      estado: '1',
      fecha_hora: fechaHoraActual,
      fecha_resolucion: null,
      id_usuario_reporta: userId,
      id_usuario_asignado: null,
      solucion: 'Pendiente',
    };

    try {
      const response = await axios.post(`${API_URL}/incidencias`, incidenciaData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        setAlertaExito(true);
        setTimeout(() => {
          setAlertaExito(false);
          navigate('/MisIncidencias', { replace: true });
        }, 3000);
      } else {
        setAlertaError(true);
        setErrorMensaje('Error al agregar incidencia. Intente nuevamente.');
      }
    } catch (error) {
      setAlertaError(true);
      const mensajeError = error.response ? error.response.data.message : 'Error al agregar incidencia';
      setErrorMensaje(mensajeError);
    }
  };

  const toggleModalPaquetes = () => {
    setModalPaquetes(!modalPaquetes);
  };

  const seleccionarPaquete = (paquete) => {
    setUuidPaquete({ value: paquete.id, label: paquete.uuid });
    toggleModalPaquetes();
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const paquetesFiltrados = paquetesDisponibles.filter(paquete => 
    paquete.uuid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedPaquetes = paquetesFiltrados.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <Container fluid>
      <Row>
        <Col>
          <h4>Agregar Incidencia</h4>
          {alertaExito && <Alert color="success">Incidencia agregada exitosamente</Alert>}
          {alertaError && <Alert color="danger">{errorMensaje}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label for="id_tipo_incidencia">Tipo de Incidencia</Label>
                  <Input
                    type="select"
                    id="id_tipo_incidencia"
                    value={idTipoIncidencia}
                    onChange={(e) => setIdTipoIncidencia(e.target.value)}
                    required
                  >
                    <option value="">Seleccione un tipo de incidencia</option>
                    {tipoIncidencias.map((tipo) => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.nombre}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </Col>

              <Col md="6">
                {roleName === "acompanante" ? (
                  <FormGroup>
                    <Label for="uuid_paquete">Paquete con incidencia</Label>
                    <div className="d-flex align-items-center">
                      <Select
                        id="uuid_paquete"
                        value={uuidPaquete}
                        onChange={(selectedOption) => setUuidPaquete(selectedOption)}
                        options={paquetesDanio.map((paquete) => ({
                          value: paquete.id,
                          label: paquete.uuid,
                        }))}
                        placeholder="Buscar por descripción"
                        isSearchable
                        required
                        styles={customStyles}
                        className="flex-grow-1"
                      />
                      <Button color="primary" onClick={iniciarEscaneoQR} disabled={escaneandoQR} style={{ marginLeft: '10px' }}>
                        Escanear QR
                      </Button>
                    </div>
                  </FormGroup>
                ) : (
                  <FormGroup>
                    <Label for="uuid_paquete">Paquete con incidencia</Label>
                    <div className="d-flex">
                      <Input
                        type="text"
                        id="uuid_paquete"
                        value={uuidPaquete ? uuidPaquete.label : ""}
                        readOnly
                        required
                        style={{ height: '80%', width: '70%' }}
                      />
                      <Button color="primary" onClick={toggleModalPaquetes} style={{ marginLeft: '10px' }}>
                        Seleccionar
                      </Button>
                    </div>
                  </FormGroup>
                )}
              </Col>
            </Row>

            {(escaneandoQR) && (
              <Row className="mt-3">
                <Col md={12}>
                  <div style={{ position: 'relative', width: '100%', maxWidth: '400px', margin: '0 auto' }}>
                    <video
                      ref={videoRefQR}
                      style={{ width: '100%', maxWidth: '400px', display: 'block' }}
                      playsInline
                    ></video>
                    <canvas
                      ref={canvasRefQR}
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
                  <Button
                    color="danger"
                    onClick={detenerEscaneoQR}
                    style={{ marginTop: '10px' }}
                  >
                    Detener Escaneo QR
                  </Button>
                </Col>
              </Row>
            )}

            <Row>
              <Col md="12">
                <FormGroup>
                  <Label for="descripcion">Descripción</Label>
                  <Input
                    type="textarea"
                    id="descripcion"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    required
                  />
                </FormGroup>
              </Col>
            </Row>

            <Button type="submit" color="primary">
              Agregar Incidencia
            </Button>{' '}
            <Link to="/GestionIncidencias" className="btn btn-secondary btn-regresar">
              <i className="fas fa-arrow-left"></i> Regresar
            </Link>
          </Form>
        </Col>
      </Row>

      <Modal isOpen={modalPaquetes} toggle={toggleModalPaquetes} size="lg">
        <ModalHeader toggle={toggleModalPaquetes}>Seleccionar Paquete</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Input
              type="text"
              placeholder="Buscar por UUID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </FormGroup>
          <Table bordered>
            <thead>
              <tr>
                <th>ID</th>
                <th>UUID</th>
                <th>Descripción</th>
                <th>Tamaño</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPaquetes.map(paquete => (
                <tr key={paquete.id}>
                  <td>{paquete.id}</td>
                  <td>{paquete.uuid}</td>
                  <td>{paquete.descripcion_contenido}</td>
                  <td>{paquete.tamano_paquete}</td>
                  <td>
                    <Button color="primary" onClick={() => seleccionarPaquete(paquete)}>
                      Seleccionar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination
            activePage={currentPage}
            itemsCountPerPage={ITEMS_PER_PAGE}
            totalItemsCount={paquetesFiltrados.length}
            pageRangeDisplayed={5}
            onChange={handlePageChange}
            itemClass="page-item"
            linkClass="page-link"
            innerClass="pagination"
          />
        </ModalBody>
      </Modal>

      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </Container>
  );
};

export default AgregarIncidencia;
