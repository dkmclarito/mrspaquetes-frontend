import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, Table, Button, ModalFooter } from 'reactstrap';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthService from '../../services/authService';
import FormularioDireccion from '../../pages/FormularioDireccion';
import ModalVerDireccion from './ModalVerDireccion';
import ModalEditarDireccion from './ModalEditarDireccion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

const API_URL = import.meta.env.VITE_API_URL;

const ModalDirecciones = ({ isOpen, toggle, clienteId }) => {
    const [direcciones, setDirecciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [direccionSeleccionada, setDireccionSeleccionada] = useState(null);
    const [modalVerDireccion, setModalVerDireccion] = useState(false);
    const [modalEditarDireccion, setModalEditarDireccion] = useState(false);
    const [modalConfirmacion, setModalConfirmacion] = useState(false);
    const [direccionAEliminar, setDireccionAEliminar] = useState(null);

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
            toast.error('Error al eliminar la dirección');
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

    return (
        <>
            <Modal isOpen={isOpen} toggle={toggle} size="lg">
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
                            <Table>
                                <thead>
                                    <tr>
                                        <th>Contacto</th>
                                        <th>Teléfono</th>
                                        <th>Dirección</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {direcciones.map((direccion) => (
                                        <tr key={direccion.id}>
                                            <td>{direccion.nombre_contacto}</td>
                                            <td>{direccion.telefono}</td>
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
                            <Button color="primary" onClick={toggleFormulario}>
                                Agregar Nueva Dirección
                            </Button>
                        </>
                    ) : (
                        <>
                            <p>No hay direcciones asociadas a este cliente.</p>
                            <Button color="primary" onClick={toggleFormulario}>
                                Agregar Nueva Dirección
                            </Button>
                        </>
                    )}
                </ModalBody>
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
            <Modal isOpen={modalConfirmacion} toggle={() => setModalConfirmacion(false)} style={{ zIndex: 1060 }}>
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