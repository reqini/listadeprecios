import React, { useMemo } from 'react';
import { Box, useMediaQuery } from '@mui/material';
import { IS_CHRISTMAS_MODE } from '../../config/christmasConfig';

/**
 * Capa muy liviana de copos de nieve sobre el header.
 * - Máximo ~40 copos en desktop, menos en mobile.
 * - Respeta prefers-reduced-motion para no afectar dispositivos de bajo rendimiento.
 */
const SnowfallHeader = () => {
  const isMobile = useMediaQuery('(max-width:600px)');

  if (!IS_CHRISTMAS_MODE) return null;

  // Detección simple de dispositivos que prefieren menos animación
  if (typeof window !== 'undefined') {
    const prefersReduced = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      return null;
    }
  }

  const flakeCount = isMobile ? 18 : 32;

  const flakes = useMemo(
    () =>
      Array.from({ length: flakeCount }).map((_, index) => ({
        id: index,
        left: Math.random() * 100,
        duration: 10 + Math.random() * 10,
        delay: Math.random() * -15,
        size: isMobile ? 3 + Math.random() * 3 : 4 + Math.random() * 4,
        opacity: 0.4 + Math.random() * 0.4,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [flakeCount, isMobile]
  );

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: 96,
        pointerEvents: 'none',
        zIndex: 1200,
        overflow: 'hidden',
        '@keyframes snowFall': {
          '0%': { transform: 'translateY(-20px)' },
          '100%': { transform: 'translateY(120px)' },
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
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            opacity: flake.opacity,
            filter: 'blur(0.3px)',
            animation: `snowFall ${flake.duration}s linear infinite`,
            animationDelay: `${flake.delay}s`,
          }}
        />
      ))}
    </Box>
  );
};

export default SnowfallHeader;


