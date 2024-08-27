import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Table, Button, Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import AuthService from '../../services/authService';
import FormularioDireccion from '../../pages/FormularioDireccion';
import ModalVerDireccion from './ModalVerDireccion';
import ModalEditarDireccion from './ModalEditarDireccion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

const API_URL = import.meta.env.VITE_API_URL;
const DIRECCIONES_POR_PAGINA = 5;

const ModalDirecciones = ({ isOpen, toggle, clienteId }) => {
    const [direcciones, setDirecciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [direccionSeleccionada, setDireccionSeleccionada] = useState(null);
    const [modalVerDireccion, setModalVerDireccion] = useState(false);
    const [modalEditarDireccion, setModalEditarDireccion] = useState(false);
    const [modalConfirmacion, setModalConfirmacion] = useState(false);
    const [direccionAEliminar, setDireccionAEliminar] = useState(null);
    const [paginaActual, setPaginaActual] = useState(1);

    const cargarDirecciones = async () => {
        setLoading(true);
        try {
            const token = AuthService.getCurrentUser();
            const response = await axios.get(`${API_URL}/direcciones?id_cliente=${clienteId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDirecciones(response.data.direcciones);
        } catch (error) {
            console.error('Error al cargar direcciones:', error);
            toast.error('Error al cargar las direcciones');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && clienteId) {
            cargarDirecciones();
        }
    }, [isOpen, clienteId]);

    const confirmarEliminarDireccion = (id) => {
        setDireccionAEliminar(id);
        setModalConfirmacion(true);
    };

    const eliminarDireccion = async () => {
        try {
            const token = AuthService.getCurrentUser();
            await axios.delete(`${API_URL}/direcciones/${direccionAEliminar}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await cargarDirecciones();
            toast.success('Dirección eliminada correctamente');
        } catch (error) {
            console.error('Error al eliminar dirección:', error);
            // Asumimos que cualquier error de eliminación podría ser debido a una asociación con una orden
            toast.error('Esta dirección no puede ser eliminada porque podría estar asociada a una orden u otros registros.');
        } finally {
            setModalConfirmacion(false);
            setDireccionAEliminar(null);
        }
    };

    const toggleFormulario = () => {
        setMostrarFormulario(!mostrarFormulario);
    };

    const onDireccionGuardada = () => {
        cargarDirecciones();
        setMostrarFormulario(false);
        toast.success('Dirección guardada correctamente');
    };

    const verDireccion = (direccion) => {
        setDireccionSeleccionada(direccion);
        setModalVerDireccion(true);
    };

    const editarDireccion = (direccion) => {
        setDireccionSeleccionada(direccion);
        setModalEditarDireccion(true);
    };

    const onDireccionEditada = () => {
        cargarDirecciones();
        setModalEditarDireccion(false);
        toast.success('Dirección actualizada correctamente');
    };

    // Cálculos para la paginación
    const totalPaginas = Math.ceil(direcciones.length / DIRECCIONES_POR_PAGINA);
    const indicePrimeraDireccion = (paginaActual - 1) * DIRECCIONES_POR_PAGINA;
    const indiceUltimaDireccion = indicePrimeraDireccion + DIRECCIONES_POR_PAGINA;
    const direccionesActuales = direcciones.slice(indicePrimeraDireccion, indiceUltimaDireccion);

    return (
        <>
            <Modal isOpen={isOpen} toggle={toggle} size="xl" style={{ maxWidth: '50%', width: '90%' }}>
                <ModalHeader toggle={toggle}>Direcciones del Cliente</ModalHeader>
                <ModalBody>
                    {mostrarFormulario ? (
                        <FormularioDireccion
                            clienteId={clienteId}
                            onDireccionGuardada={onDireccionGuardada}
                            onCancel={toggleFormulario}
                        />
                    ) : loading ? (
                        <p>Cargando direcciones...</p>
                    ) : direcciones.length > 0 ? (
                        <>
                            <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '20px' }}>
                                <Table responsive bordered hover>
                                    <thead>
                                        <tr>
                                            <th style={{ width: '20%' }}>Contacto</th>
                                            <th style={{ width: '15%' }}>Teléfono</th>
                                            <th style={{ width: '50%' }}>Dirección</th>
                                            <th style={{ width: '15%' }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {direccionesActuales.map((direccion) => (
                                            <tr key={direccion.id}>
                                                <td>{direccion.nombre_contacto}</td>
                                                <td style={{ whiteSpace: 'nowrap' }}>{direccion.telefono}</td>
                                                <td>{direccion.direccion}</td>
                                                <td>
                                                    <div className="d-flex justify-content-around">
                                                        <Button color="info" size="sm" onClick={() => verDireccion(direccion)} className="me-2">
                                                            <FontAwesomeIcon icon={faEye} />
                                                        </Button>
                                                        <Button color="warning" size="sm" onClick={() => editarDireccion(direccion)} className="me-2">
                                                            <FontAwesomeIcon icon={faEdit} />
                                                        </Button>
                                                        <Button color="danger" size="sm" onClick={() => confirmarEliminarDireccion(direccion.id)}>
                                                            <FontAwesomeIcon icon={faTrash} />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                            <Pagination className="justify-content-center">
                                <PaginationItem disabled={paginaActual === 1}>
                                    <PaginationLink previous onClick={() => setPaginaActual(paginaActual - 1)} />
                                </PaginationItem>
                                {[...Array(totalPaginas).keys()].map(numero => (
                                    <PaginationItem key={numero + 1} active={paginaActual === numero + 1}>
                                        <PaginationLink onClick={() => setPaginaActual(numero + 1)}>
                                            {numero + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}
                                <PaginationItem disabled={paginaActual === totalPaginas}>
                                    <PaginationLink next onClick={() => setPaginaActual(paginaActual + 1)} />
                                </PaginationItem>
                            </Pagination>
                        </>
                    ) : (
                        <p>No hay direcciones asociadas a este cliente.</p>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={toggleFormulario}>
                        {mostrarFormulario ? "Cancelar" : "Agregar Nueva Dirección"}
                    </Button>
                    <Button color="secondary" onClick={toggle}>Cerrar</Button>
                </ModalFooter>
            </Modal>
            <ModalVerDireccion
                isOpen={modalVerDireccion}
                toggle={() => setModalVerDireccion(!modalVerDireccion)}
                direccion={direccionSeleccionada}
            />
            <ModalEditarDireccion
                isOpen={modalEditarDireccion}
                toggle={() => setModalEditarDireccion(!modalEditarDireccion)}
                direccion={direccionSeleccionada}
                onDireccionEditada={onDireccionEditada}
            />
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
        </>
    );
};

export default ModalDirecciones;