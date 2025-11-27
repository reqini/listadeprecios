// API para obtener promos por catálogo
// Optimizado para performance y manejo robusto de errores
import axios from './axios';

// Cache para logos de bancos (evitar múltiples llamadas)
const bancosCache = {
  data: null,
  timestamp: null,
  TTL: 5 * 60 * 1000, // 5 minutos
};

/**
 * Obtener todos los bancos desde la API con cache
 * @returns {Promise<Array>} Array de bancos
 */
const getAllBancos = async () => {
  // Verificar cache
  const now = Date.now();
  if (
    bancosCache.data &&
    bancosCache.timestamp &&
    (now - bancosCache.timestamp) < bancosCache.TTL
  ) {
    return bancosCache.data;
  }

  try {
    const response = await axios.get('/api/bancos');
    const bancos = Array.isArray(response.data) 
      ? response.data 
      : (response.data?.data || []);
    
    // Actualizar cache
    bancosCache.data = bancos;
    bancosCache.timestamp = now;
    
    return bancos;
  } catch (error) {
    console.warn('Error obteniendo bancos desde API:', error);
    // Si hay cache viejo, usarlo
    if (bancosCache.data) {
      return bancosCache.data;
    }
    return [];
  }
};

/**
 * Obtener logo de un banco por ID o nombre
 * @param {string} bancoId - ID o nombre del banco
 * @param {Array} bancos - Array de bancos (pre-cargado)
 * @returns {Object|null} Objeto con datos del banco o null
 */
const getBankLogo = (bancoId, bancos = []) => {
  if (!bancoId || !bancos || bancos.length === 0) return null;

  const bancoIdNormalized = bancoId.toString().trim().toLowerCase();
  
  // Buscar banco por múltiples campos
  const banco = bancos.find(b => {
    const id = (b.id || b.codigo || '').toString().toLowerCase();
    const nombre = (b.banco || b.nombre || '').toString().toLowerCase();
    const bancoIdLower = bancoIdNormalized;
    
    return (
      id === bancoIdLower ||
      nombre === bancoIdLower ||
      nombre.includes(bancoIdLower) ||
      bancoIdLower.includes(nombre)
    );
  });

  if (!banco) {
    console.warn(`Banco no encontrado: ${bancoId}`);
    return null;
  }

  return {
    id: banco.id || banco.codigo || bancoId,
    nombre: banco.banco || banco.nombre || bancoId,
    logo_url: banco.logo_url || banco.logoUrl || null,
  };
};

/**
 * Obtener promos activas para un catálogo específico
 * Soporta formato Google Sheets (catalogos y bancos como strings separados por comas)
 * @param {string} catalogoRuta - Ruta del catálogo (ej: '/catalogo3', '/home')
 * @returns {Promise<Array>} Array de promos activas para ese catálogo
 */
export const getPromosByCatalogo = async (catalogoRuta) => {
  try {
    const catalogoId = catalogoRuta.replace('/', '') || 'home';
    
    // Intentar desde API backend
    const response = await axios.get(`/api/catalogo-promos?catalogo=${encodeURIComponent(catalogoRuta)}`);
    
    // Si viene como array directo, procesarlo
    let promosFromAPI = Array.isArray(response.data) 
      ? response.data 
      : (response.data?.promos || response.data?.data || []);
    
    // Si no hay promos, intentar formato alternativo
    if (!promosFromAPI || promosFromAPI.length === 0) {
      const altResponse = await axios.get(`/api/bancos-promos`);
      promosFromAPI = Array.isArray(altResponse.data) 
        ? altResponse.data 
        : (altResponse.data?.data || []);
    }
    
    // Filtrar promos activas que incluyan este catálogo
    const promosFiltradas = promosFromAPI.filter(promo => {
      // Verificar si está activa
      const activo = promo.activo || promo.activa || promo.activo === true || promo.activo === 'TRUE' || promo.activo === 'si';
      if (!activo && activo !== true) {
        return false;
      }
      
      // Formato Google Sheets: catalogos es string separado por comas
      const catalogosStr = (promo.catalogos || promo.catalogo || '').toString().trim();
      if (!catalogosStr) {
        return false;
      }
      
      const catalogos = catalogosStr.split(',').map(c => c.trim().toLowerCase());
      const catalogoIdLower = catalogoId.toLowerCase();
      const catalogoRutaLower = catalogoRuta.toLowerCase().replace('/', '');
      
      return (
        catalogos.includes(catalogoIdLower) ||
        catalogos.includes(catalogoRutaLower) ||
        catalogos.includes(catalogoRuta.replace('/', '')) ||
        catalogos.some(c => c.includes(catalogoIdLower) || catalogoIdLower.includes(c))
      );
    });
    
    if (promosFiltradas.length > 0) {
      return promosFiltradas;
    }
    
    // Fallback: buscar en localStorage
    try {
      const localPromos = JSON.parse(localStorage.getItem('catalogo_promos') || '[]');
      if (Array.isArray(localPromos) && localPromos.length > 0) {
        const catalogoIdLowerLocal = catalogoId.toLowerCase();
        const catalogoRutaLowerLocal = catalogoRuta.toLowerCase().replace('/', '');
        const promosLocales = localPromos.filter(promo => {
          const activo = promo.activo || promo.activa;
          if (!activo && activo !== true) return false;
          const catalogos = (promo.catalogos || '').toString().split(',').map(c => c.trim().toLowerCase());
          return catalogos.includes(catalogoIdLowerLocal) || catalogos.includes(catalogoRutaLowerLocal);
        });
        if (promosLocales.length > 0) {
          return promosLocales;
        }
      }
    } catch (localError) {
      console.warn('Error leyendo promos desde localStorage:', localError);
    }
    
    return [];
  } catch (error) {
    console.warn(`Error obteniendo promos para catálogo ${catalogoRuta}:`, error);
    
    // Fallback a localStorage
    try {
      const localPromos = JSON.parse(localStorage.getItem('catalogo_promos') || '[]');
      const catalogoId = catalogoRuta.replace('/', '') || 'home';
      
      const promosLocales = localPromos.filter(promo => {
        const activo = promo.activo || promo.activa;
        if (!activo && activo !== true) return false;
        const catalogos = (promo.catalogos || '').toString().split(',').map(c => c.trim().toLowerCase());
        const catalogoIdLowerLocal = catalogoId.toLowerCase();
        const catalogoRutaLowerLocal = catalogoRuta.toLowerCase().replace('/', '');
        return catalogos.includes(catalogoIdLowerLocal) || catalogos.includes(catalogoRutaLowerLocal);
      });
      
      return promosLocales;
    } catch (localError) {
      console.error('Error al leer promos desde localStorage:', localError);
      return [];
    }
  }
};

/**
 * Obtener todos los logos de bancos para un catálogo
 * Convierte formato Google Sheets (bancos como string separado por comas) a objetos
 * Optimizado para performance con cache y llamadas paralelas
 * @param {string} catalogoRuta - Ruta del catálogo
 * @returns {Promise<Array>} Array de objetos con { id, nombre, logo_url }
 */
export const getBankLogosForCatalogo = async (catalogoRuta) => {
  try {
    console.log(`[Promos] Cargando logos para catálogo: ${catalogoRuta}`);
    
    // 1. Obtener promos activas para este catálogo
    const promos = await getPromosByCatalogo(catalogoRuta);
    
    if (!promos || promos.length === 0) {
      console.log(`[Promos] No hay promos activas para ${catalogoRuta}`);
      return [];
    }
    
    console.log(`[Promos] Encontradas ${promos.length} promos para ${catalogoRuta}`);
    
    // 2. Cargar todos los bancos una sola vez (con cache)
    const allBancos = await getAllBancos();
    
    if (!allBancos || allBancos.length === 0) {
      console.warn(`[Promos] No se pudieron cargar bancos desde la API`);
      return [];
    }
    
    // 3. Procesar promos y obtener bancos (sin llamadas async dentro del loop)
    const bancosSet = new Set(); // Para evitar duplicados
    const bancosResult = [];
    
    for (const promo of promos) {
      let bancosIds = [];
      
      // Formato antiguo: promo.bancos es un array de objetos
      if (Array.isArray(promo.bancos)) {
        // Ya viene como objetos, agregarlos directamente
        promo.bancos.forEach(banco => {
          const bancoId = banco.id || banco.nombre || banco.banco;
          if (bancoId && !bancosSet.has(bancoId)) {
            bancosSet.add(bancoId);
            bancosResult.push({
              id: banco.id || banco.codigo || bancoId,
              nombre: banco.nombre || banco.banco || bancoId,
              logo_url: banco.logo_url || banco.logoUrl || null,
            });
          }
        });
      }
      // Formato Google Sheets: promo.bancos es string separado por comas
      else if (typeof promo.bancos === 'string' && promo.bancos.trim()) {
        bancosIds = promo.bancos.split(',').map(b => b.trim()).filter(Boolean);
      }
      // Formato alternativo: banco único
      else if (promo.banco) {
        bancosIds = [promo.banco.toString().trim()];
      }
      
      // Procesar IDs de bancos (sincrónico, ya tenemos todos los bancos en memoria)
      for (const bancoId of bancosIds) {
        if (!bancoId || bancosSet.has(bancoId)) continue;
        
        bancosSet.add(bancoId);
        const bancoData = getBankLogo(bancoId, allBancos);
        
        if (bancoData) {
          bancosResult.push(bancoData);
        } else {
          // Fallback: crear objeto básico si no se encuentra en la API
          console.warn(`[Promos] Banco ${bancoId} no encontrado en API, usando fallback`);
          bancosResult.push({
            id: bancoId,
            nombre: bancoId,
            logo_url: null, // Se intentará resolver con fallback en BankLogosRow
          });
        }
      }
    }
    
    // 4. Eliminar duplicados finales (por si acaso)
    const bancosUnicos = bancosResult.filter((banco, index, self) => {
      const bancoKey = (banco.id || banco.nombre || '').toString().toLowerCase();
      return index === self.findIndex(b => 
        (b.id || b.nombre || '').toString().toLowerCase() === bancoKey
      );
    });
    
    console.log(`[Promos] Retornando ${bancosUnicos.length} bancos únicos para ${catalogoRuta}`);
    
    return bancosUnicos;
  } catch (error) {
    console.error(`[Promos] Error obteniendo logos para ${catalogoRuta}:`, error);
    return [];
  }
};
