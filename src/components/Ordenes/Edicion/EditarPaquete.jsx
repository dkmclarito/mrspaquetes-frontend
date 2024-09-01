import React, { useState, useEffect } from "react";
import {
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

const EditarPaquete = ({ paquete, guardarPaquete, cancelarEdicion }) => {
  const [paqueteEditado, setPaqueteEditado] = useState(paquete);
  const [tiposPaquete, setTiposPaquete] = useState([]);
  const [empaques, setEmpaques] = useState([]);
  const [estadosPaquete, setEstadosPaquete] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [tiposRes, empaquesRes, estadosRes] = await Promise.all([
          axios.get(`${API_URL}/dropdown/get_tipo_paquete`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/dropdown/get_empaques`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/dropdown/get_estado_paquete`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setTiposPaquete(tiposRes.data.tipo_paquete || []);
        setEmpaques(empaquesRes.data.empaques || []);
        setEstadosPaquete(estadosRes.data.estado_paquetes || []);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        toast.error("Error al cargar datos del paquete");
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaqueteEditado({ ...paqueteEditado, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    guardarPaquete(paqueteEditado);
  };

  return (
    <Modal isOpen={true} toggle={cancelarEdicion}>
      <ModalHeader toggle={cancelarEdicion}>Editar Paquete</ModalHeader>
      <ModalBody>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label for="id_tipo_paquete">Tipo de Paquete</Label>
            <Input
              type="select"
              name="id_tipo_paquete"
              id="id_tipo_paquete"
              value={paqueteEditado.id_tipo_paquete}
              onChange={handleChange}
            >
              <option value="">Seleccione un tipo</option>
              {tiposPaquete.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nombre}
                </option>
              ))}
            </Input>
          </FormGroup>
          <FormGroup>
            <Label for="id_empaque">Empaque</Label>
            <Input
              type="select"
              name="id_empaque"
              id="id_empaque"
              value={paqueteEditado.id_empaque}
              onChange={handleChange}
            >
              <option value="">Seleccione un empaque</option>
              {empaques.map((empaque) => (
                <option key={empaque.id} value={empaque.id}>
                  {empaque.empaquetado}
                </option>
              ))}
            </Input>
          </FormGroup>
          <FormGroup>
            <Label for="peso">Peso</Label>
            <Input
              type="number"
              name="peso"
              id="peso"
              value={paqueteEditado.peso}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for="id_estado_paquete">Estado del Paquete</Label>
            <Input
              type="select"
              name="id_estado_paquete"
              id="id_estado_paquete"
              value={paqueteEditado.id_estado_paquete}
              onChange={handleChange}
            >
              <option value="">Seleccione un estado</option>
              {estadosPaquete.map((estado) => (
                <option key={estado.id} value={estado.id}>
                  {estado.nombre}
                </option>
              ))}
            </Input>
          </FormGroup>
          <FormGroup>
            <Label for="fecha_envio">Fecha de Envío</Label>
            <Input
              type="date"
              name="fecha_envio"
              id="fecha_envio"
              value={paqueteEditado.fecha_envio}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for="fecha_entrega_estimada">
              Fecha de Entrega Estimada
            </Label>
            <Input
              type="date"
              name="fecha_entrega_estimada"
              id="fecha_entrega_estimada"
              value={paqueteEditado.fecha_entrega_estimada}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for="descripcion_contenido">Descripción del Contenido</Label>
            <Input
              type="textarea"
              name="descripcion_contenido"
              id="descripcion_contenido"
              value={paqueteEditado.descripcion_contenido}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for="precio">Precio</Label>
            <Input
              type="number"
              name="precio"
              id="precio"
              value={paqueteEditado.precio}
              onChange={handleChange}
            />
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleSubmit}>
          Guardar Cambios
        </Button>
        <Button color="secondary" onClick={cancelarEdicion}>
          Cancelar
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default EditarPaquete;
