import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input, Button } from "reactstrap";

const ModalEditarVehiculo = ({
    modalEditar,
    vehiculoEditado,
    setVehiculoEditado,
    guardarCambiosVehiculo,
    setModalEditar,
    modelos = [] // Default value if modelos is undefined
}) => {
    const [error, setError] = useState(null);

    useEffect(() => {
        if (modalEditar && vehiculoEditado) {
            setError(null);
        }
    }, [modalEditar, vehiculoEditado]);

    const handleGuardarCambios = () => {
        // Restablecer el mensaje de error en cada intento de guardado
        setError(null);

        if (!vehiculoEditado.placa) {
            setError("La placa no puede estar vacía.");
            return;
        }

        if (!vehiculoEditado.modelo_id) {
            setError("Debe seleccionar un modelo.");
            return;
        }

        if (!vehiculoEditado.color) {
            setError("El color no puede estar vacío.");
            return;
        }

        if (!vehiculoEditado.anio) {
            setError("El año no puede estar vacío.");
            return;
        }

        // Preparar datos del vehículo para guardarlos
        const vehiculoActualizado = {
            ...vehiculoEditado,
        };

        guardarCambiosVehiculo(vehiculoActualizado);
    };

    return (
        <Modal isOpen={modalEditar} toggle={() => setModalEditar(false)}>
            <ModalHeader toggle={() => setModalEditar(false)}>Editar Vehículo</ModalHeader>
            <ModalBody>
                <FormGroup>
                    <Label for="placa">Placa</Label>
                    <Input
                        type="text"
                        id="placa"
                        value={vehiculoEditado ? vehiculoEditado.placa : ""}
                        onChange={(e) => setVehiculoEditado(prevState => ({ ...prevState, placa: e.target.value }))}
                        required
                    />
                </FormGroup>
                <FormGroup>
                    <Label for="modelo">Modelo</Label>
                    <Input
                        type="select"
                        id="modelo"
                        value={vehiculoEditado ? vehiculoEditado.modelo_id : ""}
                        onChange={(e) => setVehiculoEditado(prevState => ({ ...prevState, modelo_id: e.target.value }))}
                        required
                    >
                        <option value="">Seleccione un modelo</option>
                        {Array.isArray(modelos) && modelos.length > 0 ? (
                            modelos.map(modelo => (
                                <option key={modelo.id} value={modelo.id}>
                                    {modelo.nombre}
                                </option>
                            ))
                        ) : (
                            <option disabled>No hay modelos disponibles</option>
                        )}
                    </Input>
                </FormGroup>
                <FormGroup>
                    <Label for="color">Color</Label>
                    <Input
                        type="text"
                        id="color"
                        value={vehiculoEditado ? vehiculoEditado.color : ""}
                        onChange={(e) => setVehiculoEditado(prevState => ({ ...prevState, color: e.target.value }))}
                        required
                    />
                </FormGroup>
                <FormGroup>
                    <Label for="anio">Año</Label>
                    <Input
                        type="number"
                        id="anio"
                        value={vehiculoEditado ? vehiculoEditado.anio : ""}
                        onChange={(e) => setVehiculoEditado(prevState => ({ ...prevState, anio: e.target.value }))}
                        required
                    />
                </FormGroup>
                <FormGroup>
                    <Label for="descripcion">Descripción</Label>
                    <Input
                        type="textarea"
                        id="descripcion"
                        value={vehiculoEditado ? vehiculoEditado.descripcion : ""}
                        onChange={(e) => setVehiculoEditado(prevState => ({ ...prevState, descripcion: e.target.value }))}
                    />
                </FormGroup>
                <FormGroup>
                    <Label for="status">Estado</Label>
                    <Input
                        type="select"
                        id="status"
                        value={vehiculoEditado ? vehiculoEditado.status : ""}
                        onChange={(e) => setVehiculoEditado(prevState => ({ ...prevState, status: e.target.value }))}
                        required
                    >
                        <option value="1">Activo</option>
                        <option value="0">Inactivo</option>
                    </Input>
                </FormGroup>
                {error && <p className="text-danger">{error}</p>}
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={handleGuardarCambios}>Guardar Cambios</Button>
                <Button color="secondary" onClick={() => setModalEditar(false)}>Cancelar</Button>
            </ModalFooter>
        </Modal>
    );
};

ModalEditarVehiculo.propTypes = {
    modalEditar: PropTypes.bool.isRequired,
    vehiculoEditado: PropTypes.object,
    setVehiculoEditado: PropTypes.func.isRequired,
    guardarCambiosVehiculo: PropTypes.func.isRequired,
    setModalEditar: PropTypes.func.isRequired,
    modelos: PropTypes.array.isRequired
};

export default ModalEditarVehiculo;
