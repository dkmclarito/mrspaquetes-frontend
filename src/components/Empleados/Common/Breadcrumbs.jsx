import React from "react";
import { Link } from "react-router-dom";

const Breadcrumbs = ({ title, mainMenu, breadcrumbItem }) => {
  return (
    <div className="row">
      <div className="col-sm-12">
        <div className="page-title-box">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h4 className="page-title">{title}</h4>
              <ol className="breadcrumb m-0">
                <li className="breadcrumb-item">
                  {/* Renderiza el menú principal como texto, no como enlace */}
                  {mainMenu}
                </li>
                <li className="breadcrumb-item active">{breadcrumbItem}</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Breadcrumbs;
