// API para manejo de usuarios/emprendedoras con sistema de slug
import axios from './axios';

/**
 * Obtener usuario por slug
 * @param {string} slug - Identificador único del usuario (ej: "cocinaty")
 * @returns {Promise<Object>} Datos del usuario con cuotas y productos de entrega inmediata
 */
export const getUserBySlug = async (slug) => {
  try {
    // Intentar obtener desde API backend
    const response = await axios.get(`/api/user/by-slug/${slug}`);
    
    if (response.data && response.data.success) {
      return {
        success: true,
        data: response.data.data
      };
    } else {
      return {
        success: false,
        message: response.data.message || 'Usuario no encontrado'
      };
    }
  } catch (error) {
    console.error('Error al obtener usuario por slug:', error);
    
    // Fallback: Intentar desde usuarios generales
    try {
      const usuariosResponse = await axios.get('/api/user/all');
      const usuarios = usuariosResponse.data || [];
      const usuario = usuarios.find(u => 
        u.slug === slug || 
        u.username === slug ||
        u.identificador_unico === slug
      );
      
      if (usuario) {
        // Formatear datos para compatibilidad
        return {
          success: true,
          data: {
            id: usuario.id || usuario._id,
            username: usuario.username,
            nombre: usuario.nombre || usuario.username,
            slug: usuario.slug || usuario.username,
            cuotas: usuario.cuotas || ["3", "6", "12", "18"],
            entregaInmediata: usuario.entregaInmediata || usuario.entrega_inmediata || [],
            activo: usuario.activo !== false,
            ...usuario
          }
        };
      }
    } catch (fallbackError) {
      console.error('Error en fallback de usuarios:', fallbackError);
    }
    
    return {
      success: false,
      message: 'Usuario no encontrado'
    };
  }
};

/**
 * Obtener todos los usuarios
 * @returns {Promise<Array>} Lista de usuarios
 */
export const getAllUsers = async () => {
  try {
    const response = await axios.get('/api/user/all');
    return response.data || [];
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return [];
  }
};

/**
 * Validar si un slug existe
 * @param {string} slug - Slug a validar
 * @returns {Promise<boolean>} True si existe
 */
export const validateSlug = async (slug) => {
  const result = await getUserBySlug(slug);
  return result.success && result.data;
};

/**
 * Obtener productos de entrega inmediata para un usuario
 * @param {string} slug - Slug del usuario
 * @returns {Promise<Array>} Lista de productos
 */
export const getProductosEntregaInmediata = async (slug) => {
  try {
    const userResult = await getUserBySlug(slug);
    
    if (!userResult.success || !userResult.data) {
      return [];
    }
    
    const usuario = userResult.data;
    const productosIds = usuario.entregaInmediata || [];
    
    if (productosIds.length === 0) {
      return [];
    }
    
    // Obtener todos los productos
    const productosResponse = await axios.get('/api/productos');
    const todosProductos = productosResponse.data || [];
    
    // Filtrar productos de entrega inmediata
    return todosProductos.filter(producto => {
      // Por IDs configurados
      if (productosIds.includes(producto.id) || 
          productosIds.includes(producto.codigo) ||
          productosIds.includes(producto._id)) {
        return true;
      }
      
      // Por flags de entrega inmediata
      return (
        producto.entrega_ya === "si" ||
        producto.entrega_ya === "Sí" ||
        producto.entrega_ya === true ||
        producto.entrega_inmediata === "si" ||
        producto.entrega_inmediata === "Sí" ||
        producto.entrega_inmediata === true ||
        producto.envio_inmediato === "si" ||
        producto.envio_inmediato === "Sí"
      );
    });
  } catch (error) {
    console.error('Error al obtener productos de entrega inmediata:', error);
    return [];
  }
};

