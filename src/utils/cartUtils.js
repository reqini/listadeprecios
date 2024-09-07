// utils/cartUtils.js

import { parsePrice, formatPrice } from './priceUtils';

/**
 * Aplica el descuento de Plan Canje si está activo.
 * @param {number} amount - El monto original.
 * @returns {number} - El monto con descuento aplicado.
 */
export const applyPlanCanjeDiscount = (amount) => {
  return Math.max(amount - 30000, 0);
};

/**
 * Calcula el precio con el Plan Canje aplicado y el costo de envío si corresponde.
 * @param {string} price - El precio original del producto.
 * @param {string} codigo - El código del producto.
 * @param {Object} planCanje - Estado que indica si se aplica el Plan Canje.
 * @param {boolean} includeShipping - Estado que indica si se incluye el envío.
 * @param {number} shippingCost - Costo del envío.
 * @returns {number} - El precio final con los descuentos y/o envío aplicado.
 */
export const getDiscountedPrice = (price, codigo, planCanje, includeShipping, shippingCost) => {
  const parsedPrice = parsePrice(price);
  const finalPrice = planCanje[codigo] ? applyPlanCanjeDiscount(parsedPrice) : parsedPrice;
  return includeShipping ? finalPrice + shippingCost : finalPrice;
};

/**
 * Calcula el precio por cuota de un producto.
 * @param {string} psvpPrice - Precio de lista del producto.
 * @param {string} cuotaPrice - Precio por cuota.
 * @param {string} codigo - El código del producto.
 * @param {Object} planCanje - Estado que indica si se aplica el Plan Canje.
 * @param {boolean} includeShipping - Estado que indica si se incluye el envío.
 * @param {number} shippingCost - Costo del envío.
 * @returns {string} - El precio final por cuota formateado.
 */
export const getCuotaPrice = (psvpPrice, cuotaPrice, codigo, planCanje, includeShipping, shippingCost) => {
    const parsedPSVPPrice = parsePrice(psvpPrice);
    const parsedCuotaPrice = parsePrice(cuotaPrice);
  
    const discountedPSVP = planCanje[codigo] ? applyPlanCanjeDiscount(parsedPSVPPrice) : parsedPSVPPrice;
    const finalPrice = includeShipping ? discountedPSVP + shippingCost : discountedPSVP;
  
    return parsedCuotaPrice > 0 ? (finalPrice / (parsedPSVPPrice / parsedCuotaPrice)).toFixed(0) : 0;
  };
  
