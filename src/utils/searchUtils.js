/**
 * Utilidades para búsqueda y filtrado de productos
 * Incluye normalización de acentos y búsqueda robusta
 * Optimizado para performance con memoización
 */

// Cache para normalización de strings (mejora performance)
const normalizeCache = new Map();

/**
 * Normaliza un string removiendo acentos y convirtiendo a minúsculas
 * Con cache para mejorar performance
 * @param {string} str - String a normalizar
 * @returns {string} - String normalizado
 */
export const normalizeString = (str) => {
  if (!str) return '';
  if (normalizeCache.has(str)) {
    return normalizeCache.get(str);
  }
  
  const normalized = str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .trim();
  
  // Limitar cache a 1000 entradas para evitar memory leak
  if (normalizeCache.size > 1000) {
    const firstKey = normalizeCache.keys().next().value;
    normalizeCache.delete(firstKey);
  }
  
  normalizeCache.set(str, normalized);
  return normalized;
};

/**
 * Busca un término en múltiples campos de un producto
 * Optimizado para evitar procesamiento innecesario
 * @param {Object} producto - Producto a buscar
 * @param {string} searchTerm - Término de búsqueda normalizado
 * @returns {boolean} - True si hay coincidencia
 */
export const searchInProduct = (producto, normalizedSearchTerm) => {
  if (!normalizedSearchTerm || !normalizedSearchTerm.trim()) return true;
  if (!producto) return false;
  
  // Campos a buscar - procesar solo si es necesario
  const descripcion = normalizeString(producto?.descripcion || '');
  if (descripcion.includes(normalizedSearchTerm)) return true;
  
  const linea = normalizeString(producto?.linea || '');
  if (linea.includes(normalizedSearchTerm)) return true;
  
  const categoria = normalizeString(producto?.categoria || '');
  if (categoria.includes(normalizedSearchTerm)) return true;
  
  const codigo = normalizeString(producto?.codigo?.toString() || '');
  if (codigo.includes(normalizedSearchTerm)) return true;
  
  return false;
};

/**
 * Filtra productos según término de búsqueda y vigencia
 * Optimizado para performance con early returns
 * @param {Array} productos - Array de productos
 * @param {string} searchTerm - Término de búsqueda
 * @param {boolean} onlyActive - Solo productos vigentes
 * @returns {Array} - Productos filtrados
 */
export const filterProducts = (productos = [], searchTerm = '', onlyActive = true) => {
  if (!productos || productos.length === 0) return [];
  
  const searchTrimmed = searchTerm ? searchTerm.trim() : '';
  const normalizedSearch = searchTrimmed ? normalizeString(searchTrimmed) : '';
  
  // Si no hay búsqueda, solo filtrar por vigencia
  if (!normalizedSearch) {
    if (onlyActive) {
      return productos.filter((producto) => producto?.vigencia === "SI");
    }
    return productos;
  }
  
  // Filtrar con búsqueda
  const results = [];
  for (let i = 0; i < productos.length; i++) {
    const producto = productos[i];
    
    // Early return por vigencia
    if (onlyActive && producto?.vigencia !== "SI") {
      continue;
    }
    
    // Búsqueda optimizada
    if (searchInProduct(producto, normalizedSearch)) {
      results.push(producto);
    }
  }
  
  return results;
};

/**
 * Valida si un producto tiene vigencia activa
 * @param {Object} producto - Producto a validar
 * @returns {boolean} - True si está vigente
 */
export const isProductActive = (producto) => {
  return producto?.vigencia === "SI";
};
