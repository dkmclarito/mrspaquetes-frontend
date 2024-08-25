import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, Form, FormGroup, Label, Input, Button, FormFeedback } from 'reactstrap';
import axios from 'axios';
import AuthService from '../../services/authService';

const API_URL = import.meta.env.VITE_API_URL;

const ModalEditarDireccion = ({ isOpen, toggle, direccion, onDireccionEditada }) => {
    const [formData, setFormData] = useState({
        id_cliente: '',
        nombre_contacto: '',
        telefono: '',
        id_departamento: '',
        id_municipio: '',
        direccion: '',
        referencia: ''
    });
    const [departamentos, setDepartamentos] = useState([]);
    const [municipiosPorDepartamento, setMunicipiosPorDepartamento] = useState({});
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (direccion) {
            setFormData({
                id_cliente: direccion.id_cliente,
                nombre_contacto: direccion.nombre_contacto,
                telefono: direccion.telefono,
                id_departamento: direccion.id_departamento,
                id_municipio: direccion.id_municipio,
                direccion: direccion.direccion,
                referencia: direccion.referencia
            });
        }
    }, [direccion]);

    useEffect(() => {
        const fetchDepartamentos = async () => {
            try {
                const token = AuthService.getCurrentUser();
                const response = await axios.get(`${API_URL}/dropdown/get_departamentos`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setDepartamentos(response.data);
            } catch (error) {
                console.error("Error al obtener los departamentos:", error);
            }
        };

        fetchDepartamentos();
    }, []);

    useEffect(() => {
        const fetchMunicipios = async () => {
            if (formData.id_departamento) {
                try {
                    const token = AuthService.getCurrentUser();
                    const response = await axios.get(`${API_URL}/dropdown/get_municipio/${formData.id_departamento}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setMunicipiosPorDepartamento(prev => ({
                        ...prev,
                        [formData.id_departamento]: response.data.municipio
                    }));
                } catch (error) {
                    console.error("Error al obtener los municipios:", error);
                }
            }
        };

        fetchMunicipios();
    }, [formData.id_departamento]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'telefono') {
            let numericValue = value.replace(/[^\d]/g, '');
            numericValue = numericValue.slice(0, 8);
            let formattedValue = numericValue;
            if (numericValue.length > 4) {
                formattedValue = `${numericValue.slice(0, 4)}-${numericValue.slice(4)}`;
            }
            setFormData(prev => ({ ...prev, [name]: formattedValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        let errors = {};
        let formIsValid = true;

        if (!formData.nombre_contacto.trim()) {
            errors.nombre_contacto = "El nombre de contacto es requerido";
            formIsValid = false;
        }

        if (!formData.telefono.trim()) {
            errors.telefono = "El teléfono es requerido";
            formIsValid = false;
        } else if (!/^\d{4}-?\d{4}$/.test(formData.telefono)) {
            errors.telefono = "El teléfono debe tener 8 dígitos";
            formIsValid = false;
        }

        if (!formData.id_departamento) {
            errors.id_departamento = "El departamento es requerido";
            formIsValid = false;
        }

        if (!formData.id_municipio) {
            errors.id_municipio = "El municipio es requerido";
            formIsValid = false;
        }

        if (!formData.direccion.trim()) {
            errors.direccion = "La dirección es requerida";
            formIsValid = false;
        }

        if (!formData.referencia.trim()) {
            errors.referencia = "La referencia es requerida";
            formIsValid = false;
        }

        setErrors(errors);
        return formIsValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                const token = AuthService.getCurrentUser();
                await axios.put(`${API_URL}/direcciones/${direccion.id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                onDireccionEditada();
                toggle();
            } catch (error) {
                console.error('Error al editar dirección:', error);
            }
        }
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>Editar Dirección</ModalHeader>
            <ModalBody>
                <Form onSubmit={handleSubmit}>
                    <FormGroup>
                        <Label for="nombre_contacto">Nombre de Contacto</Label>
                        <Input
                            type="text"
                            name="nombre_contacto"
                            id="nombre_contacto"
                            value={formData.nombre_contacto}
                            onChange={handleChange}
                            invalid={!!errors.nombre_contacto}
                        />
                        <FormFeedback>{errors.nombre_contacto}</FormFeedback>
                    </FormGroup>
                    <FormGroup>
                        <Label for="telefono">Teléfono</Label>
                        <Input
                            type="text"
                            name="telefono"
                            id="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                            invalid={!!errors.telefono}
                            placeholder="1234-5678"
                            maxLength={9}
                        />
                        <FormFeedback>{errors.telefono}</FormFeedback>
                    </FormGroup>
                    <FormGroup>
                        <Label for="id_departamento">Departamento</Label>
                        <Input
                            type="select"
                            name="id_departamento"
                            id="id_departamento"
                            value={formData.id_departamento}
                            onChange={handleChange}
                            invalid={!!errors.id_departamento}
                        >
                            <option value="">Seleccione un departamento</option>
                            {departamentos.map(dep => (
                                <option key={dep.id} value={dep.id}>{dep.nombre}</option>
                            ))}
                        </Input>
                        <FormFeedback>{errors.id_departamento}</FormFeedback>
                    </FormGroup>
                    <FormGroup>
                        <Label for="id_municipio">Municipio</Label>
                        <Input
                            type="select"
                            name="id_municipio"
                            id="id_municipio"
                            value={formData.id_municipio}
                            onChange={handleChange}
                            invalid={!!errors.id_municipio}
                        >
                            <option value="">Seleccione un municipio</option>
                            {municipiosPorDepartamento[formData.id_departamento]?.map(mun => (
                                <option key={mun.id} value={mun.id}>{mun.nombre}</option>
                            ))}
                        </Input>
                        <FormFeedback>{errors.id_municipio}</FormFeedback>
                    </FormGroup>
                    <FormGroup>
                        <Label for="direccion">Dirección</Label>
                        <Input
                            type="text"
                            name="direccion"
                            id="direccion"
                            value={formData.direccion}
                            onChange={handleChange}
                            invalid={!!errors.direccion}
                        />
                        <FormFeedback>{errors.direccion}</FormFeedback>
                    </FormGroup>
                    <FormGroup>
                        <Label for="referencia">Referencia</Label>
                        <Input
                            type="text"
                            name="referencia"
                            id="referencia"
                            value={formData.referencia}
                            onChange={handleChange}
                            invalid={!!errors.referencia}
                        />
                        <FormFeedback>{errors.referencia}</FormFeedback>
                    </FormGroup>
                    <div className="d-flex justify-content-between">
                        <Button type="submit" color="primary">Guardar Cambios</Button>
                        <Button type="button" color="secondary" onClick={toggle}>Cancelar</Button>
                    </div>
                </Form>
            </ModalBody>
        </Modal>
    );
};

export default ModalEditarDireccion;