
import axios from "axios";
import { API_CONFIG } from "../config/api";

const url = API_CONFIG.baseURL;

const instance = axios.create({
  baseURL: `${url}`,
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
      console.warn("⚠️ Token inválido. Solo rutas protegidas redirigen.");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default instance;