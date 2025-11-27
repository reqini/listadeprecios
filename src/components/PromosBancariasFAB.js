import React, { useState, useEffect } from 'react';
import { Fab, useMediaQuery, useTheme } from '@mui/material';
import { CreditCard as CreditCardIcon } from '@mui/icons-material';
import PromosBancariasModal from './PromosBancariasModal';
import { getBankLogosForCatalogo } from '../utils/catalogoPromosAPI';

/**
 * Botón flotante (FAB) para acceder a promociones bancarias
 * Se muestra solo si hay promos activas y si está habilitado desde el admin
 */
const PromosBancariasFAB = ({ catalogoRuta = '/home' }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(false);
  const [showFAB, setShowFAB] = useState(false);
  const [hasActivePromos, setHasActivePromos] = useState(false);
  const [fabEnabled, setFabEnabled] = useState(true); // Por defecto habilitado

  // Cargar configuración del admin (mostrar_boton_promos)
  useEffect(() => {
    const loadFabConfig = async () => {
      try {
        // Intentar cargar desde localStorage o API
        const config = localStorage.getItem('admin_config');
        if (config) {
          const parsed = JSON.parse(config);
          if (parsed.mostrar_boton_promos !== undefined) {
            setFabEnabled(parsed.mostrar_boton_promos);
          }
        }
        
        // También intentar desde API si existe
        try {
          const { default: axios } = await import('../utils/axios');
          const response = await axios.get('/api/admin/config');
          if (response.data && response.data.mostrar_boton_promos !== undefined) {
            setFabEnabled(response.data.mostrar_boton_promos);
          }
        } catch (apiError) {
          // Si no existe el endpoint, usar el valor por defecto
          console.warn('Endpoint de config no disponible, usando valor por defecto');
        }
      } catch (error) {
        console.error('Error cargando configuración del FAB:', error);
      }
    };

    loadFabConfig();
    
    // Escuchar cambios en la configuración
    const handleConfigUpdate = () => {
      loadFabConfig();
    };
    window.addEventListener('adminConfigUpdated', handleConfigUpdate);
    return () => window.removeEventListener('adminConfigUpdated', handleConfigUpdate);
  }, []);

  // Verificar si hay promos activas
  useEffect(() => {
    const checkActivePromos = async () => {
      try {
        const promos = await getBankLogosForCatalogo(catalogoRuta);
        const hasPromos = promos && promos.length > 0;
        setHasActivePromos(hasPromos);
        setShowFAB(fabEnabled && hasPromos);
      } catch (error) {
        console.error('Error verificando promos activas:', error);
        setHasActivePromos(false);
        setShowFAB(false);
      }
    };

    if (fabEnabled) {
      checkActivePromos();
      
      // Re-verificar periódicamente o cuando cambien las promos
      const interval = setInterval(checkActivePromos, 30000); // Cada 30 segundos
      const handlePromosUpdate = () => checkActivePromos();
      window.addEventListener('catalogoPromosUpdated', handlePromosUpdate);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('catalogoPromosUpdated', handlePromosUpdate);
      };
    } else {
      setShowFAB(false);
    }
  }, [fabEnabled, catalogoRuta]);

  // Ocultado completamente según solicitud
  return null;
};

export default PromosBancariasFAB;

