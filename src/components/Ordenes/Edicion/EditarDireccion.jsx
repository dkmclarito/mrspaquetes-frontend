import React, { useState, useEffect } from "react";
import {
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
} from "reactstrap";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

const EditarDireccion = ({ orden, actualizarOrden }) => {
  const [direcciones, setDirecciones] = useState([]);
  const [direccionSeleccionada, setDireccionSeleccionada] = useState(null);
  const [editando, setEditando] = useState(false);
  const [modalAgregar, setModalAgregar] = useState(false);
  const [nuevaDireccion, setNuevaDireccion] = useState({
    id_cliente: orden.id_cliente,
    nombre_contacto: "",
    telefono: "",
    id_departamento: "",
    id_municipio: "",
    direccion: "",
    referencia: "",
  });
  const [departamentos, setDepartamentos] = useState([]);
  const [municipios, setMunicipios] = useState([]);

  useEffect(() => {
    fetchDirecciones();
    fetchDepartamentos();
  }, [orden.id_cliente]);

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
      const direccionActual = response.data.direcciones.find(
        (d) => d.id === orden.id_direccion
      );
      setDireccionSeleccionada(direccionActual || null);
    } catch (error) {
      console.error("Error al cargar direcciones:", error);
      toast.error("Error al cargar las direcciones");
    }
  };

  const fetchDepartamentos = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/dropdown/get_departamentos`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDepartamentos(response.data || []);
    } catch (error) {
      console.error("Error al cargar departamentos:", error);
      toast.error("Error al cargar los departamentos");
    }
  };

  const fetchMunicipios = async (idDepartamento) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/dropdown/get_municipio/${idDepartamento}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMunicipios(response.data.municipio || []);
    } catch (error) {
      console.error("Error al cargar municipios:", error);
      toast.error("Error al cargar los municipios");
    }
  };

  const seleccionarDireccion = (direccion) => {
    setDireccionSeleccionada(direccion);
    actualizarOrden({ ...orden, id_direccion: direccion.id });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (editando) {
      setDireccionSeleccionada((prev) => ({ ...prev, [name]: value }));
    } else {
      setNuevaDireccion((prev) => ({ ...prev, [name]: value }));
    }

    if (name === "id_departamento") {
      fetchMunicipios(value);
    }
  };

  const guardarCambios = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_URL}/direcciones/${direccionSeleccionada.id}`,
        direccionSeleccionada,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.status === 200) {
        toast.success("Dirección actualizada con éxito");
        setEditando(false);
        fetchDirecciones();
      } else {
        toast.error("Error al actualizar la dirección");
      }
    } catch (error) {
      console.error("Error al guardar los cambios:", error);
      toast.error("Error al guardar los cambios en la dirección");
    }
  };

  const agregarDireccion = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/direcciones`,
        nuevaDireccion,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.status === 201) {
        toast.success("Nueva dirección agregada con éxito");
        setModalAgregar(false);
        fetchDirecciones();
      } else {
        toast.error("Error al agregar la nueva dirección");
      }
    } catch (error) {
      console.error("Error al agregar nueva dirección:", error);
      toast.error("Error al agregar la nueva dirección");
    }
  };

  return (
    <div>
      <h3>Direcciones Disponibles</h3>
      <Button color="success" onClick={() => setModalAgregar(true)}>
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
                  color="primary"
                  onClick={() => seleccionarDireccion(direccion)}
                  disabled={direccion.id === direccionSeleccionada?.id}
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
            <Form>
              <FormGroup>
                <Label for="nombre_contacto">Nombre de Contacto</Label>
                <Input
                  type="text"
                  name="nombre_contacto"
                  id="nombre_contacto"
                  value={direccionSeleccionada.nombre_contacto}
                  onChange={handleChange}
                />
              </FormGroup>
              <FormGroup>
                <Label for="telefono">Teléfono</Label>
                <Input
                  type="tel"
                  name="telefono"
                  id="telefono"
                  value={direccionSeleccionada.telefono}
                  onChange={handleChange}
                />
              </FormGroup>
              <FormGroup>
                <Label for="id_departamento">Departamento</Label>
                <Input
                  type="select"
                  name="id_departamento"
                  id="id_departamento"
                  value={direccionSeleccionada.id_departamento}
                  onChange={handleChange}
                >
                  <option value="">Seleccione un departamento</option>
                  {departamentos.map((dep) => (
                    <option key={dep.id} value={dep.id}>
                      {dep.nombre}
                    </option>
                  ))}
                </Input>
              </FormGroup>
              <FormGroup>
                <Label for="id_municipio">Municipio</Label>
                <Input
                  type="select"
                  name="id_municipio"
                  id="id_municipio"
                  value={direccionSeleccionada.id_municipio}
                  onChange={handleChange}
                >
                  <option value="">Seleccione un municipio</option>
                  {municipios.map((mun) => (
                    <option key={mun.id} value={mun.id}>
                      {mun.nombre}
                    </option>
                  ))}
                </Input>
              </FormGroup>
              <FormGroup>
                <Label for="direccion">Dirección</Label>
                <Input
                  type="text"
                  name="direccion"
                  id="direccion"
                  value={direccionSeleccionada.direccion}
                  onChange={handleChange}
                />
              </FormGroup>
              <FormGroup>
                <Label for="referencia">Referencia</Label>
                <Input
                  type="text"
                  name="referencia"
                  id="referencia"
                  value={direccionSeleccionada.referencia}
                  onChange={handleChange}
                />
              </FormGroup>
              <Button color="success" onClick={guardarCambios}>
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
              <Button color="primary" onClick={() => setEditando(true)}>
                Editar Dirección
              </Button>
            </>
          )}
        </div>
      )}

      <Modal
        isOpen={modalAgregar}
        toggle={() => setModalAgregar(!modalAgregar)}
      >
        <ModalHeader toggle={() => setModalAgregar(!modalAgregar)}>
          Agregar Nueva Dirección
        </ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="nombre_contacto">Nombre de Contacto</Label>
              <Input
                type="text"
                name="nombre_contacto"
                id="nombre_contacto"
                value={nuevaDireccion.nombre_contacto}
                onChange={handleChange}
              />
            </FormGroup>
            <FormGroup>
              <Label for="telefono">Teléfono</Label>
              <Input
                type="tel"
                name="telefono"
                id="telefono"
                value={nuevaDireccion.telefono}
                onChange={handleChange}
              />
            </FormGroup>
            <FormGroup>
              <Label for="id_departamento">Departamento</Label>
              <Input
                type="select"
                name="id_departamento"
                id="id_departamento"
                value={nuevaDireccion.id_departamento}
                onChange={handleChange}
              >
                <option value="">Seleccione un departamento</option>
                {departamentos.map((dep) => (
                  <option key={dep.id} value={dep.id}>
                    {dep.nombre}
                  </option>
                ))}
              </Input>
            </FormGroup>
            <FormGroup>
              <Label for="id_municipio">Municipio</Label>
              <Input
                type="select"
                name="id_municipio"
                id="id_municipio"
                value={nuevaDireccion.id_municipio}
                onChange={handleChange}
              >
                <option value="">Seleccione un municipio</option>
                {municipios.map((mun) => (
                  <option key={mun.id} value={mun.id}>
                    {mun.nombre}
                  </option>
                ))}
              </Input>
            </FormGroup>
            <FormGroup>
              <Label for="direccion">Dirección</Label>
              <Input
                type="text"
                name="direccion"
                id="direccion"
                value={nuevaDireccion.direccion}
                onChange={handleChange}
              />
            </FormGroup>
            <FormGroup>
              <Label for="referencia">Referencia</Label>
              <Input
                type="text"
                name="referencia"
                id="referencia"
                value={nuevaDireccion.referencia}
                onChange={handleChange}
              />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={agregarDireccion}>
            Agregar
          </Button>{" "}
          <Button color="secondary" onClick={() => setModalAgregar(false)}>
            Cancelar
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default EditarDireccion;
