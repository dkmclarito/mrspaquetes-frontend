import React from "react";
import PropTypes from "prop-types";
import { Button, Table } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import "../../styles/Vehiculos.css";

const TablaBodegas = ({ bodegas, departamentos, municipios, eliminarBodega, toggleModalEditar }) => {
  return (
    <div className="table-responsive" style={{ marginTop: "-10px" }}>
      <Table striped className="table-centered table-nowrap mb-0">
        <thead className="thead-light">
          <tr>
            <th className="text-center">ID</th>
            <th className="text-center">Nombre</th>
            <th className="text-center">Departamento</th>
            <th className="text-center">Municipio</th>
            <th className="text-center">Dirección</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {bodegas.length > 0 ? (
            bodegas.map(bodega => {
              const departamentoNombre = departamentos.find(dep => dep.id === Number(bodega.id_departamento))?.nombre;
              const municipioNombre = municipios.find(mun => mun.id === Number(bodega.id_municipio))?.nombre;

              return (
                <tr key={bodega.id}>
                  <td className="text-center">{bodega.id}</td>
                  <td className="text-center">{bodega.nombre || 'N/A'}</td>
                  <td className="text-center">{departamentoNombre || 'N/A'}</td>
                  <td className="text-center">{municipioNombre || 'N/A'}</td>
                  <td className="text-center">{bodega.direccion || 'N/A'}</td>
                  <td className="text-center">
                    <div className="button-container">
                      <Button
                        className="me-2 btn-icon btn-danger"
                        onClick={() => eliminarBodega(bodega.id)}
                        aria-label="Eliminar Bodega"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </Button>
                      <Button
                        className="btn-icon btn-editar"
                        onClick={() => toggleModalEditar(bodega)}
                        aria-label="Editar Bodega"
                      >
                        <FontAwesomeIcon icon={faPencilAlt} />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="6" className="text-center">
                No hay bodegas disponibles
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};



TablaBodegas.propTypes = {
  bodegas: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      nombre: PropTypes.string.isRequired,
      id_departamento: PropTypes.number.isRequired,
      id_municipio: PropTypes.number.isRequired,
      direccion: PropTypes.string.isRequired,
    })
  ).isRequired,
  departamentos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      nombre: PropTypes.string.isRequired,
    })
  ).isRequired,
  municipios: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      nombre: PropTypes.string.isRequired,
    })
  ).isRequired,
  eliminarBodega: PropTypes.func.isRequired,
  toggleModalEditar: PropTypes.func.isRequired,
};

export default TablaBodegas;
