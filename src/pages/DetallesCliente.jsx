import React, { useEffect, useState } from "react";
import { Card, CardBody, Col, Row, Button, Badge } from "reactstrap";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import AuthService from "../services/authService";

const DetallesCliente = () => {
  const { id } = useParams(); // Obtiene el ID de la URL
  const [cliente, setCliente] = useState(null);

  useEffect(() => {
    const fetchCliente = async () => {
      try {
        const token = AuthService.getCurrentUser();
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/clientes/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        console.log("Datos del cliente:", response.data); // Verifica los datos recibidos
        setCliente(response.data);
      } catch (error) {
        console.error("Error al obtener los detalles del cliente:", error);
      }
    };

    fetchCliente();
  }, [id]);

  if (!cliente) {
    return <p>Cargando...</p>;
  }

  // Función para obtener el nombre del tipo de persona
  const obtenerNombreTipoPersona = (idTipoPersona) => {
    const tipoPersona = {
      1: "Persona Natural",
      2: "Persona Jurídica",
    };
    return tipoPersona[idTipoPersona] || 'Desconocido';
  };

  // Función para obtener el DUI o el NIT según el tipo de persona
  const obtenerDocumento = (idTipoPersona, dui, nit) => {
    if (idTipoPersona === 1) { // Persona Natural
      return dui || 'N/A';
    } else if (idTipoPersona === 2) { // Persona Jurídica
      return nit || 'N/A';
    }
    return 'N/A';
  };

  // Función para formatear la fecha sin la hora
  const formatearFecha = (fecha) => {
    const opciones = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const fechaFormateada = new Date(fecha).toLocaleDateString('es-ES', opciones);
    return fechaFormateada;
  };

  return (
    <div className="page-content">
      <Card>
        <CardBody>
          <h5 className="card-title">
            Cliente: {cliente.nombre_comercial || cliente.nombre} {cliente.apellido}
          </h5>
          <Row>
            <Col sm="12">
              <div className="table-responsive">
                <table className="table table-bordered">
                  <tbody>
                    <tr>
                      <th scope="row">ID</th>
                      <td>
                        <Badge color="purple">{cliente.id}</Badge>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">Nombre</th>
                      <td>{cliente.nombre}</td>
                    </tr>
                    <tr>
                      <th scope="row">Apellido</th>
                      <td>{cliente.apellido}</td>
                    </tr>
                    <tr>
                      <th scope="row">Tipo de Persona</th>
                      <td>{obtenerNombreTipoPersona(cliente.id_tipo_persona)}</td>
                    </tr>
                    <tr>
                      <th scope="row">DUI/NIT</th>
                      <td>{obtenerDocumento(cliente.id_tipo_persona, cliente.dui, cliente.nit)}</td>
                    </tr>
                    <tr>
                      <th scope="row">Teléfono</th>
                      <td>{cliente.telefono || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th scope="row">Fecha de Registro</th>
                      <td>{formatearFecha(cliente.fecha_registro)}</td>
                    </tr>
                    <tr>
                      <th scope="row">Estado</th>
                      <td>
                        <Badge color={cliente.id_estado === 1 ? "success" : "danger"}>
                          {cliente.id_estado === 1 ? "Activo" : "Inactivo"}
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">Creado por</th>
                      <td>{cliente.created_by || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th scope="row">Modificado por</th>
                      <td>{cliente.updated_by || 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Col>
          </Row>
          <div className="d-flex justify-content-between mt-4">
            <Link to="/GestionClientes" className="btn btn-secondary">
              <i className="fas fa-arrow-left"></i> Regresar
            </Link>
            <Button color="primary">
              <i className="fas fa-edit"></i> Editar
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default DetallesCliente;
