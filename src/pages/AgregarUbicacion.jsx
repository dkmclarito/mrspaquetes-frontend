import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Card,
  CardBody,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from "reactstrap";
import Breadcrumbs from "../components/Bodegas/Common/Breadcrumbs";
import AuthService from "../services/authService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const AgregarUbicacionPaquete = () => {
  const [codigoQRPaquete, setCodigoQRPaquete] = useState("");
  const [codigoNomenclaturaUbicacion, setCodigoNomenclaturaUbicacion] = useState(""); 
  const [modal, setModal] = useState(false);
  const token = AuthService.getCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    const verificarEstadoUsuarioLogueado = async () => {
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
          }
        }
      } catch (error) {
        console.error("Error al verificar el estado del usuario:", error);
      }
    };

    verificarEstadoUsuarioLogueado();
    const interval = setInterval(verificarEstadoUsuarioLogueado, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const handleScannerInput = (e) => {
    const value = e.target.value;
    if (value.includes(';')) {
      const [codigoQR, codigoNomenclatura] = value.split(';');
      setCodigoQRPaquete(codigoQR.trim());
      setCodigoNomenclaturaUbicacion(codigoNomenclatura.trim());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      } else {
        toast.success("¡Ubicación del paquete registrada con éxito!", {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
        });
      }

      setCodigoQRPaquete("");
      setCodigoNomenclaturaUbicacion(""); 
    } catch (error) {
      toast.error(`Error al registrar la ubicación del paquete: ${error.message}`, {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });
    }
  };

  return (
    <Container>
      <Breadcrumbs title="Formulario de Registro de Ubicaciones de Paquetes" breadcrumbItem="Ingrese la información" />
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
                onKeyDown={handleScannerInput} // Manejar el escaneo
                placeholder="Escanee el código QR del paquete"
              />
            </FormGroup>
            <FormGroup>
              <Label for="codigoUbicacion">Código de Nomenclatura de Ubicación</Label>
              <Input
                type="text"
                id="codigoUbicacion"
                value={codigoNomenclaturaUbicacion}
                onChange={e => setCodigoNomenclaturaUbicacion(e.target.value)}
                onKeyDown={handleScannerInput} // Manejar el escaneo
                placeholder="Escanee el código de nomenclatura de ubicación"
              />
            </FormGroup>
            <Button color="primary" type="submit">Guardar</Button>
            <Button color="secondary" onClick={() => navigate('/gestion-ubicacion')} style={{ marginLeft: '10px' }}>
              Salir
            </Button>
          </Form>
        </CardBody>
      </Card>
    </Container>
  );
};

export default AgregarUbicacionPaquete;
