/**
 * Servicios de búsqueda web para productos
 * Integra múltiples APIs: Google, Bing, MercadoLibre, etc.
 */

/**
 * Buscar productos en MercadoLibre
 * @param {string} query - Término de búsqueda
 * @returns {Promise<Array>} - Resultados de MercadoLibre
 */
export async function searchMercadoLibre(query) {
  try {
    const response = await fetch(
      `https://api.mercadolibre.com/sites/MLA/search?q=${encodeURIComponent(query)}&limit=20`
    );
    const data = await response.json();
    
    if (!data.results || !Array.isArray(data.results)) {
      return [];
    }
    
    return data.results.slice(0, 20).map(item => ({
      id: item.id,
      nombre: item.title,
      precio: item.price || 0,
      imagen: item.thumbnail || item.thumbnail_id ? `https://http2.mlstatic.com/D_${item.thumbnail_id || item.thumbnail}-O.jpg` : '',
      tienda: 'MercadoLibre',
      url: item.permalink,
      calificacion: item.seller?.reputation?.transactions?.ratings?.average || null,
      ubicacion: item.seller_address?.city?.name || '',
      envioGratis: item.shipping?.free_shipping || false,
      condicion: item.condition || 'new',
      vendidos: item.sold_quantity || 0,
      fuente: 'mercadolibre',
      raw: item,
    }));
  } catch (error) {
    console.error('Error buscando en MercadoLibre:', error);
    return [];
  }
}

/**
 * Buscar en Google usando Custom Search API
 * Requiere API key en variables de entorno
 * @param {string} query - Término de búsqueda
 * @returns {Promise<Array>} - Resultados de Google
 */
export async function searchGoogle(query) {
  const apiKey = process.env.REACT_APP_GOOGLE_SEARCH_API_KEY;
  const searchEngineId = process.env.REACT_APP_GOOGLE_SEARCH_ENGINE_ID;
  
  if (!apiKey || !searchEngineId) {
    console.warn('Google Search API no configurada. Configurar REACT_APP_GOOGLE_SEARCH_API_KEY y REACT_APP_GOOGLE_SEARCH_ENGINE_ID');
    return [];
  }
  
  try {
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query + ' precio comprar')}&num=20`
    );
    const data = await response.json();
    
    if (!data.items || !Array.isArray(data.items)) {
      return [];
    }
    
    return data.items.slice(0, 20).map(item => ({
      id: `google_${item.link?.replace(/[^a-zA-Z0-9]/g, '_')}`,
      nombre: item.title || '',
      descripcion: item.snippet || '',
      precio: extractPriceFromText(item.snippet || ''),
      imagen: item.pagemap?.cse_image?.[0]?.src || '',
      tienda: extractStoreFromUrl(item.displayLink || ''),
      url: item.link || '',
      calificacion: null,
      fuente: 'google',
      raw: item,
    }));
  } catch (error) {
    console.error('Error buscando en Google:', error);
    return [];
  }
}

/**
 * Buscar en Bing Web Search API
 * @param {string} query - Término de búsqueda
 * @returns {Promise<Array>} - Resultados de Bing
 */
export async function searchBing(query) {
  const apiKey = process.env.REACT_APP_BING_SEARCH_API_KEY;
  
  if (!apiKey) {
    console.warn('Bing Search API no configurada. Configurar REACT_APP_BING_SEARCH_API_KEY');
    return [];
  }
  
  try {
    const response = await fetch(
      `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query + ' precio')}&count=20`,
      {
        headers: {
          'Ocp-Apim-Subscription-Key': apiKey,
        },
      }
    );
    const data = await response.json();
    
    if (!data.webPages || !data.webPages.value || !Array.isArray(data.webPages.value)) {
      return [];
    }
    
    return data.webPages.value.slice(0, 20).map(item => ({
      id: `bing_${item.url?.replace(/[^a-zA-Z0-9]/g, '_')}`,
      nombre: item.name || '',
      descripcion: item.snippet || '',
      precio: extractPriceFromText(item.snippet || ''),
      imagen: '',
      tienda: extractStoreFromUrl(item.displayUrl || ''),
      url: item.url || '',
      calificacion: null,
      fuente: 'bing',
      raw: item,
    }));
  } catch (error) {
    console.error('Error buscando en Bing:', error);
    return [];
  }
}

/**
 * Búsqueda genérica usando múltiples fuentes
 * @param {string} query - Término de búsqueda
 * @returns {Promise<Object>} - Resultados agrupados por fuente
 */
export async function searchAllSources(query) {
  if (!query || query.trim().length < 2) {
    return {
      mercadolibre: [],
      google: [],
      bing: [],
      error: null,
    };
  }
  
  const searchTerm = query.trim();
  
  try {
    // Ejecutar búsquedas en paralelo con timeout
    const [mercadolibre, google, bing] = await Promise.allSettled([
      Promise.race([
        searchMercadoLibre(searchTerm),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
      ]),
      Promise.race([
        searchGoogle(searchTerm),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
      ]),
      Promise.race([
        searchBing(searchTerm),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
      ]),
    ]);
    
    return {
      mercadolibre: mercadolibre.status === 'fulfilled' ? mercadolibre.value : [],
      google: google.status === 'fulfilled' ? google.value : [],
      bing: bing.status === 'fulfilled' ? bing.value : [],
      error: null,
    };
  } catch (error) {
    console.error('Error en búsqueda general:', error);
    return {
      mercadolibre: [],
      google: [],
      bing: [],
      error: error.message,
    };
  }
}

/**
 * Extrae precio de un texto
 * @param {string} text - Texto que puede contener precio
 * @returns {number} - Precio extraído o 0
 */
function extractPriceFromText(text) {
  if (!text) return 0;
  
  // Buscar patrones como $1234, $1.234, $1,234.56, ARS 1234, etc.
  const pricePatterns = [
    /\$\s*([\d.,]+)/g,
    /ARS\s*([\d.,]+)/g,
    /([\d.,]+)\s*ARS/g,
    /precio[:\s]+([\d.,]+)/gi,
  ];
  
  for (const pattern of pricePatterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      const priceStr = matches[0].replace(/[$ARS\s:]/gi, '').replace(/\./g, '').replace(',', '.');
      const price = parseFloat(priceStr);
      if (!isNaN(price) && price > 0) {
        return price;
      }
    }
  }
  
  return 0;
}

/**
 * Extrae nombre de tienda desde URL
 * @param {string} url - URL de la tienda
 * @returns {string} - Nombre de la tienda
 */
function extractStoreFromUrl(url) {
  if (!url) return 'Desconocido';
  
  try {
    const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
    const parts = domain.split('.');
    
    // Remover www, com, com.ar, etc.
    const storeName = parts.filter(part => 
      !['www', 'com', 'com.ar', 'net', 'org', 'ar'].includes(part.toLowerCase())
    )[0] || domain;
    
    return storeName.charAt(0).toUpperCase() + storeName.slice(1);
  } catch (e) {
    return url;
  }
}

