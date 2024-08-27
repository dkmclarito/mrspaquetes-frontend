import React, { useState, useEffect } from 'react';
import { Form, FormGroup, Label, Input, Button, FormFeedback } from 'reactstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthService from '../services/authService';

const API_URL = import.meta.env.VITE_API_URL;

const FormularioDireccion = ({ clienteId, onDireccionGuardada, onCancel }) => {
    const [formData, setFormData] = useState({
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
            // Elimina cualquier carácter que no sea número
            let numericValue = value.replace(/[^\d]/g, '');

            // Limita a 8 dígitos
            numericValue = numericValue.slice(0, 8);

            // Formatea el número con un guion después del cuarto dígito
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
                await axios.post(`${API_URL}/direcciones`, {
                    ...formData,
                    id_cliente: clienteId
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                onDireccionGuardada();
            } catch (error) {
                console.error('Error al guardar dirección:', error);
                toast.error('Error al guardar la dirección');
            }
        } else {
            toast.error('Por favor, corrija los errores en el formulario');
        }
    };

    return (
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
            <Button type="submit" color="primary">Guardar Dirección</Button>
            <Button type="button" color="secondary" onClick={onCancel}>Cancelar</Button>
        </Form>
    );
};

export default FormularioDireccion;