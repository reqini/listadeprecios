import { useState, useEffect } from 'react';

/**
 * Hook para debounce de valores
 * Útil para optimizar búsquedas y evitar re-renders innecesarios
 * @param {any} value - Valor a debounce
 * @param {number} delay - Delay en milisegundos (default: 300)
 * @returns {any} - Valor debounced
 */
export const useDebounce = (value, delay = 150) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set timeout para actualizar el valor después del delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: cancelar timeout si el valor cambia antes del delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

