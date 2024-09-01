import React from 'react';
import { Modal, Button } from 'reactstrap';

const ModalConfirmarEliminar = ({ isOpen, toggle, ordenId, confirmarEliminar }) => {
    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <div className="modal-header">
                <h5 className="modal-title">Confirmar Eliminación</h5>
                <button type="button" className="close" onClick={toggle}>
                    <span>&times;</span>
                </button>
            </div>
            <div className="modal-body">
                <p>¿Está seguro de que desea eliminar esta orden?</p>
                <p>Esta acción no se puede deshacer.</p>
            </div>
            <div className="modal-footer">
                <Button color="secondary" onClick={toggle}>Cancelar</Button>
                <Button color="danger" onClick={() => confirmarEliminar(ordenId)}>Eliminar</Button>
            </div>
        </Modal>
    );
};

export default ModalConfirmarEliminar;