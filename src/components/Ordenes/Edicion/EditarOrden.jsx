import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, Container, Row, Col } from "reactstrap";
import { toast } from "react-toastify";
import ResumenOrden from "./ResumenOrden";
import EditarCliente from "./EditarCliente";
import EditarDireccion from "./EditarDireccion";
import EditarDetallesOrden from "./EditarDetallesOrden";

const API_URL = import.meta.env.VITE_API_URL;

const EditarOrden = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ordenOriginal, setOrdenOriginal] = useState(null);
  const [ordenActualizada, setOrdenActualizada] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seccionActual, setSeccionActual] = useState("resumen");

  useEffect(() => {
    const fetchOrden = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/ordenes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Datos recibidos de la API:", response.data);
        setOrdenOriginal(response.data);
        setOrdenActualizada(response.data);
        localStorage.setItem("ordenEnEdicion", JSON.stringify(response.data));
      } catch (error) {
        console.error("Error al cargar la orden:", error);
        setError("Error al cargar los datos de la orden");
        toast.error("Error al cargar los datos de la orden");
      } finally {
        setLoading(false);
      }
    };

    fetchOrden();

    return () => {
      localStorage.removeItem("ordenEnEdicion");
    };
  }, [id]);

  const actualizarOrden = (cambios) => {
    setOrdenActualizada((prevOrden) => {
      const nuevaOrden = { ...prevOrden, ...cambios };
      localStorage.setItem("ordenEnEdicion", JSON.stringify(nuevaOrden));
      return nuevaOrden;
    });
  };

  const guardarCambios = async () => {
    try {
      const token = localStorage.getItem("token");
      const ordenGuardada = JSON.parse(
        localStorage.getItem("ordenEnEdicion") || "{}"
      );

      if (!ordenGuardada.id_direccion) {
        toast.error(
          "Por favor, seleccione una dirección antes de guardar los cambios."
        );
        return;
      }

      const datosParaEnviar = {
        id_cliente: parseInt(ordenGuardada.id_cliente),
        id_direccion: parseInt(ordenGuardada.id_direccion),
        id_tipo_pago: parseInt(ordenGuardada.id_tipo_pago),
        total_pagar: parseFloat(ordenGuardada.total_pagar),
        id_estado_paquetes: parseInt(ordenGuardada.id_estado_paquetes),
        costo_adicional: parseFloat(ordenGuardada.costo_adicional) || 0,
        concepto: ordenGuardada.concepto,
        tipo_documento: ordenGuardada.tipo_documento,
        detalles: ordenGuardada.detalles.map((detalle) => {
          const detalleFormateado = {
            id_tipo_entrega: parseInt(detalle.id_tipo_entrega),
            id_estado_paquetes: parseInt(ordenGuardada.id_estado_paquetes),
            id_direccion_entrega:
              parseInt(detalle.id_direccion_entrega) ||
              parseInt(ordenGuardada.id_direccion),
            validacion_entrega: detalle.validacion_entrega || "",
            instrucciones_entrega: detalle.instrucciones_entrega || "",
            descripcion: detalle.descripcion || "",
            precio: parseFloat(detalle.precio) || 0,
            fecha_entrega: detalle.fecha_entrega || null,
            id_tipo_paquete: parseInt(detalle.id_tipo_paquete),
            id_tamano_paquete: parseInt(detalle.id_tamano_paquete),
            tipo_caja: parseInt(detalle.tipo_caja),
            peso: parseFloat(detalle.peso) || 0,
            fecha_envio: detalle.fecha_envio || null,
            fecha_entrega_estimada: detalle.fecha_entrega_estimada || null,
            descripcion_contenido: detalle.descripcion_contenido || "",
            id_estado_paquete:
              parseInt(detalle.id_estado_paquete) ||
              parseInt(ordenGuardada.id_estado_paquetes),
          };

          // Si el detalle ya existe, incluir su ID
          if (detalle.id) {
            detalleFormateado.id = parseInt(detalle.id);
          }
          if (detalle.id_paquete) {
            detalleFormateado.id_paquete = parseInt(detalle.id_paquete);
          }

          return detalleFormateado;
        }),
      };

      console.log("Datos a enviar al servidor:", datosParaEnviar);

      const response = await axios.put(
        `${API_URL}/ordenes/${id}`,
        datosParaEnviar,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Respuesta del servidor:", response.data);

      localStorage.removeItem("ordenEnEdicion");
      toast.success("Orden actualizada con éxito");
      navigate("/GestionOrdenes");
    } catch (error) {
      console.error("Error al actualizar la orden:", error);
      if (error.response) {
        console.error("Respuesta del servidor:", error.response.data);
        toast.error(
          `Error al actualizar la orden: ${error.response.data.message || JSON.stringify(error.response.data)}`
        );
      } else {
        toast.error("Error al actualizar la orden: " + error.message);
      }
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!ordenActualizada) return <div>No se encontró la orden</div>;

  const renderSeccion = () => {
    switch (seccionActual) {
      case "resumen":
        return <ResumenOrden orden={ordenActualizada} />;
      case "cliente":
        return (
          <EditarCliente
            orden={ordenActualizada}
            actualizarOrden={actualizarOrden}
          />
        );
      case "direccion":
        return (
          <EditarDireccion
            orden={ordenActualizada}
            actualizarOrden={actualizarOrden}
          />
        );
      case "detalles":
        return (
          <EditarDetallesOrden
            orden={ordenActualizada}
            actualizarOrden={actualizarOrden}
          />
        );
      default:
        return <ResumenOrden orden={ordenActualizada} />;
    }
  };

  return (
    <Container>
      <h1>Editar Orden #{ordenActualizada.id}</h1>
      <Row className="mb-3">
        <Col>
          <Button color="primary" onClick={() => setSeccionActual("resumen")}>
            Resumen
          </Button>{" "}
          <Button color="primary" onClick={() => setSeccionActual("cliente")}>
            Editar Cliente
          </Button>{" "}
          <Button color="primary" onClick={() => setSeccionActual("direccion")}>
            Editar Dirección
          </Button>{" "}
          <Button color="primary" onClick={() => setSeccionActual("detalles")}>
            Editar Detalles
          </Button>
        </Col>
      </Row>
      <Row>
        <Col>{renderSeccion()}</Col>
      </Row>
      <Row className="mt-3">
        <Col>
          <Button color="success" onClick={guardarCambios}>
            Guardar Todos los Cambios
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default EditarOrden;
