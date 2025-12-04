/**
 * Servicio de Verificación de Vencimiento de Suscripción
 * Revisa el estado de la suscripción y detecta vencimientos próximos o vencidos
 */

import axios from '../utils/axios';

/**
 * Verifica el estado de vencimiento de la suscripción del usuario
 * @returns {Promise<{status: string, daysRemaining: number|null, shouldShowModal: boolean}>}
 */
export const checkSubscriptionExpiration = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return {
        status: 'none',
        daysRemaining: null,
        shouldShowModal: false,
      };
    }

    // Consultar estado de suscripción al backend
    const response = await axios.get('/api/subscriptions/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.data || !response.data.success) {
      return {
        status: 'unknown',
        daysRemaining: null,
        shouldShowModal: false,
      };
    }

    const subscription = response.data;
    const subscriptionStatus = subscription.subscription_status;
    const nextChargeDate = subscription.subscription_next_charge_date;

    // Si no hay suscripción activa, no verificar vencimiento
    if (subscriptionStatus !== 'active' && subscriptionStatus !== 'expiring_soon') {
      return {
        status: subscriptionStatus,
        daysRemaining: null,
        shouldShowModal: subscriptionStatus === 'expired' || subscriptionStatus === 'past_due',
      };
    }

    // Si ya está marcado como expiring_soon o expired, retornar eso
    if (subscriptionStatus === 'expiring_soon' || subscriptionStatus === 'expired') {
      return {
        status: subscriptionStatus,
        daysRemaining: subscriptionStatus === 'expiring_soon' ? calculateDaysRemaining(nextChargeDate) : 0,
        shouldShowModal: true,
      };
    }

    // Calcular días restantes
    if (!nextChargeDate) {
      return {
        status: subscriptionStatus,
        daysRemaining: null,
        shouldShowModal: false,
      };
    }

    const daysRemaining = calculateDaysRemaining(nextChargeDate);
    let finalStatus = subscriptionStatus;

    // Actualizar estado según días restantes
    if (daysRemaining <= 0) {
      finalStatus = 'expired';
    } else if (daysRemaining <= 3) {
      finalStatus = 'expiring_soon';
    }

    // Actualizar en localStorage si cambió
    if (finalStatus !== subscriptionStatus) {
      localStorage.setItem('subscriptionStatus', finalStatus);
    }

    return {
      status: finalStatus,
      daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
      shouldShowModal: finalStatus === 'expiring_soon' || finalStatus === 'expired',
    };
  } catch (error) {
    console.error('Error al verificar vencimiento de suscripción:', error);
    return {
      status: 'error',
      daysRemaining: null,
      shouldShowModal: false,
    };
  }
};

/**
 * Calcula los días restantes hasta la fecha de próximo cobro
 * @param {string|Date} nextChargeDate - Fecha del próximo cobro
 * @returns {number} - Días restantes (negativo si ya venció)
 */
export const calculateDaysRemaining = (nextChargeDate) => {
  if (!nextChargeDate) return null;

  const nextDate = new Date(nextChargeDate);
  const today = new Date();
  
  // Resetear horas para comparar solo fechas
  today.setHours(0, 0, 0, 0);
  nextDate.setHours(0, 0, 0, 0);

  const diffTime = nextDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

/**
 * Verifica si la suscripción está próxima a vencer (3 días o menos)
 */
export const isExpiringSoon = (daysRemaining) => {
  return daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 3;
};

/**
 * Verifica si la suscripción ya venció
 */
export const isExpired = (daysRemaining) => {
  return daysRemaining !== null && daysRemaining <= 0;
};

export default {
  checkSubscriptionExpiration,
  calculateDaysRemaining,
  isExpiringSoon,
  isExpired,
};

