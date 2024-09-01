import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Método para iniciar sesión como usuario normal
const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("role", JSON.stringify({ role: response.data.role }));
      localStorage.setItem("userId", response.data.user.id); // Almacena el id del usuario
      return response.data.token;
    }
    return null;
  } catch (error) {
    throw error;
  }
};

// Método para iniciar sesión como cliente
const loginClient = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login-cliente`, { email, password });
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("role", JSON.stringify({ role: response.data.role }));
      localStorage.setItem("userId", response.data.user.id); // Almacena el id del usuario
      return response.data.token;
    }
    return null;
  } catch (error) {
    throw error;
  }
};

// Método para cerrar sesión
const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("role");
  localStorage.removeItem("userId"); // Elimina el id del usuario del localStorage
  //localStorage.clear(); // Alternativamente, puedes usar esto para limpiar todos los datos del almacenamiento local.
};

// Método para verificar el estado del usuario y cerrar sesión si es inactivo
const checkUserStatus = async () => {
  try {
    const userId = localStorage.getItem("userId");
    const token = getCurrentUser();
    if (userId && token) {
      const response = await axios.get(`${API_URL}/auth/get_user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const status = response.data.status; // Suponiendo que la respuesta incluye el status del usuario
      if (status === "inactive") {
        logout();
        window.location.href = "/login"; // O '/login-cliente' dependiendo del rol
      }
    }
  } catch (error) {
    console.error("Error al verificar el estado del usuario:", error);
    // Puedes manejar errores aquí, como cerrar sesión si la solicitud falla
    // logout();
    // window.location.href = "/login";
  }
};

// Método para obtener el token del usuario actual
const getCurrentUser = () => {
  return localStorage.getItem("token");
};

// Método para obtener los detalles del usuario actual
const getUserDetails = () => {
  const user = localStorage.getItem("role");
  return user ? JSON.parse(user) : null;
};

// Exporta el servicio de autenticación
const AuthService = {
  login,
  loginClient,
  logout,
  getCurrentUser,
  getUserDetails,
  checkUserStatus,
};

export default AuthService;
