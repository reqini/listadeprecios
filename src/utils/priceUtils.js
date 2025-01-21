/**
 * Convierte un string de precio en un entero eliminando los caracteres no numéricos.
 * @param {string} priceString - El precio en formato string.
 * @returns {number} - El precio convertido a número.
 */
export const parsePrice = (priceString) => {
  if (!priceString || typeof priceString !== 'string') {
    console.warn('Advertencia: El precio no es un string válido:', priceString);
    return 0;
  }

  try {
    // Remover caracteres no numéricos y espacios
    const parsed = parseInt(priceString.replace(/[^\d]/g, '').trim(), 10);

    if (isNaN(parsed)) {
      console.error('Error: El precio no es un número válido:', priceString);
      return 0;
    }

    return parsed;
  } catch (error) {
    console.error('Error al parsear el precio:', error, priceString);
    return 0;
  }
};

/**
 * Convierte un número a un string con formato de moneda.
 * @param {number} price - El precio a formatear.
 * @returns {string} - El precio formateado como moneda.
 */
export const formatPrice = (price) => {
  // Validación ampliada para asegurar que el precio es un número positivo
  if (price === undefined || price === null || isNaN(price) || typeof price !== 'number' || price < 0) {
    console.error('Error: Precio no válido para formatear:', price);
    return '$0'; // Valor por defecto en caso de precio no válido
  }

  try {
    // Convertir y formatear el número como moneda con estilo ARS
    return price.toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  } catch (error) {
    console.error('Error al formatear el precio:', error, price);
    return '$0';
  }
};

// Ejemplo de uso en otro archivo (catalogo.js):
// Asegúrate de que el valor de `price` esté definido antes de llamar a formatPrice
// console.log("Precio antes de formatear:", price);
// const formattedPrice = formatPrice(price);
