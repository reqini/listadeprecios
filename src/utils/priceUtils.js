/**
 * Convierte un string de precio en un entero eliminando los caracteres no numéricos.
 * @param {string} priceString - El precio en formato string.
 * @returns {number} - El precio convertido a número.
 */
export const parsePrice = (priceString) => {
    if (!priceString || typeof priceString !== 'string') return 0;
  
    try {
      // Remover el símbolo de moneda ($) y cualquier otro carácter no numérico
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
    if (isNaN(price) || typeof price !== 'number' || price < 0) {
      console.error('Error: Precio no válido para formatear:', price);
      return '$0';
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
  