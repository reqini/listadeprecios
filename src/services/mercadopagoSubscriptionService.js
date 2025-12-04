/**
 * Servicio de Suscripciones con Mercado Pago
 * Maneja toda la lógica de suscripciones mensuales
 */

import axios from '../utils/axios';

// Plan de suscripción mensual de Mercado Pago
export const SUBSCRIPTION_CONFIG = {
  PLAN_ID: '2c93808494f9e81b01952fe6e9e01a76',
  AMOUNT: 10000, // $10.000 ARS
  CURRENCY: 'ARS',
  FREQUENCY: 'monthly',
  CHECKOUT_URL: 'https://www.mercadopago.com.ar/subscriptions/checkout',
};

/**
 * Genera un código de acceso único para el usuario
 * Formato: CAT-XXXX-XXXX-XXXX
 */
export const generateAccessCode = () => {
  const segment1 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const segment2 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const segment3 = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CAT-${segment1}-${segment2}-${segment3}`;
};

/**
 * Construye la URL de checkout de Mercado Pago con parámetros
 */
export const buildCheckoutUrl = (userId, email, backUrl) => {
  const params = new URLSearchParams({
    preapproval_plan_id: SUBSCRIPTION_CONFIG.PLAN_ID,
    external_reference: userId || '',
  });

  if (email) {
    params.append('payer_email', email);
  }

  if (backUrl) {
    params.append('back_url', backUrl);
  }

  return `${SUBSCRIPTION_CONFIG.CHECKOUT_URL}?${params.toString()}`;
};

/**
 * Obtiene el estado actual de la suscripción del usuario
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

/**
 * Redirige al usuario al checkout de Mercado Pago
 */
export const redirectToCheckout = (userId, email, backUrl) => {
  const checkoutUrl = buildCheckoutUrl(userId, email, backUrl);
  window.location.href = checkoutUrl;
};

/**
 * Verifica si el estado de suscripción permite acceso
 */
export const isSubscriptionActive = (subscriptionStatus) => {
  return subscriptionStatus === 'active';
};

/**
 * Verifica si la suscripción está vencida o cancelada
 */
export const isSubscriptionInactive = (subscriptionStatus) => {
  return ['past_due', 'canceled', 'none'].includes(subscriptionStatus);
};

/**
 * Obtiene el mensaje de error según el estado de suscripción
 */
export const getSubscriptionErrorMessage = (subscriptionStatus) => {
  switch (subscriptionStatus) {
    case 'past_due':
      return 'Tu suscripción está vencida. Renová tu suscripción para seguir usando la app.';
    case 'canceled':
      return 'Tu suscripción fue cancelada. Activá tu suscripción mensual para acceder.';
    case 'none':
      return 'No tenés una suscripción activa. Activá tu suscripción mensual de $10.000 para usar la app.';
    default:
      return 'Tu suscripción no está activa. Activá tu suscripción para acceder.';
  }
};

export default {
  SUBSCRIPTION_CONFIG,
  generateAccessCode,
  buildCheckoutUrl,
  getSubscriptionStatus,
  redirectToCheckout,
  isSubscriptionActive,
  isSubscriptionInactive,
  getSubscriptionErrorMessage,
};

