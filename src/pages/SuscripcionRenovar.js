import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { redirectToCheckout, SUBSCRIPTION_CONFIG } from '../services/mercadopagoSubscriptionService';

const SuscripcionRenovar = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const username = localStorage.getItem('activeSession') || '';
  const email = localStorage.getItem('userEmail') || '';

  const handleRenovar = () => {
    setLoading(true);
    const backUrl = `${window.location.origin}/suscripcion/confirmacion`;
    redirectToCheckout(username, email, backUrl);
  };

  const features = [
    'Acceso completo a todos los catálogos',
    'Listas de precios actualizadas',
    'Todas las funcionalidades de la app',
    'Soporte prioritario',
  ];

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <WarningIcon sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Suscripción vencida o inactiva
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Para seguir usando la app, activá tu suscripción mensual
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Alert severity="warning" sx={{ mb: 3 }}>
          Tu suscripción está vencida o cancelada. Para acceder a todas las funcionalidades, necesitás renovar tu suscripción.
        </Alert>

        <Card sx={{ mb: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          <CardContent>
            <Typography variant="h5" gutterBottom fontWeight="bold" align="center">
              Suscripción Mensual
            </Typography>
            <Typography variant="h3" align="center" fontWeight="bold" sx={{ my: 2 }}>
              ${SUBSCRIPTION_CONFIG.AMOUNT.toLocaleString('es-AR')}
            </Typography>
            <Typography variant="body2" align="center" sx={{ opacity: 0.9 }}>
              Por mes
            </Typography>
          </CardContent>
        </Card>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Lo que incluye:
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
          onClick={handleRenovar}
          disabled={loading}
          sx={{ mt: 2, py: 1.5, fontSize: '1.1rem' }}
        >
          {loading ? 'Procesando...' : 'Renovar suscripción mensual'}
        </Button>

        <Button
          fullWidth
          variant="outlined"
          onClick={() => navigate('/login')}
          sx={{ mt: 2 }}
        >
          Volver al Login
        </Button>
      </Paper>
    </Container>
  );
};

export default SuscripcionRenovar;

