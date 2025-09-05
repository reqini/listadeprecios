import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Lock as LockIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Upgrade as UpgradeIcon,
  Person as PersonIcon,
  Star as StarIcon
} from '@mui/icons-material';

const FreePlanWelcome = ({ onUpgrade }) => {
  const freePlanFeatures = [
    'Acceso al perfil de usuario',
    'Cambio de contraseña',
    'Soporte básico por email'
  ];

  const premiumPlanFeatures = [
    'Acceso completo al panel principal',
    'Todos los catálogos de productos',
    'Generación de placas con IA',
    'Gestión de clientes',
    'Panel de ventas',
    'Capacitaciones gratuitas',
    'Preguntas frecuentes',
    'Soporte prioritario por WhatsApp'
  ];

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ 
          fontWeight: 800,
          background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 2
        }}>
          ¡Bienvenido a tu Perfil!
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          Estás usando el Plan Gratuito. Accede a todas las funcionalidades con el Plan Premium.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Plan Actual - Gratuito */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            height: '100%',
            border: '2px solid',
            borderColor: 'warning.main',
            bgcolor: 'rgba(255, 193, 7, 0.05)'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <PersonIcon sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
                <Typography variant="h5" fontWeight="bold" color="warning.dark">
                  Plan Gratuito
                </Typography>
                <Typography variant="h4" color="warning.dark" fontWeight="bold">
                  $0
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  por mes
                </Typography>
              </Box>

              <Typography variant="h6" gutterBottom>
                Incluye:
              </Typography>
              
              <List dense>
                {freePlanFeatures.map((feature, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText primary={feature} />
                  </ListItem>
                ))}
              </List>

              <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(255, 193, 7, 0.1)', borderRadius: 2 }}>
                <Typography variant="body2" color="warning.dark" fontWeight="bold">
                  🔒 Funcionalidades limitadas
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Solo acceso al perfil de usuario
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Plan Premium */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            height: '100%',
            border: '2px solid',
            borderColor: 'primary.main',
            bgcolor: 'rgba(102, 126, 234, 0.05)',
            position: 'relative',
            overflow: 'visible'
          }}>
            {/* Badge "Recomendado" */}
            <Box sx={{
              position: 'absolute',
              top: -12,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1
            }}>
              <Chip
                label="Recomendado"
                color="primary"
                icon={<StarIcon />}
                sx={{ fontWeight: 'bold' }}
              />
            </Box>

            <CardContent sx={{ p: 4, pt: 5 }}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <UpgradeIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" fontWeight="bold" color="primary.main">
                  Plan Premium
                </Typography>
                <Typography variant="h4" color="primary.main" fontWeight="bold">
                  $2.990
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  por mes
                </Typography>
              </Box>

              <Typography variant="h6" gutterBottom>
                Incluye todo lo anterior, más:
              </Typography>
              
              <List dense>
                {premiumPlanFeatures.map((feature, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText primary={feature} />
                  </ListItem>
                ))}
              </List>

              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                startIcon={<UpgradeIcon />}
                onClick={onUpgrade}
                sx={{ 
                  mt: 3,
                  borderRadius: 3,
                  py: 1.5,
                  fontWeight: 'bold',
                  boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
                  '&:hover': {
                    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)'
                  }
                }}
              >
                Actualizar a Premium
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Información adicional */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          💡 ¿Necesitas ayuda? Contacta a nuestro soporte: +54 9 11 51347453
        </Typography>
      </Box>
    </Box>
  );
};

export default FreePlanWelcome;
