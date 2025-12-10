/**
 * Funciones helper para aplicar premios de la ruleta al carrito
 */

/**
 * Aplica un descuento al total del carrito
 * @param {Array} cart - Array del carrito
 * @param {number} discount - Porcentaje de descuento (ej: 5 para 5%)
 * @returns {Array} Nuevo carrito con descuento aplicado
 */
export function applyDiscountToCart(cart, discount) {
  if (!cart || cart.length === 0 || !discount || discount <= 0) {
    return cart;
  }

  // Agregar un ítem de descuento al carrito
  const discountItem = {
    id: `discount-${discount}`,
    descripcion: `Descuento ${discount}%`,
    precio: 0,
    selectedCuotaValue: 0,
    discount: discount,
    isDiscount: true,
  };

  return [...cart, discountItem];
}

/**
 * Agrega un regalo al carrito
 * @param {Array} cart - Array del carrito
 * @param {string} giftName - Nombre del regalo ("asas" o "mate")
 * @returns {Array} Nuevo carrito con regalo agregado
 */
export function addGiftToCart(cart, giftName) {
  if (!cart) return [];

  const giftNames = {
    asas: "Asas de Silicona",
    mate: "Mate",
  };

  const giftTitle = giftNames[giftName] || giftName;

  // Verificar si el regalo ya está en el carrito
  const alreadyHasGift = cart.some(
    (item) => item.id === `gift-${giftName}` || item.gift === giftName
  );

  if (alreadyHasGift) {
    return cart; // No duplicar regalos
  }

  const giftItem = {
    id: `gift-${giftName}`,
    descripcion: giftTitle,
    precio: 0,
    selectedCuotaValue: 0,
    gift: giftName,
    isGift: true,
  };

  return [...cart, giftItem];
}

/**
 * Calcula el total del carrito aplicando descuentos
 * @param {Array} cart - Array del carrito
 * @returns {number} Total con descuentos aplicados
 */
export function calculateCartTotalWithDiscounts(cart) {
  if (!cart || cart.length === 0) return 0;

  // Calcular subtotal (sin descuentos ni regalos)
  const subtotal = cart.reduce((sum, item) => {
    if (item.isDiscount || item.isGift) {
      return sum; // Los descuentos y regalos no suman al subtotal
    }
    const price = item.selectedCuotaValue || item.precio || 0;
    const quantity = item.cantidad || 1;
    return sum + price * quantity;
  }, 0);

  // Aplicar descuentos
  let total = subtotal;
  cart.forEach((item) => {
    if (item.isDiscount && item.discount) {
      const discountAmount = (total * item.discount) / 100;
      total = total - discountAmount;
    }
  });

  return Math.max(0, total); // Asegurar que no sea negativo
}


