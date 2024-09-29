import React, { useState, useEffect, useRef } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";
import "bootstrap/dist/css/bootstrap.min.css";
import "./VerticalLayout.css";
import {
  BiBook,
  BiHome,
  BiUser,
  BiReceipt,
  BiGroup,
  BiCamera,
  BiBuilding,
  BiDirections,
  BiCar,
  BiShield,
  BiShoppingBag,
  BiMenu,
  BiPlus,
  BiMap,
  BiNavigation,
  BiErrorCircle,
  BiBus,
  BiBox,
  BiLayer,
  BiArchive,
  BiChevronDown,
  BiChevronUp,
  BiChart,
} from "react-icons/bi";
import logoImage from "../../assets/logo-menu.png";
import { useAuth } from "../../services/AuthContext";

const VerticalLayout = () => {
  const [darkMode, setDarkMode] = useState(
    () => JSON.parse(localStorage.getItem("darkMode")) || false
  );
  const [menuCollapsed, setMenuCollapsed] = useState(
    () => JSON.parse(localStorage.getItem("menuCollapsed")) || false
  );
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const [visibleSubMenu, setVisibleSubMenu] = useState(null);
  const [shouldReload, setShouldReload] = useState(true);
  const { user, loading } = useAuth();
  const location = useLocation();
  const menuRef = useRef(null); // Referencia al contenedor del menú

  useEffect(() => {
    if (shouldReload && !loading) {
      window.location.reload();
    }
    setShouldReload(false);
  }, [loading, shouldReload]);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("menuCollapsed", JSON.stringify(menuCollapsed));
  }, [menuCollapsed]);

  useEffect(() => {
    // Determine which menu should be active based on the current route
    if (
      location.pathname.includes("/GestionPreOrdenes") ||
      location.pathname.includes("/GestionPreOrdenesExpress") ||
      location.pathname.includes("/GestionOrdenes") ||
      location.pathname.includes("/GestionOrdenesExpress") ||
      location.pathname.includes("/TrackingPage") ||
      location.pathname.includes("/OrdenEntregada")
    ) {
      setActiveSubMenu("ordenes");
      setVisibleSubMenu(null);
    } else if (
      location.pathname.includes("/GestionMarcas") ||
      location.pathname.includes("/GestionModelos") ||
      location.pathname.includes("/GestionVehiculos")
    ) {
      setActiveSubMenu("vehicles");
      setVisibleSubMenu(null);
    } else if (
      location.pathname.includes("/gestion-ordenes-recoleccion") ||
      location.pathname.includes("/GestionAsignarRutas")
    ) {
      setActiveSubMenu("rutas");
      setVisibleSubMenu(null);
    } else if (
      location.pathname.includes("/GestionBodegas") ||
      location.pathname.includes("/GestionUbicacion") ||
      location.pathname.includes("/GestionTraslados") ||
      location.pathname.includes("/GestionKardex")
    ) {
      setActiveSubMenu("bodegas");
      setVisibleSubMenu(null);
    } else if (
      location.pathname.includes("/GestionIncidencias") ||
      location.pathname.includes("/IncidenciasUbicadas")
    ) {
      setActiveSubMenu("incidencias");
      setVisibleSubMenu(null);
    } else {
      setActiveSubMenu(null);
      setVisibleSubMenu(null);
    }
  }, [location]);

  useEffect(() => {
    // Manejo de clics fuera del menú
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        if (!menuCollapsed) {
          setMenuCollapsed(true);
          setVisibleSubMenu(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuCollapsed]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleMenuToggle = () => {
    setMenuCollapsed(!menuCollapsed);
    if (!menuCollapsed) {
      setVisibleSubMenu(null);
    }
  };

  const handleSubMenuClick = (subMenuName) => {
    if (menuCollapsed) {
      setActiveSubMenu(subMenuName);
      setVisibleSubMenu(subMenuName);
      setMenuCollapsed(false);
    } else {
      if (activeSubMenu === subMenuName) {
        setVisibleSubMenu((prev) =>
          prev === subMenuName ? null : subMenuName
        );
      } else {
        setActiveSubMenu(subMenuName);
        setVisibleSubMenu(subMenuName);
      }
    }
  };

  const hasRole = (role) => {
    return user && user.role === role;
  };

  return (
    <div className={`vertical-layout ${darkMode ? "dark-mode" : ""}`}>
      <Header
        toggleDarkMode={toggleDarkMode}
        darkMode={darkMode}
        menuCollapsed={menuCollapsed}
        handleMenuToggle={handleMenuToggle}
      />
      <div className="menu-container" ef={menuRef}>
        <nav
          className={`vertical-nav fondo text-white ${menuCollapsed ? "menu-collapsed" : "menu-expanded"}`}
        >
          <div className="p-3">
            <button className="menu-toggle" onClick={handleMenuToggle}>
              <BiMenu />
            </button>
            <img
              src={logoImage}
              alt="Logo"
              className={`logo-img ${menuCollapsed ? "logo-collapsed" : "logo-expanded"}`}
            />
          </div>
          <ul
            className={`nav flex-column ${menuCollapsed ? "icons-only" : ""}`}
          >
            {hasRole("admin") && (
              <>
                <li className="nav-item">
                  <NavLink
                    to="/home"
                    className={({ isActive }) =>
                      isActive ? "nav-link active" : "nav-link"
                    }
                  >
                    <BiHome className="nav-icon" />
                    {!menuCollapsed && <span>Inicio</span>}
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/GestionUsuarios"
                    className={({ isActive }) =>
                      isActive ? "nav-link active" : "nav-link"
                    }
                  >
                    <BiUser className="nav-icon" />
                    {!menuCollapsed && <span>Usuarios</span>}
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/GestionEmpleados"
                    className={({ isActive }) =>
                      isActive ? "nav-link active" : "nav-link"
                    }
                  >
                    <BiGroup className="nav-icon" />
                    {!menuCollapsed && <span>Empleados</span>}
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/GestionClientes"
                    className={({ isActive }) =>
                      isActive ? "nav-link active" : "nav-link"
                    }
                  >
                    <BiGroup className="nav-icon" />
                    {!menuCollapsed && <span>Clientes</span>}
                  </NavLink>
                </li>

                {/* Submenu for Ordenes */}
                <li className="nav-item">
                  <div
                    className={`nav-link text-white ${activeSubMenu === "ordenes" ? "active" : ""}`}
                    onClick={() => handleSubMenuClick("ordenes")}
                  >
                    <BiReceipt className="nav-icon" />
                    {(!menuCollapsed || visibleSubMenu === "ordenes") && (
                      <span>Ordenes</span>
                    )}
                    {visibleSubMenu === "ordenes" ? (
                      <BiDirections className="sub-menu-icon" />
                    ) : (
                      <BiPlus className="sub-menu-icon" />
                    )}
                  </div>
                  <ul
                    className={`sub-menu ${visibleSubMenu === "ordenes" ? "active" : ""}`}
                  >
                    <li>
                      <NavLink
                        to="/GestionPreOrdenes"
                        className={({ isActive }) =>
                          isActive ? "nav-link active" : "nav-link"
                        }
                      >
                        <BiPlus className="nav-icon sub-icon" />
                        Pre-Orden Normal
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/GestionPreOrdenesExpress"
                        className={({ isActive }) =>
                          isActive ? "nav-link active" : "nav-link"
                        }
                      >
                        <BiPlus className="nav-icon sub-icon" />
                        Pre-Orden Express
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/GestionOrdenes"
                        className={({ isActive }) =>
                          isActive ? "nav-link active" : "nav-link"
                        }
                      >
                        <BiPlus className="nav-icon sub-icon" />
                        Normal
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/GestionOrdenesExpress"
                        className={({ isActive }) =>
                          isActive ? "nav-link active" : "nav-link"
                        }
                      >
                        <BiPlus className="nav-icon sub-icon" />
                        Express
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/TrackingPage"
                        className={({ isActive }) =>
                          isActive ? "nav-link active" : "nav-link"
                        }
                      >
                        <BiPlus className="nav-icon sub-icon" />
                        Tracking
                      </NavLink>
                    </li>

                    <li>
                      <NavLink
                        to="/OrdenEntregada"
                        className={({ isActive }) =>
                          isActive ? "nav-link active" : "nav-link"
                        }
                      >
                        <BiPlus className="nav-icon sub-icon" />
                        Validar orden
                      </NavLink>
                    </li>
                  </ul>
                </li>

                {/* Nuevo submenú para Rutas */}
                <li className="nav-item">
                  <div
                    className={`nav-link text-white ${activeSubMenu === "rutas" ? "active" : ""}`}
                    onClick={() => handleSubMenuClick("rutas")}
                  >
                    <BiMap className="nav-icon" />
                    {(!menuCollapsed || visibleSubMenu === "rutas") && (
                      <span>Rutas</span>
                    )}
                    {visibleSubMenu === "rutas" ? (
                      <BiDirections className="sub-menu-icon" />
                    ) : (
                      <BiPlus className="sub-menu-icon" />
                    )}
                  </div>
                  <ul
                    className={`sub-menu ${visibleSubMenu === "rutas" ? "active" : ""}`}
                  >
                    <li>
                      <NavLink
                        to="/GestionAsignarRutas"
                        className={({ isActive }) =>
                          isActive ? "nav-link active" : "nav-link"
                        }
                      >
                        <BiReceipt className="nav-icon sub-icon" />
                        Asignar rutas
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/gestion-ordenes-recoleccion"
                        className={({ isActive }) =>
                          isActive ? "nav-link active" : "nav-link"
                        }
                      >
                        <BiReceipt className="nav-icon sub-icon" />
                        Recolección
                      </NavLink>
                    </li>
                  </ul>
                </li>

                {/* Submenu for Bodegas */}
                <li className="nav-item">
                  <div
                    className={`nav-link text-white ${activeSubMenu === "bodegas" ? "active" : ""}`}
                    onClick={() => handleSubMenuClick("bodegas")}
                  >
                    <BiBuilding className="nav-icon" />
                    {(!menuCollapsed || visibleSubMenu === "bodegas") && (
                      <span>Bodegas</span>
                    )}
                    {visibleSubMenu === "bodegas" ? (
                      <BiDirections className="sub-menu-icon" />
                    ) : (
                      <BiPlus className="sub-menu-icon" />
                    )}
                  </div>
                  <ul
                    className={`sub-menu ${visibleSubMenu === "bodegas" ? "active" : ""}`}
                  >
                    <li>
                      <NavLink
                        to="/GestionBodegas"
                        className={({ isActive }) =>
                          isActive ? "nav-link active" : "nav-link"
                        }
                      >
                        <BiBuilding className="nav-icon sub-icon" />
                        Bodegas
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/GestionUbicacion"
                        className={({ isActive }) =>
                          isActive ? "nav-link active" : "nav-link"
                        }
                      >
                        <BiLayer className="nav-icon sub-icon" />
                        Ubicaciones
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/GestionTraslados"
                        className={({ isActive }) =>
                          isActive ? "nav-link active" : "nav-link"
                        }
                      >
                        <BiBus className="nav-icon sub-icon" />
                        Traslados
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/GestionKardex"
                        className={({ isActive }) =>
                          isActive ? "nav-link active" : "nav-link"
                        }
                      >
                        <BiBook className="nav-icon sub-icon" />
                        Kardex
                      </NavLink>
                    </li>
                  </ul>
                </li>

                {/* Submenu for Vehículos */}
                <li className="nav-item">
                  <div
                    className={`nav-link text-white ${activeSubMenu === "vehicles" ? "active" : ""}`}
                    onClick={() => handleSubMenuClick("vehicles")}
                  >
                    <BiCar className="nav-icon" />
                    {(!menuCollapsed || visibleSubMenu === "vehicles") && (
                      <span>Vehículos</span>
                    )}
                    {visibleSubMenu === "vehicles" ? (
                      <BiDirections className="sub-menu-icon" />
                    ) : (
                      <BiPlus className="sub-menu-icon" />
                    )}
                  </div>
                  <ul
                    className={`sub-menu ${visibleSubMenu === "vehicles" ? "active" : ""}`}
                  >
                    <li>
                      <NavLink
                        to="/GestionMarcas"
                        className={({ isActive }) =>
                          isActive ? "nav-link active" : "nav-link"
                        }
                      >
                        <BiPlus className="nav-icon sub-icon" />
                        Marcas
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/GestionModelos"
                        className={({ isActive }) =>
                          isActive ? "nav-link active" : "nav-link"
                        }
                      >
                        <BiPlus className="nav-icon sub-icon" />
                        Modelos
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/GestionVehiculos"
                        className={({ isActive }) =>
                          isActive ? "nav-link active" : "nav-link"
                        }
                      >
                        <BiPlus className="nav-icon sub-icon" />
                        Vehículos
                      </NavLink>
                    </li>
                  </ul>
                </li>
                {/* Submenu for Incidencias */}
                <li className="nav-item">
                  <div
                    className={`nav-link text-white ${activeSubMenu === "incidencias" ? "active" : ""}`}
                    onClick={() => handleSubMenuClick("incidencias")}
                  >
                    <BiErrorCircle className="nav-icon" />{" "}
                    {/* Ícono principal para Incidencias */}
                    {(!menuCollapsed || visibleSubMenu === "incidencias") && (
                      <span>Incidencias</span>
                    )}
                    {visibleSubMenu === "incidencias" ? (
                      <BiChevronUp className="sub-menu-icon" />
                    ) : (
                      <BiChevronDown className="sub-menu-icon" />
                    )}
                  </div>
                  <ul
                    className={`sub-menu ${visibleSubMenu === "incidencias" ? "active" : ""}`}
                  >
                    <li>
                      <NavLink
                        to="/GestionIncidencias"
                        className={({ isActive }) =>
                          isActive ? "nav-link active" : "nav-link"
                        }
                      >
                        <BiErrorCircle className="nav-icon sub-icon" />
                        Gestión de Incidencias
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/IncidenciasUbicadas"
                        className={({ isActive }) =>
                          isActive ? "nav-link active" : "nav-link"
                        }
                      >
                        <BiMap className="nav-icon sub-icon" />
                        Paquetes dañados ubicados
                      </NavLink>
                    </li>
                  </ul>
                </li>

                <li className="nav-item">
                  <NavLink
                    to="/GestionRolesPermisos"
                    className={({ isActive }) =>
                      isActive ? "nav-link active" : "nav-link"
                    }
                  >
                    <BiShield className="nav-icon" />
                    {!menuCollapsed && <span>Roles y permisos</span>}
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/reportes"
                    className={({ isActive }) =>
                      isActive ? "nav-link active" : "nav-link"
                    }
                  >
                    <BiChart className="nav-icon" />
                    {!menuCollapsed && <span>Reportes</span>}
                  </NavLink>
                </li>
              </>
            )}
            {hasRole("atencion_al_cliente") && (
              <>
                <li className="nav-item">
                  <NavLink
                    to="/GestionClientes"
                    className={({ isActive }) =>
                      isActive ? "nav-link active" : "nav-link"
                    }
                  >
                    <BiGroup className="nav-icon" />
                    {!menuCollapsed && <span>Clientes</span>}
                  </NavLink>
                </li>

                {/* Submenu for Ordenes */}
                <li className="nav-item">
                  <div
                    className={`nav-link text-white ${activeSubMenu === "ordenes" ? "active" : ""}`}
                    onClick={() => handleSubMenuClick("ordenes")}
                  >
                    <BiReceipt className="nav-icon" />
                    {(!menuCollapsed || visibleSubMenu === "ordenes") && (
                      <span>Ordenes</span>
                    )}
                    {visibleSubMenu === "ordenes" ? (
                      <BiDirections className="sub-menu-icon" />
                    ) : (
                      <BiPlus className="sub-menu-icon" />
                    )}
                  </div>
                  <ul
                    className={`sub-menu ${visibleSubMenu === "ordenes" ? "active" : ""}`}
                  >
                    <li>
                      <NavLink
                        to="/GestionPreOrdenes"
                        className={({ isActive }) =>
                          isActive ? "nav-link active" : "nav-link"
                        }
                      >
                        <BiPlus className="nav-icon sub-icon" />
                        Pre-Orden Normal
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/GestionPreOrdenesExpress"
                        className={({ isActive }) =>
                          isActive ? "nav-link active" : "nav-link"
                        }
                      >
                        <BiPlus className="nav-icon sub-icon" />
                        Pre-Orden Express
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/GestionOrdenes"
                        className={({ isActive }) =>
                          isActive ? "nav-link active" : "nav-link"
                        }
                      >
                        <BiPlus className="nav-icon sub-icon" />
                        Normal
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/GestionOrdenesExpress"
                        className={({ isActive }) =>
                          isActive ? "nav-link active" : "nav-link"
                        }
                      >
                        <BiPlus className="nav-icon sub-icon" />
                        Express
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/TrackingPage"
                        className={({ isActive }) =>
                          isActive ? "nav-link active" : "nav-link"
                        }
                      >
                        <BiPlus className="nav-icon sub-icon" />
                        Tracking
                      </NavLink>
                    </li>
                  </ul>
                </li>

                <li className="nav-item">
                  <NavLink
                    to="/reportes"
                    className={({ isActive }) =>
                      isActive ? "nav-link active" : "nav-link"
                    }
                  >
                    <BiChart className="nav-icon" />
                    {!menuCollapsed && <span>Reportes</span>}
                  </NavLink>
                </li>
              </>
            )}
            {hasRole("acompanante") && (
              <>
                <li className="nav-item">
                  <NavLink
                    to="/OrdenEntregada"
                    className={({ isActive }) =>
                      isActive ? "nav-link active" : "nav-link"
                    }
                  >
                    <BiCamera className="nav-icon" />
                    {!menuCollapsed && <span>Validar entrega</span>}
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/gestion-de-ordenes-recoleccion"
                    className={({ isActive }) =>
                      isActive ? "nav-link active" : "nav-link"
                    }
                  >
                    <BiReceipt className="nav-icon sub-icon" />
                    Recolección
                  </NavLink>
                </li>
                <li className="nav-item">
                  <div
                    className={`nav-link text-white ${activeSubMenu === "incidencias" ? "active" : ""}`}
                    onClick={() => handleSubMenuClick("incidencias")}
                  >
                    <BiErrorCircle className="nav-icon" />{" "}
                    {/* Ícono principal para Incidencias */}
                    {(!menuCollapsed || visibleSubMenu === "incidencias") && (
                      <span>Incidencias</span>
                    )}
                    {visibleSubMenu === "incidencias" ? (
                      <BiChevronUp className="sub-menu-icon" />
                    ) : (
                      <BiChevronDown className="sub-menu-icon" />
                    )}
                  </div>
                  <ul
                    className={`sub-menu ${visibleSubMenu === "incidencias" ? "active" : ""}`}
                  >
                    <li>
                      <NavLink
                        to="/GestionIncidencias"
                        className={({ isActive }) =>
                          isActive ? "nav-link active" : "nav-link"
                        }
                      >
                        <BiErrorCircle className="nav-icon sub-icon" />
                        Gestión de Incidencias
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/IncidenciasUbicadas"
                        className={({ isActive }) =>
                          isActive ? "nav-link active" : "nav-link"
                        }
                      >
                        <BiMap className="nav-icon sub-icon" />
                        Paquetes dañados ubicados
                      </NavLink>
                    </li>
                  </ul>
                </li>
              </>
            )}
            {hasRole("conductor") && (
              <>
                <li className="nav-item">
                  <NavLink
                    to="/OrdenEntregada"
                    className={({ isActive }) =>
                      isActive ? "nav-link active" : "nav-link"
                    }
                  >
                    <BiCamera className="nav-icon" />
                    {!menuCollapsed && <span>Validar entrega</span>}
                  </NavLink>
                </li>
              </>
            )}
            {hasRole("operador_de_almacen") && (
              <>
                {/* Submenu for Bodegas */}
                <li className="nav-item">
                  <div
                    className={`nav-link text-white ${activeSubMenu === "bodegas" ? "active" : ""}`}
                    onClick={() => handleSubMenuClick("bodegas")}
                  >
                    <BiBuilding className="nav-icon" />
                    {(!menuCollapsed || visibleSubMenu === "bodegas") && (
                      <span>Bodegas</span>
                    )}
                    {visibleSubMenu === "bodegas" ? (
                      <BiDirections className="sub-menu-icon" />
                    ) : (
                      <BiPlus className="sub-menu-icon" />
                    )}
                  </div>
                  <ul
                    className={`sub-menu ${visibleSubMenu === "bodegas" ? "active" : ""}`}
                  >
                    <li>
                      <NavLink
                        to="/GestionUbicacion"
                        className={({ isActive }) =>
                          isActive ? "nav-link active" : "nav-link"
                        }
                      >
                        <BiLayer className="nav-icon sub-icon" />
                        Ubicaciones
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/GestionTraslados"
                        className={({ isActive }) =>
                          isActive ? "nav-link active" : "nav-link"
                        }
                      >
                        <BiBus className="nav-icon sub-icon" />
                        Traslados
                      </NavLink>
                    </li>
                  </ul>
                </li>
              </>
            )}
            {hasRole("coordinador_de_rutas") && (
              <>
                {/* Nuevo submenú para Rutas */}
                <li className="nav-item">
                  <div
                    className={`nav-link text-white ${activeSubMenu === "rutas" ? "active" : ""}`}
                    onClick={() => handleSubMenuClick("rutas")}
                  >
                    <BiMap className="nav-icon" />
                    {(!menuCollapsed || visibleSubMenu === "rutas") && (
                      <span>Rutas</span>
                    )}
                    {visibleSubMenu === "rutas" ? (
                      <BiDirections className="sub-menu-icon" />
                    ) : (
                      <BiPlus className="sub-menu-icon" />
                    )}
                  </div>
                  <ul
                    className={`sub-menu ${visibleSubMenu === "rutas" ? "active" : ""}`}
                  >
                    <li>
                      <NavLink
                        to="/GestionAsignarRutas"
                        className={({ isActive }) =>
                          isActive ? "nav-link active" : "nav-link"
                        }
                      >
                        <BiReceipt className="nav-icon sub-icon" />
                        Asignar rutas
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/gestion-ordenes-recoleccion"
                        className={({ isActive }) =>
                          isActive ? "nav-link active" : "nav-link"
                        }
                      >
                        <BiReceipt className="nav-icon sub-icon" />
                        Recolección
                      </NavLink>
                    </li>
                  </ul>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
      <div className={`main-content ${menuCollapsed ? "collapsed" : ""}`}>
        <Outlet />
      </div>
      <Footer menuCollapsed={menuCollapsed} />
    </div>
  );
};

export default VerticalLayout;
