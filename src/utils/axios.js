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
      console.log("🛠️ Enviando token:", token); // Log para depuración
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("⚠️ No se encontró token en localStorage");
    }
    return config;
  },
  (error) => {
    console.error("Error en la configuración de la solicitud:", error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas de errores
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        console.warn("⚠️ Token inválido o expirado. Mostrar aviso antes de cerrar sesión.");
        alert("Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.");
        localStorage.removeItem("token");
        window.location.href = "/login"; 
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
