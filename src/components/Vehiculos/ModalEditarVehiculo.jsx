import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input, Button, Row, Col } from "reactstrap";
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const ModalEditarVehiculo = ({
    modalEditar,
    vehiculoEditado,
    setVehiculoEditado,
    guardarCambiosVehiculo,
    setModalEditar
}) => {
    const [marcas, setMarcas] = useState([]);
    const [modelos, setModelos] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [estados, setEstados] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const token = localStorage.getItem('token');
                const [marcasRes, modelosRes, empleadosRes, estadosRes] = await Promise.all([
                    axios.get(`${API_URL}/dropdown/get_marcas`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${API_URL}/dropdown/get_modelos`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${API_URL}/dropdown/get_empleados`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${API_URL}/dropdown/get_estado_vehiculos`, { headers: { Authorization: `Bearer ${token}` } })
                ]);
                setMarcas(marcasRes.data.marcas || []);
                setModelos(modelosRes.data.modelos || []);
                setEmpleados(empleadosRes.data.empleados || []);
                setEstados(estadosRes.data.estado_vehiculos || []);
            } catch (error) {
                console.error("Error al obtener los datos:", error);
            }
        };

        fetchDropdownData();
    }, []);

    useEffect(() => {
        if (modalEditar && vehiculoEditado?.id) {
            const fetchVehicleData = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const { data } = await axios.get(`${API_URL}/vehiculo/${vehiculoEditado.id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    console.log('Fetched vehicle data:', data);

                    const conductorEmpleado = empleados.find(empleado => `${empleado.nombres} ${empleado.apellidos}` === data.conductor.trim());
                    const apoyoEmpleado = empleados.find(empleado => `${empleado.nombres} ${empleado.apellidos}` === data.apoyo.trim());

                    console.log('Conductor found:', conductorEmpleado);
                    console.log('Apoyo found:', apoyoEmpleado);

                    setVehiculoEditado(prev => ({
                        ...prev,
                        ...data,
                        id_marca: marcas.find(marca => marca.nombre === data.marca)?.id || "",
                        id_modelo: modelos.find(modelo => modelo.nombre === data.modelo)?.id || "",
                        id_empleado_conductor: conductorEmpleado ? conductorEmpleado.id : "",
                        id_empleado_apoyo: apoyoEmpleado ? apoyoEmpleado.id : "",
                        id_estado: estados.find(estado => estado.estado === data.estado)?.id || ""
                    }));

                } catch (error) {
                    console.error("Error fetching vehicle data:", error);
                }
            };

            fetchVehicleData();
        }
    }, [modalEditar, vehiculoEditado?.id, marcas, modelos, empleados, estados]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await guardarCambiosVehiculo();
            setModalEditar(false);
        } catch (err) {
            console.error("Error al guardar los cambios:", err);
            setError("Error al guardar los cambios. Por favor, intenta nuevamente.");
        }
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setVehiculoEditado((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <Modal isOpen={modalEditar} toggle={() => setModalEditar(false)} size="lg" className="modal-custom">
            <ModalHeader toggle={() => setModalEditar(false)}>Editar Vehículo</ModalHeader>
            <ModalBody>
                <form onSubmit={handleSubmit}>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <Row>
                        <Col md={6}>
                            <FormGroup>
                                <Label for="marca">Marca</Label>
                                <Input
                                    type="select"
                                    id="marca"
                                    name="id_marca"
                                    value={vehiculoEditado?.id_marca || ""}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Seleccione Marca</option>
                                    {marcas.map((marca) => (
                                        <option key={marca.id} value={marca.id}>
                                            {marca.nombre}
                                        </option>
                                    ))}
                                </Input>
                            </FormGroup>
                        </Col>
                        <Col md={6}>
                            <FormGroup>
                                <Label for="modelo">Modelo</Label>
                                <Input
                                    type="select"
                                    id="modelo"
                                    name="id_modelo"
                                    value={vehiculoEditado?.id_modelo || ""}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Seleccione Modelo</option>
                                    {modelos.map((modelo) => (
                                        <option key={modelo.id} value={modelo.id}>
                                            {modelo.nombre}
                                        </option>
                                    ))}
                                </Input>
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <FormGroup>
                                <Label for="placa">Placa</Label>
                                <Input
                                    type="text"
                                    id="placa"
                                    name="placa"
                                    value={vehiculoEditado?.placa || ""}
                                    onChange={handleInputChange}
                                    required
                                />
                            </FormGroup>
                        </Col>
                        <Col md={6}>
                            <FormGroup>
                                <Label for="anio">Año</Label>
                                <Input
                                    type="number"
                                    id="anio"
                                    name="year_fabricacion"
                                    value={vehiculoEditado?.year_fabricacion || ""}
                                    onChange={handleInputChange}
                                    min="1900"
                                    max="2099"
                                    required
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <FormGroup>
                                <Label for="conductor">Conductor</Label>
                                <Input
                                    type="select"
                                    id="conductor"
                                    name="id_empleado_conductor"
                                    value={vehiculoEditado?.id_empleado_conductor || ""}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Seleccione Conductor</option>
                                    {empleados
                                        .filter((empleado) => empleado.id_cargo === 1) // Filtra empleados con id_cargo 1 para conductores
                                        .map((empleado) => (
                                            <option key={empleado.id} value={empleado.id}>
                                                {empleado.nombres} {empleado.apellidos}
                                            </option>
                                        ))}
                                </Input>
                            </FormGroup>
                        </Col>
                        <Col md={6}>
                            <FormGroup>
                                <Label for="apoyo">Apoyo</Label>
                                <Input
                                    type="select"
                                    id="apoyo"
                                    name="id_empleado_apoyo"
                                    value={vehiculoEditado?.id_empleado_apoyo || ""}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Seleccione Apoyo</option>
                                    {empleados
                                        .filter((empleado) => empleado.id_cargo === 2) // Assuming `2` is for Apoyo roles
                                        .map((empleado) => (
                                            <option key={empleado.id} value={empleado.id}>
                                                {empleado.nombres} {empleado.apellidos}
                                            </option>
                                        ))}
                                </Input>
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={12}>
                            <FormGroup>
                                <Label for="estado">Estado</Label>
                                <Input
                                    type="select"
                                    id="estado"
                                    name="id_estado"
                                    value={vehiculoEditado?.id_estado || ""}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Seleccione Estado</option>
                                    {estados.map((estado) => (
                                        <option key={estado.id} value={estado.id}>
                                            {estado.estado}
                                        </option>
                                    ))}
                                </Input>
                            </FormGroup>
                        </Col>
                    </Row>
                    <ModalFooter>
                        <Button type="submit" color="primary">Guardar</Button>
                        <Button color="secondary" onClick={() => setModalEditar(false)}>Cancelar</Button>
                    </ModalFooter>
                </form>
            </ModalBody>
        </Modal>
    );
};

ModalEditarVehiculo.propTypes = {
    modalEditar: PropTypes.bool.isRequired,
    vehiculoEditado: PropTypes.object.isRequired,
    setVehiculoEditado: PropTypes.func.isRequired,
    guardarCambiosVehiculo: PropTypes.func.isRequired,
    setModalEditar: PropTypes.func.isRequired
};

export default ModalEditarVehiculo;
