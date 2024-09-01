import React, { useState, useEffect } from "react";
import { Form, FormGroup, Label, Input, Button, Table } from "reactstrap";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

const EditarCliente = ({ orden, actualizarCliente }) => {
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/clientes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClientes(response.data.data || []);

        // Establecer el cliente seleccionado inicialmente
        const clienteActual = response.data.data.find(
          (c) => c.id === orden.id_cliente
        );
        setClienteSeleccionado(clienteActual || null);
      } catch (error) {
        console.error("Error al cargar clientes:", error);
        toast.error("Error al cargar los clientes");
      }
    };

    fetchClientes();
  }, [orden.id_cliente]);

  const seleccionarCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    // Notificar al componente padre del cambio de cliente, sin seleccionar dirección
    actualizarCliente(cliente, null);
  };

  return (
    <div>
      <h3>Clientes Disponibles</h3>
      <Table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Teléfono</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => (
            <tr key={cliente.id}>
              <td>{cliente.nombre}</td>
              <td>{cliente.apellido}</td>
              <td>{cliente.telefono}</td>
              <td>
                <Button
                  color="primary"
                  onClick={() => seleccionarCliente(cliente)}
                  disabled={cliente.id === clienteSeleccionado?.id}
                >
                  {cliente.id === clienteSeleccionado?.id
                    ? "Seleccionado"
                    : "Seleccionar"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {clienteSeleccionado && (
        <div>
          <h4>Cliente Seleccionado</h4>
          <p>
            <strong>Nombre:</strong> {clienteSeleccionado.nombre}{" "}
            {clienteSeleccionado.apellido}
          </p>
          <p>
            <strong>Teléfono:</strong> {clienteSeleccionado.telefono}
          </p>
        </div>
      )}
    </div>
  );
};

export default EditarCliente;
