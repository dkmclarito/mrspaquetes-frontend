import React, { useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody, ListGroup, ListGroupItem } from 'reactstrap';
import axios from 'axios';
import AuthService from '../../services/authService';

const API_URL = import.meta.env.VITE_API_URL;

const ModalVerDireccion = ({ isOpen, toggle, direccion }) => {
    const [direccionCompleta, setDireccionCompleta] = useState(null);

    useEffect(() => {
        if (direccion && isOpen) {
            const fetchDireccionCompleta = async () => {
                try {
                    const token = AuthService.getCurrentUser();

                    // Obtener detalles básicos de la dirección
                    const responseBasic = await axios.get(`${API_URL}/direcciones/${direccion.id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    // Obtener detalles del departamento y municipio
                    const responseDetails = await axios.get(`${API_URL}/dropdown/get_direcciones/${direccion.id_cliente}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    const direccionDetallada = responseDetails.data.find(d => d.id === direccion.id);

                    // Combinar la información
                    setDireccionCompleta({
                        ...responseBasic.data.direccion,
                        departamento: direccionDetallada?.departamento,
                        municipio: direccionDetallada?.municipio
                    });
                } catch (error) {
                    console.error('Error al obtener los detalles de la dirección:', error);
                }
            };
            fetchDireccionCompleta();
        }
    }, [direccion, isOpen]);

    if (!direccionCompleta) return null;

    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>Detalles de la Dirección</ModalHeader>
            <ModalBody>
                <ListGroup>
                    <ListGroupItem>Contacto: {direccionCompleta.nombre_contacto}</ListGroupItem>
                    <ListGroupItem>Teléfono: {direccionCompleta.telefono}</ListGroupItem>
                    <ListGroupItem>Departamento: {direccionCompleta.departamento || direccionCompleta.id_departamento}</ListGroupItem>
                    <ListGroupItem>Municipio: {direccionCompleta.municipio || direccionCompleta.id_municipio}</ListGroupItem>
                    <ListGroupItem>Dirección: {direccionCompleta.direccion}</ListGroupItem>
                    <ListGroupItem>Referencia: {direccionCompleta.referencia || 'No especificada'}</ListGroupItem>
                </ListGroup>
            </ModalBody>
        </Modal>
    );
};

export default ModalVerDireccion;