
import axios from "axios";

const baseURL = process.env.REACT_APP_API_BASE || "";

// Cache muy simple por URL para GETs (en memoria + localStorage)
const RESPONSE_CACHE_PREFIX = "catalogo_cache_";

const instance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000, // 20s para evitar 504 por timeouts muy largos
});

// Interceptor para agregar el token solo si existe
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Intentar servir desde cache para GET si existe y es reciente (< 60s)
    if (config.method === "get") {
      const cacheKey = RESPONSE_CACHE_PREFIX + (config.url || "");
      try {
        const raw = localStorage.getItem(cacheKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          const age = Date.now() - parsed.timestamp;
          if (age < 60000 && parsed.data) {
            // Devolvemos una respuesta simulada y evitamos ir a red
            return Promise.reject({
              __fromCache: true,
              config,
              response: { data: parsed.data, status: 200 },
            });
          }
        }
      } catch {
        // Ignorar errores de cache
      }
    }

    return config;
  },
  (error) => {
    console.error("Error en la configuración de la solicitud:", error);
    return Promise.reject(error);
  }
);

// Interceptor de respuesta mejorado con retries y cache
instance.interceptors.response.use(
  (response) => {
    // Guardar en cache respuestas GET exitosas
    if (response.config?.method === "get" && response.config.url) {
      const cacheKey = RESPONSE_CACHE_PREFIX + response.config.url;
      try {
        localStorage.setItem(
          cacheKey,
          JSON.stringify({ timestamp: Date.now(), data: response.data })
        );
      } catch {
        // Ignorar errores de localStorage (cuota llena, etc.)
      }
    }
    return response;
  },
  async (error) => {
    // Si viene marcado como cache, devolvemos directamente la response simulada
    if (error.__fromCache && error.response) {
      return error.response;
    }

    const config = error.config || {};
    const requestURL = config.url || "";

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

    // Retries automáticos para errores de red / 5xx / 504
    const status = error.response?.status;
    const isNetworkError = error.code === "ECONNABORTED" || error.code === "ERR_NETWORK" || !error.response;
    const shouldRetry = isNetworkError || (status && status >= 500);

    if (shouldRetry && config && !config.__isRetryRequest) {
      const maxRetries = 2;
      config.__retryCount = config.__retryCount || 0;

      if (config.__retryCount < maxRetries) {
        config.__retryCount += 1;
        config.__isRetryRequest = true;

        // Pequeño backoff lineal
        await new Promise((resolve) => setTimeout(resolve, 500 * config.__retryCount));
        return instance(config);
      }
    }

    // Manejar errores de red
    if (isNetworkError) {
      console.error("Error de red:", error.message);
    }

    return Promise.reject(error);
  }
);

export default instance;
