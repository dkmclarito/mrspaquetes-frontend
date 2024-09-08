import React from "react";
import { Form, FormGroup, Label, Input, Button } from "reactstrap";

const OrdenForm = ({
  orden,
  rutasRecoleccion,
  ordenes,
  handleInputChange,
  handleSubmit,
  isEditing,
}) => {
  return (
    <Form>
      <FormGroup>
        <Label for="id_ruta_recoleccion">Ruta de Recolección</Label>
        <Input
          type="select"
          name="id_ruta_recoleccion"
          id="id_ruta_recoleccion"
          onChange={handleInputChange}
          value={orden.id_ruta_recoleccion}
        >
          <option value="">Seleccione una ruta de recolección</option>
          {rutasRecoleccion.map((ruta) => (
            <option key={ruta.id} value={ruta.id}>
              {ruta.ruta ? ruta.ruta.nombre : `Ruta ${ruta.id}`}
            </option>
          ))}
        </Input>
      </FormGroup>
      <FormGroup>
        <Label for="id_orden">Orden</Label>
        <Input
          type="select"
          name="id_orden"
          id="id_orden"
          onChange={handleInputChange}
          value={orden.id_orden}
        >
          <option value="">Seleccione una orden</option>
          {ordenes.map((orden) => (
            <option key={orden.id} value={orden.id}>
              {`${orden.numero_seguimiento || "N/A"} - ${orden.cliente?.nombre || "N/A"} ${orden.cliente?.apellido || ""}`}
            </option>
          ))}
        </Input>
      </FormGroup>
      <FormGroup>
        <Label for="estado">Estado</Label>
        <Input
          type="select"
          name="estado"
          id="estado"
          onChange={handleInputChange}
          value={orden.estado}
        >
          <option value="">Seleccione un estado</option>
          <option value="1">Pendiente</option>
          <option value="2">En Proceso</option>
          <option value="3">Completada</option>
        </Input>
      </FormGroup>
      <Button color="primary" onClick={handleSubmit}>
        {isEditing ? "Actualizar" : "Crear"}
      </Button>
    </Form>
  );
};

export default OrdenForm;
