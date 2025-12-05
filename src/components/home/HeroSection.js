/**
 * Hero Section - Bienvenida personalizada moderna
 * Diseño tipo dashboard SaaS con animaciones sutiles
 */

import React from 'react';
import { Box, Typography, Fade } from '@mui/material';
import { useAuth } from '../../AuthContext';

const HeroSection = ({ username, timeOfDay, isFirstVisit }) => {
  const greeting = isFirstVisit 
    ? "¡Bienvenida a tu espacio emprendedor!" 
    : `¡Hola de nuevo, ${username || 'emprendedora'}! ¿Lista para vender más hoy?`;

  return (
    <Fade in timeout={800}>
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: { xs: 0, sm: 4 },
          p: { xs: 4, sm: 6 },
          mb: 4,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
              mb: 1,
              lineHeight: 1.2,
            }}
          >
            {greeting}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '1rem', sm: '1.125rem' },
              opacity: 0.95,
              mt: 2,
            }}
          >
            {timeOfDay} • Tu catálogo siempre actualizado
          </Typography>
        </Box>
      </Box>
    </Fade>
  );
};

export default HeroSection;

