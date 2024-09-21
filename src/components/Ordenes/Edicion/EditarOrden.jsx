import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Row, Col, Nav, NavItem, Button } from "reactstrap";
import { toast, ToastContainer } from "react-toastify";
import ResumenOrden from "./ResumenOrden";
import EditarDatosOrden from "./EditarDatosOrden";
import EditarDireccion from "./EditarDireccion";
import EditarDetallesOrden from "./EditarDetallesOrden";

const API_URL = import.meta.env.VITE_API_URL;

export default function EditarOrden() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orden, setOrden] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seccionActual, setSeccionActual] = useState("resumen");

  const fetchOrden = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/ordenes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Datos completos de la orden cargada:", response.data);
      setOrden(response.data);
    } catch (error) {
      console.error("Error al cargar la orden:", error);
      setError("Error al cargar los datos de la orden");
      toast.error("Error al cargar los datos de la orden");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrden();
  }, [fetchOrden]);

  const actualizarOrden = useCallback(
    async (datosActualizados) => {
      try {
        // Actualizar el estado local con los datos proporcionados
        setOrden((prevOrden) => ({
          ...prevOrden,
          ...datosActualizados,
          detalles: datosActualizados.detalles || prevOrden.detalles,
        }));

        // Recargar los datos completos de la orden
        await fetchOrden();

        toast.success("Cambios guardados con éxito.");
      } catch (error) {
        console.error("Error al actualizar la orden:", error);
        toast.error("Error al guardar los cambios: " + error.message);
      }
    },
    [fetchOrden]
  );

  const handleRegresar = () => {
    const tipoOrden = orden.tipo_orden;
    const tipoEntrega =
      orden.detalles && orden.detalles[0]?.id_tipo_entrega === 2
        ? "express"
        : "normal";

    if (tipoOrden === "preorden") {
      if (tipoEntrega === "express") {
        navigate("/GestionPreOrdenesExpress");
      } else {
        navigate("/GestionPreOrdenes");
      }
    } else {
      if (tipoEntrega === "express") {
        navigate("/GestionOrdenesExpress");
      } else {
        navigate("/GestionOrdenes");
      }
    }
  };

  const renderSeccion = () => {
    switch (seccionActual) {
      case "resumen":
        return <ResumenOrden orden={orden} />;
      case "datos":
        return (
          <EditarDatosOrden orden={orden} actualizarOrden={actualizarOrden} />
        );
      case "direccion":
        return (
          <EditarDireccion orden={orden} actualizarOrden={actualizarOrden} />
        );
      case "detalles":
        return (
          <EditarDetallesOrden
            orden={orden}
            actualizarOrden={actualizarOrden}
          />
        );
      default:
        return <ResumenOrden orden={orden} />;
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!orden) return <div>No se encontró la orden</div>;

  const tipoOrden = orden.tipo_orden === "preorden" ? "Pre-Orden" : "Orden";
  const tipoEntrega =
    orden.detalles && orden.detalles[0]?.id_tipo_entrega === 2
      ? "Express"
      : "Normal";

  const NavLinkStyled = ({ children, isActive, ...props }) => (
    <NavItem>
      <a
        {...props}
        className={`nav-link ${isActive ? "active" : ""}`}
        style={{
          cursor: "pointer",
          backgroundColor: isActive ? "white" : "transparent",
          color: isActive ? "black" : "inherit",
          fontWeight: isActive ? "bold" : "normal",
          borderBottom: isActive ? "2px solid black" : "none",
        }}
      >
        {children}
      </a>
    </NavItem>
  );

  return (
    <Container>
      <ToastContainer />
      <Row className="mb-3 align-items-center">
        <Col>
          <h1>
            Editar {tipoOrden} {tipoEntrega} #{orden.id}
          </h1>
        </Col>
        <Col xs="auto">
          <Button color="secondary" onClick={handleRegresar}>
            Volver a la lista {tipoOrden}es {tipoEntrega}
          </Button>
        </Col>
      </Row>
      <Nav tabs>
        <NavLinkStyled
          isActive={seccionActual === "resumen"}
          onClick={() => setSeccionActual("resumen")}
        >
          Resumen de {tipoOrden}
        </NavLinkStyled>
        <NavLinkStyled
          isActive={seccionActual === "datos"}
          onClick={() => setSeccionActual("datos")}
        >
          Datos de la {tipoOrden}
        </NavLinkStyled>
        <NavLinkStyled
          isActive={seccionActual === "direccion"}
          onClick={() => setSeccionActual("direccion")}
        >
          Dirección
        </NavLinkStyled>
        <NavLinkStyled
          isActive={seccionActual === "detalles"}
          onClick={() => setSeccionActual("detalles")}
        >
          Detalles/Paquetes
        </NavLinkStyled>
      </Nav>
      <Row className="mt-3">
        <Col>{renderSeccion()}</Col>
      </Row>
    </Container>
  );
}
