import React, { useMemo } from 'react';
import { Box, useMediaQuery } from '@mui/material';
import { IS_CHRISTMAS_MODE } from '../../config/christmasConfig';

/**
 * Efecto de nieve global muy liviano para catálogos.
 * - Máximo 20 copos
 * - Animación lenta y suave
 * - No distrae ni baja FPS
 * - Nunca tapa textos o botones
 */
const Snowfall = ({ intensity = 0.5 }) => {
  const isMobile = useMediaQuery('(max-width:600px)');
  
  // Máximo 20 copos, ajustado por intensidad
  const flakeCount = Math.max(8, Math.floor((isMobile ? 12 : 20) * intensity));

  const flakes = useMemo(
    () =>
      Array.from({ length: flakeCount }).map((_, index) => ({
        id: index,
        left: Math.random() * 100,
        duration: 15 + Math.random() * 15, // Animación más lenta
        delay: Math.random() * -20,
        size: isMobile ? 2 + Math.random() * 2 : 3 + Math.random() * 3,
        opacity: 0.3 + Math.random() * 0.3, // Más sutil
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [flakeCount, isMobile, intensity]
  );

  if (!IS_CHRISTMAS_MODE) return null;

  // Detección simple de dispositivos que prefieren menos animación
  if (typeof window !== 'undefined') {
    const prefersReduced = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      return null;
    }
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1, // Muy bajo, nunca tapa contenido
        overflow: 'hidden',
        '@keyframes snowFall': {
          '0%': { transform: 'translateY(-20px) translateX(0)' },
          '50%': { transform: 'translateY(50vh) translateX(10px)' },
          '100%': { transform: 'translateY(100vh) translateX(-10px)' },
        },
      }}
    >
      {flakes.map((flake) => (
        <Box
          key={flake.id}
          sx={{
            position: 'absolute',
            top: 0,
            left: `${flake.left}%`,
            width: flake.size,
            height: flake.size,
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            opacity: flake.opacity,
            filter: 'blur(0.5px)',
            animation: `snowFall ${flake.duration}s linear infinite`,
            animationDelay: `${flake.delay}s`,
          }}
        />
      ))}
    </Box>
  );
};

export default Snowfall;

