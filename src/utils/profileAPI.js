// API para manejo de datos de perfil con Google Sheets
import axios from './axios';

// Simular datos de perfil desde Google Sheets (fallback)
const MOCK_PROFILE_DATA = {
  cocinaty: {
    username: 'cocinaty',
    email: 'cocinaty@ejemplo.com',
    phone: '+54 9 11 1234-5678',
    address: 'Buenos Aires, Argentina',
    businessName: 'Cocina TY - Productos de Cocina',
    businessType: 'Venta de productos de cocina',
    avatar: '',
    rango: 'Demostrador/a',
    fechaRegistro: '2024-01-15',
    totalVentas: 1247,
    clientesActivos: 89,
    placasGeneradas: 156,
    rating: 4.8,
    preferences: {
      notifications: true,
      darkMode: false,
      language: 'es',
      theme: 'default'
    }
  }
};

export const profileAPI = {
  // Obtener datos del perfil
  async getProfile(username) {
    try {
      // Llamada real a Google Sheets a través del backend
      const response = await axios.get(`/api/profile/${username}`);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Usuario no encontrado'
        };
      }
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      
      // Fallback a datos mock si el servidor no responde
      const profileData = MOCK_PROFILE_DATA[username];
      if (profileData) {
        console.warn('Usando datos mock para perfil:', username);
        return {
          success: true,
          data: profileData
        };
      }
      
      return {
        success: false,
        message: 'Error al cargar datos del perfil'
      };
    }
  },

  // Actualizar datos del perfil
  async updateProfile(username, profileData) {
    try {
      // Llamada real a Google Sheets a través del backend
      const response = await axios.put(`/api/profile/${username}`, profileData);
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Perfil actualizado exitosamente'
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al actualizar el perfil'
        };
      }
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      
      // Fallback a simulación local si el servidor no responde
      if (MOCK_PROFILE_DATA[username]) {
        MOCK_PROFILE_DATA[username] = { ...MOCK_PROFILE_DATA[username], ...profileData };
        console.warn('Usando actualización mock para perfil:', username);
        return {
          success: true,
          message: 'Perfil actualizado exitosamente (modo offline)'
        };
      }
      
      return {
        success: false,
        message: 'Error al actualizar el perfil'
      };
    }
  },

  // Cambiar contraseña
  async changePassword(username, passwordData) {
    try {
      // Llamada real a la API para cambiar contraseña
      const response = await axios.post(`/api/profile/${username}/change-password`, passwordData);
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Contraseña actualizada exitosamente'
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al cambiar la contraseña'
        };
      }
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      
      // En caso de error de conexión, no simular cambio de contraseña por seguridad
      return {
        success: false,
        message: 'Error de conexión. No se pudo cambiar la contraseña.'
      };
    }
  },

  // Obtener estadísticas del usuario
  async getUserStats(username) {
    try {
      // Llamada real a Google Sheets para estadísticas
      const response = await axios.get(`/api/profile/${username}/stats`);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al cargar estadísticas'
        };
      }
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      
      // Fallback a datos mock para estadísticas
      const profileData = MOCK_PROFILE_DATA[username];
      if (profileData) {
        console.warn('Usando estadísticas mock para:', username);
        return {
          success: true,
          data: {
            totalVentas: profileData.totalVentas,
            clientesActivos: profileData.clientesActivos,
            placasGeneradas: profileData.placasGeneradas,
            rating: profileData.rating
          }
        };
      }
      
      return {
        success: false,
        message: 'Error al cargar estadísticas'
      };
    }
  }
};

export default profileAPI;
