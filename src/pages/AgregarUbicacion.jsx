import React, { useState, useEffect, useCallback } from "react";
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
  Table,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  DropdownItem
} from "reactstrap";
import Breadcrumbs from "../components/Bodegas/Common/Breadcrumbs";
import AuthService from "../services/authService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const AgregarUbicacionPaquete = () => {
  const [paquetes, setPaquetes] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [idPaquete, setIdPaquete] = useState("");
  const [idUbicacion, setIdUbicacion] = useState(""); // Estado para ID de ubicación
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUbicaciones, setFilteredUbicaciones] = useState([]);
  const [modal, setModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedPaquete, setSelectedPaquete] = useState(null);
  const token = AuthService.getCurrentUser();
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      const [paquetesResponse, ubicacionesResponse] = await Promise.all([
        axios.get(`${API_URL}/dropdown/get_paquetes`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/dropdown/get_Ubicaciones_SinPaquetes`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const paquetesNoAsignados = paquetesResponse.data.paquetes.filter(paquete => !paquete.id_ubicacion);
      setPaquetes(paquetesNoAsignados);
      setUbicaciones(ubicacionesResponse.data || []);
      setFilteredUbicaciones(ubicacionesResponse.data || []);
    } catch (error) {
      console.error("Error al obtener datos:", error);
    }
  }, [token]);

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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePaqueteChange = (e) => {
    setIdPaquete(e.target.value);
  };

  const handleUbicacionChange = (e) => {
    const searchValue = e.target.value;
    setSearchTerm(searchValue);

    if (searchValue === "") {
      setFilteredUbicaciones([]);
      setDropdownOpen(false);
      return;
    }

    const filtered = ubicaciones.filter((ubicacion) =>
      ubicacion.nomenclatura.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredUbicaciones(filtered);
    setDropdownOpen(filtered.length > 0);
  };

  const handleUbicacionSelect = (ubicacion) => {
    setSearchTerm(ubicacion.nomenclatura);
    setIdUbicacion(ubicacion.id); // Actualiza el ID de ubicación seleccionado
    setDropdownOpen(false);
  };

  const toggleModal = () => {
    setModal(!modal);
    if (modal) {
      // Clear the search term when closing the modal
      setSearchTerm("");
      setFilteredUbicaciones([]);
    }
  };

  const handleAsignarUbicacion = (paquete) => {
    setSelectedPaquete(paquete);
    setIdPaquete(paquete.id);
    toggleModal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ubicacionPaqueteData = {
      id_paquete: idPaquete,
      id_ubicacion: idUbicacion, // Usa el ID de ubicación seleccionado
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
      toast.success("¡Ubicación del paquete registrada con éxito!", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al registrar la ubicación del paquete.");
      }

      

      // Actualizar las ubicaciones y paquetes después de guardar
      fetchData();
      toggleModal();
      setIdPaquete("");
      setIdUbicacion(""); // Limpiar ID de ubicación después del envío
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
            <Table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Peso (libras)</th>
                  <th>Descripción</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {paquetes.length > 0 ? (
                  paquetes.map((paquete) => (
                    <tr key={paquete.id}>
                      <td>{paquete.id}</td>
                      <td>{paquete.peso}</td>
                      <td>{paquete.descripcion_contenido}</td>
                      <td>
                        <Button color="primary" onClick={() => handleAsignarUbicacion(paquete)}>
                          Asignar Ubicación
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">No hay paquetes disponibles</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Form>
        </CardBody>
      </Card>

      <Modal isOpen={modal} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>Asignar Ubicación</ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="paqueteDisplay">Paquete Seleccionado</Label>
              <Input
                type="text"
                id="paqueteDisplay"
                value={selectedPaquete ? selectedPaquete.descripcion_contenido : ""}
                readOnly
              />
            </FormGroup>
            <FormGroup>
              <Label for="ubicacionSelect">Seleccionar Ubicación</Label>
              <Input
                type="text"
                id="ubicacionSelect"
                value={searchTerm}
                onChange={handleUbicacionChange}
              />
              {dropdownOpen && (
                <div className="dropdown-menu show" style={{width: '94%'}}>
                  {filteredUbicaciones.map((ubicacion) => (
                    <DropdownItem
                      key={ubicacion.id}
                      onClick={() => handleUbicacionSelect(ubicacion)}
                    >
                      {ubicacion.nomenclatura}
                    </DropdownItem>
                  ))}
                </div>
              )}
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleSubmit}>Guardar</Button>
          <Button color="secondary" onClick={toggleModal}>Cerrar</Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
};

export default AgregarUbicacionPaquete;
