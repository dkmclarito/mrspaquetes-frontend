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
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./services/AuthContext";
import EmailVerification from "./pages/EmailVerification";
import ForgetPassword from "./components/LoginClientes/ForgetPassword";
import ResetPassword from "./components/LoginClientes/ResetPassword";
import DataUsuario from "./pages/DataUsuario";
import GestionBodegas from "./pages/GestionBodega";
import AgregarBodega from "./pages/AgregarBodega";
import DetallesBodega from "./pages/DetallesBodega";
import GestionOrdenes from "./pages/GestionOrdenes";
import DatosPaquete from "./pages/DatosPaquete";
import GenerarOrden from "./pages/GenerarOrden";
import ProcesarPago from "./pages/ProcesarPago";
import OrdenesSeleccionarCliente from "./pages/OrdenesSeleccionarCliente";
import OrdenesDirecciones from "./pages/OrdenesDirecciones";
import DetallesOrden from "./pages/DetallesOrden";
import TrackingPage from "./components/Tracking/Tracking";
import VerDetallesOrden from "./pages/VerDetallesOrden";
import EditarOrden from "./components/Ordenes/Edicion/EditarOrden";
import GestionOrdenesExpress from "./pages/GestionOrdenesExpress";
import OrdenesSeleccionarClienteExpress from "./pages/OrdenesSeleccionarClienteExpress";
import OrdenesDireccionesExpress from "./pages/OrdenesDireccionesExpress";
import DatosPaqueteExpress from "./pages/DatosPaqueteExpress";
import GenerarOrdenExpress from "./pages/GenerarOrdenExpress";
import ProcesarPagoExpress from "./pages/ProcesarPagoExpress";
import GestionAsignarRutas from "./pages/GestionAsignarRutas";
import AgregarAsignacionRuta from "./pages/AgregarAsignacionRuta";
import DetallesAsignacionRutas from "./pages/DetallesAsignacionRutas";
import GestionPreOrdenes from "./pages/GestionPreOrdenes";
import GestionPreOrdenesExpress from "./pages/GestionPreOrdenesExpress";
import GenerarPreOrden from "./pages/GenerarPreOrden";
import GenerarPreOrdenExpress from "./pages/GenerarPreOrdenExpress";
import PreOrdenesSeleccionarCliente from "./pages/PreOrdenesSeleccionarCliente";
import PreOrdenesSeleccionarClienteExpress from "./pages/PreOrdenesSeleccionarClienteExpress";
import PreOrdenesDirecciones from "./pages/PreOrdenesDirecciones";
import PreOrdenesDireccionesExpress from "./pages/PreOrdenesDireccionesExpress";
import AgregarUbicacion from "./pages/AgregarUbicacion";
import GestionUbicacion from "./pages/GestionUbicacion";
import DatosPaquetePreOrden from "./pages/DatosPaquetePreOrden";
import DatosPaquetePreOrdenExpress from "./pages/DatosPaquetePreOrdenExpress";
import GestionIncidencias from "./pages/GestionIncidencias";
import SeleccionarPaquetes from "./pages/SeleccionarPaquetes";
import AgregarIncidencia from "./pages/AgregarIncidencia";
import AgregarIncidenciaPaqueteSeleccionado from "./pages/AgregarIncidenciaPaqueteSeleccionado";
import AsignarUsuarioIncidencia from "./pages/AsignarUsuarioIncidencia";
import DarSolucionIncidencia from "./pages/DarSolucionIncidencia";
import DataIncidencia from "./pages/DataIncidencia";
import EditarPaquetesAsignacion from "./components/AsignacionRutas/EdicionRutaAsignada/EditarPaquetesAsignacion";
import EditarAsignacionRuta from "./components/AsignacionRutas/EdicionRutaAsignada/EditarAsignacionRuta";
import EditarDatosAsignacion from "./components/AsignacionRutas/EdicionRutaAsignada/EditarDatosAsignacion";
import GestionTraslados from "./pages/GestionTraslados";
import TrackingPaquetes from "./pages/TrackingPaquetes";
import IncidenciasUbicadas from "./pages/IncidenciasUbicadas";
import GestionOrdenesRecoleccion from "./pages/GestionOrdenesRecoleccion";
import DetallesUbicacion from "./pages/DetallesUbicacion";
import DetallesVehiculo from "./pages/DetallesVehiculo";
import CrearRutaRecoleccion from "./components/Recoleccion/CrearRutaRecoleccion";
import EditarRutaRecoleccion from "./components/Recoleccion/EditarRutaRecoleccion";
import DetallesRutaRecoleccion from "./components/Recoleccion/DetallesRutaRecoleccion";
import AgregarNuevoRol from "./pages/AgregarNuevoRol";
import DataRol from "./pages/DataRol";
import PaquetesTrackingScreen from "./components/Tracking/PaquetesTrackingScreen";
import OrdenEntregada from "./pages/OrdenEntregada";
import MisIncidencias from "./pages/MisIncidencias";
import Reportes from "./pages/Reportes";
import AgregarTraslados from './pages/AgregarTraslados';
import DetallesTraslados from './pages/DetallesTraslados';
import EditarTraslados from './components/Traslados/EditarTraslados/EditarTraslados';


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
          <Route path="/forget-password" element={<ForgetPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route
            element={
              <PrivateRoute allowedRoles={["admin", "acompanante", "cliente"]} />
            }
          >
            <Route element={<VerticalLayout />}>
              <Route path="/home" element={<HomePage />} />

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
                  path="/GestionTraslados"
                  element={<GestionTraslados />}
                />
                <Route
                  path="/GestionTraslados"
                  element={<GestionTraslados />}
                />
                 <Route
                  path="/AgregarTraslados"
                  element={<AgregarTraslados />}
                />
                <Route path="/DetallesTraslados/:id" element={<DetallesTraslados />} />
                <Route path="/EditarTraslados/:id" element={<EditarTraslados />} />

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
                <Route
                  path="/SeleccionarPaquetes"
                  element={<SeleccionarPaquetes />}
                />
                <Route path="/AgregarEmpleado" element={<AgregarEmpleado />} />
                <Route
                  path="/AgregarEmpleado/:id"
                  element={<AgregarEmpleadoUser />}
                />
                <Route
                  path="/DetallesEmpleado/:id"
                  element={<DetallesEmpleado />}
                />
                <Route
                  path="/EditarAsignacionRuta/:codigo_unico_asignacion"
                  element={<EditarAsignacionRuta />}
                />
                <Route
                  path="/EditarDatosAsignacion/:codigo_unico_asignacion"
                  element={<EditarDatosAsignacion />}
                />
                <Route
                  path="/EditarPaquetesAsignacion/:codigo_unico_asignacion"
                  element={<EditarPaquetesAsignacion />}
                />
                <Route path="/GestionClientes" element={<GestionClientes />} />
                <Route path="/AgregarCliente" element={<AgregarCliente />} />
                <Route
                  path="/DetallesCliente/:id"
                  element={<DetallesCliente />}
                />
                <Route
                  path="/DetallesVehiculo/:id"
                  element={<DetallesVehiculo />}
                />
                <Route
                  path="/DetallesUbicacion/:id"
                  element={<DetallesUbicacion />}
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
                <Route
                  path="/TrackingPaquetes"
                  element={<TrackingPaquetes />}
                />
                <Route
                  path="/PaquetesTrackingScreen/:id"
                  element={<PaquetesTrackingScreen />}
                />
                <Route
                  path="/GestionUbicacion"
                  element={<GestionUbicacion />}
                />
                <Route
                  path="/AgregarUbicacion"
                  element={<AgregarUbicacion />}
                />
                <Route path="/GestionBodegas" element={<GestionBodegas />} />
                <Route path="/AgregarBodega" element={<AgregarBodega />} />
                <Route
                  path="/DetallesBodega/:id"
                  element={<DetallesBodega />}
                />
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
                  path="/VerDetallesOrden/:id"
                  element={<VerDetallesOrden />}
                />
                <Route path="/editar-orden/:id" element={<EditarOrden />} />
                
              </Route>

              <Route
                path="/GestionPreOrdenes"
                element={<GestionPreOrdenes />}
              />
              <Route
                path="/GestionPreOrdenesExpress"
                element={<GestionPreOrdenesExpress />}
              />
              <Route
                path="/GenerarPreOrden/:idCliente"
                element={<GenerarPreOrden />}
              />
              <Route
                path="/GenerarPreOrdenExpress/:idCliente"
                element={<GenerarPreOrdenExpress />}
              />

              <Route
                path="/PreOrdenesSeleccionarCliente"
                element={<PreOrdenesSeleccionarCliente />}
              />
              <Route
                path="/PreOrdenesDirecciones/:idCliente"
                element={<PreOrdenesDirecciones />}
              />

              <Route
                path="/PreOrdenesSeleccionarClienteExpress"
                element={<PreOrdenesSeleccionarClienteExpress />}
              />
              <Route
                path="/PreOrdenesDireccionesExpress/:idCliente"
                element={<PreOrdenesDireccionesExpress />}
              />

              <Route
                path="/DatosPaquetePreOrden/:idCliente"
                element={<DatosPaquetePreOrden />}
              />
              <Route
                path="/DatosPaquetePreOrdenExpress/:idCliente"
                element={<DatosPaquetePreOrdenExpress />}
              />

              <Route
                element={
                  <PrivateRoute
                    allowedRoles={["admin", "acompanante", "cliente"]}
                  />
                }
              >
                <Route path="/OrdenEntregada" element={<OrdenEntregada />} />
                <Route
                  path="/GestionIncidencias"
                  element={<GestionIncidencias />}
                />
                <Route
                  path="/IncidenciasUbicadas"
                  element={<IncidenciasUbicadas />}
                />
                <Route
                  path="/AgregarIncidencia"
                  element={<AgregarIncidencia />}
                />
                <Route
                  path="/AgregarIncidenciaPaqueteSeleccionado/:idPaquete"
                  element={<AgregarIncidenciaPaqueteSeleccionado />}
                />
                <Route
                  path="/AsignarUsuarioIncidencia/:idIncidencia"
                  element={<AsignarUsuarioIncidencia />}
                />
                <Route
                  path="/DarSolucionIncidencia/:idIncidencia"
                  element={<DarSolucionIncidencia />}
                />
                <Route
                  path="/DataIncidencia/:idIncidencia"
                  element={<DataIncidencia />}
                />

                <Route
                  path="/AgregarIncidencia"
                  element={<AgregarIncidencia />}
                />
                <Route
                  path="/AgregarIncidenciaPaqueteSeleccionado/:idPaquete"
                  element={<AgregarIncidenciaPaqueteSeleccionado />}
                />
                <Route
                  path="/AsignarUsuarioIncidencia/:idIncidencia"
                  element={<AsignarUsuarioIncidencia />}
                />
                <Route
                  path="/DarSolucionIncidencia/:idIncidencia"
                  element={<DarSolucionIncidencia />}
                />
                <Route
                  path="/DataIncidencia/:idIncidencia"
                  element={<DataIncidencia />}
                />

                <Route
                  path="/AgregarIncidencia"
                  element={<AgregarIncidencia />}
                />
                <Route
                  path="/AgregarIncidenciaPaqueteSeleccionado/:idPaquete"
                  element={<AgregarIncidenciaPaqueteSeleccionado />}
                />
                <Route
                  path="/AsignarUsuarioIncidencia/:idIncidencia"
                  element={<AsignarUsuarioIncidencia />}
                />
                <Route
                  path="/DarSolucionIncidencia/:idIncidencia"
                  element={<DarSolucionIncidencia />}
                />
                <Route
                  path="/DataIncidencia/:idIncidencia"
                  element={<DataIncidencia />}
                />
                <Route path="/AgregarNuevoRol" element={<AgregarNuevoRol />} />
                <Route path="/DataRol/:id" element={<DataRol />} />
                <Route path="/MisIncidencias" element={<MisIncidencias />} />
              </Route>
              <Route
                path="/gestion-ordenes-recoleccion"
                element={<GestionOrdenesRecoleccion />}
              />
              <Route
                path="/crear-ruta-recoleccion"
                element={<CrearRutaRecoleccion />}
              />
              <Route
                path="/editar-ruta-recoleccion/:id"
                element={<EditarRutaRecoleccion />}
              />
              <Route
                path="/detalles-ruta-recoleccion/:id"
                element={<DetallesRutaRecoleccion />}
              />
              <Route path="/reportes" element={<Reportes />} />

              <Route element={<PrivateRoute allowedRoles={["cliente"]} />}>
                <Route path="/PerfilCliente" element={<AgregarDatos />} />
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