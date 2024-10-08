import React from "react";
import PropTypes from "prop-types";
import { Button } from "reactstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import "/src/styles/Clientes.css";

const TablaMarcas = ({ marcas, eliminarMarca, toggleModalEditar }) => {
  return (
    <div className="table-responsive" style={{ marginTop: "-10px" }}>
      <table className="table table-striped table-centered table-nowrap mb-0">
        <thead className="thead-light">
          <tr>
            <th className="text-center">ID</th>
            <th className="text-center">Nombre</th>
            <th className="text-center">Descripción</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {marcas.length > 0 ? (
            marcas.map(marca => (
              <tr key={marca.id}>
                <td>{marca.id}</td>
                <td>{marca.nombre}</td>
                <td>{marca.descripcion || 'N/A'}</td>
                <td>
                  <div className="button-container">
                    <Button
                      className="me-2 btn-icon btn-danger"
                      onClick={() => eliminarMarca(marca.id)}
                      aria-label="Eliminar marca"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </Button>
                    <Button
                      className="btn-icon btn-editar"
                      onClick={() => toggleModalEditar(marca)}
                      aria-label="Editar marca"
                    >
                      <FontAwesomeIcon icon={faPencilAlt} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">No hay datos disponibles</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

TablaMarcas.propTypes = {
  marcas: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    nombre: PropTypes.string.isRequired,
    descripcion: PropTypes.string,
  })).isRequired,
  eliminarMarca: PropTypes.func.isRequired,
  toggleModalEditar: PropTypes.func.isRequired,
};

export default TablaMarcas;
