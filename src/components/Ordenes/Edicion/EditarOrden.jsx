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

  const actualizarCliente = (nuevoCliente, nuevaDireccion) => {
    actualizarOrden({
      id_cliente: nuevoCliente.id,
      id_direccion: nuevaDireccion ? nuevaDireccion.id : null,
      direccion_emisor: nuevaDireccion || null,
    });

    if (nuevoCliente.id !== ordenActualizada.id_cliente) {
      setSeccionActual("direccion");
      toast.info("Por favor, seleccione una nueva dirección para el cliente.");
    }
  };

  const actualizarDireccion = (nuevaDireccion) => {
    actualizarOrden({
      id_direccion: nuevaDireccion.id,
      direccion_emisor: nuevaDireccion,
    });
  };

  const actualizarDetalles = (nuevosDetalles) => {
    actualizarOrden({ detalles: nuevosDetalles });
  };

  const guardarCambios = async () => {
    try {
      const token = localStorage.getItem("token");
      const ordenGuardada = JSON.parse(localStorage.getItem("ordenEnEdicion"));

      if (!ordenGuardada.id_direccion) {
        toast.error(
          "Por favor, seleccione una dirección antes de guardar los cambios."
        );
        return;
      }

      const datosParaEnviar = {
        ...ordenGuardada,
        detalles: ordenGuardada.detalles.map((detalle) => ({
          ...detalle,
          id_empaque: detalle.id_empaque || detalle.tipo_caja,
          id_direccion: detalle.id_direccion_entrega || detalle.id_direccion,
        })),
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
            actualizarCliente={actualizarCliente}
          />
        );
      case "direccion":
        return (
          <EditarDireccion
            orden={ordenActualizada}
            actualizarDireccion={actualizarDireccion}
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
