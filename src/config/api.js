// Configuración de la API
export const API_CONFIG = {
  // Cambiar aquí para usar diferentes servidores
  USE_PRODUCTION: true, // Cambiar a false para usar local
  
  // URLs de los servidores
  LOCAL: "http://localhost:3001",
  PRODUCTION: "https://backtest-production-7f88.up.railway.app",
  
  // URL activa
  get baseURL() {
    return this.USE_PRODUCTION ? this.PRODUCTION : this.LOCAL;
  }
};

export default API_CONFIG;
