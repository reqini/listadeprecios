/**
 * Utilidad para fusionar y rankear resultados de búsqueda
 * Prioriza relevancia, precio y calificaciones
 */

/**
 * Fusiona resultados de múltiples fuentes y los rankea por relevancia
 * @param {Array} localResults - Resultados del catálogo local
 * @param {Object} webResults - Resultados de búsqueda web { mercadolibre: [], google: [], bing: [] }
 * @param {string} query - Término de búsqueda original
 * @returns {Object} - Resultados agrupados y fusionados
 */
export function mergeSearchResults(localResults = [], webResults = {}, query = '') {
  const normalizedQuery = normalizeString(query);
  
  // Agrupar resultados web en un solo array
  const allWebResults = [
    ...(webResults.mercadolibre || []).map(r => ({ ...r, fuente: 'mercadolibre' })),
    ...(webResults.google || []).map(r => ({ ...r, fuente: 'google' })),
    ...(webResults.bing || []).map(r => ({ ...r, fuente: 'bing' })),
  ];
  
  // Rankear resultados locales
  const rankedLocal = rankLocalResults(localResults, normalizedQuery);
  
  // Rankear resultados web
  const rankedWeb = rankWebResults(allWebResults, normalizedQuery);
  
  // Encontrar comparaciones (mismo producto en diferentes fuentes)
  const comparisons = findComparisons([...rankedLocal, ...rankedWeb], normalizedQuery);
  
  // Identificar el más barato
  const cheapest = findCheapest(rankedWeb);
  
  return {
    local: rankedLocal.slice(0, 20), // Máximo 20 por fuente
    web: rankedWeb.slice(0, 60), // Máximo 60 total de web
    comparisons,
    cheapest,
    stats: {
      totalLocal: rankedLocal.length,
      totalWeb: rankedWeb.length,
      totalComparisons: comparisons.length,
      query: query,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Rankea resultados locales por relevancia
 * @param {Array} results - Resultados locales
 * @param {string} query - Query normalizada
 * @returns {Array} - Resultados rankeados
 */
function rankLocalResults(results, query) {
  return results.map(result => {
    let score = 0;
    const descripcion = normalizeString(result.descripcion || result.nombre || '');
    const nombre = normalizeString(result.nombre || '');
    const codigo = normalizeString(String(result.codigo || ''));
    const categoria = normalizeString(result.categoria || result.linea || '');
    
    // Coincidencia exacta en nombre: +100
    if (nombre === query) score += 100;
    if (nombre.includes(query)) score += 50;
    
    // Coincidencia en descripción: +30
    if (descripcion.includes(query)) score += 30;
    
    // Coincidencia en código: +20
    if (codigo.includes(query)) score += 20;
    
    // Coincidencia en categoría: +10
    if (categoria.includes(query)) score += 10;
    
    // Producto vigente: +5
    if (result.vigencia === 'SI' || result.vigente) score += 5;
    
    // Stock disponible: +3
    if (result.stock > 0) score += 3;
    
    return {
      ...result,
      relevanciaScore: score,
      esLocal: true,
      fuente: 'Catálogo Interno',
    };
  })
  .sort((a, b) => b.relevanciaScore - a.relevanciaScore);
}

/**
 * Rankea resultados web por relevancia
 * @param {Array} results - Resultados web
 * @param {string} query - Query normalizada
 * @returns {Array} - Resultados rankeados
 */
function rankWebResults(results, query) {
  const uniqueResults = removeDuplicates(results);
  
  return uniqueResults.map(result => {
    let score = 0;
    const nombre = normalizeString(result.nombre || '');
    const descripcion = normalizeString(result.descripcion || '');
    
    // Coincidencia exacta: +100
    if (nombre === query) score += 100;
    if (nombre.includes(query)) score += 50;
    
    // Coincidencia en descripción: +20
    if (descripcion.includes(query)) score += 20;
    
    // Precio disponible: +10
    if (result.precio > 0) score += 10;
    
    // Calificación alta: +15
    if (result.calificacion && result.calificacion >= 4.5) score += 15;
    else if (result.calificacion && result.calificacion >= 4.0) score += 10;
    
    // Envío gratis: +5
    if (result.envioGratis) score += 5;
    
    // Muchas ventas: +5
    if (result.vendidos > 100) score += 5;
    
    // Priorizar MercadoLibre: +10
    if (result.fuente === 'mercadolibre') score += 10;
    
    return {
      ...result,
      relevanciaScore: score,
      esLocal: false,
    };
  })
  .sort((a, b) => b.relevanciaScore - a.relevanciaScore);
}

/**
 * Encuentra comparaciones (mismo producto en diferentes fuentes)
 * @param {Array} results - Todos los resultados
 * @param {string} query - Query normalizada
 * @returns {Array} - Agrupaciones de productos similares
 */
function findComparisons(results, query) {
  const comparisons = [];
  const processed = new Set();
  
  for (let i = 0; i < results.length; i++) {
    if (processed.has(i)) continue;
    
    const current = results[i];
    const similar = [current];
    
    for (let j = i + 1; j < results.length; j++) {
      if (processed.has(j)) continue;
      
      const other = results[j];
      const similarity = calculateSimilarity(
        current.nombre || '',
        other.nombre || ''
      );
      
      // Si son más del 70% similares, agruparlos
      if (similarity > 0.7) {
        similar.push(other);
        processed.add(j);
      }
    }
    
    if (similar.length > 1) {
      comparisons.push({
        productos: similar,
        precioMin: Math.min(...similar.map(s => s.precio || Infinity)),
        precioMax: Math.max(...similar.map(s => s.precio || 0)),
        precioPromedio: similar.reduce((sum, s) => sum + (s.precio || 0), 0) / similar.length,
        mejorPrecio: similar.find(s => s.precio === Math.min(...similar.map(s => s.precio || Infinity))),
        totalFuentes: new Set(similar.map(s => s.fuente || s.tienda)).size,
      });
      processed.add(i);
    }
  }
  
  return comparisons;
}

/**
 * Encuentra el producto más barato
 * @param {Array} results - Resultados web
 * @returns {Object|null} - Producto más barato
 */
function findCheapest(results) {
  const withPrice = results.filter(r => r.precio > 0);
  if (withPrice.length === 0) return null;
  
  return withPrice.reduce((min, current) => 
    (current.precio < min.precio) ? current : min
  );
}

/**
 * Calcula similitud entre dos strings (Jaccard similarity)
 * @param {string} str1 - Primera cadena
 * @param {string} str2 - Segunda cadena
 * @returns {number} - Similitud entre 0 y 1
 */
function calculateSimilarity(str1, str2) {
  const s1 = normalizeString(str1);
  const s2 = normalizeString(str2);
  
  if (s1 === s2) return 1;
  
  const words1 = new Set(s1.split(/\s+/).filter(w => w.length > 2));
  const words2 = new Set(s2.split(/\s+/).filter(w => w.length > 2));
  
  if (words1.size === 0 || words2.size === 0) return 0;
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

/**
 * Normaliza un string para comparación
 * @param {string} str - String a normalizar
 * @returns {string} - String normalizado
 */
function normalizeString(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .trim();
}

/**
 * Remueve duplicados de resultados web
 * @param {Array} results - Resultados con posibles duplicados
 * @returns {Array} - Resultados únicos
 */
function removeDuplicates(results) {
  const seen = new Set();
  const unique = [];
  
  for (const result of results) {
    const key = `${result.url || result.id}_${result.nombre}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(result);
    }
  }
  
  return unique;
}

