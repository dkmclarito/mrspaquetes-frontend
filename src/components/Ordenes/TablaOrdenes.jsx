import React, { useState, useCallback } from "react";
import { Table, Button } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faPencilAlt, faEye } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import ModalConfirmarCancelar from "./ModalConfirmarCancelar";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const TablaOrdenes = ({
  ordenes,
  navegarAEditar,
  verDetallesOrden,
  actualizarOrden,
}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [ordenIdACancelar, setOrdenIdACancelar] = useState(null);

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

  return (
    <>
      <Table responsive striped>
        <thead>
          <tr>
            <th>Nombre del Cliente</th>
            <th>Teléfono</th>
            <th>Tipo de Pago</th>
            <th>Total a Pagar</th>
            <th>Estado de la Orden</th>
            <th>Número de Seguimiento</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ordenes.length > 0 ? (
            ordenes.map((orden) => (
              <tr key={orden.id}>
                <td>
                  {orden.cliente.nombre} {orden.cliente.apellido}
                </td>
                <td>{orden.detalles[0]?.telefono || "N/A"}</td>
                <td>{orden.tipo_pago}</td>
                <td>${orden.total_pagar}</td>
                <td>{orden.estado || "N/A"}</td>
                <td>{orden.numero_seguimiento}</td>
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
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center">
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
