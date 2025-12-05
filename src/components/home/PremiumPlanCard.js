/**
 * Premium Plan Card - Card moderna estilo 2025
 * Diseño tipo SaaS premium, inspirado en cards modernas de catálogos
 */

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Fade,
  Chip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { redirectToCheckout } from '../../services/mercadopagoSubscriptionService';

const PremiumPlanCard = () => {
  const [loading, setLoading] = useState(false);
  const username = localStorage.getItem('registeredUsername') || localStorage.getItem('activeSession') || '';
  const email = localStorage.getItem('userEmail') || '';

  const handleSubscribe = () => {
    setLoading(true);
    const backUrl = `${window.location.origin}/suscripcion/confirmacion`;
    redirectToCheckout(username, email, backUrl);
  };

  const benefits = [
    'Acceso ilimitado a todos los catálogos',
    'Buscador inteligente con IA',
    'Ideas de venta y textos generados',
    'Herramientas exclusivas para emprendedoras',
    'Actualizaciones automáticas',
    'Soporte personalizado',
  ];

  return (
    <Fade in timeout={800}>
      <Card
        sx={{
          width: '100%',
          borderRadius: { xs: 3, sm: 4 },
          overflow: 'hidden',
          background: '#FFFFFF',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: '1px solid rgba(0,0,0,0.06)',
          position: 'relative',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08)',
            transform: 'translateY(-4px)',
          },
        }}
      >
        {/* Icono premium superior */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            pt: 4,
            pb: 2,
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
            }}
          >
            <StarIcon sx={{ fontSize: 48, color: 'white' }} />
          </Box>
        </Box>

        <CardContent sx={{ px: { xs: 3, sm: 4 }, pb: 4 }}>
          {/* Título */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              textAlign: 'center',
              mb: 1,
              fontSize: { xs: '1.75rem', sm: '2rem' },
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Plan Emprendedoras Premium
          </Typography>

          {/* Banner 60 días gratis */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <Chip
              label="¡60 días GRATIS de prueba!"
              sx={{
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                color: 'white',
                fontWeight: 600,
                fontSize: { xs: '0.875rem', sm: '1rem' },
                py: 2.5,
                px: 1,
                '& .MuiChip-label': {
                  px: 2,
                },
              }}
            />
          </Box>

          {/* Precio destacado */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '2.5rem', sm: '3.5rem' },
                mb: 0.5,
                color: '#1a1a1a',
              }}
            >
              $10.000
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#666',
                fontSize: { xs: '1rem', sm: '1.125rem' },
                fontWeight: 500,
              }}
            >
              / mes
            </Typography>
          </Box>

          {/* Lista de beneficios */}
          <List sx={{ mb: 4 }}>
            {benefits.map((benefit, index) => (
              <ListItem
                key={index}
                sx={{
                  px: 0,
                  py: 1.5,
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <CheckCircleIcon
                    sx={{
                      color: '#43e97b',
                      fontSize: { xs: 24, sm: 28 },
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={benefit}
                  primaryTypographyProps={{
                    sx: {
                      fontSize: { xs: '0.9375rem', sm: '1rem' },
                      fontWeight: 500,
                      color: '#333',
                    },
                  }}
                />
              </ListItem>
            ))}
          </List>

          {/* Botón CTA Premium */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleSubscribe}
            disabled={loading || !username}
            sx={{
              py: { xs: 2, sm: 2.5 },
              borderRadius: { xs: 2, sm: 3 },
              fontSize: { xs: '1rem', sm: '1.125rem' },
              fontWeight: 600,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)',
              textTransform: 'none',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                boxShadow: '0 6px 24px rgba(102, 126, 234, 0.5)',
                transform: 'translateY(-2px)',
              },
              '&:disabled': {
                background: '#e0e0e0',
                color: '#999',
              },
            }}
          >
            {loading ? 'Redirigiendo...' : 'Probar gratis 60 días'}
          </Button>

          {/* Texto informativo */}
          <Typography
            variant="body2"
            sx={{
              textAlign: 'center',
              mt: 2,
              color: '#999',
              fontSize: { xs: '0.8125rem', sm: '0.875rem' },
            }}
          >
            Pago seguro con Mercado Pago • Cancelá cuando quieras
          </Typography>
        </CardContent>
      </Card>
    </Fade>
  );
};

export default PremiumPlanCard;

