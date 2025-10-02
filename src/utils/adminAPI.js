// API para manejo de configuración administrativa
import axios from './axios';

export const adminAPI = {
  // Obtener costos actuales
  async getCostos() {
    try {
      const response = await axios.get('/api/admin/costos');
      return response.data;
    } catch (error) {
      console.error('Error al obtener costos:', error);
      // Fallback a valores por defecto
      return {
        success: true,
        data: {
          costoEnvio: 21036,
          costoPlanCanje: 0
        }
      };
    }
  },

  // Actualizar costos
  async updateCostos(costos) {
    try {
      const response = await axios.put('/api/admin/costos', costos);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar costos:', error);
      return {
        success: false,
        message: 'Error al actualizar costos'
      };
    }
  },

  // Obtener estadísticas del sistema
  async getStats() {
    try {
      const response = await axios.get('/api/admin/stats');
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return {
        success: false,
        message: 'Error al obtener estadísticas'
      };
    }
  }
};
