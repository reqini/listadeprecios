// API para obtener promociones por banco desde backend/Google Sheets
import axios from './axios';

/**
 * Obtener promociones activas por banco
 * @returns {Promise<Array>} Array de promociones activas
 */
export const getBankPromos = async () => {
  try {
    const response = await axios.get('/api/bancos-promos');
    return response.data || [];
  } catch (error) {
    console.error('Error obteniendo promociones de bancos:', error);
    // Fallback: retornar array vacío
    return [];
  }
};

/**
 * Obtener promoción activa para un banco específico
 * @param {string|number} bancoId - ID o código del banco
 * @returns {Promise<Object|null>} Promoción activa o null
 */
export const getActivePromoByBank = async (bancoId) => {
  try {
    const promos = await getBankPromos();
    return promos.find(promo => 
      promo.activa === 'si' || promo.activa === true
    ) || null;
  } catch (error) {
    console.error('Error obteniendo promo por banco:', error);
    return null;
  }
};

/**
 * Obtener logo del banco desde URL o assets
 * @param {string} bancoNombre - Nombre del banco
 * @param {string} logoUrl - URL del logo (opcional)
 * @returns {string} URL o path del logo
 */
export const getBankLogo = (bancoNombre, logoUrl) => {
  if (logoUrl) {
    return logoUrl;
  }
  
  // Mapeo de nombres de bancos a logos locales
  const bankLogoMap = {
    'BANCO DE LA NACION ARGENTINA': '/logos-bancos/nacion.png',
    'BANCO DE GALICIA': '/logos-bancos/galicia.png',
    'BANCO SANTANDER': '/logos-bancos/santander.png',
    'BANCO BBVA': '/logos-bancos/bbva.png',
    'BANCO MACRO': '/logos-bancos/macro.png',
    'BANCO PATAGONIA': '/logos-bancos/patagonia.png',
    'NARANJA X': '/logos-bancos/naranja.png',
  };
  
  const normalizedName = bancoNombre.toUpperCase();
  const logoKey = Object.keys(bankLogoMap).find(key => 
    normalizedName.includes(key.replace('BANCO ', ''))
  );
  
  return logoKey ? bankLogoMap[logoKey] : '/logos-bancos/default-bank.png';
};

