import React from "react";
import PropTypes from "prop-types";
import { Button } from "reactstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import "/src/styles/Vehiculos.css";

const TablaModelos = ({ modelos, eliminarModelo, toggleModalEditar, marcas  }) => {
  return (
    <div className="table-responsive" style={{ marginTop: "-10px" }}>
      <table className="table table-centered table-nowrap mb-0">
        <thead className="thead-light">
          <tr>
            <th className="text-center">ID</th>
            <th className="text-center">Nombre</th>
            <th className="text-center">Descripción</th>
            <th className="text-center">Marca</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {modelos.length > 0 ? (
            modelos.map(modelo => (
              <tr key={modelo.id}>
                <td className="text-center">{modelo.id}</td>
                <td className="text-center">{modelo.nombre}</td>
                <td className="text-center">{modelo.descripcion || 'N/A'}</td>
                <td className="text-center">
                  {marcas.find(marca => marca.id.toString() === modelo.id_marca.toString())?.nombre || 'Desconocido'}               </td>
                <td className="text-center">
                  <div className="button-container">
                    <Button
                      className="me-2 btn-icon btn-danger"
                      onClick={() => eliminarModelo(modelo.id)}
                      aria-label="Eliminar modelo"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </Button>
                    <Button
                      className="btn-icon btn-editar"
                      onClick={() => toggleModalEditar(modelo)}
                      aria-label="Editar modelo"
                    >
                      <FontAwesomeIcon icon={faPencilAlt} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">No hay datos disponibles</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

TablaModelos.propTypes = {
  modelos: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    nombre: PropTypes.string.isRequired,
    descripcion: PropTypes.string,
  })).isRequired,
  eliminarModelo: PropTypes.func.isRequired,
  toggleModalEditar: PropTypes.func.isRequired,
  marcas: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    nombre: PropTypes.string.isRequired,
  })).isRequired,
};

export default TablaModelos;
