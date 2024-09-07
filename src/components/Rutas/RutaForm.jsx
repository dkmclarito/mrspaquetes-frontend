import React from "react";
import { Form, FormGroup, Label, Input, Button } from "reactstrap";

const RutaForm = ({
  ruta,
  rutasDropdown,
  vehiculos,
  handleInputChange,
  handleSubmit,
  isEditing,
}) => {
  return (
    <Form>
      <FormGroup>
        <Label for="id_ruta">Ruta</Label>
        <Input
          type="select"
          name="id_ruta"
          id="id_ruta"
          onChange={handleInputChange}
          value={ruta.id_ruta}
        >
          <option value="">Seleccione una ruta</option>
          {rutasDropdown.map((rutaOption) => (
            <option key={rutaOption.id} value={rutaOption.id}>
              {rutaOption.nombre}
            </option>
          ))}
        </Input>
      </FormGroup>
      <FormGroup>
        <Label for="id_vehiculo">Vehículo</Label>
        <Input
          type="select"
          name="id_vehiculo"
          id="id_vehiculo"
          onChange={handleInputChange}
          value={ruta.id_vehiculo}
        >
          <option value="">Seleccione un vehículo</option>
          {vehiculos.map((vehiculo) => (
            <option key={vehiculo.id} value={vehiculo.id}>
              {`${vehiculo.marca} ${vehiculo.modelo} - Carga: ${vehiculo.capacidad_carga} - Placa: ${vehiculo.placa} - Conductor: ${vehiculo.conductor}`}
            </option>
          ))}
        </Input>
      </FormGroup>
      <FormGroup>
        <Label for="fecha_asignacion">Fecha Asignación</Label>
        <Input
          type="date"
          name="fecha_asignacion"
          id="fecha_asignacion"
          onChange={handleInputChange}
          value={ruta.fecha_asignacion}
        />
      </FormGroup>
      <Button color="primary" onClick={handleSubmit}>
        {isEditing ? "Actualizar" : "Crear"}
      </Button>
    </Form>
  );
};

export default RutaForm;
