import React from 'react';

const Footer = ({ menuCollapsed }) => {
  return (
    <footer className={`footer ${menuCollapsed ? 'collapsed' : ''}`}>
      Mr. Paquetes © 2024 | Todos los derechos reservados
    </footer>
  );
};

export default Footer;
