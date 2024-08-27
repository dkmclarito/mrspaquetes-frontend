import React, { useEffect, useState } from "react";
import { Card, CardBody, Col, Row, Button, Badge } from "reactstrap";
import { Link, useParams } from "react-router-dom";
import Breadcrumbs from "../components/Usuarios/Common/Breadcrumbs";
import axios from "axios";
import AuthService from "../services/authService";

const DetallesEmpleado = () => {
  const { id } = useParams(); // Obtiene el ID de la URL
  const [empleado, setEmpleado] = useState(null);

  useEffect(() => {
    const fetchEmpleado = async () => {
      try {
        const token = AuthService.getCurrentUser();
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/empleados/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });        
        setEmpleado(response.data.empleado);
      } catch (error) {
        console.error("Error al obtener los detalles del empleado:", error);
      }
    };

    fetchEmpleado();
  }, [id]);

  if (!empleado) {
    return <p>Cargando...</p>;
  }

  return (
    <div className="page-content">
      <Breadcrumbs title="Gestión de Empleados" breadcrumbItem="Datos de Empleado" />        
      <Card>
        <CardBody>
          <h5 className="card-title">Detalles del Empleado</h5>
          <Row>
            <Col sm="12">
              <div className="table-responsive">
                <table className="table table-bordered">
                  <tbody>
                    <tr>
                      <th scope="row" style={{ width: '150px', whiteSpace: 'nowrap' }}>ID:</th>
                      <td>
                      <Badge color="primary"> {empleado.id} </Badge>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">Nombre:</th>
                      <td>{empleado.nombres || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th scope="row">Apellido:</th>
                      <td>{empleado.apellidos || 'N/A'}</td>
                    </tr>                   
                    <tr>
                      <th scope="row">DUI:</th>
                      <td>{empleado.dui || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th scope="row">Teléfono:</th>
                      <td>{empleado.telefono || 'N/A'}</td>
                    </tr>
                    <tr>
                    </tr>
                    <tr>
                      <th scope="row">Fecha de Nacimiento:</th>
                      <td>{new Date(empleado.fecha_nacimiento).toLocaleDateString('es-ES')}</td>
                    </tr>
                    <tr>
                      <th scope="row">Fecha de Contratacion:</th>
                      <td>{new Date(empleado.fecha_contratacion).toLocaleDateString('es-ES')}</td>
                    </tr>
                    <tr>
                      <th scope="row">Estado:</th>
                      <td>
                        <Badge color={empleado.id_estado === 1 ? "success" : "danger"}>
                          {empleado.id_estado === 1 ? "Activo" : "Inactivo"}
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">Cargo:</th>
                      <td>{empleado.cargo || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th scope="row">Departamento:</th>
                      <td>{empleado.departamento || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th scope="row">Municipio:</th>
                      <td>{empleado.municipio || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th scope="row">Direccion:</th>
                      <td>{empleado.direccion || 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Col>
          </Row>
          <div className="d-flex justify-content-between mt-4">
            <Link to="/GestionEmpleados" className="btn btn-secondary btn-regresar">
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

export default DetallesEmpleado;
