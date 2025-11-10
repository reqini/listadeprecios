// Servicio para búsqueda con IA en internet
// En producción, aquí integrarías con APIs reales como:
// - Google Custom Search API
// - Bing Search API
// - SerpAPI
// - ScrapingBee
// - etc.

class SearchAPIService {
  constructor() {
    // Configuración de APIs (en producción, estas claves irían en variables de entorno)
    this.apiKeys = {
      google: process.env.REACT_APP_GOOGLE_API_KEY || '',
      googleCSE: process.env.REACT_APP_GOOGLE_CSE_ID || '',
      bing: process.env.REACT_APP_BING_API_KEY || '',
      serpapi: process.env.REACT_APP_SERPAPI_KEY || ''
    };
    
    this.baseURLs = {
      google: 'https://www.googleapis.com/customsearch/v1',
      bing: 'https://api.bing.microsoft.com/v7.0/search',
      serpapi: 'https://serpapi.com/search'
    };
  }

  // Búsqueda principal que combina múltiples fuentes
  async searchEssenMaterial(searchTerm, options = {}) {
      const {
        maxResults = 20,
        includeImages = true,
        includeVideos = true
      } = options;

    try {
      // Ejecutar búsquedas en paralelo para mejor rendimiento
      const [webResults, imageResults, videoResults] = await Promise.allSettled([
        this.searchWeb(searchTerm, { maxResults: Math.floor(maxResults * 0.4) }),
        includeImages ? this.searchImages(searchTerm, { maxResults: Math.floor(maxResults * 0.3) }) : Promise.resolve([]),
        includeVideos ? this.searchVideos(searchTerm, { maxResults: Math.floor(maxResults * 0.3) }) : Promise.resolve([])
      ]);

      // Combinar y procesar resultados
      const allResults = [
        ...(webResults.status === 'fulfilled' ? webResults.value : []),
        ...(imageResults.status === 'fulfilled' ? imageResults.value : []),
        ...(videoResults.status === 'fulfilled' ? videoResults.value : [])
      ];

      // Filtrar y enriquecer resultados específicos para Essen
      const enrichedResults = this.enrichEssenResults(allResults, searchTerm);
      
      // Ordenar por relevancia
      return this.sortByRelevance(enrichedResults, searchTerm);
    } catch (error) {
      console.error('Error en búsqueda principal:', error);
      throw new Error('Error al realizar la búsqueda. Intenta nuevamente.');
    }
  }

  // Búsqueda web general
  async searchWeb(searchTerm, options = {}) {
    const { maxResults = 10 } = options;
    
    try {
      // Usar Google Custom Search si está disponible
      if (this.apiKeys.google && this.apiKeys.googleCSE) {
        return await this.searchWithGoogle(searchTerm, maxResults);
      }
      
      // Fallback a búsqueda simulada
      return this.generateMockWebResults(searchTerm, maxResults);
    } catch (error) {
      console.error('Error en búsqueda web:', error);
      return this.generateMockWebResults(searchTerm, maxResults);
    }
  }

  // Búsqueda de imágenes
  async searchImages(searchTerm, options = {}) {
    const { maxResults = 10 } = options;
    
    try {
      if (this.apiKeys.google && this.apiKeys.googleCSE) {
        return await this.searchImagesWithGoogle(searchTerm, maxResults);
      }
      
      return this.generateMockImageResults(searchTerm, maxResults);
    } catch (error) {
      console.error('Error en búsqueda de imágenes:', error);
      return this.generateMockImageResults(searchTerm, maxResults);
    }
  }

  // Búsqueda de videos
  async searchVideos(searchTerm, options = {}) {
    const { maxResults = 10 } = options;
    
    try {
      if (this.apiKeys.google && this.apiKeys.googleCSE) {
        return await this.searchVideosWithGoogle(searchTerm, maxResults);
      }
      
      return this.generateMockVideoResults(searchTerm, maxResults);
    } catch (error) {
      console.error('Error en búsqueda de videos:', error);
      return this.generateMockVideoResults(searchTerm, maxResults);
    }
  }

  // Implementación con Google Custom Search API
  async searchWithGoogle(searchTerm, maxResults) {
    const params = new URLSearchParams({
      key: this.apiKeys.google,
      cx: this.apiKeys.googleCSE,
      q: `${searchTerm} Essen Argentina`,
      num: Math.min(maxResults, 10),
      safe: 'medium',
      lr: 'lang_es'
    });

    const response = await fetch(`${this.baseURLs.google}?${params}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Error en Google Search API');
    }

    return this.processGoogleResults(data.items || []);
  }

  // Implementación con Google para imágenes
  async searchImagesWithGoogle(searchTerm, maxResults) {
    const params = new URLSearchParams({
      key: this.apiKeys.google,
      cx: this.apiKeys.googleCSE,
      q: `${searchTerm} Essen Argentina`,
      searchType: 'image',
      num: Math.min(maxResults, 10),
      safe: 'medium',
      lr: 'lang_es'
    });

    const response = await fetch(`${this.baseURLs.google}?${params}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Error en Google Images API');
    }

    return this.processGoogleImageResults(data.items || []);
  }

  // Implementación con Google para videos
  async searchVideosWithGoogle(searchTerm, maxResults) {
    const params = new URLSearchParams({
      key: this.apiKeys.google,
      cx: this.apiKeys.googleCSE,
      q: `${searchTerm} Essen Argentina`,
      searchType: 'video',
      num: Math.min(maxResults, 10),
      safe: 'medium',
      lr: 'lang_es'
    });

    const response = await fetch(`${this.baseURLs.google}?${params}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Error en Google Videos API');
    }

    return this.processGoogleVideoResults(data.items || []);
  }

  // Procesar resultados de Google Search
  processGoogleResults(items) {
    return items.map((item, index) => ({
      id: `web_${index}`,
      title: item.title,
      description: item.snippet,
      url: item.link,
      type: this.detectContentType(item.link),
      thumbnail: this.getThumbnailFromUrl(item.link),
      source: this.extractDomain(item.link),
      relevance: this.calculateRelevance(item, 'web')
    }));
  }

  // Procesar resultados de Google Images
  processGoogleImageResults(items) {
    return items.map((item, index) => ({
      id: `image_${index}`,
      title: item.title,
      description: `Imagen de ${item.title}`,
      url: item.link,
      type: 'image',
      thumbnail: item.image?.thumbnailLink || item.link,
      source: this.extractDomain(item.image?.contextLink || item.link),
      resolution: `${item.image?.width || 'N/A'}x${item.image?.height || 'N/A'}`,
      relevance: this.calculateRelevance(item, 'image')
    }));
  }

  // Procesar resultados de Google Videos
  processGoogleVideoResults(items) {
    return items.map((item, index) => ({
      id: `video_${index}`,
      title: item.title,
      description: item.snippet,
      url: item.link,
      type: 'video',
      thumbnail: item.pagemap?.videoobject?.[0]?.thumbnailurl || this.getThumbnailFromUrl(item.link),
      source: this.extractDomain(item.link),
      duration: this.extractDuration(item),
      relevance: this.calculateRelevance(item, 'video')
    }));
  }

  // Detectar tipo de contenido basado en URL
  detectContentType(url) {
    const urlLower = url.toLowerCase();
    
    if (urlLower.includes('.pdf')) return 'pdf';
    if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) return 'video';
    if (urlLower.includes('.jpg') || urlLower.includes('.jpeg') || urlLower.includes('.png') || urlLower.includes('.gif')) return 'image';
    if (urlLower.includes('.gif')) return 'gif';
    
    return 'web';
  }

  // Extraer dominio de URL
  extractDomain(url) {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return 'Fuente desconocida';
    }
  }

  // Obtener thumbnail de URL
  getThumbnailFromUrl(url) {
    // En una implementación real, podrías usar servicios como:
    // - LinkPreview API
    // - OpenGraph meta tags
    // - Screenshot APIs
    return `https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=Preview`;
  }

  // Extraer duración de video
  extractDuration(item) {
    // Implementar lógica para extraer duración de videos
    return 'N/A';
  }

  // Calcular relevancia
  calculateRelevance(item, type) {
    let score = 0;
    
    // Puntuar por palabras clave Essen
    const text = `${item.title} ${item.snippet || ''}`.toLowerCase();
    if (text.includes('essen')) score += 10;
    if (text.includes('argentina')) score += 5;
    if (text.includes('receta')) score += 3;
    if (text.includes('tutorial')) score += 3;
    
    // Puntuar por tipo de contenido
    if (type === 'video') score += 5;
    if (type === 'pdf') score += 4;
    if (type === 'image') score += 3;
    
    return score;
  }

  // Enriquecer resultados específicos para Essen
  enrichEssenResults(results, searchTerm) {
    return results.map(result => ({
      ...result,
      title: this.enhanceTitle(result.title, searchTerm),
      description: this.enhanceDescription(result.description, searchTerm),
      essenRelevance: this.calculateEssenRelevance(result, searchTerm)
    }));
  }

  // Mejorar título
  enhanceTitle(title, searchTerm) {
    // Lógica para mejorar títulos basado en el término de búsqueda
    return title;
  }

  // Mejorar descripción
  enhanceDescription(description, searchTerm) {
    // Lógica para mejorar descripciones
    return description;
  }

  // Calcular relevancia específica para Essen
  calculateEssenRelevance(result, searchTerm) {
    let score = 0;
    const text = `${result.title} ${result.description}`.toLowerCase();
    
    // Palabras clave específicas de Essen
    const essenKeywords = ['essen', 'sartén', 'cacerola', 'wok', 'plancha', 'olla'];
    essenKeywords.forEach(keyword => {
      if (text.includes(keyword)) score += 2;
    });
    
    // Término de búsqueda
    if (text.includes(searchTerm.toLowerCase())) score += 5;
    
    return score;
  }

  // Ordenar por relevancia
  sortByRelevance(results, searchTerm) {
    return results.sort((a, b) => {
      const scoreA = (a.relevance || 0) + (a.essenRelevance || 0);
      const scoreB = (b.relevance || 0) + (b.essenRelevance || 0);
      return scoreB - scoreA;
    });
  }

  // Generar resultados simulados para desarrollo/testing
  generateMockWebResults(searchTerm, maxResults) {
    const mockResults = [
      {
        id: `mock_web_1`,
        title: `${searchTerm} - Receta oficial Essen Argentina`,
        description: 'Receta completa paso a paso para preparar con tu producto Essen. Incluye ingredientes, preparación y consejos de uso.',
        url: 'https://www.essen.com.ar/recetas/' + searchTerm.toLowerCase().replace(/\s+/g, '-'),
        type: 'web',
        thumbnail: 'https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=Receta+Web',
        source: 'essen.com.ar',
        relevance: 15
      },
      {
        id: `mock_web_2`,
        title: `Manual de uso ${searchTerm} - Essen`,
        description: 'Guía completa de uso, cuidado y mantenimiento de tu producto Essen.',
        url: 'https://www.essen.com.ar/manuales/' + searchTerm.toLowerCase().replace(/\s+/g, '-') + '.pdf',
        type: 'pdf',
        thumbnail: 'https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=Manual+PDF',
        source: 'essen.com.ar',
        pages: 12,
        size: '2.3 MB',
        relevance: 12
      }
    ];

    return mockResults.slice(0, maxResults);
  }

  generateMockImageResults(searchTerm, maxResults) {
    const mockResults = [
      {
        id: `mock_image_1`,
        title: `${searchTerm} - Imagen oficial Essen`,
        description: `Imagen de alta calidad del producto ${searchTerm} de Essen`,
        url: 'https://picsum.photos/800/600?random=1',
        type: 'image',
        thumbnail: 'https://picsum.photos/300/200?random=1',
        source: 'instagram.com/essenargentina',
        resolution: '1920x1080',
        relevance: 10
      },
      {
        id: `mock_image_2`,
        title: `${searchTerm} - Galería de fotos`,
        description: `Múltiples ángulos del producto ${searchTerm} Essen`,
        url: 'https://picsum.photos/800/600?random=2',
        type: 'image',
        thumbnail: 'https://picsum.photos/300/200?random=2',
        source: 'facebook.com/essenargentina',
        resolution: '1920x1080',
        relevance: 9
      }
    ];

    return mockResults.slice(0, maxResults);
  }

  generateMockVideoResults(searchTerm, maxResults) {
    const mockResults = [
      {
        id: `mock_video_1`,
        title: `${searchTerm} - Tutorial Essen`,
        description: `Video tutorial completo de cómo usar tu ${searchTerm} Essen`,
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        type: 'video',
        thumbnail: 'https://via.placeholder.com/300x200/96CEB4/FFFFFF?text=Video+Tutorial',
        source: 'youtube.com/essenargentina',
        duration: '5:30',
        views: '125K',
        relevance: 13
      },
      {
        id: `mock_video_2`,
        title: `${searchTerm} - Receta en video`,
        description: `Receta paso a paso usando ${searchTerm} Essen`,
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        type: 'video',
        thumbnail: 'https://via.placeholder.com/300x200/FFEAA7/FFFFFF?text=Receta+Video',
        source: 'youtube.com/essenoficial',
        duration: '3:45',
        views: '89K',
        relevance: 11
      }
    ];

    return mockResults.slice(0, maxResults);
  }
}

// Instancia singleton del servicio
const searchAPI = new SearchAPIService();

export default searchAPI;
