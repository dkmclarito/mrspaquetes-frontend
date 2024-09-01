import React, { useState, useEffect } from "react";
import { Button, Table, Card, CardBody } from "reactstrap";
import EditarPaquete from "./EditarPaquete";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

const EditarPaquetes = ({ orden, actualizarOrden }) => {
  const [paquetes, setPaquetes] = useState([]);
  const [editandoPaquete, setEditandoPaquete] = useState(null);

  useEffect(() => {
    if (orden && orden.detalles) {
      setPaquetes(orden.detalles);
    }
  }, [orden]);

  const agregarPaquete = () => {
    const nuevoPaquete = {
      id: Date.now(), // ID temporal
      id_tipo_paquete: "",
      id_empaque: "",
      peso: "",
      id_estado_paquete: "",
      fecha_envio: "",
      fecha_entrega_estimada: "",
      descripcion_contenido: "",
      precio: "",
    };
    setPaquetes([...paquetes, nuevoPaquete]);
  };

  const eliminarPaquete = (id) => {
    const nuevosPaquetes = paquetes.filter((paquete) => paquete.id !== id);
    setPaquetes(nuevosPaquetes);
    actualizarOrden({ ...orden, detalles: nuevosPaquetes });
  };

  const editarPaquete = (paquete) => {
    setEditandoPaquete(paquete);
  };

  const guardarPaquete = (paqueteEditado) => {
    const nuevosPaquetes = paquetes.map((p) =>
      p.id === paqueteEditado.id ? paqueteEditado : p
    );
    setPaquetes(nuevosPaquetes);
    setEditandoPaquete(null);
    actualizarOrden({ ...orden, detalles: nuevosPaquetes });
  };

  const cancelarEdicion = () => {
    setEditandoPaquete(null);
  };

  return (
    <Card>
      <CardBody>
        <h3>Paquetes de la Orden</h3>
        <Table>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Peso</th>
              <th>Estado</th>
              <th>Fecha Envío</th>
              <th>Fecha Entrega Est.</th>
              <th>Precio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paquetes.map((paquete) => (
              <tr key={paquete.id}>
                <td>{paquete.id_tipo_paquete}</td>
                <td>{paquete.peso}</td>
                <td>{paquete.id_estado_paquete}</td>
                <td>{paquete.fecha_envio}</td>
                <td>{paquete.fecha_entrega_estimada}</td>
                <td>{paquete.precio}</td>
                <td>
                  <Button
                    color="primary"
                    onClick={() => editarPaquete(paquete)}
                  >
                    Editar
                  </Button>
                  <Button
                    color="danger"
                    onClick={() => eliminarPaquete(paquete.id)}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Button color="success" onClick={agregarPaquete}>
          Agregar Paquete
        </Button>

        {editandoPaquete && (
          <EditarPaquete
            paquete={editandoPaquete}
            guardarPaquete={guardarPaquete}
            cancelarEdicion={cancelarEdicion}
          />
        )}
      </CardBody>
    </Card>
  );
};

export default EditarPaquetes;
