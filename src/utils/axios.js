import axios from "axios";

const url =
  process.env.NODE_ENV === "development"
    ? `http://localhost:3001`
    : "https://backtest-production-7f88.up.railway.app";

const instance = axios.create({
  baseURL: `${url}`,
});

// Interceptor para agregar el token a cada solicitud
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Obtener el token del localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Agregar el token al header
    }
    return config;
  },
  (error) => {
    console.error("Error en la configuración de la solicitud:", error);
    return Promise.reject(error); // Propagar el error
  }
);

// Interceptor para manejar respuestas de errores
instance.interceptors.response.use(
  (response) => response, // Retornar la respuesta si es exitosa
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Token inválido o expirado. Cerrando sesión...");
      localStorage.removeItem("token"); // Eliminar el token si es inválido
      // Puedes redirigir al login o manejar el cierre de sesión aquí
      window.location.href = "/login"; // Redirigir al login
    }
    return Promise.reject(error); // Propagar el error
  }
);

export default instance;
