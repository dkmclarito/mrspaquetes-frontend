import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Container, Card, CardBody, Form, FormGroup, Label, Input, Button } from "reactstrap";
import Breadcrumbs from "../components/Bodegas/Common/Breadcrumbs";
import AuthService from "../services/authService";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

const API_URL = import.meta.env.VITE_API_URL;

const AgregarUbicacionPaquete = () => {
  const [codigoQRPaquete, setCodigoQRPaquete] = useState("");
  const [codigoNomenclaturaUbicacion, setCodigoNomenclaturaUbicacion] = useState("");
  const [paquetesDisponibles, setPaquetesDisponibles] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const token = AuthService.getCurrentUser();
  const navigate = useNavigate();

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
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleScannerInput = (e) => {
    const value = e.target.value;
    if (value.includes(';')) {
      const [uuid, codigoNomenclatura] = value.split(';');
      setCodigoQRPaquete(uuid.trim());
      setCodigoNomenclaturaUbicacion(codigoNomenclatura.trim());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const paqueteDisponible = paquetesDisponibles?.find(paquete => paquete.uuid === codigoQRPaquete);
    if (!paqueteDisponible) {
      toast.error("El paquete no está disponible o ya está asignado.", { position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true, });
      return;
    }

    const ubicacionDisponible = ubicaciones?.find(ubicacion => ubicacion.nomenclatura === codigoNomenclaturaUbicacion);
    if (!ubicacionDisponible) {
      toast.error("La ubicación no existe o ya está en uso.", { position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,});
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
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        onClose: () => navigate('/GestionUbicacion'),
      });
      //setTimeout(() => navigate("/GestionUbicacion"), 2000);
      
      setCodigoQRPaquete("");
      setCodigoNomenclaturaUbicacion("");
      //fetchData();
    } catch (error) {
      toast.error(`Error: ${error.message}`, { 
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,});
    }
  };

  return (
    <Container>
      <Breadcrumbs title="Registro de Ubicaciones" breadcrumbItem="Formulario" />
      <Card>
        <CardBody>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label for="codigoQR">Código QR del Paquete</Label>
              <Input
                type="text"
                id="codigoQR"
                value={codigoQRPaquete}
                onChange={e => setCodigoQRPaquete(e.target.value)}
                onKeyDown={handleScannerInput}
                placeholder="Escanea el código QR"
                required
              />
            </FormGroup>
            <FormGroup>
              <Label for="codigoUbicacion">Código Nomenclatura Ubicación</Label>
              <Input
                type="text"
                id="codigoUbicacion"
                value={codigoNomenclaturaUbicacion}
                onChange={e => setCodigoNomenclaturaUbicacion(e.target.value)}
                onKeyDown={handleScannerInput}
                placeholder="Escanea el código de ubicación"
                required
              />
            </FormGroup>
            <Button color="primary" type="submit">Guardar</Button>
            <Button color="secondary" onClick={() => navigate('/GestionUbicacion')} style={{ marginLeft: '10px' }}>Salir</Button>
          </Form>
        </CardBody>
      </Card>
      <ToastContainer />
    </Container>
  );
};

export default AgregarUbicacionPaquete;
