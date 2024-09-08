import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import PrivateRoute from "./components/Login/PrivateRoute";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import LoginClientePage from "./pages/LoginClientePage";
import RegisterCliente from "./pages/RegisterCliente";
import Logout from "./components/Login/Logout";
import AuthService from "./services/authService";
import "bootstrap/dist/css/bootstrap.min.css";
import GestionEmpleados from "./pages/GestionEmpleados";
import AgregarEmpleado from "./pages/AgregarEmpleado";
import AgregarEmpleadoUser from "./pages/AgregarEmpleado";
import DetallesEmpleado from "./pages/DetallesEmpleado";
import DetallesRutas from "./pages/DetallesRutas";
import GestionClientes from "./pages/GestionClientes";
import AgregarCliente from "./pages/AgregarCliente";
import DetallesCliente from "./pages/DetallesCliente";
import AgregarDatos from "./pages/PerfilCliente";
import GestionUsuarios from "./pages/GestionUsuarios";
import AgregarUsuario from "./pages/AgregarUsuario";
import GestionRolesPermisos from "./pages/GestionRolesPermisos";
import VerticalLayout from "./components/Layout/VerticalLayout";
import "react-toastify/dist/ReactToastify.css";
import AgregarRolesPermisos from "./pages/AgregarRolesPermisos";
import GestionVehiculos from "./pages/GestionVehiculos";
import AgregarVehiculo from "./pages/AgregarVehiculo";
import GestionMarcas from "./pages/GestionMarcas";
import AgregarMarca from "./pages/AgregarMarca";
import GestionModelos from "./pages/GestionModelos";
import AgregarModelo from "./pages/AgregarModelo";
import GestionPaquetes from "./pages/GestionPaquetes";
import AgregarPaquete from "./pages/AgregarPaquete";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./services/AuthContext";
import EmailVerification from "./pages/EmailVerification";
import ForgetPassword from "./components/LoginClientes/ForgetPassword"; // Nuevo: Importación de ForgetPassword
import ResetPassword from "./components/LoginClientes/ResetPassword"; // Nuevo: Importación de ResetPassword
import DataUsuario from "./pages/DataUsuario";
import GestionBodegas from "./pages/GestionBodega";
import AgregarBodega from "./pages/AgregarBodega";
import DetallesBodega from "./pages/DetallesBodega";
import AgregarOrden from "./pages/AgregarOrden";
import GestionOrdenes from "./pages/GestionOrdenes";
import DatosPaquete from "./pages/DatosPaquete";
import GenerarOrden from "./pages/GenerarOrden";
import ProcesarPago from "./pages/ProcesarPago";
import OrdenesSeleccionarCliente from "./pages/OrdenesSeleccionarCliente";
import OrdenesDirecciones from "./pages/OrdenesDirecciones";
import DetallesOrden from "./pages/DetallesOrden";
import TrackingPage from "./pages/Tracking";
import VerDetallesOrden from "./pages/VerDetallesOrden";
import EditarOrden from "./components/Ordenes/Edicion/EditarOrden";
import GestionRutas from "./pages/GestionRutas";
import AgregarRuta from "./pages/AgregarRuta";
import GestionOrdenesExpress from "./pages/GestionOrdenesExpress";
import OrdenesSeleccionarClienteExpress from "./pages/OrdenesSeleccionarClienteExpress";
import OrdenesDireccionesExpress from "./pages/OrdenesDireccionesExpress";
import DatosPaqueteExpress from "./pages/DatosPaqueteExpress";
import GenerarOrdenExpress from "./pages/GenerarOrdenExpress";
import ProcesarPagoExpress from "./pages/ProcesarPagoExpress";
import GestionAsignarRutas from "./pages/GestionAsignarRutas";
import RutasRecoleccion from "./pages/RutasRecoleccion";
import OrdenesRecoleccion from "./pages/OrdenesRecoleccion";
import AgregarAsignacionRuta from "./pages/AgregarAsignacionRuta";
import DetallesAsignacionRutas from "./pages/DetallesAsignacionRutas";

const App = () => {
  const isAuthenticated = AuthService.getCurrentUser();

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/clientelogin" element={<LoginClientePage />} />
          <Route path="/registercliente" element={<RegisterCliente />} />
          <Route path="/email-verification" element={<EmailVerification />} />
          <Route path="/logout" element={<Logout />} />

          {/* Nuevas rutas para "Olvidé mi contraseña" y "Restablecer contraseña" */}
          <Route path="/forget-password" element={<ForgetPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Rutas privadas con VerticalLayout */}
          <Route
            element={
              <PrivateRoute allowedRoles={["admin", "conductor", "cliente"]} />
            }
          >
            <Route element={<VerticalLayout />}>
              <Route path="/home" element={<HomePage />} />

              {/* Rutas específicas para 'admin' */}
              <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
                <Route path="/GestionUsuarios" element={<GestionUsuarios />} />
                <Route path="/AgregarUsuario" element={<AgregarUsuario />} />
                <Route
                  path="/GestionRolesPermisos"
                  element={<GestionRolesPermisos />}
                />
                <Route
                  path="/AgregarRolesPermisos/:id"
                  element={<AgregarRolesPermisos />}
                />
                <Route
                  path="/GestionEmpleados"
                  element={<GestionEmpleados />}
                />
                <Route
                  path="/GestionAsignarRutas"
                  element={<GestionAsignarRutas />}
                />
                <Route
                  path="/AgregarAsignacionRuta"
                  element={<AgregarAsignacionRuta />}
                />
                  <Route
                  path="/DetallesAsignacionRutas/:id"
                  element={<DetallesAsignacionRutas />}
                />
                <Route path="/AgregarEmpleado" element={<AgregarEmpleado />} />
                <Route
                  path="/AgregarEmpleado/:id"
                  element={<AgregarEmpleadoUser />}
                />{" "}
                {/* NUEVO */}
                <Route
                  path="/DetallesEmpleado/:id"
                  element={<DetallesEmpleado />}
                />
                <Route path="/DetallesRutas/:id" element={<DetallesRutas />} />
                <Route path="/GestionClientes" element={<GestionClientes />} />
                <Route path="/AgregarCliente" element={<AgregarCliente />} />
                <Route
                  path="/DetallesCliente/:id"
                  element={<DetallesCliente />}
                />
                <Route
                  path="/GestionVehiculos"
                  element={<GestionVehiculos />}
                />
                <Route path="/AgregarVehiculo" element={<AgregarVehiculo />} />
                <Route path="/GestionMarcas" element={<GestionMarcas />} />
                <Route path="/AgregarMarca" element={<AgregarMarca />} />
                <Route path="/GestionModelos" element={<GestionModelos />} />
                <Route path="/AgregarModelo" element={<AgregarModelo />} />
                <Route path="/DataUsuario/:id" element={<DataUsuario />} />
                <Route path="/TrackingPage" element={<TrackingPage />} />
                <Route path="/GestionBodegas" element={<GestionBodegas />} />
                <Route path="/AgregarBodega" element={<AgregarBodega />} />
                <Route
                  path="/DetallesBodega/:id"
                  element={<DetallesBodega />}
                />
                <Route path="/AgregarOrden" element={<AgregarOrden />} />
                <Route
                  path="/OrdenesSeleccionarCliente"
                  element={<OrdenesSeleccionarCliente />}
                />
                <Route
                  path="/OrdenesSeleccionarClienteExpress"
                  element={<OrdenesSeleccionarClienteExpress />}
                />
                <Route path="/GestionOrdenes" element={<GestionOrdenes />} />
                <Route
                  path="/GestionOrdenesExpress"
                  element={<GestionOrdenesExpress />}
                />
                <Route
                  path="/OrdenesDirecciones/:idCliente"
                  element={<OrdenesDirecciones />}
                />
                <Route
                  path="/OrdenesDireccionesExpress/:idCliente"
                  element={<OrdenesDireccionesExpress />}
                />
                <Route
                  path="/DatosPaquete/:idCliente"
                  element={<DatosPaquete />}
                />
                <Route
                  path="/DatosPaqueteExpress/:idCliente"
                  element={<DatosPaqueteExpress />}
                />
                <Route
                  path="/GenerarOrden/:idCliente"
                  element={<GenerarOrden />}
                />
                <Route
                  path="/GenerarOrdenExpress/:idCliente"
                  element={<GenerarOrdenExpress />}
                />
                <Route
                  path="/DetallesOrden/:idCliente"
                  element={<DetallesOrden />}
                />
                <Route
                  path="/ProcesarPago/:idCliente"
                  element={<ProcesarPago />}
                />
                <Route
                  path="/ProcesarPagoExpress/:idCliente"
                  element={<ProcesarPagoExpress />}
                />
                <Route
                  path="/OrdenesSeleccionarCliente"
                  element={<OrdenesSeleccionarCliente />}
                />
                <Route path="/GestionOrdenes" element={<GestionOrdenes />} />
                <Route
                  path="/OrdenesDirecciones/:idCliente"
                  element={<OrdenesDirecciones />}
                />
                <Route
                  path="/DatosPaquete/:idCliente"
                  element={<DatosPaquete />}
                />
                <Route
                  path="/GenerarOrden/:idCliente"
                  element={<GenerarOrden />}
                />
                <Route
                  path="/DetallesOrden/:idCliente"
                  element={<DetallesOrden />}
                />
                <Route
                  path="/VerDetallesOrden/:id"
                  element={<VerDetallesOrden />}
                />
                <Route path="/editar-orden/:id" element={<EditarOrden />} />
                <Route path="/GestionRutas" element={<GestionRutas />} />
                <Route path="/AgregarRuta" element={<AgregarRuta />} />
                <Route
                  path="/RutasRecoleccion"
                  element={<RutasRecoleccion />}
                />
                <Route
                  path="/OrdenesRecoleccion"
                  element={<OrdenesRecoleccion />}
                />
              </Route>

              {/* Rutas para 'conductor' */}
              <Route
                element={
                  <PrivateRoute
                    allowedRoles={["admin", "conductor", "cliente"]}
                  />
                }
              >
                <Route path="/GestionPaquetes" element={<GestionPaquetes />} />
                <Route path="/AgregarPaquete" element={<AgregarPaquete />} />
                {/* Aquí van las rutas adicionales */}
              </Route>

              {/* Rutas para 'cliente' */}
              <Route element={<PrivateRoute allowedRoles={["cliente"]} />}>
                <Route path="/PerfilCliente" element={<AgregarDatos />} />
                {/* Aquí van las rutas adicionales */}
              </Route>
            </Route>
          </Route>

          <Route
            path="/"
            element={
              <Navigate to={isAuthenticated ? "/home" : "/login"} replace />
            }
          />
          <Route
            path="*"
            element={
              <Navigate to={isAuthenticated ? "/home" : "/login"} replace />
            }
          />
        </Routes>
      </AuthProvider>
      <ToastContainer />
    </Router>
  );
};

export default App;
