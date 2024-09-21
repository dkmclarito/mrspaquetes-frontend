import React from 'react';
import { Offcanvas, OffcanvasHeader, OffcanvasBody } from 'reactstrap';

const RightSidebar = ({ isOpen, toggle }) => {
  return (
    <Offcanvas isOpen={isOpen} direction="end" toggle={toggle} id="right-bar">
      <OffcanvasHeader toggle={toggle}>Configuraciones</OffcanvasHeader>
      <OffcanvasBody>
        {/* Contenido de la barra lateral derecha */}
      </OffcanvasBody>
    </Offcanvas>
  );
};

export default RightSidebar;
