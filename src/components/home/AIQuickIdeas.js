/**
 * AI Quick Ideas - 3 bullets de ideas rápidas que cambian
 * Integración natural de IA, no invasiva
 */

import React from 'react';
import { Box, Typography, Paper, Fade } from '@mui/material';
import { AutoAwesome as AutoAwesomeIcon } from '@mui/icons-material';

const ideasSets = [
  {
    items: [
      'Idea de reel para hoy: mostrá cómo se limpia fácil tu producto estrella.',
      'Texto para vender sin agresividad: "¿Sabías que podés cocinar sin aceite? Te cuento cómo."',
      'Cómo presentar un producto premium: enfocáte en el ahorro de tiempo, no solo en el precio.',
    ],
  },
  {
    items: [
      'Idea de reel para hoy: antes y después de usar el producto en una receta.',
      'Texto para vender sin agresividad: "Este producto cambió mi forma de cocinar. ¿Querés que te muestre?"',
      'Cómo presentar un producto premium: destacá la durabilidad y garantía de por vida.',
    ],
  },
  {
    items: [
      'Idea de reel para hoy: mini tutorial de 30 segundos con tu producto más vendido.',
      'Texto para vender sin agresividad: "Probá este producto sin compromiso. Si no te encanta, te devuelvo el dinero."',
      'Cómo presentar un producto premium: compará el precio con comer afuera todos los días.',
    ],
  },
];

const AIQuickIdeas = () => {
  // Seleccionar set basado en el día de la semana para consistencia
  const dayOfWeek = new Date().getDay();
  const ideas = ideasSets[dayOfWeek % ideasSets.length];

  return (
    <Fade in timeout={1200}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          background: 'linear-gradient(135deg, #f093fb15 0%, #4facfe15 100%)',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <AutoAwesomeIcon sx={{ color: 'primary.main', fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1.125rem', sm: '1.25rem' } }}>
            Ideas Rápidas de IA
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {ideas.items.map((idea, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  minWidth: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f093fb 0%, #4facfe 100%)',
                  mt: 1,
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                  lineHeight: 1.6,
                  color: 'text.primary',
                }}
              >
                {idea}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>
    </Fade>
  );
};

export default AIQuickIdeas;

