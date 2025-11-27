// Sistema de cache con localStorage + fallback a API
class CacheManager {
  constructor() {
    this.CACHE_KEY = 'catalog_cache';
    this.CACHE_TIMESTAMP_KEY = 'catalog_cache_timestamp';
    this.CACHE_DURATION = 30 * 60 * 1000; // 30 minutos en milisegundos
  }

  // Verificar si el cache es válido
  isCacheValid() {
    try {
      const timestamp = localStorage.getItem(this.CACHE_TIMESTAMP_KEY);
      if (!timestamp) return false;

      const cacheAge = Date.now() - parseInt(timestamp, 10);
      return cacheAge < this.CACHE_DURATION;
    } catch (error) {
      console.error('Error checking cache validity:', error);
      return false;
    }
  }

  // Obtener datos del cache
  getCache(key = null) {
    try {
      if (!this.isCacheValid()) {
        console.log('⚠️ Cache expirado o no válido');
        return null;
      }

      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return null;

      const data = JSON.parse(cached);
      
      if (key) {
        return data[key] || null;
      }

      return data;
    } catch (error) {
      console.error('Error getting cache:', error);
      return null;
    }
  }

  // Guardar en cache
  setCache(data, key = null) {
    try {
      let cacheData = {};

      // Si ya existe cache, mantenerlo
      const existingCache = this.getCache();
      if (existingCache) {
        cacheData = existingCache;
      }

      // Actualizar con nuevos datos
      if (key) {
        cacheData[key] = data;
      } else {
        cacheData = { ...cacheData, ...data };
      }

      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
      localStorage.setItem(this.CACHE_TIMESTAMP_KEY, Date.now().toString());

      console.log('✅ Cache actualizado:', key || 'all');
    } catch (error) {
      console.error('Error setting cache:', error);
      // Si el localStorage está lleno, limpiar cache viejo
      if (error.name === 'QuotaExceededError') {
        this.clearCache();
        console.warn('⚠️ localStorage lleno, cache limpiado');
      }
    }
  }

  // Limpiar cache
  clearCache() {
    try {
      localStorage.removeItem(this.CACHE_KEY);
      localStorage.removeItem(this.CACHE_TIMESTAMP_KEY);
      console.log('🗑️ Cache limpiado');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Obtener datos con fallback: primero cache, luego API
  async fetchWithCache(key, fetchFunction, forceRefresh = false) {
    try {
      // Si no forzar refresh y el cache es válido, devolver cache
      if (!forceRefresh && this.isCacheValid()) {
        const cached = this.getCache(key);
        if (cached) {
          console.log(`📦 Datos obtenidos del cache: ${key}`);
          return cached;
        }
      }

      // Si no hay cache válido, obtener de API
      console.log(`🌐 Obteniendo datos de API: ${key}`);
      const data = await fetchFunction();

      // Guardar en cache
      this.setCache(data, key);

      return data;
    } catch (error) {
      console.error(`Error fetching with cache for ${key}:`, error);
      
      // En caso de error, intentar devolver cache aunque esté expirado
      const staleCache = this.getCache(key);
      if (staleCache) {
        console.warn(`⚠️ Usando cache expirado como fallback: ${key}`);
        return staleCache;
      }

      throw error;
    }
  }

  // Invalidar cache específico
  invalidateCache(key = null) {
    if (key) {
      const cache = this.getCache();
      if (cache && cache[key]) {
        delete cache[key];
        this.setCache(cache);
        console.log(`🗑️ Cache invalidado para: ${key}`);
      }
    } else {
      this.clearCache();
    }
  }
}

// Instancia singleton
const cacheManager = new CacheManager();

export default cacheManager;
