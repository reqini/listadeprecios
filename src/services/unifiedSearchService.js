/**
 * Servicio Unificado de Búsqueda
 * 
 * Combina búsqueda semántica con IA, filtros avanzados y contenido útil
 * 100% seguro: solo datos ficticios, sin scraping ni datos reales
 */

// Dataset ficticio para contenido de emprendedoras
const FICTIONAL_PRODUCTS_DATASET = [
  {
    id: 'prod_001',
    title: 'Sartén antiadherente 24cm línea Terra Nova',
    description: 'Ideal para preparaciones rápidas y saludables. Material premium con acabado no adherente.',
    category: 'Cocina',
    linea: 'Terra Nova',
    tags: ['cocina rápida', 'ventas altas', 'regalo ideal', 'inicio de cocina'],
    precio: 45900,
    material: 'Aluminio reforzado',
    sugerencias: [
      'Idea de posteo: "Iniciá tu cocina saludable con esta sartén que te cambia la vida"',
      'Descripción optimizada: Perfecta para principiantes en la cocina',
      'Argumento de venta: Sin aceite, sin complicaciones, solo resultados'
    ]
  },
  {
    id: 'prod_002',
    title: 'Cacerola 18cm línea Premium',
    description: 'Tamaño perfecto para preparar porciones individuales o para dos personas.',
    category: 'Cocina',
    linea: 'Premium',
    tags: ['tamaño individual', 'versatilidad', 'fácil limpieza'],
    precio: 32100,
    material: 'Aluminio',
    sugerencias: [
      'Idea de posteo: "Porciones perfectas para tu familia"',
      'Descripción: Ideal para vivir solo o en pareja',
      'Argumento: Cocina justo lo que necesitás'
    ]
  },
  {
    id: 'prod_003',
    title: 'Wok profesional 30cm línea Chef',
    description: 'Para salteados rápidos y platos orientales. Base gruesa para cocción uniforme.',
    category: 'Cocina Internacional',
    linea: 'Chef',
    tags: ['cocina internacional', 'salteados', 'técnicas avanzadas'],
    precio: 52800,
    material: 'Aluminio con base gruesa',
    sugerencias: [
      'Idea de posteo: "Llevá tu cocina a otro nivel con técnicas profesionales"',
      'Descripción: Para quienes quieren experimentar con sabores nuevos',
      'Argumento: Transformá ingredientes simples en platos gourmet'
    ]
  },
  {
    id: 'prod_004',
    title: 'Plancha grill 28cm línea Gourmet',
    description: 'Marca perfecta en carnes y verduras. Ideal para parrilla en interiores.',
    category: 'Parrilla',
    linea: 'Gourmet',
    tags: ['parrilla', 'marca perfecta', 'carnes', 'verduras'],
    precio: 48900,
    material: 'Hierro fundido',
    sugerencias: [
      'Idea de posteo: "Sabor a parrilla sin salir de casa"',
      'Descripción: Para los amantes de la carne con marca perfecta',
      'Argumento: Parrilla en cualquier momento del año'
    ]
  },
  {
    id: 'prod_005',
    title: 'Olla express 5.5L línea Clásica',
    description: 'Reduce tiempos de cocción hasta en un 70%. Perfecta para guisos y cocción a presión.',
    category: 'Cocción Rápida',
    linea: 'Clásica',
    tags: ['cocción rápida', 'ahorro de tiempo', 'guisos', 'familias'],
    precio: 67200,
    material: 'Acero inoxidable',
    sugerencias: [
      'Idea de posteo: "Cena lista en minutos, no en horas"',
      'Descripción: Para familias ocupadas que quieren comer bien',
      'Argumento: Más tiempo con tu familia, menos en la cocina'
    ]
  }
];

const FICTIONAL_CONTENT_IDEAS = [
  {
    category: 'posteo_ventas',
    title: 'Cómo crear un posteo que venda',
    content: 'Usá imágenes de alta calidad, destacá los beneficios, incluí un call to action claro. Ejemplo: "¿Querés cocinar más saludable? Esta sartén te lo pone fácil. Escribime para más info 📱"'
  },
  {
    category: 'descripciones_catalogo',
    title: 'Descripciones optimizadas para catálogo',
    content: 'Sé específico: "Sartén antiadherente de 24cm, ideal para preparaciones rápidas. Material premium que distribuye el calor uniformemente. Perfecta para principiantes."'
  },
  {
    category: 'argumentos_venta',
    title: 'Argumentos de venta efectivos',
    content: 'Enfocáte en beneficios, no solo características. "Ahorrá tiempo" vs "Cocción rápida". "Más tiempo con tu familia" vs "Reduce tiempos de cocción".'
  },
  {
    category: 'fotos_productos',
    title: 'Tips para fotos de productos',
    content: 'Buena iluminación natural, fondo neutro, muestra el producto en uso, varios ángulos. La primera foto debe mostrar claramente qué es el producto.'
  },
  {
    category: 'clientes_objetivo',
    title: 'Identificar tu cliente ideal',
    content: '¿Quién necesita este producto? Ejemplo: "Madres que trabajan y quieren cocinar saludable pero rápido" o "Personas que viven solas y quieren porciones justas".'
  }
];

class UnifiedSearchService {
  constructor() {
    this.cache = new Map();
    this.CACHE_DURATION = 60 * 60 * 1000; // 1 hora
  }

  /**
   * Búsqueda principal unificada
   * @param {string} query - Término de búsqueda
   * @param {Object} filters - Filtros avanzados
   * @returns {Promise<Object>} - Resultados combinados
   */
  async search(query, filters = {}) {
    const cacheKey = `search_${query}_${JSON.stringify(filters)}`;
    
    // Verificar cache
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const searchTerm = query.trim().toLowerCase();
    
    if (!searchTerm || searchTerm.length < 2) {
      return this.emptyResults();
    }

    try {
      // Búsqueda semántica en dataset ficticio
      const products = this.searchProducts(searchTerm, filters);
      
      // Generar sugerencias de IA
      const aiSuggestions = this.generateAISuggestions(searchTerm, products);
      
      // Contenido útil para emprendedoras
      const helpfulContent = this.getHelpfulContent(searchTerm);

      const results = {
        products: products.map(p => ({
          title: p.title,
          description: p.description,
          tags: p.tags,
          category: p.category,
          linea: p.linea,
          precio: p.precio,
          material: p.material
        })),
        aiSuggestions,
        helpfulContent,
        query: searchTerm,
        timestamp: Date.now()
      };

      // Guardar en cache
      this.saveToCache(cacheKey, results);
      
      return results;
    } catch (error) {
      console.error('Error en búsqueda unificada:', error);
      return this.emptyResults();
    }
  }

  /**
   * Búsqueda de productos en dataset ficticio
   */
  searchProducts(searchTerm, filters = {}) {
    let results = [...FICTIONAL_PRODUCTS_DATASET];

    // Filtro por búsqueda
    if (searchTerm) {
      results = results.filter(product => {
        const searchableText = `${product.title} ${product.description} ${product.tags.join(' ')} ${product.category} ${product.linea}`.toLowerCase();
        return searchableText.includes(searchTerm);
      });
    }

    // Filtros avanzados
    if (filters.categoria && filters.categoria !== 'all') {
      results = results.filter(p => p.category === filters.categoria);
    }

    if (filters.linea && filters.linea !== 'all') {
      results = results.filter(p => p.linea === filters.linea);
    }

    if (filters.precioMin) {
      results = results.filter(p => p.precio >= filters.precioMin);
    }

    if (filters.precioMax) {
      results = results.filter(p => p.precio <= filters.precioMax);
    }

    if (filters.material && filters.material !== 'all') {
      results = results.filter(p => p.material.toLowerCase().includes(filters.material.toLowerCase()));
    }

    // Ordenar por relevancia
    results = this.sortByRelevance(results, searchTerm);

    return results;
  }

  /**
   * Generar sugerencias de IA basadas en búsqueda
   */
  generateAISuggestions(searchTerm, products) {
    const suggestions = [];

    // Si encontró productos, generar sugerencias específicas
    if (products.length > 0) {
      const product = products[0];
      suggestions.push(...product.sugerencias);
    }

    // Sugerencias generales basadas en intención
    const intent = this.detectIntent(searchTerm);
    
    if (intent.includes('vender') || intent.includes('venta')) {
      suggestions.push(
        '💡 Idea de posteo: "Transformá tu cocina con este producto que todas aman. ¿Te gustaría probarlo? Escribime 📱"',
        '📱 CTA efectivo: Incluí un botón de WhatsApp directo en tus posts',
        '🎯 Segmentación: Publicá en grupos de Facebook de cocina y recetas'
      );
    }

    if (intent.includes('receta') || intent.includes('cocinar')) {
      suggestions.push(
        '🍳 Idea de contenido: Mostrá el producto en acción preparando una receta simple',
        '📸 Tip de foto: Incluí ingredientes alrededor del producto para contexto',
        '✨ Valor agregado: Compartí un tip de cocina relacionado con el producto'
      );
    }

    if (intent.includes('regalo') || intent.includes('presente')) {
      suggestions.push(
        '🎁 Ángulo de venta: "El regalo perfecto para alguien que ama cocinar"',
        '💝 Packaging: Ofrecé un packaging especial para regalo',
        '💌 Mensaje: Incluí una tarjeta personalizada sin costo adicional'
      );
    }

    return suggestions.slice(0, 5); // Máximo 5 sugerencias
  }

  /**
   * Detectar intención de búsqueda
   */
  detectIntent(searchTerm) {
    const intents = {
      venta: ['vender', 'venta', 'vendo', 'vender más', 'aumentar ventas'],
      receta: ['receta', 'cocinar', 'preparar', 'hacer', 'cómo'],
      regalo: ['regalo', 'presente', 'obsequio', 'cumpleaños', 'navidad'],
      comparar: ['comparar', 'diferencia', 'mejor', 'vs', 'versus'],
      informacion: ['qué es', 'para qué', 'cómo funciona', 'características']
    };

    for (const [intent, keywords] of Object.entries(intents)) {
      if (keywords.some(kw => searchTerm.includes(kw))) {
        return intent;
      }
    }

    return 'general';
  }

  /**
   * Obtener contenido útil para emprendedoras
   */
  getHelpfulContent(searchTerm) {
    // Filtrar contenido relevante
    const relevantContent = FICTIONAL_CONTENT_IDEAS.filter(item => {
      const searchable = `${item.title} ${item.content}`.toLowerCase();
      return searchable.includes(searchTerm) || this.detectIntent(searchTerm) !== 'general';
    });

    // Si no hay contenido específico, devolver general
    if (relevantContent.length === 0) {
      return FICTIONAL_CONTENT_IDEAS.slice(0, 3);
    }

    return relevantContent.slice(0, 3);
  }

  /**
   * Autosuggest mientras el usuario escribe
   */
  getSuggestions(partialQuery) {
    if (!partialQuery || partialQuery.length < 2) {
      return [];
    }

    const query = partialQuery.toLowerCase();
    const suggestions = new Set();

    // Buscar en productos
    FICTIONAL_PRODUCTS_DATASET.forEach(product => {
      if (product.title.toLowerCase().includes(query)) {
        suggestions.add(product.title);
      }
      product.tags.forEach(tag => {
        if (tag.toLowerCase().includes(query)) {
          suggestions.add(tag);
        }
      });
    });

    // Sugerencias de intención
    const commonQueries = [
      'cómo vender más',
      'ideas de posteos',
      'descripciones de productos',
      'fotos para catálogo',
      'argumentos de venta',
      'clientes objetivo'
    ];

    commonQueries.forEach(q => {
      if (q.includes(query)) {
        suggestions.add(q);
      }
    });

    return Array.from(suggestions).slice(0, 8);
  }

  /**
   * Ordenar resultados por relevancia
   */
  sortByRelevance(results, searchTerm) {
    return results.sort((a, b) => {
      const scoreA = this.calculateRelevance(a, searchTerm);
      const scoreB = this.calculateRelevance(b, searchTerm);
      return scoreB - scoreA;
    });
  }

  /**
   * Calcular relevancia de un producto
   */
  calculateRelevance(product, searchTerm) {
    let score = 0;
    const searchableText = `${product.title} ${product.description} ${product.tags.join(' ')}`.toLowerCase();
    
    // Coincidencia exacta en título
    if (product.title.toLowerCase().includes(searchTerm)) score += 10;
    
    // Coincidencia en descripción
    if (product.description.toLowerCase().includes(searchTerm)) score += 5;
    
    // Coincidencia en tags
    product.tags.forEach(tag => {
      if (tag.toLowerCase().includes(searchTerm)) score += 3;
    });

    return score;
  }

  /**
   * Sistema de cache
   */
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  saveToCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  emptyResults() {
    return {
      products: [],
      aiSuggestions: [],
      helpfulContent: [],
      query: '',
      timestamp: Date.now()
    };
  }

  /**
   * Limpiar cache (útil para testing)
   */
  clearCache() {
    this.cache.clear();
  }
}

// Instancia singleton
const unifiedSearchService = new UnifiedSearchService();

export default unifiedSearchService;

