import React from 'react';
import { Box, useMediaQuery } from '@mui/material';
import { IS_CHRISTMAS_MODE } from '../../config/christmasConfig';
import santaImage from '../../assets/navidad-mobile.jpg';

/**
 * Overlay visual con un trineo navideño recorriendo la parte superior del viewport.
 *
 * Nota: La especificación original menciona Lottie; para mantener el bundle liviano
 * usamos una animación CSS suave con una imagen existente. Puede reemplazarse por
 * una animación Lottie en el futuro sin cambiar la API del componente.
 */
const SantaSleighOverlay = () => {
  const isMobile = useMediaQuery('(max-width:600px)');

  if (!IS_CHRISTMAS_MODE) return null;

  const santaWidth = isMobile ? 140 : 220;
  const santaTop = isMobile ? 8 : 16;
  const animationDuration = isMobile ? '26s' : '22s';

  return (
    <Box
      sx={{
        position: 'fixed',
        top: santaTop,
        left: 0,
        width: '100%',
        pointerEvents: 'none',
        zIndex: 1300,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: santaWidth,
          height: santaWidth * 0.45,
          '@keyframes santaRide': {
            '0%': { transform: 'translateX(-120%) translateY(0)' },
            '50%': { transform: 'translateX(10%) translateY(-6px)' },
            '100%': { transform: 'translateX(120%) translateY(0)' },
          },
          animation: `santaRide ${animationDuration} linear infinite`,
        }}
      >
        <Box
          component="img"
          src={santaImage}
          alt="Trineo de Navidad"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.35))',
          }}
        />
      </Box>
    </Box>
  );
};

export default SantaSleighOverlay;


