import React, { useState, useEffect } from "react";
import { Form, FormGroup, Label, Input, Button, Table } from "reactstrap";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

const EditarDireccion = ({ orden, actualizarDireccion }) => {
  const [direcciones, setDirecciones] = useState([]);
  const [direccionSeleccionada, setDireccionSeleccionada] = useState(null);

  useEffect(() => {
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

        // Establecer la dirección seleccionada inicialmente
        const direccionActual = response.data.direcciones.find(
          (d) => d.id === orden.id_direccion
        );
        setDireccionSeleccionada(direccionActual || null);
      } catch (error) {
        console.error("Error al cargar direcciones:", error);
        toast.error("Error al cargar las direcciones");
      }
    };

    fetchDirecciones();
  }, [orden.id_cliente, orden.id_direccion]);

  const seleccionarDireccion = (direccion) => {
    setDireccionSeleccionada(direccion);
    actualizarDireccion(direccion);
  };

  return (
    <div>
      <h3>Direcciones Disponibles</h3>
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
          <p>
            <strong>Dirección:</strong> {direccionSeleccionada.direccion}
          </p>
          <p>
            <strong>Contacto:</strong> {direccionSeleccionada.nombre_contacto}
          </p>
          <p>
            <strong>Teléfono:</strong> {direccionSeleccionada.telefono}
          </p>
        </div>
      )}
    </div>
  );
};

export default EditarDireccion;
