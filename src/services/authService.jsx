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
  //localStorage.clear(); // Alternativamente, puedes usar esto para limpiar todos los datos del almacenamiento local.
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
};

export default AuthService;
