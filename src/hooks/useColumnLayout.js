import { useState } from 'react';

/**
 * Hook para manejar el layout de columnas en mobile
 * Guarda la preferencia en localStorage
 * @param {string} key - Clave única para identificar el catálogo (ej: 'catalogo12', 'home')
 * @param {boolean} defaultMobileColumns - Número de columnas por defecto en mobile (1 o 2)
 * @returns {Object} - { mobileColumns, toggleColumns, setMobileColumns }
 */
export const useColumnLayout = (key = 'default', defaultMobileColumns = 1) => {
  const storageKey = `columnLayout_${key}`;
  
  const [mobileColumns, setMobileColumnsState] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) {
        return parseInt(saved, 10) === 2 ? 2 : 1;
      }
    } catch (error) {
      console.warn('Error al leer preferencia de columnas:', error);
    }
    return defaultMobileColumns === 2 ? 2 : 1;
  });

  const setMobileColumns = (columns) => {
    try {
      setMobileColumnsState(columns);
      localStorage.setItem(storageKey, columns.toString());
    } catch (error) {
      console.warn('Error al guardar preferencia de columnas:', error);
    }
  };

  const toggleColumns = () => {
    setMobileColumns(mobileColumns === 1 ? 2 : 1);
  };

  return {
    mobileColumns,
    toggleColumns,
    setMobileColumns,
  };
};

