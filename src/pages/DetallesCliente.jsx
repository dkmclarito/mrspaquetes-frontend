import React, { useEffect, useState } from "react";
import { Card, CardBody, Col, Row, Button, Badge } from "reactstrap";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import AuthService from "../services/authService";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck,faTimes } from '@fortawesome/free-solid-svg-icons';

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
        setCliente(response.data.cliente);
      } catch (error) {
        console.error("Error al obtener los detalles del cliente:", error);
      }
    };

    fetchCliente();
  }, [id]);

  if (!cliente) {
    return <p>Cargando...</p>;
  }

  return (
    <div className="page-content">
      <Card>
        <CardBody>
          <h5 className="card-title">Detalles del Cliente</h5>
          <Row>
            <Col sm="12">
              <div className="table-responsive">
                <table className="table table-bordered">
                  <tbody>
                    <tr>
                      <th scope="row" style={{ width: '150px', whiteSpace: 'nowrap' }}>ID:</th>
                      <td>
                      <Badge color="primary"> {cliente.id} </Badge>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">Nombre:</th>
                      <td>{cliente.nombre || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th scope="row">Apellido:</th>
                      <td>{cliente.apellido || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th scope="row">Nombre Comercial:</th>
                      <td>{cliente.nombre_comercial || 'N/A'}</td>
                    </tr>                    
                    <tr>
                      <th scope="row">DUI/NIT:</th>
                      <td>{cliente.id_tipo_persona === 1 ? cliente.dui || 'N/A' : cliente.nit || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th scope="row">Teléfono:</th>
                      <td>{cliente.telefono || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th scope="row">Tipo de Persona:</th>
                      <td>{cliente.id_tipo_persona === 1 ? 'Persona Natural' : 'Persona Jurídica'}</td>
                    </tr>
                    <tr>
                    <th scope="row">Contribuyente:</th>
                    <td>
                      {cliente.es_contribuyente === 0 ? (
                        <FontAwesomeIcon icon={faCheck} style={{ color: 'green' }} />
                      ) : (
                        <FontAwesomeIcon icon={faTimes} style={{ color: 'red' }} />
                      )}
                    </td>
                    </tr>
                    <tr>
                      <th scope="row">Fecha de Registro:</th>
                      <td>{new Date(cliente.fecha_registro).toLocaleDateString('es-ES')}</td>
                    </tr>
                    <tr>
                      <th scope="row">Estado:</th>
                      <td>
                        <Badge color={cliente.id_estado === 1 ? "success" : "danger"}>
                          {cliente.id_estado === 1 ? "Activo" : "Inactivo"}
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">Departamento:</th>
                      <td>{cliente.id_departamento || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th scope="row">Municipio:</th>
                      <td>{cliente.id_municipio || 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Col>
          </Row>
          <div className="d-flex justify-content-between mt-4">
            <Link to="/GestionClientes" className="btn btn-secondary btn-regresar">
              <i className="fas fa-arrow-left"></i> Regresar
            </Link>
            {/*<Button color="primary">*/}
              {/*<i className="fas fa-edit"></i> Editar*/}
            {/*</Button>*/}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default DetallesCliente;
