import React, { useState, useEffect } from "react";
import { Button, Card, CardBody } from "reactstrap";
import EditarPaquete from "./EditarPaquete";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

const EditarPaquetes = ({ ordenId, actualizarOrden }) => {
  const [paquetes, setPaquetes] = useState([]);
  const [tarifas, setTarifas] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [datosComunes, setDatosComunes] = useState({
    id_estado_paquetes: 1,
    id_tipo_entrega: 1,
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const token = localStorage.getItem("token");
        const ordenEnEdicion = JSON.parse(
          localStorage.getItem("ordenEnEdicion") || "{}"
        );

        // Procesamos los detalles para combinar la información del paquete
        const paquetesProcesados = ordenEnEdicion.detalles.map((detalle) => ({
          ...detalle,
          ...detalle.paquete,
          id_paquete: detalle.id_paquete,
          id_tipo_entrega: detalle.id_tipo_entrega,
          id_estado_paquetes: detalle.id_estado_paquetes,
          id_direccion_entrega: detalle.id_direccion_entrega,
          validacion_entrega: detalle.validacion_entrega,
          instrucciones_entrega: detalle.instrucciones_entrega,
          descripcion: detalle.descripcion,
          precio: detalle.precio,
          fecha_entrega: detalle.fecha_entrega,
        }));

        setPaquetes(paquetesProcesados);
        setDatosComunes({
          id_estado_paquetes: ordenEnEdicion.id_estado_paquetes || 1,
          id_tipo_entrega: paquetesProcesados[0]?.id_tipo_entrega || 1,
        });

        const tarifasResponse = await axios.get(`${API_URL}/tarifa-destinos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTarifas(tarifasResponse.data || []);

        setSelectedAddress(ordenEnEdicion.direccion_emisor || {});
      } catch (error) {
        console.error("Error al cargar datos:", error);
        toast.error("Error al cargar los datos necesarios");
      }
    };

    cargarDatos();
  }, [ordenId]);

  const actualizarPaquete = (index, paqueteActualizado) => {
    const nuevosPaquetes = [...paquetes];
    nuevosPaquetes[index] = paqueteActualizado;
    setPaquetes(nuevosPaquetes);
  };

  const agregarNuevoPaquete = () => {
    const nuevoPaquete = {
      id: null,
      id_paquete: null,
      id_tipo_entrega: datosComunes.id_tipo_entrega,
      id_estado_paquetes: datosComunes.id_estado_paquetes,
      id_direccion_entrega: selectedAddress?.id_direccion,
      id_direccion: selectedAddress?.id_direccion,
      validacion_entrega: "",
      instrucciones_entrega: "",
      descripcion: "",
      precio: "",
      fecha_entrega: "",
      id_tipo_paquete: "",
      id_tamano_paquete: "",
      id_empaque: "",
      peso: "",
      fecha_envio: "",
      fecha_entrega_estimada: "",
      descripcion_contenido: "",
      id_estado_paquete: datosComunes.id_estado_paquetes,
    };
    setPaquetes([...paquetes, nuevoPaquete]);
  };

  const eliminarPaquete = (index) => {
    const nuevosPaquetes = paquetes.filter((_, i) => i !== index);
    setPaquetes(nuevosPaquetes);
  };

  const guardarPaquetes = () => {
    const paquetesActualizados = paquetes.map((paquete) => ({
      ...paquete,
      id_tipo_entrega: datosComunes.id_tipo_entrega,
      id_estado_paquetes: datosComunes.id_estado_paquetes,
      id_direccion_entrega: selectedAddress?.id_direccion,
      id_direccion: selectedAddress?.id_direccion,
    }));

    const ordenEnEdicion = JSON.parse(
      localStorage.getItem("ordenEnEdicion") || "{}"
    );
    ordenEnEdicion.detalles = paquetesActualizados;
    localStorage.setItem("ordenEnEdicion", JSON.stringify(ordenEnEdicion));
    actualizarOrden(ordenEnEdicion);
    toast.success("Cambios guardados en el localStorage");
  };

  return (
    <div>
      <h3>Paquetes de la Orden</h3>
      {paquetes.map((paquete, index) => (
        <Card key={index} className="mb-3">
          <CardBody>
            <h5>Paquete {index + 1}</h5>
            <EditarPaquete
              paquete={paquete}
              actualizarPaquete={(paqueteActualizado) =>
                actualizarPaquete(index, paqueteActualizado)
              }
              tarifas={tarifas}
              selectedAddress={selectedAddress}
              index={index}
            />
            <Button
              color="danger"
              onClick={() => eliminarPaquete(index)}
              className="mt-2"
            >
              Eliminar Paquete
            </Button>
          </CardBody>
        </Card>
      ))}
      <Button
        color="success"
        onClick={agregarNuevoPaquete}
        className="mt-3 mb-3"
      >
        Agregar Nuevo Paquete
      </Button>
      <Button
        color="primary"
        onClick={guardarPaquetes}
        className="mt-3 mb-3 ml-2"
      >
        Guardar Paquetes
      </Button>
    </div>
  );
};

export default EditarPaquetes;
