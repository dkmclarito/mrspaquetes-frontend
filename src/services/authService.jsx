import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user)); 
      localStorage.setItem("role", JSON.stringify({role: response.data.role}));       
      return response.data.token;
    }
    return null;
  } catch (error) {
    throw error;
  }
};


const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("role")
  //localStorage.clear();
};

const getCurrentUser = () => {
  return localStorage.getItem("token");
};

const getUserDetails = () => {
  const user = localStorage.getItem("role");
  return user ? JSON.parse(user) : null;
};

const AuthService = {
  login,
  logout,
  getCurrentUser,
  getUserDetails,
};


export default AuthService;
