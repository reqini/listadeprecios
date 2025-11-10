
import axios from "axios";

const baseURL = process.env.REACT_APP_API_BASE || "";

const instance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar el token solo si existe
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Error en la configuración de la solicitud:", error);
    return Promise.reject(error);
  }
);

// Interceptor de respuesta mejorado
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestURL = error?.config?.url || "";

    // Solo alertar si es una ruta protegida
    const isProtected = !requestURL.includes("/api/productos");

    if (error.response && error.response.status === 401 && isProtected) {
      console.warn("⚠️ Token inválido. Redirigiendo al login.");
      // Limpiar localStorage completamente
      localStorage.removeItem("token");
      localStorage.removeItem("deviceId");
      localStorage.removeItem("activeSession");
      localStorage.removeItem("tipoUsuario");
      localStorage.removeItem("user");
      // Redirigir al login
      window.location.href = "/login";
    }

    // Manejar errores de red
    if (error.code === 'NETWORK_ERROR' || !error.response) {
      console.error("Error de red:", error.message);
    }

    return Promise.reject(error);
  }
);

export default instance;