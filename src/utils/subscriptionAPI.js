/**
 * API de Suscripciones
 * Funciones para interactuar con los endpoints de suscripción
 */

import axios from './axios';

/**
 * Cancela la suscripción del usuario
 */
export const cancelSubscription = async (token) => {
  try {
    const response = await axios.delete('/api/subscriptions/cancel', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('Error al cancelar suscripción:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Error al cancelar la suscripción',
    };
  }
};

/**
 * Elimina la cuenta del usuario
 */
export const deleteAccount = async (token) => {
  try {
    const response = await axios.delete('/api/users/delete', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('Error al eliminar cuenta:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Error al eliminar la cuenta',
    };
  }
};

/**
 * Obtiene el estado de la suscripción
 */
export const getSubscriptionStatus = async (token) => {
  try {
    const response = await axios.get('/api/subscriptions/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('Error al obtener estado de suscripción:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Error al obtener estado de suscripción',
    };
  }
};

export default {
  cancelSubscription,
  deleteAccount,
  getSubscriptionStatus,
};

