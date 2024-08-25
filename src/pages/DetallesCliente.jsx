import React, { useEffect, useState } from "react";
import { Card, CardBody, Col, Row, Button, Badge, Modal, ModalHeader, ModalBody, ModalFooter, Table } from "reactstrap";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthService from "../services/authService";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faEye, faEdit, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import FormularioDireccion from "../pages/FormularioDireccion";
import ModalEditarDireccion from "../components/Clientes/ModalEditarDireccion";

const API_URL = import.meta.env.VITE_API_URL;

const DetallesCliente = () => {
  const { id } = useParams();
  const [cliente, setCliente] = useState(null);
  const [direcciones, setDirecciones] = useState([]);
  const [modalDireccion, setModalDireccion] = useState(false);
  const [modalEditarDireccion, setModalEditarDireccion] = useState(false);
  const [direccionSeleccionada, setDireccionSeleccionada] = useState(null);
  const [modalConfirmacion, setModalConfirmacion] = useState(false);
  const [direccionAEliminar, setDireccionAEliminar] = useState(null);

  useEffect(() => {
    const fetchClienteYDirecciones = async () => {
      try {
        const token = AuthService.getCurrentUser();
        const clienteResponse = await axios.get(`${API_URL}/clientes/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCliente(clienteResponse.data.cliente);

        const direccionesResponse = await axios.get(`${API_URL}/direcciones?id_cliente=${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDirecciones(direccionesResponse.data.direcciones);
      } catch (error) {
        console.error("Error al obtener los datos:", error);
        toast.error("Error al cargar los datos del cliente");
      }
    };

    fetchClienteYDirecciones();
  }, [id]);

  const toggleModalDireccion = () => setModalDireccion(!modalDireccion);

  const onDireccionGuardada = async () => {
    toggleModalDireccion();
    await cargarDirecciones();
    toast.success('Dirección guardada correctamente');
  };

  const cargarDirecciones = async () => {
    try {
      const token = AuthService.getCurrentUser();
      const response = await axios.get(`${API_URL}/direcciones?id_cliente=${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDirecciones(response.data.direcciones);
    } catch (error) {
      console.error("Error al cargar direcciones:", error);
      toast.error("Error al cargar las direcciones");
    }
  };

  const editarDireccion = (direccion) => {
    setDireccionSeleccionada(direccion);
    setModalEditarDireccion(true);
  };

  const onDireccionEditada = async () => {
    setModalEditarDireccion(false);
    await cargarDirecciones();
    toast.success('Dirección actualizada correctamente');
  };

  const confirmarEliminarDireccion = (direccionId) => {
    setDireccionAEliminar(direccionId);
    setModalConfirmacion(true);
  };

  const eliminarDireccion = async () => {
    try {
      const token = AuthService.getCurrentUser();
      await axios.delete(`${API_URL}/direcciones/${direccionAEliminar}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await cargarDirecciones();
      setModalConfirmacion(false);
      toast.success('Dirección eliminada correctamente');
    } catch (error) {
      console.error("Error al eliminar dirección:", error);
      toast.error("Error al eliminar la dirección");
    }
  };

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
          <h5 className="mt-4">Direcciones del Cliente</h5>
          <Table>
            <thead>
              <tr>
                <th>Contacto</th>
                <th>Teléfono</th>
                <th>Departamento</th>
                <th>Municipio</th>
                <th>Dirección</th>
                <th>Referencia</th>
                <th>Acciones</th>

              </tr>
            </thead>
            <tbody>
              {direcciones.map((direccion) => (
                <tr key={direccion.id}>
                  <td>{direccion.nombre_contacto}</td>
                  <td>{direccion.telefono}</td>
                  <td>{direccion.id_departamento}</td>
                  <td>{direccion.id_municipio}</td>
                  <td>{direccion.direccion}</td>
                  <td>{direccion.referencia}</td>
                  <td>
                    <Button color="info" size="sm" className="me-2" onClick={() => editarDireccion(direccion)}>
                      <FontAwesomeIcon icon={faEdit} />
                    </Button>
                    <Button color="danger" size="sm" onClick={() => confirmarEliminarDireccion(direccion.id)}>
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Button color="primary" onClick={toggleModalDireccion}>
            <FontAwesomeIcon icon={faPlus} /> Agregar Dirección
          </Button>

          <div className="d-flex justify-content-between mt-4">
            <Link to="/GestionClientes" className="btn btn-secondary btn-regresar">
              <i className="fas fa-arrow-left"></i> Regresar
            </Link>
          </div>
        </CardBody>
      </Card>

      {/* Modal para agregar dirección */}
      <Modal isOpen={modalDireccion} toggle={toggleModalDireccion}>
        <ModalHeader toggle={toggleModalDireccion}>Agregar Nueva Dirección</ModalHeader>
        <ModalBody>
          <FormularioDireccion
            clienteId={id}
            onDireccionGuardada={onDireccionGuardada}
            onCancel={toggleModalDireccion}
          />
        </ModalBody>
      </Modal>

      {/* Modal para editar dirección */}
      <ModalEditarDireccion
        isOpen={modalEditarDireccion}
        toggle={() => setModalEditarDireccion(!modalEditarDireccion)}
        direccion={direccionSeleccionada}
        onDireccionEditada={onDireccionEditada}
      />

      {/* Modal de confirmación para eliminar */}
      <Modal isOpen={modalConfirmacion} toggle={() => setModalConfirmacion(false)}>
        <ModalHeader toggle={() => setModalConfirmacion(false)}>Confirmar Eliminación</ModalHeader>
        <ModalBody>
          ¿Está seguro de que desea eliminar esta dirección?
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={eliminarDireccion}>Eliminar</Button>{' '}
          <Button color="secondary" onClick={() => setModalConfirmacion(false)}>Cancelar</Button>
        </ModalFooter>
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default DetallesCliente;