import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';

const ModalEditarBodega = ({
  modalEditar,
  bodegaEditado,
  setBodegaEditado,
  guardarCambiosBodega,
  setModalEditar,
  departamentos,
  municipiosPorDepartamento = {},
}) => {
  const [municipios, setMunicipios] = useState([]);

  useEffect(() => {
    if (bodegaEditado.id_departamento) {
      setMunicipios(municipiosPorDepartamento[bodegaEditado.id_departamento] || []);
    } else {
      setMunicipios([]);
    }
  }, [bodegaEditado.id_departamento, municipiosPorDepartamento]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBodegaEditado({ ...bodegaEditado, [name]: value });
  };

  const handleDepartamentoChange = (e) => {
    const { value } = e.target;
    setBodegaEditado({
      ...bodegaEditado,
      id_departamento: value,
      id_municipio: "",
    });
  };

  const handleMunicipioChange = (e) => {
    const { value } = e.target;
    setBodegaEditado({ ...bodegaEditado, id_municipio: value });
  };

  const isDireccionValida =
    bodegaEditado.direccion && bodegaEditado.direccion.length <= 200;

  return (
    <Modal show={modalEditar} onHide={() => setModalEditar(false)} size="md">
      <Modal.Header closeButton>
        <Modal.Title>Editar Bodega</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {bodegaEditado ? (
          <Form>
            <Form.Group as={Row} controlId="nombre">
              <Form.Label column sm={12}>Nombre</Form.Label>
              <Col sm={12}>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={bodegaEditado.nombre || ""}
                  onChange={handleChange}
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row} controlId="nombre">
              <Form.Label column sm={12}>Tipo de bodega</Form.Label>
              <Col sm={12}>
                <Form.Control
                  as="select"
                  name="tipo_bodega"
                  value={bodegaEditado.tipo_bodega || ""}
                  onChange={handleChange}
                >
                  <option value="fisica">Física</option>
                  <option value="movil">Móvil</option>
                </Form.Control>
              </Col>
            </Form.Group>

            <Form.Group as={Row} controlId="direccion">
              <Form.Label column sm={12}>Dirección</Form.Label>
              <Col sm={12}>
                <Form.Control
                  type="text"
                  name="direccion"
                  value={bodegaEditado.direccion || ""}
                  onChange={handleChange}
                  isInvalid={!isDireccionValida}
                />
                <Form.Control.Feedback type="invalid">
                  La dirección debe contener entre 1 y 200 caracteres.
                </Form.Control.Feedback>
              </Col>
            </Form.Group>

            <Form.Group as={Row} controlId="departamento">
              <Form.Label column sm={12}>Departamento</Form.Label>
              <Col sm={12}>
                <Form.Control
                  as="select"
                  name="id_departamento"
                  value={bodegaEditado.id_departamento || ""}
                  onChange={handleDepartamentoChange}
                >
                      {departamentos
                        .filter((d) => [11, 12, 13, 14].includes(d.id)) // Filtra los departamentos para incluir solo los IDs deseados
                        .map((departamento) => (
                          <option key={departamento.id} value={departamento.id}>
                            {departamento.nombre}
                          </option>
                        ))}
                </Form.Control>
              </Col>
            </Form.Group>

            <Form.Group as={Row} controlId="municipio">
              <Form.Label column sm={12}>Municipio</Form.Label>
              <Col sm={12}>
                <Form.Control
                  as="select"
                  name="id_municipio"
                  value={bodegaEditado.id_municipio || ""}
                  onChange={handleMunicipioChange}
                  disabled={!bodegaEditado.id_departamento}
                >
                  <option value="">Seleccione un municipio</option>
                  {municipios.length > 0 ? (
                    municipios.map((mun) => (
                      <option key={mun.id} value={mun.id}>
                        {mun.nombre}
                      </option>
                    ))
                  ) : (
                    <option disabled>No hay municipios disponibles</option>
                  )}
                </Form.Control>
              </Col>
            </Form.Group>
          </Form>
        ) : (
          <p>Seleccione una bodega para editar.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="primary"
          onClick={guardarCambiosBodega}
          disabled={!bodegaEditado.nombre || !isDireccionValida}
        >
          Guardar
        </Button>
        <Button variant="secondary" onClick={() => setModalEditar(false)}>
          Cancelar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

ModalEditarBodega.propTypes = {
  modalEditar: PropTypes.bool.isRequired,
  bodegaEditado: PropTypes.object,
  setBodegaEditado: PropTypes.func.isRequired,
  guardarCambiosBodega: PropTypes.func.isRequired,
  setModalEditar: PropTypes.func.isRequired,
  departamentos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      nombre: PropTypes.string.isRequired,
    })
  ).isRequired,
  municipiosPorDepartamento: PropTypes.objectOf(
    PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        nombre: PropTypes.string.isRequired,
      })
    )
  ).isRequired,
};

export default ModalEditarBodega;
