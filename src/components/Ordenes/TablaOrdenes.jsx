import React, { useState, useCallback } from "react";
import { Table, Button, Badge } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faPencilAlt,
  faEye,
  faCreditCard,
  faCheck,
  faSortUp,
  faSortDown,
  faSort,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import ModalConfirmarCancelar from "./ModalConfirmarCancelar";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const TablaOrdenes = ({
  ordenes,
  navegarAEditar,
  verDetallesOrden,
  actualizarOrden,
  procesarPago,
  finalizarOrden,
  onOrdenar,
  ordenamiento,
}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [ordenIdACancelar, setOrdenIdACancelar] = useState(null);
  const navigate = useNavigate();

  const toggleModal = useCallback(() => {
    setModalIsOpen((prevState) => !prevState);
  }, []);

  const handleCancelarOrden = useCallback(
    (id) => {
      setOrdenIdACancelar(id);
      toggleModal();
    },
    [toggleModal]
  );

  const confirmarCancelarOrden = useCallback(
    async (id) => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.put(
          `${API_URL}/ordenes/${id}/cancelar`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.status === 200) {
          actualizarOrden(id, { estado: "Cancelada" });
          toast.success("Orden cancelada correctamente");
        }
      } catch (error) {
        console.error("Error al cancelar la orden:", error);
        toast.error(
          error.response?.data?.message || "Error al cancelar la orden"
        );
      }
      toggleModal();
    },
    [actualizarOrden, toggleModal]
  );

  const handleProcesarPago = useCallback(
    (orden) => {
      if (!orden.id_cliente) {
        console.error("Error: ID del cliente no disponible", orden);
        toast.error("Error: Información del cliente no disponible");
        return;
      }
      const ruta = orden.detalles.some(
        (detalle) => detalle.tipo_entrega === "Entrega Express"
      )
        ? `/procesarpagoexpress/${orden.id_cliente}`
        : `/procesarpago/${orden.id_cliente}`;
      procesarPago(orden.id_cliente, ruta);
    },
    [procesarPago]
  );

  const renderSortIcon = (campo) => {
    if (ordenamiento.campo === campo) {
      return ordenamiento.direccion === "asc" ? (
        <FontAwesomeIcon icon={faSortUp} />
      ) : (
        <FontAwesomeIcon icon={faSortDown} />
      );
    }
    return <FontAwesomeIcon icon={faSort} />;
  };

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case "En_proceso":
        return <Badge color="warning">En proceso</Badge>;
      case "Completada":
        return <Badge color="success">Completada</Badge>;
      case "Cancelada":
        return <Badge color="danger">Cancelada</Badge>;
      default:
        return <Badge color="secondary">{estado}</Badge>;
    }
  };

  return (
    <>
      <Table responsive striped>
        <thead>
          <tr>
            <th onClick={() => onOrdenar("numero_seguimiento")}>
              Número de Seguimiento {renderSortIcon("numero_seguimiento")}
            </th>
            <th onClick={() => onOrdenar("cliente.nombre")}>
              Cliente {renderSortIcon("cliente.nombre")}
            </th>
            <th onClick={() => onOrdenar("tipo_pago")}>
              Tipo de Pago {renderSortIcon("tipo_pago")}
            </th>
            <th onClick={() => onOrdenar("total_pagar")}>
              Total a Pagar {renderSortIcon("total_pagar")}
            </th>
            <th onClick={() => onOrdenar("estado")}>
              Estado {renderSortIcon("estado")}
            </th>
            <th onClick={() => onOrdenar("estado_pago")}>
              Estado de Pago {renderSortIcon("estado_pago")}
            </th>
            <th onClick={() => onOrdenar("created_at")}>
              Fecha de Creación {renderSortIcon("created_at")}
            </th>
            <th>Paquetes</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ordenes && ordenes.length > 0 ? (
            ordenes.map((orden) => (
              <tr key={orden.id}>
                <td>{orden.numero_seguimiento}</td>
                <td>{`${orden.cliente.nombre} ${orden.cliente.apellido}`}</td>
                <td>{orden.tipo_pago}</td>
                <td>${orden.total_pagar}</td>
                <td>{getEstadoBadge(orden.estado)}</td>
                <td>
                  {orden.estado_pago === "pagado" ? (
                    <Badge color="success">Pagado</Badge>
                  ) : (
                    <Badge color="warning">Pendiente</Badge>
                  )}
                </td>
                <td>{new Date(orden.created_at).toLocaleDateString()}</td>
                <td>{orden.detalles.length} paquete(s)</td>
                <td>
                  <div className="button-container">
                    <Button
                      className="me-2 btn-icon btn-danger"
                      onClick={() => handleCancelarOrden(orden.id)}
                      disabled={orden.estado !== "En_proceso"}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </Button>
                    <Button
                      className="me-2 btn-icon btn-editar"
                      onClick={() => navegarAEditar(orden.id)}
                    >
                      <FontAwesomeIcon icon={faPencilAlt} />
                    </Button>
                    <Button
                      className="btn-sm me-2 btn-icon btn-success"
                      onClick={() => verDetallesOrden(orden.id)}
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </Button>
                    {orden.estado_pago === "pendiente" && procesarPago && (
                      <Button
                        className="btn-sm me-2 btn-icon btn-regresar2"
                        onClick={() => handleProcesarPago(orden)}
                      >
                        <FontAwesomeIcon icon={faCreditCard} />
                      </Button>
                    )}
                    {orden.estado_pago === "pagado" && !orden.finished && (
                      <Button
                        className="me-2 btn-icon btn-editar"
                        onClick={() => finalizarOrden(orden)}
                      >
                        <FontAwesomeIcon icon={faCheck} />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="text-center">
                No hay órdenes disponibles
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      <ModalConfirmarCancelar
        isOpen={modalIsOpen}
        toggle={toggleModal}
        ordenId={ordenIdACancelar}
        confirmarCancelar={confirmarCancelarOrden}
      />
    </>
  );
};

export default TablaOrdenes;
