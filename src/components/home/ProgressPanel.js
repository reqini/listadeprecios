/**
 * Progress Panel - Panel de beneficios y progreso
 * Muestra estado de suscripción y beneficios de forma sutil
 */

import React from 'react';
import { Box, Typography, Paper, Chip, Fade, Grid } from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';

const ProgressPanel = ({ subscriptionStatus }) => {
  if (!subscriptionStatus || subscriptionStatus === 'none') {
    return null;
  }

  const isActive = subscriptionStatus === 'active';
  const isExpiring = subscriptionStatus === 'expiring_soon';

  if (!isActive && !isExpiring) {
    return null;
  }

  const benefits = [
    'Acceso a todos los catálogos',
    'Buscador inteligente con IA',
    'Herramientas de venta',
    'Soporte prioritario',
  ];

  return (
    <Fade in timeout={1000}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          background: isExpiring
            ? 'linear-gradient(135deg, #fee14015 0%, #fa709a15 100%)'
            : 'linear-gradient(135deg, #43e97b15 0%, #38f9d715 100%)',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontSize: { xs: '1.125rem', sm: '1.25rem' },
            }}
          >
            Tus Beneficios
          </Typography>
          <Chip
            icon={<CheckCircleIcon />}
            label={isExpiring ? 'Por vencer' : 'Activo'}
            color={isExpiring ? 'warning' : 'success'}
            size="small"
          />
        </Box>
        <Grid container spacing={2}>
          {benefits.map((benefit, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon sx={{ fontSize: 20, color: 'success.main' }} />
                <Typography variant="body2">{benefit}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
        {isExpiring && (
          <Box sx={{ mt: 3, p: 2, background: 'rgba(255, 193, 7, 0.1)', borderRadius: 2 }}>
            <Typography variant="body2" color="warning.main" sx={{ fontWeight: 500 }}>
              Tu suscripción vence pronto. Renová para seguir disfrutando de todos los beneficios.
            </Typography>
          </Box>
        )}
      </Paper>
    </Fade>
  );
};

export default ProgressPanel;

