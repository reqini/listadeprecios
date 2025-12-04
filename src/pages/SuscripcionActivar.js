import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PaymentIcon from '@mui/icons-material/Payment';
import SecurityIcon from '@mui/icons-material/Security';
import { redirectToCheckout, SUBSCRIPTION_CONFIG } from '../services/mercadopagoSubscriptionService';

const SuscripcionActivar = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const username = localStorage.getItem('registeredUsername') || localStorage.getItem('activeSession') || '';
  const email = localStorage.getItem('userEmail') || '';

  useEffect(() => {
    // Si no hay usuario registrado, redirigir al registro
    if (!username) {
      navigate('/registro');
    }
  }, [username, navigate]);

  const handleActivar = () => {
    setLoading(true);
    const backUrl = `${window.location.origin}/suscripcion/confirmacion`;
    redirectToCheckout(username, email, backUrl);
  };

  const features = [
    'Acceso completo a todos los catálogos',
    'Listas de precios actualizadas en tiempo real',
    'Búsqueda avanzada de productos',
    'Ver promociones y ofertas especiales',
    'Agregar productos al carrito',
    'Compartir por WhatsApp',
    'Soporte prioritario',
    'Todas las funcionalidades de la app',
  ];

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <PaymentIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Activá tu suscripción mensual para acceder a la app
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            Para usar todas las funcionalidades, necesitás activar tu suscripción mensual
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="body2">
            <strong>Importante:</strong> La suscripción es mensual y se renovará automáticamente. Podés cancelarla en cualquier momento desde Mercado Pago.
          </Typography>
        </Alert>

        <Card sx={{ mb: 4, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          <CardContent>
            <Typography variant="h5" gutterBottom fontWeight="bold" align="center">
              Suscripción Mensual
            </Typography>
            <Typography variant="h3" align="center" fontWeight="bold" sx={{ my: 2 }}>
              ${SUBSCRIPTION_CONFIG.AMOUNT.toLocaleString('es-AR')}
            </Typography>
            <Typography variant="body2" align="center" sx={{ opacity: 0.9 }}>
              Por mes - Renovación automática
            </Typography>
          </CardContent>
        </Card>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Lo que incluye tu suscripción:
          </Typography>
          <List>
            {features.map((feature, index) => (
              <ListItem key={index} sx={{ px: 0 }}>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText primary={feature} />
              </ListItem>
            ))}
          </List>
        </Box>

        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleActivar}
          disabled={loading || !username}
          sx={{ 
            mt: 2, 
            py: 2, 
            fontSize: '1.2rem',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Redirigiendo a Mercado Pago...' : 'Suscribirme por $10.000 / mes'}
        </Button>

        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3 }}>
          Al hacer clic, serás redirigido a Mercado Pago para completar el pago de forma segura
        </Typography>
      </Paper>
    </Container>
  );
};

export default SuscripcionActivar;

