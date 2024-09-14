import React, { useState, useEffect } from "react";
import {
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
} from "reactstrap";
import axios from "axios";
import { toast } from "react-toastify";
import FormularioDireccion from "../../../pages/FormularioDireccion";

const API_URL = import.meta.env.VITE_API_URL;

const EditarDireccion = ({ orden, actualizarOrden }) => {
  const [direcciones, setDirecciones] = useState([]);
  const [direccionSeleccionada, setDireccionSeleccionada] = useState(null);
  const [modalAgregar, setModalAgregar] = useState(false);
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    if (orden) {
      fetchDirecciones();
    }
  }, [orden]);

  const fetchDirecciones = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/direcciones?id_cliente=${orden.id_cliente}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDirecciones(response.data.direcciones || []);

      // Seleccionar automáticamente la dirección que viene con la orden
      const direccionOrden = response.data.direcciones.find(
        (d) => d.id === orden.id_direccion
      );
      if (direccionOrden) {
        setDireccionSeleccionada(direccionOrden);
      }
    } catch (error) {
      console.error("Error al cargar direcciones:", error);
      toast.error("Error al cargar las direcciones");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDireccionSeleccionada((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/direcciones/${direccionSeleccionada.id}`,
        direccionSeleccionada,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Dirección actualizada con éxito");
      actualizarOrden({
        direccion_emisor: direccionSeleccionada,
        id_direccion: direccionSeleccionada.id,
      });
      setEditando(false);
      fetchDirecciones();
    } catch (error) {
      console.error("Error al actualizar la dirección:", error);
      toast.error("Error al actualizar la dirección");
    }
  };

  const seleccionarDireccion = async (direccion) => {
    setDireccionSeleccionada(direccion);
    try {
      const token = localStorage.getItem("token");
      const dataToSend = {
        id_cliente: orden.id_cliente,
        id_tipo_pago: orden.id_tipo_pago,
        id_direccion: direccion.id,
        total_pagar: orden.total_pagar,
        costo_adicional: orden.costo_adicional,
        concepto: orden.concepto,
        tipo_documento: orden.tipo_documento,
      };

      const response = await axios.put(
        `${API_URL}/ordenes/actualizar-orden/${orden.id}`,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        toast.success("Dirección de la orden actualizada con éxito");
        actualizarOrden({
          ...orden,
          id_direccion: direccion.id,
          direccion_emisor: direccion,
        });
      } else {
        toast.error("Error al actualizar la dirección de la orden");
      }
    } catch (error) {
      console.error("Error al actualizar la dirección de la orden:", error);
      toast.error("Error al actualizar la dirección de la orden");
    }
  };

  const toggleModalAgregar = () => setModalAgregar(!modalAgregar);

  const agregarNuevaDireccion = async (nuevaDireccion) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/direcciones`,
        {
          ...nuevaDireccion,
          id_cliente: orden.id_cliente,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Nueva dirección agregada con éxito");
      fetchDirecciones();
      toggleModalAgregar();
    } catch (error) {
      console.error("Error al agregar nueva dirección:", error);
      toast.error("Error al agregar la nueva dirección");
    }
  };

  return (
    <Card>
      <CardBody>
        <h3>Editar Dirección</h3>
        <Button color="primary" onClick={toggleModalAgregar}>
          Agregar Nueva Dirección
        </Button>
        <Table>
          <thead>
            <tr>
              <th>Dirección</th>
              <th>Contacto</th>
              <th>Teléfono</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {direcciones.map((direccion) => (
              <tr key={direccion.id}>
                <td>{direccion.direccion}</td>
                <td>{direccion.nombre_contacto}</td>
                <td>{direccion.telefono}</td>
                <td>
                  <Button
                    color={
                      direccion.id === direccionSeleccionada?.id
                        ? "success"
                        : "primary"
                    }
                    onClick={() => seleccionarDireccion(direccion)}
                  >
                    {direccion.id === direccionSeleccionada?.id
                      ? "Seleccionada"
                      : "Seleccionar"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        {direccionSeleccionada && (
          <div>
            <h4>Dirección Seleccionada</h4>
            {editando ? (
              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label for="referencia">Referencia</Label>
                  <Input
                    type="text"
                    name="referencia"
                    id="referencia"
                    value={direccionSeleccionada.referencia || ""}
                    onChange={handleInputChange}
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="nombre_contacto">Nombre de Contacto</Label>
                  <Input
                    type="text"
                    name="nombre_contacto"
                    id="nombre_contacto"
                    value={direccionSeleccionada.nombre_contacto || ""}
                    onChange={handleInputChange}
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="telefono">Teléfono</Label>
                  <Input
                    type="text"
                    name="telefono"
                    id="telefono"
                    value={direccionSeleccionada.telefono || ""}
                    onChange={handleInputChange}
                  />
                </FormGroup>
                <Button color="primary" type="submit">
                  Guardar Cambios
                </Button>
                <Button color="secondary" onClick={() => setEditando(false)}>
                  Cancelar
                </Button>
              </Form>
            ) : (
              <>
                <p>
                  <strong>Dirección:</strong> {direccionSeleccionada.direccion}
                </p>
                <p>
                  <strong>Contacto:</strong>{" "}
                  {direccionSeleccionada.nombre_contacto}
                </p>
                <p>
                  <strong>Teléfono:</strong> {direccionSeleccionada.telefono}
                </p>
                <p>
                  <strong>Referencia:</strong>{" "}
                  {direccionSeleccionada.referencia || "No especificada"}
                </p>
                <Button color="primary" onClick={() => setEditando(true)}>
                  Editar Detalles
                </Button>
              </>
            )}
          </div>
        )}

        <Modal isOpen={modalAgregar} toggle={toggleModalAgregar}>
          <ModalHeader toggle={toggleModalAgregar}>
            Agregar Nueva Dirección
          </ModalHeader>
          <ModalBody>
            <FormularioDireccion
              clienteId={orden.id_cliente}
              onDireccionGuardada={agregarNuevaDireccion}
              onCancel={toggleModalAgregar}
            />
          </ModalBody>
        </Modal>
      </CardBody>
    </Card>
  );
};

export default EditarDireccion;
