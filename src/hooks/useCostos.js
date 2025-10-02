import { useState, useEffect } from 'react';
import { adminAPI } from '../utils/adminAPI';

export const useCostos = () => {
  const [costos, setCostos] = useState({
    costoEnvio: 21036,
    costoPlanCanje: 0
  });
  const [loading, setLoading] = useState(true);

  // Cargar costos iniciales
  useEffect(() => {
    const loadCostos = async () => {
      try {
        setLoading(true);
        const response = await adminAPI.getCostos();
        if (response.success) {
          setCostos(response.data);
          // Actualizar localStorage
          localStorage.setItem('costoEnvio', response.data.costoEnvio.toString());
          localStorage.setItem('costoPlanCanje', response.data.costoPlanCanje.toString());
        }
      } catch (error) {
        console.error('Error al cargar costos:', error);
        // Usar valores de localStorage como fallback
        const envio = localStorage.getItem('costoEnvio');
        const canje = localStorage.getItem('costoPlanCanje');
        if (envio || canje) {
          setCostos({
            costoEnvio: envio ? parseFloat(envio) : 21036,
            costoPlanCanje: canje ? parseFloat(canje) : 0
          });
        }
      } finally {
        setLoading(false);
      }
    };

    loadCostos();
  }, []);

  // Escuchar cambios de costos en tiempo real
  useEffect(() => {
    const handleCostosUpdate = (event) => {
      setCostos(event.detail);
    };

    window.addEventListener('costosUpdated', handleCostosUpdate);
    return () => window.removeEventListener('costosUpdated', handleCostosUpdate);
  }, []);

  return { costos, loading };
};
