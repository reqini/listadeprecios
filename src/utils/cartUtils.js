import { parsePrice, formatPrice } from './priceUtils';

/**
 * Aplica el descuento de Plan Canje si está activo.
 * @param {number} amount - El monto original.
 * @returns {number} - El monto con descuento aplicado.
 */
export const applyPlanCanjeDiscount = (amount) => {
  return Math.max(amount - 35000, 0);
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
  const parsedPrice = parsePrice(price); // Aseguramos que el precio esté parseado correctamente
  const finalPrice = planCanje[codigo] ? applyPlanCanjeDiscount(parsedPrice) : parsedPrice; // Aplicar plan canje si es necesario
  return includeShipping ? finalPrice + shippingCost : finalPrice; // Agregar envío si es necesario
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

  if (parsedPSVPPrice === 0 || parsedCuotaPrice === 0) {
    console.error(`Error: PSVP o cuota no válidos para el producto ${codigo}`);
    return formatPrice(0);  // Retorna $0 si los valores no son válidos
  }

  // Aplicar descuento de Plan Canje si corresponde
  const discountedPSVP = planCanje[codigo] ? applyPlanCanjeDiscount(parsedPSVPPrice) : parsedPSVPPrice;
  // Aplicar el costo de envío si corresponde
  const finalPrice = includeShipping ? discountedPSVP + shippingCost : discountedPSVP;
  // Verifica que no haya división por cero y calcula el valor de la cuota
  const cuotaFinal = parsedCuotaPrice > 0 ? (finalPrice / (parsedPSVPPrice / parsedCuotaPrice)) : 0;

  return formatPrice(cuotaFinal);  // Devuelve el precio formateado
};
