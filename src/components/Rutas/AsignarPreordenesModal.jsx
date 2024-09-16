import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Table,
  Pagination,
  PaginationItem,
  PaginationLink,
} from "reactstrap";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 10;

const AsignarPreordenesModal = ({
  isOpen,
  toggle,
  rutaSeleccionada,
  onAsignarOrdenes,
}) => {
  const [preordenes, setPreordenes] = useState([]);
  const [selectedOrdenes, setSelectedOrdenes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchPreordenes = useCallback(
    async (page) => {
      if (!rutaSeleccionada) return;
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/ordenes`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            page: page,
            per_page: ITEMS_PER_PAGE,
          },
        });

        // Filtrar las preórdenes en el lado del cliente
        const preordenesFiltradas = response.data.data.filter(
          (orden) =>
            orden.tipo_orden === "preorden" && orden.estado === "En_proceso"
        );

        setPreordenes(preordenesFiltradas);
        // Ajustar el número total de páginas basado en las preórdenes filtradas
        setTotalPages(Math.ceil(preordenesFiltradas.length / ITEMS_PER_PAGE));
      } catch (error) {
        console.error("Error al obtener preórdenes:", error);
        toast.error("Error al cargar las preórdenes");
      } finally {
        setLoading(false);
      }
    },
    [rutaSeleccionada]
  );

  useEffect(() => {
    if (isOpen) {
      fetchPreordenes(1);
    }
  }, [isOpen, fetchPreordenes]);

  const handleSelectOrden = (orden) => {
    setSelectedOrdenes((prev) =>
      prev.includes(orden) ? prev.filter((o) => o !== orden) : [...prev, orden]
    );
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchPreordenes(page);
  };

  const handleAsignarOrdenes = () => {
    onAsignarOrdenes(selectedOrdenes); // Pasamos las órdenes completas, no solo los IDs
    toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>
        Asignar Preórdenes a Ruta {rutaSeleccionada?.nombre}
      </ModalHeader>
      <ModalBody>
        {loading ? (
          <div>Cargando preórdenes...</div>
        ) : (
          <>
            <Table responsive striped>
              <thead>
                <tr>
                  <th>Seleccionar</th>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Número de Seguimiento</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {preordenes.map((orden) => (
                  <tr key={orden.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedOrdenes.includes(orden)}
                        onChange={() => handleSelectOrden(orden)}
                      />
                    </td>
                    <td>{orden.id}</td>
                    <td>
                      {orden.cliente
                        ? `${orden.cliente.nombre} ${orden.cliente.apellido}`
                        : "N/A"}
                    </td>
                    <td>{orden.numero_seguimiento}</td>
                    <td>{orden.estado}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Pagination>
              {[...Array(totalPages).keys()].map((number) => (
                <PaginationItem
                  key={number}
                  active={currentPage === number + 1}
                >
                  <PaginationLink onClick={() => handlePageChange(number + 1)}>
                    {number + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
            </Pagination>
          </>
        )}
      </ModalBody>
      <ModalFooter>
        <Button
          color="primary"
          onClick={handleAsignarOrdenes}
          disabled={selectedOrdenes.length === 0}
        >
          Asignar Órdenes Seleccionadas
        </Button>
        <Button color="secondary" onClick={toggle}>
          Cancelar
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AsignarPreordenesModal;
