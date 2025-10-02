// Configuración de la API
export const API_CONFIG = {
  // Cambiar aquí para usar diferentes servidores
  USE_PRODUCTION: true, // Cambiar a false para usar local
  USE_RENDER: true, // Usar Render (necesita CORS configurado)
  
  // URLs de los servidores
  LOCAL: "http://localhost:3001",
  RAILWAY: "https://backtest-production-7f88.up.railway.app",
  RENDER: "https://backend-catalogosimple.onrender.com", // ✅ URL REAL DE RENDER
  
  // URL activa
  get baseURL() {
    if (!this.USE_PRODUCTION) {
      return this.LOCAL;
    }
    return this.USE_RENDER ? this.RENDER : this.RAILWAY;
  }
};

export default API_CONFIG;
