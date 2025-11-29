/**
 * Función pura para filtrar productos
 * Busca coincidencias en: nombre, descripción, categoría, línea, banco, tags
 * 
 * @param {Array} products - Array de productos a filtrar
 * @param {string} searchTerm - Término de búsqueda
 * @returns {Array} - Productos filtrados
 */
export const filterProducts = (products, searchTerm) => {
  if (!searchTerm || searchTerm.trim() === '') {
    return products;
  }

  const normalizedSearch = normalizeString(searchTerm);

  return products.filter((producto) => {
    // Campos a buscar
    const campos = [
      producto.descripcion,
      producto.nombre,
      producto.categoria,
      producto.linea,
      producto.banco,
      producto.tags,
      producto.codigo,
      producto.marca,
    ];

    // Buscar en todos los campos
    return campos.some((campo) => {
      if (!campo) return false;
      const normalizedField = normalizeString(String(campo));
      return normalizedField.includes(normalizedSearch);
    });
  });
};

/**
 * Normaliza strings para búsqueda sin acentos y en minúsculas
 * @param {string} str - String a normalizar
 * @returns {string} - String normalizado
 */
const normalizeString = (str) => {
  if (!str) return '';
  
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

/**
 * Filtra productos excluyendo repuestos y productos no vigentes
 * @param {Array} products - Array de productos
 * @returns {Array} - Productos filtrados
 */
export const filterValidProducts = (products) => {
  return products.filter((producto) => {
    const linea = (producto?.linea || '').toLowerCase();
    const vigencia = (producto?.vigencia || '').toLowerCase();
    
    return linea !== 'repuestos' && vigencia !== 'no';
  });
};

/**
 * Combina todos los filtros: búsqueda + validación
 * @param {Array} products - Array de productos
 * @param {string} searchTerm - Término de búsqueda
 * @returns {Array} - Productos filtrados
 */
export const filterAllProducts = (products, searchTerm) => {
  const validProducts = filterValidProducts(products);
  return filterProducts(validProducts, searchTerm);
};

