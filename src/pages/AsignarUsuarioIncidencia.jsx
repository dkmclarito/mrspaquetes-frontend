import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Container, Row, Col, Card, CardBody, Input, Label } from "reactstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../components/Usuarios/Common/Breadcrumbs";
import TablaUsuarios from "../components/Incidencias/TablaUsuarios"; // Reutilizamos el componente que muestra la tabla de usuarios
import AuthService from "../services/authService";
import "../styles/usuarios.css";
import Pagination from 'react-js-pagination';

const API_URL = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 5;

const AsignarUsuarioIncidencia = () => {
    document.title = "Usuarios | Mr. Paquetes";
    const navigate = useNavigate();
    const { idIncidencia } = useParams(); // Obtiene el ID de la incidencia desde la URL
    console.log("ID de la incidencia:", idIncidencia);

    const [usuarios, setUsuarios] = useState([]);
    const [incidencia, setIncidencia] = useState(null); // Estado para almacenar los datos de la incidencia
    const [busqueda, setBusqueda] = useState("");
    const [rolFiltro, setRolFiltro] = useState("");
    const [estadoFiltro, setEstadoFiltro] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const token = AuthService.getCurrentUser();

    // Verificar el estado del usuario logueado
    const verificarEstadoUsuarioLogueado = useCallback(async () => {
        try {
            const userId = localStorage.getItem("userId");
            if (userId && token) {
                const response = await axios.get(`${API_URL}/auth/show/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.status === "Token is Invalid") {
                    AuthService.logout();
                    window.location.href = "/login";
                    return;
                }
            }
        } catch (error) {
            console.error("Error al verificar el estado del usuario:", error);
        }
    }, [token]);

    // Cargar los usuarios
    const fetchUsuarios = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/auth/get_users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data && Array.isArray(response.data.users)) {
                setUsuarios(response.data.users);
            }
        } catch (error) {
            console.error("Error al obtener los usuarios:", error);
        }
    }, [token]);

    // Cargar la incidencia por su ID
    const fetchIncidencia = useCallback(async () => {
        try {
          const response = await axios.get(`${API_URL}/incidencias/${idIncidencia}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data) {
            setIncidencia(response.data);
            console.log("Incidencia obtenida:", response.data); // Verifica que se obtienen los datos correctos
          }
        } catch (error) {
          console.error("Error al obtener la incidencia:", error);
        }
      }, [idIncidencia, token]);
      

    useEffect(() => {
        verificarEstadoUsuarioLogueado();
        fetchUsuarios();
        fetchIncidencia(); // Cargar la incidencia cuando el componente se monte
    }, [fetchUsuarios, fetchIncidencia, verificarEstadoUsuarioLogueado]);

    const asignarUsuario = async (usuarioId) => {
        if (!incidencia) {
            console.error("La incidencia no está definida. No se puede asignar el usuario.");
            return;
        }
    
        try {
            // Asegúrate de que `incidencia` existe y tiene un `id`
            const incidenciaActualizada = {
                ...incidencia,
                id_usuario_asignado: usuarioId,
            };
    
            // Imprime los datos que estás enviando a la API
            console.log("Datos enviados en la solicitud PUT:", incidenciaActualizada);
    
            // Envía la solicitud de actualización a la API
            const response = await axios.put(`${API_URL}/incidencias/${incidencia.id}`, incidenciaActualizada, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
    
            if (response.status === 200) {
                alert("Usuario asignado exitosamente a la incidencia.");
                navigate("/GestionIncidencias");
            }
        } catch (error) {
            console.error("Error al asignar usuario:", error);
            alert("Error al asignar el usuario a la incidencia.");
        }
    };
    


    const filtrarUsuarios = () => {
        return usuarios.filter(usuario => {
            const cumpleBusqueda = !busqueda || usuario.email.toLowerCase().includes(busqueda.toLowerCase());
            const cumpleRol = !rolFiltro || usuario.role_id === parseInt(rolFiltro, 10);
            const cumpleEstado = !estadoFiltro || usuario.status.toString() === estadoFiltro;
            return cumpleBusqueda && cumpleRol && cumpleEstado;
        });
    };

    const usuariosFiltrados = filtrarUsuarios();
    const paginatedUsuarios = usuariosFiltrados.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div className="page-content">
            <Container fluid>
                <Breadcrumbs title="Asignación de Usuario" breadcrumbItem="Asignar Usuario a Incidencia" />
                <Row>
                    <Col lg={12}>
                        <div style={{ marginTop: "10px", display: "flex", alignItems: "center" }}>
                            <Label for="busqueda" style={{ marginRight: "10px", marginLeft: "20px" }}>Buscar:</Label>
                            <Input
                                type="text"
                                id="busqueda"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                placeholder="Escriba email"
                                style={{ width: "300px" }}
                            />
                            <Label for="rolFiltro" style={{ marginRight: "10px", marginLeft: "20px" }}>Rol:</Label>
                            <Input
                                type="select"
                                id="rolFiltro"
                                value={rolFiltro}
                                onChange={(e) => setRolFiltro(e.target.value)}
                                style={{ width: "150px" }}
                            >
                                <option value="">Todos</option>
                                <option value="1">Administrador</option>
                                <option value="3">Conductor</option>
                                <option value="4">Básico</option>
                            </Input>
                            <Label for="estadoFiltro" style={{ marginRight: "10px", marginLeft: "20px" }}>Estado:</Label>
                            <Input
                                type="select"
                                id="estadoFiltro"
                                value={estadoFiltro}
                                onChange={(e) => setEstadoFiltro(e.target.value)}
                                style={{ width: "150px" }}
                            >
                                <option value="">Todos</option>
                                <option value="1">Activo</option>
                                <option value="0">Inactivo</option>
                            </Input>
                        </div>
                    </Col>
                </Row>
                <br />
                <Row>
                    <Col lg={12}>
                        <Card>
                            <CardBody>
                                <TablaUsuarios
                                    usuarios={paginatedUsuarios}
                                    incidencia={incidencia} // Pasa la incidencia como prop
                                    asignarUsuario={asignarUsuario} // Pasar la función para asignar usuario
                                />

                            </CardBody>
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col lg={12} style={{ marginTop: "20px", display: "flex", justifyContent: "center" }}>
                        <Pagination
                            activePage={currentPage}
                            itemsCountPerPage={ITEMS_PER_PAGE}
                            totalItemsCount={usuariosFiltrados.length}
                            pageRangeDisplayed={5}
                            onChange={setCurrentPage}
                            itemClass="page-item"
                            linkClass="page-link"
                            innerClass="pagination"
                        />
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default AsignarUsuarioIncidencia;
