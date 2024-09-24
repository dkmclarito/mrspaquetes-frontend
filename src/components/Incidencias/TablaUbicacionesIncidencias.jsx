import React, { useState, useMemo } from "react";
import { Table, Input, Label, Row, Col } from "reactstrap";

const TablaUbicacionesIncidencias = ({ incidencias }) => {
  const [uuidFiltro, setUuidFiltro] = useState("");
  const [ubicacionFiltro, setUbicacionFiltro] = useState("");

  // Obtener una lista única de ubicaciones para el dropdown
  const ubicacionesUnicas = useMemo(() => {
    const ubicaciones = incidencias.map((incidencia) => incidencia.ubicacion);
    return Array.from(new Set(ubicaciones));
  }, [incidencias]);

  // Filtrar las incidencias según los filtros de UUID y ubicación
  const incidenciasFiltradas = useMemo(() => {
    return incidencias.filter((incidencia) => {
      const cumpleUuid = !uuidFiltro || incidencia.uuid.toLowerCase().includes(uuidFiltro.toLowerCase());
      const cumpleUbicacion = !ubicacionFiltro || incidencia.ubicacion === ubicacionFiltro;

      return cumpleUuid && cumpleUbicacion;
    });
  }, [incidencias, uuidFiltro, ubicacionFiltro]);

  return (
    <div>
      <Row className="mb-3">
        <Col md={6}>
          <Label for="uuidFiltro">Buscar por UUID:</Label>
          <Input
            type="text"
            id="uuidFiltro"
            value={uuidFiltro}
            onChange={(e) => setUuidFiltro(e.target.value)}
            placeholder="Ingrese UUID"
          />
        </Col>
        <Col md={6}>
          <Label for="ubicacionFiltro">Filtrar por Ubicación:</Label>
          <Input
            type="select"
            id="ubicacionFiltro"
            value={ubicacionFiltro}
            onChange={(e) => setUbicacionFiltro(e.target.value)}
          >
            <option value="">Todas las ubicaciones</option>
            {ubicacionesUnicas.map((ubicacion, index) => (
              <option key={index} value={ubicacion}>
                {ubicacion}
              </option>
            ))}
          </Input>
        </Col>
      </Row>

      <Table bordered>
        <thead>
          <tr>
            <th>ID Paquete</th>
            <th>UUID</th>
            <th>Descripción Paquete</th>
            <th>Ubicación</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {incidenciasFiltradas.map((incidencia) => (
            <tr key={incidencia.id}>
              <td>{incidencia.id_paquete}</td>
              <td>{incidencia.uuid}</td>
              <td>{incidencia.paquete}</td>
              <td>{incidencia.ubicacion}</td>
              <td>{incidencia.estado === 1 ? "Abierta" : "Cerrada"}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default TablaUbicacionesIncidencias;
