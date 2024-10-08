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
import { ToastContainer, toast } from "react-toastify";
import FormularioDireccion from "../../../pages/FormularioDireccion";

const API_URL = import.meta.env.VITE_API_URL;

const EditarDireccion = ({ orden, actualizarOrden }) => {
  const [direcciones, setDirecciones] = useState([]);
  const [direccionSeleccionada, setDireccionSeleccionada] = useState(null);
  const [
    direccionRecoleccionSeleccionada,
    setDireccionRecoleccionSeleccionada,
  ] = useState(null);
  const [modalAgregar, setModalAgregar] = useState(false);
  const [editando, setEditando] = useState(false);
  const [editandoRecoleccion, setEditandoRecoleccion] = useState(false);
  const [direccionesDetalladas, setDireccionesDetalladas] = useState({});
  const [direccionEntrega, setDireccionEntrega] = useState(null);
  const [direccionRecoleccion, setDireccionRecoleccion] = useState(null);

  const obtenerDetallesDirecciones = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/dropdown/get_direcciones/${orden.id_cliente}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const detalles = {};
      response.data.forEach((d) => {
        detalles[d.id] = {
          departamento: d.departamento,
          municipio: d.municipio,
        };
      });
      setDireccionesDetalladas(detalles);
    } catch (error) {
      console.error("Error al obtener detalles de direcciones:", error);
      toast.error("Error al cargar detalles de ubicaciones");
    }
  };

  useEffect(() => {
    if (orden) {
      fetchDirecciones();
      obtenerDetallesDirecciones();
    }
  }, [orden]);

  useEffect(() => {
    if (orden && direcciones.length > 0) {
      // Seleccionar la dirección de entrega (usando el primer detalle)
      const direccionEntrega = direcciones.find(
        (d) => d.id === orden.detalles[0]?.id_direccion_entrega
      );
      setDireccionEntrega(direccionEntrega);
      setDireccionSeleccionada(direccionEntrega);

      // Seleccionar la dirección de recolección para preórdenes y órdenes express con recolección
      if (
        orden.tipo_orden === "preorden" ||
        (orden.tipo_orden === "orden" &&
          orden.detalles[0].id_tipo_entrega === 2 &&
          orden.id_direccion !== orden.detalles[0].id_direccion_entrega)
      ) {
        const direccionRecoleccion = direcciones.find(
          (d) => d.id === orden.id_direccion
        );
        setDireccionRecoleccion(direccionRecoleccion);
        setDireccionRecoleccionSeleccionada(direccionRecoleccion);
      }
    }
  }, [orden, direcciones]);

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

      // Seleccionar automáticamente las direcciones que vienen con la orden
      const direccionOrden = response.data.direcciones.find(
        (d) => d.id === orden.id_direccion
      );
      const direccionRecoleccion = response.data.direcciones.find(
        (d) => d.id === orden.direccion_recoleccion
      );
      if (direccionOrden) {
        setDireccionSeleccionada(direccionOrden);
      }
      if (direccionRecoleccion) {
        setDireccionRecoleccionSeleccionada(direccionRecoleccion);
      }
    } catch (error) {
      console.error("Error al cargar direcciones:", error);
      toast.error("Error al cargar las direcciones");
    }
  };

  const filtrarDirecciones = (direcciones, esRecoleccion) => {
    if (orden.tipo_orden === "preorden" && esRecoleccion) {
      return direcciones.filter(
        (d) => d.id_departamento === 12 && d.id_municipio === 215
      );
    } else if (
      (orden.tipo_orden === "orden" || orden.tipo_orden === "preorden") &&
      orden.detalles[0].id_tipo_entrega === 2
    ) {
      // Para órdenes o preórdenes de tipo entrega express
      return direcciones.filter(
        (d) => d.id_departamento === 12 && d.id_municipio === 215
      );
    }
    return direcciones;
  };

  const obtenerNombreUbicacion = (direccion) => {
    const detalles = direccionesDetalladas[direccion.id];
    return `${detalles?.municipio || direccion.id_municipio}, ${detalles?.departamento || direccion.id_departamento}`;
  };

  const handleInputChange = (e, isDireccionRecoleccion = false) => {
    const { name, value } = e.target;
    if (isDireccionRecoleccion) {
      setDireccionRecoleccionSeleccionada((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setDireccionSeleccionada((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      // Actualizar dirección de entrega
      await axios.put(
        `${API_URL}/direcciones/${direccionSeleccionada.id}`,
        direccionSeleccionada,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Actualizar dirección de recolección si existe
      if (direccionRecoleccionSeleccionada) {
        await axios.put(
          `${API_URL}/direcciones/${direccionRecoleccionSeleccionada.id}`,
          direccionRecoleccionSeleccionada,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      toast.success("Dirección(es) actualizada(s) con éxito");
      actualizarOrden({
        direccion_emisor: direccionSeleccionada,
        id_direccion: direccionRecoleccionSeleccionada
          ? direccionRecoleccionSeleccionada.id
          : direccionSeleccionada.id,
        direccion_recoleccion: direccionRecoleccionSeleccionada
          ? direccionRecoleccionSeleccionada.id
          : null,
      });
      setEditando(false);
      setEditandoRecoleccion(false);
      fetchDirecciones();
    } catch (error) {
      console.error("Error al actualizar la(s) dirección(es):", error);
      toast.error("Error al actualizar la(s) dirección(es)");
    }
  };

  const seleccionarDireccion = async (direccion, esRecoleccion = false) => {
    if (
      (orden.tipo_orden === "preorden" ||
        (orden.tipo_orden === "orden" &&
          orden.detalles[0].id_tipo_entrega === 2)) &&
      ((esRecoleccion && direccion.id === direccionEntrega?.id) ||
        (!esRecoleccion && direccion.id === direccionRecoleccion?.id))
    ) {
      toast.error(
        "La dirección de recolección no puede ser la misma que la de entrega"
      );
      return;
    }

    try {
      const token = localStorage.getItem("token");
      let nuevaOrden = { ...orden };

      if (esRecoleccion) {
        // Actualizar dirección de recolección
        nuevaOrden.id_direccion = direccion.id;
      } else {
        // Actualizar dirección de entrega en todos los detalles
        nuevaOrden.detalles = orden.detalles.map((detalle) => ({
          ...detalle,
          id_direccion_entrega: direccion.id,
        }));

        // Actualizar los detalles en el backend
        for (let detalle of nuevaOrden.detalles) {
          await axios.put(
            `${API_URL}/ordenes/actualizar-detalle-orden/${detalle.id}`,
            { ...detalle, id_direccion_entrega: direccion.id },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      }

      // Actualizar la orden principal
      const dataToSend = {
        id_cliente: nuevaOrden.id_cliente,
        id_tipo_pago: nuevaOrden.id_tipo_pago,
        id_direccion: esRecoleccion ? direccion.id : nuevaOrden.id_direccion,
        direccion_recoleccion: esRecoleccion
          ? direccion.id
          : nuevaOrden.direccion_recoleccion,
        total_pagar: nuevaOrden.total_pagar,
        costo_adicional: nuevaOrden.costo_adicional,
        concepto: nuevaOrden.concepto,
        tipo_documento: nuevaOrden.tipo_documento,
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
        if (esRecoleccion) {
          setDireccionRecoleccion(direccion);
          setDireccionRecoleccionSeleccionada(direccion);
        } else {
          setDireccionEntrega(direccion);
          setDireccionSeleccionada(direccion);
        }

        actualizarOrden(nuevaOrden);

        toast.success(
          `Dirección de ${esRecoleccion ? "recolección" : "entrega"} actualizada con éxito`
        );
      } else {
        toast.error(
          `Error al actualizar la dirección de ${esRecoleccion ? "recolección" : "entrega"}`
        );
      }
    } catch (error) {
      console.error(`Error al actualizar la dirección:`, error);
      toast.error(`Error al actualizar la dirección`);
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

        <h4>
          Direcciones de {orden.tipo_orden === "preorden" ? "Entrega" : ""}{" "}
          Disponibles
        </h4>
        <Table responsive>
          <thead>
            <tr>
              <th>Dirección</th>
              <th>Contacto</th>
              <th>Teléfono</th>
              <th>Ubicación</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {filtrarDirecciones(direcciones, false).map((direccion) => (
              <tr key={direccion.id}>
                <td>
                  {direccion.direccion}
                  {direccion.id === direccionEntrega?.id && (
                    <span className="text-success"> (Entrega)</span>
                  )}
                </td>
                <td>{direccion.nombre_contacto}</td>
                <td>{direccion.telefono}</td>
                <td>{obtenerNombreUbicacion(direccion)}</td>
                <td>
                  <Button
                    color={
                      direccion.id === direccionEntrega?.id
                        ? "success"
                        : "primary"
                    }
                    onClick={() => seleccionarDireccion(direccion, false)}
                    disabled={
                      orden.tipo_orden === "preorden" &&
                      direccion.id === direccionRecoleccion?.id
                    }
                  >
                    {direccion.id === direccionEntrega?.id
                      ? "Seleccionada"
                      : "Seleccionar"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {(orden.tipo_orden === "preorden" ||
          (orden.tipo_orden === "orden" &&
            orden.detalles[0].id_tipo_entrega === 2 &&
            orden.id_direccion !== orden.detalles[0].id_direccion_entrega)) && (
          <div>
            <h4>Direcciones de Recolección Disponibles</h4>
            <Table responsive>
              <thead>
                <tr>
                  <th>Dirección</th>
                  <th>Contacto</th>
                  <th>Teléfono</th>
                  <th>Ubicacion</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filtrarDirecciones(direcciones, true).map((direccion) => (
                  <tr key={direccion.id}>
                    <td>
                      {direccion.direccion}
                      {direccion.id === direccionRecoleccion?.id && (
                        <span className="text-warning"> (Recolección)</span>
                      )}
                    </td>
                    <td>{direccion.nombre_contacto}</td>
                    <td>{direccion.telefono}</td>
                    <td>{obtenerNombreUbicacion(direccion)}</td>
                    <td>
                      <Button
                        color={
                          direccion.id === direccionRecoleccion?.id
                            ? "success"
                            : "primary"
                        }
                        onClick={() => seleccionarDireccion(direccion, true)}
                        disabled={direccion.id === direccionEntrega?.id}
                      >
                        {direccion.id === direccionRecoleccion?.id
                          ? "Seleccionada"
                          : "Seleccionar"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}

        {direccionEntrega && (
          <div>
            <h4>Dirección de Entrega Seleccionada</h4>
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
                  <strong>Ubicación:</strong>{" "}
                  {obtenerNombreUbicacion(direccionSeleccionada)}
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

        {direccionRecoleccion && (
          <div>
            <h4>Dirección de Recolección Seleccionada</h4>
            {editandoRecoleccion ? (
              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label for="referencia_recoleccion">Referencia</Label>
                  <Input
                    type="text"
                    name="referencia"
                    id="referencia_recoleccion"
                    value={direccionRecoleccionSeleccionada.referencia || ""}
                    onChange={(e) => handleInputChange(e, true)}
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="nombre_contacto_recoleccion">
                    Nombre de Contacto
                  </Label>
                  <Input
                    type="text"
                    name="nombre_contacto"
                    id="nombre_contacto_recoleccion"
                    value={
                      direccionRecoleccionSeleccionada.nombre_contacto || ""
                    }
                    onChange={(e) => handleInputChange(e, true)}
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="telefono_recoleccion">Teléfono</Label>
                  <Input
                    type="text"
                    name="telefono"
                    id="telefono_recoleccion"
                    value={direccionRecoleccionSeleccionada.telefono || ""}
                    onChange={(e) => handleInputChange(e, true)}
                  />
                </FormGroup>
                <Button color="primary" type="submit">
                  Guardar Cambios
                </Button>
                <Button
                  color="secondary"
                  onClick={() => setEditandoRecoleccion(false)}
                >
                  Cancelar
                </Button>
              </Form>
            ) : (
              <>
                <p>
                  <strong>Dirección:</strong> {direccionRecoleccion.direccion}
                </p>
                <p>
                  <strong>Contacto:</strong>{" "}
                  {direccionRecoleccion.nombre_contacto}
                </p>
                <p>
                  <strong>Teléfono:</strong> {direccionRecoleccion.telefono}
                </p>
                <p>
                  <strong>Ubicación:</strong>{" "}
                  {obtenerNombreUbicacion(direccionRecoleccion)}
                </p>
                <p>
                  <strong>Referencia:</strong>{" "}
                  {direccionRecoleccion.referencia || "No especificada"}
                </p>
                <Button
                  color="primary"
                  onClick={() => setEditandoRecoleccion(true)}
                >
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
