// API local para manejo de datos de perfil
// import axios from './axios'; // No utilizado por ahora

// Simular datos de perfil desde Google Sheets
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
      // En producción, esto haría una llamada real a Google Sheets
      // const response = await axios.get(`/api/profile/${username}`);
      // return response.data;
      
      // Por ahora, usar datos mock
      const profileData = MOCK_PROFILE_DATA[username];
      if (profileData) {
        return {
          success: true,
          data: profileData
        };
      } else {
        return {
          success: false,
          message: 'Usuario no encontrado'
        };
      }
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      return {
        success: false,
        message: 'Error al cargar datos del perfil'
      };
    }
  },

  // Actualizar datos del perfil
  async updateProfile(username, profileData) {
    try {
      // En producción, esto haría una llamada real a Google Sheets
      // const response = await axios.put(`/api/profile/${username}`, profileData);
      // return response.data;
      
      // Por ahora, simular actualización
      if (MOCK_PROFILE_DATA[username]) {
        MOCK_PROFILE_DATA[username] = { ...MOCK_PROFILE_DATA[username], ...profileData };
        return {
          success: true,
          message: 'Perfil actualizado exitosamente'
        };
      } else {
        return {
          success: false,
          message: 'Usuario no encontrado'
        };
      }
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      return {
        success: false,
        message: 'Error al actualizar el perfil'
      };
    }
  },

  // Cambiar contraseña
  async changePassword(username, passwordData) {
    try {
      // En producción, esto haría una llamada real a la API
      // const response = await axios.post(`/api/profile/${username}/change-password`, passwordData);
      // return response.data;
      
      // Por ahora, simular cambio de contraseña
      return {
        success: true,
        message: 'Contraseña actualizada exitosamente'
      };
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      return {
        success: false,
        message: 'Error al cambiar la contraseña'
      };
    }
  },

  // Obtener estadísticas del usuario
  async getUserStats(username) {
    try {
      const profileData = MOCK_PROFILE_DATA[username];
      if (profileData) {
        return {
          success: true,
          data: {
            totalVentas: profileData.totalVentas,
            clientesActivos: profileData.clientesActivos,
            placasGeneradas: profileData.placasGeneradas,
            rating: profileData.rating
          }
        };
      } else {
        return {
          success: false,
          message: 'Usuario no encontrado'
        };
      }
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return {
        success: false,
        message: 'Error al cargar estadísticas'
      };
    }
  }
};

export default profileAPI;
