import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      return response.data.token;
    }
    return null;
  } catch (error) {
    throw error;
  }
};

const logout = () => {
  localStorage.removeItem("token");
};

const getCurrentUser = () => {
  return localStorage.getItem("token");
};

const AuthService = {
  login,
  logout,
  getCurrentUser,
};

export default AuthService;
