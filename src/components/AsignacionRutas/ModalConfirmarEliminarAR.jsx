import React, { useState } from 'react'
import { Modal, Button } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import "/src/styles/Empleados.css"

const ModalConfirmarEliminar = ({ isOpen, toggle, confirmarEliminar }) => {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirmarEliminar = async () => {
    setIsDeleting(true)
    try {
      await confirmarEliminar()
    } catch (error) {
      console.error('Error al eliminar:', error)
    } finally {
      setIsDeleting(false)
      toggle()
    }
  }

  return (
    <Modal show={isOpen} onHide={toggle}>
      <Modal.Header closeButton>
        <Modal.Title>Confirmar Eliminación</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        ¿Estás seguro de que deseas eliminar esta asignación de ruta?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={handleConfirmarEliminar} disabled={isDeleting}>
          {isDeleting ? 'Eliminando...' : 'Eliminar'}
        </Button>
        <Button variant="secondary" onClick={toggle}>
          Cancelar
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ModalConfirmarEliminar