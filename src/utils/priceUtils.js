// utils/priceUtils.js

/**
 * Convierte un string de precio en un entero eliminando los caracteres no numéricos.
 * @param {string} priceString - El precio en formato string.
 * @returns {number} - El precio convertido a número.
 */
export const parsePrice = (priceString) => {
    if (!priceString || typeof priceString !== 'string') return 0;
    return parseInt(priceString.replace(/[^0-9]/g, '').trim(), 10) || 0;
  };
  
  /**
   * Convierte un número a un string con formato de moneda.
   * @param {number} price - El precio a formatear.
   * @returns {string} - El precio formateado como moneda.
   */
  export const formatPrice = (price) => {
    return Math.round(price).toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };
  