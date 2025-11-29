import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Switch,
  FormControlLabel,
  Typography,
  Tooltip,
  Chip,
  useTheme,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Switch para habilitar/deshabilitar el carrusel de productos destacados
 * Solo visible para el usuario "cocinaty"
 * Timer de 1 hora desde la activación
 */
const CarouselSwitch = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  
  // CRÍTICO: Solo obtener username si existe y es cocinaty
  // El switch SOLO se muestra para cocinaty logueado
  // Las personas que reciben URLs compartidas NO deben ver el switch
  const activeSession = localStorage.getItem('activeSession') || '';
  const username = activeSession;
  
  // Verificar si el usuario es cocinaty (SOLO para mostrar el switch)
  // Debe estar logueado Y ser exactamente "cocinaty"
  const isCocinaty = Boolean(
    activeSession && 
    activeSession.trim() !== '' && 
    activeSession.toLowerCase() === 'cocinaty'
  );

  // Estados
  const [enabled, setEnabled] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  // Clave para localStorage
  const STORAGE_KEY = 'carousel_switch_cocinaty';
  const ONE_HOUR_MS = useMemo(() => 60 * 60 * 1000, []); // 1 hora en milisegundos

  // Cargar estado inicial desde localStorage
  useEffect(() => {
    if (!isCocinaty) return;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        const now = Date.now();
        const elapsed = now - data.timestamp;
        const remaining = ONE_HOUR_MS - elapsed;

        if (remaining > 0) {
          setEnabled(true);
          setTimeRemaining(remaining);
          setIsExpired(false);
        } else {
          // Expiró, limpiar
          localStorage.removeItem(STORAGE_KEY);
          setEnabled(false);
          setIsExpired(true);
          setTimeRemaining(0);
        }
      } catch (error) {
        console.error('Error al parsear estado del switch:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [isCocinaty, ONE_HOUR_MS]);

  // Actualizar tiempo restante cada segundo
  useEffect(() => {
    if (!enabled || !timeRemaining) return;

    const interval = setInterval(() => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          const now = Date.now();
          const elapsed = now - data.timestamp;
          const remaining = ONE_HOUR_MS - elapsed;

          if (remaining > 0) {
            setTimeRemaining(remaining);
            setIsExpired(false);
          } else {
            // Expiró
            localStorage.removeItem(STORAGE_KEY);
            setEnabled(false);
            setIsExpired(true);
            setTimeRemaining(0);
            // Actualizar URL para remover parámetro
            updateURL(false);
          }
        } catch (error) {
          console.error('Error al calcular tiempo restante:', error);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [enabled, timeRemaining, ONE_HOUR_MS, updateURL]);

  // Sincronizar con query param de la URL
  useEffect(() => {
    if (!isCocinaty) return;

    const searchParams = new URLSearchParams(location.search);
    const urlEnabled = searchParams.get('carousel') === 'enabled';

    if (urlEnabled && !enabled) {
      // Si viene en la URL pero no está habilitado, activar
      handleToggle(true, false); // false = no actualizar URL (ya está actualizada)
    } else if (!urlEnabled && enabled) {
      // Si no viene en la URL pero está habilitado, verificar estado real
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setEnabled(false);
      }
    }
  }, [location.search, isCocinaty, enabled]);

  // Función para actualizar la URL
  const updateURL = useCallback((isEnabled) => {
    // Si estamos en una ruta normal (/catalogo12), redirigir a /cocinaty/12
    // Si estamos en /cocinaty/12, mantener la URL
    const pathname = location.pathname;
    let newPath = pathname;
    
    // Detectar si estamos en ruta normal y convertir a /cocinaty/:numero
    const catalogoMatch = pathname.match(/\/catalogo(\d+)/);
    if (catalogoMatch && isEnabled) {
      const numero = catalogoMatch[1];
      newPath = `/cocinaty/${numero}`;
    } else if (pathname.startsWith('/cocinaty/')) {
      // Ya estamos en ruta cocinaty, mantener
      newPath = pathname;
    }
    
    // Agregar query param si está habilitado
    if (isEnabled) {
      const searchParams = new URLSearchParams(location.search);
      searchParams.set('carousel', 'enabled');
      const newSearch = searchParams.toString();
      newPath = newSearch ? `${newPath}?${newSearch}` : newPath;
    }

    navigate(newPath, { replace: true });
  }, [location.pathname, location.search, navigate]);

  // Manejar cambio del switch
  const handleToggle = useCallback((newValue, updateUrl = true) => {
    if (newValue) {
      // Activar: guardar timestamp
      const data = {
        enabled: true,
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setEnabled(true);
      setTimeRemaining(ONE_HOUR_MS);
      setIsExpired(false);
      
      if (updateUrl) {
        updateURL(true);
      }
    } else {
      // Desactivar: limpiar
      localStorage.removeItem(STORAGE_KEY);
      setEnabled(false);
      setTimeRemaining(null);
      setIsExpired(false);
      if (updateUrl) {
        updateURL(false);
      }
    }
  }, [ONE_HOUR_MS, updateURL]);

  // Formatear tiempo restante
  const formatTimeRemaining = (ms) => {
    if (!ms || ms <= 0) return '0:00';
    
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // CRÍTICO: El switch SOLO se muestra para el usuario logueado como "cocinaty"
  // Las personas que reciben la URL compartida NO deben ver el switch
  // Solo deben ver el carrusel si está habilitado por cocinaty
  if (!isCocinaty || !username) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        padding: { xs: 1, sm: 1.5 },
        backgroundColor: enabled 
          ? 'rgba(76, 175, 80, 0.1)' 
          : 'rgba(158, 158, 158, 0.1)',
        borderRadius: 2,
        border: `1px solid ${enabled ? theme.palette.success.main : theme.palette.grey[400]}`,
        marginBottom: 2,
        transition: 'all 0.3s ease',
      }}
    >
      <Tooltip
        title={
          enabled
            ? `Carrusel habilitado. Tiempo restante: ${formatTimeRemaining(timeRemaining)}`
            : 'Habilita el carrusel de productos destacados por 1 hora'
        }
        arrow
      >
        <FormControlLabel
          control={
            <Switch
              checked={enabled && !isExpired}
              onChange={(e) => handleToggle(e.target.checked)}
              color="success"
              disabled={isExpired && enabled}
            />
          }
          label={
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: enabled && !isExpired 
                  ? theme.palette.success.main 
                  : theme.palette.text.primary,
              }}
            >
              Carrusel Habilitado
            </Typography>
          }
        />
      </Tooltip>

      {enabled && timeRemaining && !isExpired && (
        <Chip
          label={`⏱️ ${formatTimeRemaining(timeRemaining)}`}
          size="small"
          color="success"
          sx={{
            fontWeight: 600,
            fontSize: '0.75rem',
          }}
        />
      )}

      {isExpired && enabled && (
        <Chip
          label="⏰ Expirado"
          size="small"
          color="error"
          sx={{
            fontWeight: 600,
            fontSize: '0.75rem',
          }}
        />
      )}
    </Box>
  );
};

export default CarouselSwitch;

