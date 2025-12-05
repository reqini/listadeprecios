/**
 * AI Daily Tip - Recomendación del día con IA
 * Componente minimalista y no invasivo
 */

import React from 'react';
import { Box, Typography, Paper, Fade } from '@mui/material';
import { Lightbulb as LightbulbIcon } from '@mui/icons-material';

const tips = [
  'Tip del día: publicá tus productos con una receta simple para aumentar ventas un 20%.',
  'Idea: compartí antes y después de una preparación para mostrar resultados.',
  'Consejo: usá hashtags locales para llegar a clientes cercanos.',
  'Estrategia: mostrá el producto en uso real, no solo la foto del catálogo.',
  'Truco: respondé rápido los mensajes, eso genera confianza.',
];

const AIDailyTip = () => {
  // Seleccionar tip basado en el día del año para consistencia
  const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const tip = tips[dayOfYear % tips.length];

  return (
    <Fade in timeout={1000}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Box
            sx={{
              minWidth: 48,
              height: 48,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            <LightbulbIcon />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 500,
                fontSize: { xs: '0.9375rem', sm: '1rem' },
                lineHeight: 1.6,
              }}
            >
              {tip}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Fade>
  );
};

export default AIDailyTip;

