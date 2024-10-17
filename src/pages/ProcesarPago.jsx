import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Table,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AuthService from "../services/authService";

const API_URL = import.meta.env.VITE_API_URL;

export default function ProcesarPago() {
  const { idCliente } = useParams();
  const navigate = useNavigate();
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [cardInfo, setCardInfo] = useState({
    nombre_titular: "",
    numero_tarjeta: "",
    fecha_vencimiento: "",
    cvv: "",
  });
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchPendingOrders();
    fetchClienteInfo();
  }, [idCliente]);

  const fetchPendingOrders = async () => {
    try {
      const token = AuthService.getCurrentUser();
      if (!token) {
        throw new Error("Token de autenticación no disponible.");
      }

      const response = await axios.get(`${API_URL}/ordenes`, {
        params: {
          id_cliente: idCliente,
          estado_pago: "pendiente",
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      // Filtrar solo las órdenes con entrega normal
      const filteredOrders = response.data.data.filter((order) =>
        order.detalles.every(
          (detalle) => detalle.tipo_entrega === "Entrega Normal"
        )
      );

      setPendingOrders(filteredOrders);
      setError(null);
    } catch (error) {
      console.error("Error al obtener órdenes pendientes:", error);
      setError(
        `Error al obtener órdenes pendientes: ${error.response?.data?.message || error.message}`
      );
      toast.error(
        `Error al obtener órdenes pendientes: ${error.response?.data?.message || error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchClienteInfo = async () => {
    try {
      const token = AuthService.getCurrentUser();
      if (!token) {
        throw new Error("Token de autenticación no disponible.");
      }

      const response = await axios.get(`${API_URL}/clientes/${idCliente}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Asegúrate de que estás accediendo correctamente a los datos del cliente
      const clienteData = response.data.cliente || response.data;
      setCliente(clienteData);
    } catch (error) {
      console.error("Error al obtener información del cliente:", error);
      toast.error("Error al obtener información del cliente");
    }
  };

  const handleProcessPayment = async () => {
    try {
      const token = AuthService.getCurrentUser();
      if (!token) {
        throw new Error("Token de autenticación no disponible.");
      }

      let paymentData = {};
      if (selectedOrder.tipo_pago === "Tarjeta") {
        paymentData = {
          nombre_titular: cardInfo.nombre_titular,
          numero_tarjeta: cardInfo.numero_tarjeta.replace(/\s/g, ""),
          fecha_vencimiento: cardInfo.fecha_vencimiento,
          cvv: cardInfo.cvv,
        };
      }

      const response = await axios.post(
        `${API_URL}/ordenes/${selectedOrder.id}/procesar-pago`,
        paymentData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(
        "Pago procesado con éxito. Se ha enviado un comprobante al correo del cliente."
      );
      await generateVineta(selectedOrder.id);
      setPendingOrders((prevOrders) =>
        prevOrders.filter((o) => o.id !== selectedOrder.id)
      );
      setSelectedOrder(null);
      setModalOpen(false);
    } catch (error) {
      console.error("Error al procesar el pago:", error);
      toast.error(
        `Error al procesar el pago: ${error.response?.data?.message || error.message}`
      );
    }
  };

  const generateVineta = async (orderId) => {
    try {
      const token = AuthService.getCurrentUser();
      if (!token) {
        throw new Error("Token de autenticación no disponible.");
      }

      const response = await axios.get(`${API_URL}/ordenes/${orderId}/vineta`, {
        params: { format: "json" },
        headers: { Authorization: `Bearer ${token}` },
      });

      const { pdf_base64 } = response.data.data;
      const byteCharacters = atob(pdf_base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "viñeta.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Viñeta generada y descargada con éxito.");
    } catch (error) {
      console.error("Error al generar la viñeta:", error);
      toast.error(
        `Error al generar la viñeta: ${error.response?.data?.message || error.message}`
      );
    }
  };

  const handleCardInfoChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "numero_tarjeta") {
      formattedValue = value
        .replace(/\D/g, "")
        .replace(/(\d{4})/g, "$1 ")
        .trim();
      formattedValue = formattedValue.substring(0, 19);
    } else if (name === "fecha_vencimiento") {
      // Eliminar caracteres no numéricos
      const numericValue = value.replace(/\D/g, "");

      // Formatear como MM/YYYY
      if (numericValue.length <= 2) {
        formattedValue = numericValue;
      } else {
        const month = numericValue.substring(0, 2);
        const year = numericValue.substring(2, 6);

        // Validar el mes
        if (parseInt(month) > 12) {
          formattedValue = "12";
        } else if (parseInt(month) === 0) {
          formattedValue = "01";
        } else {
          formattedValue = month;
        }

        // Añadir el año si está presente
        if (year.length > 0) {
          formattedValue += "/" + year;
        }
      }

      // Validar que la fecha sea futura
      if (formattedValue.length === 7) {
        const [inputMonth, inputYear] = formattedValue.split("/");
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        if (
          parseInt(inputYear) < currentYear ||
          (parseInt(inputYear) === currentYear &&
            parseInt(inputMonth) < currentMonth)
        ) {
          // Si la fecha es pasada, establecer al mes siguiente
          let newMonth = currentMonth + 1;
          let newYear = currentYear;
          if (newMonth > 12) {
            newMonth = 1;
            newYear++;
          }
          formattedValue = `${String(newMonth).padStart(2, "0")}/${newYear}`;
        }
      }
    } else if (name === "cvv") {
      formattedValue = value.replace(/\D/g, "").substring(0, 4);
    }

    setCardInfo({ ...cardInfo, [name]: formattedValue });
  };

  const toggleModal = (order = null) => {
    setSelectedOrder(order);
    setModalOpen(!modalOpen);
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="page-content">
      <Container fluid>
        <ToastContainer />
        <h1 className="text-center mb-4">
          Procesar Pago - Cliente:{" "}
          {cliente ? `${cliente.nombre} ${cliente.apellido}` : "Cargando..."}
        </h1>
        <Card>
          <CardBody>
            <h4 className="card-title mb-4">Órdenes Pendientes de Pago</h4>
            {pendingOrders.length === 0 ? (
              <p>No hay órdenes pendientes de pago para este cliente.</p>
            ) : (
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Numero de Seguimiento</th>
                    <th>Fecha</th>
                    <th>Total a Pagar</th>
                    <th>Tipo de Pago</th>
                    <th>Descripción</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingOrders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.numero_seguimiento}</td>
                      <td>{new Date(order.created_at).toLocaleDateString()}</td>
                      <td>${order.total_pagar}</td>
                      <td>{order.tipo_pago}</td>
                      <td>{order.concepto}</td>
                      <td>
                        <Button
                          color="primary"
                          onClick={() => toggleModal(order)}
                        >
                          Procesar Pago
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </CardBody>
        </Card>
        <Row className="mt-3">
          <Col>
            <Button
              color="secondary"
              onClick={() => navigate("/GestionOrdenes")}
            >
              Volver a Gestión de Órdenes
            </Button>
          </Col>
        </Row>

        <Modal isOpen={modalOpen} toggle={() => toggleModal()}>
          <ModalHeader toggle={() => toggleModal()}>
            Procesar Pago - Orden: {selectedOrder?.numero_seguimiento}
          </ModalHeader>
          <ModalBody>
            {selectedOrder?.tipo_pago === "Tarjeta" && (
              <Form>
                <FormGroup>
                  <Label for="nombre_titular">Nombre del Titular</Label>
                  <Input
                    type="text"
                    name="nombre_titular"
                    id="nombre_titular"
                    value={cardInfo.nombre_titular}
                    onChange={handleCardInfoChange}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="numero_tarjeta">Número de Tarjeta</Label>
                  <Input
                    type="text"
                    name="numero_tarjeta"
                    id="numero_tarjeta"
                    value={cardInfo.numero_tarjeta}
                    onChange={handleCardInfoChange}
                    maxLength={19}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="fecha_vencimiento">
                    Fecha de Vencimiento (MM/YYYY)
                  </Label>
                  <Input
                    type="text"
                    name="fecha_vencimiento"
                    id="fecha_vencimiento"
                    value={cardInfo.fecha_vencimiento}
                    onChange={handleCardInfoChange}
                    placeholder="MM/YYYY"
                    maxLength={7}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="cvv">CVV</Label>
                  <Input
                    type="text"
                    name="cvv"
                    id="cvv"
                    value={cardInfo.cvv}
                    onChange={handleCardInfoChange}
                    maxLength={4}
                    required
                  />
                </FormGroup>
              </Form>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={handleProcessPayment}>
              Confirmar Pago
            </Button>
            <Button color="secondary" onClick={() => toggleModal()}>
              Cancelar
            </Button>
          </ModalFooter>
        </Modal>
      </Container>
    </div>
  );
}
