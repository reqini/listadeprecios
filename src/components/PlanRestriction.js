import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Lock as LockIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Upgrade as UpgradeIcon,
  Close as CloseDialogIcon
} from '@mui/icons-material';

const PlanRestriction = ({ 
  feature, 
  message, 
  onUpgrade, 
  showDialog = false, 
  onCloseDialog 
}) => {
  const [upgradeDialogOpen, setUpgradeDialogOpen] = React.useState(showDialog);

  const handleUpgrade = () => {
    setUpgradeDialogOpen(true);
  };

  const handleCloseUpgrade = () => {
    setUpgradeDialogOpen(false);
    if (onCloseDialog) onCloseDialog();
  };

  const handleConfirmUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    }
    setUpgradeDialogOpen(false);
  };

  const planFeatures = {
    limitado: [
      'Acceso solo a la página principal',
      'Recuperación de contraseña',
      'Información básica de productos',
      'Soporte por email'
    ],
    full: [
      'Acceso completo a todos los catálogos',
      'Generación de placas con IA',
      'Gestión ilimitada de clientes',
      'Estadísticas avanzadas y reportes',
      'Soporte prioritario por WhatsApp',
      'Templates premium y personalización',
      'Exportación de datos',
      'Integración con redes sociales'
    ]
  };

  const planLimitations = {
    limitado: [
      'Sin acceso a catálogos completos',
      'Sin generación de placas',
      'Sin gestión de clientes',
      'Sin estadísticas avanzadas'
    ]
  };

  return (
    <>
      <Card 
        sx={{ 
          maxWidth: 400, 
          mx: 'auto', 
          mt: 4,
          border: '2px dashed',
          borderColor: 'warning.main',
          bgcolor: 'rgba(255, 193, 7, 0.05)'
        }}
      >
        <CardContent sx={{ textAlign: 'center', p: 4 }}>
          <Box sx={{ mb: 2 }}>
            <LockIcon sx={{ fontSize: 48, color: 'warning.main' }} />
          </Box>
          
          <Typography variant="h6" gutterBottom fontWeight="bold" color="warning.dark">
            Funcionalidad Premium
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            {message || 'Esta funcionalidad está disponible solo en el Plan Full'}
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<UpgradeIcon />}
            onClick={handleUpgrade}
            sx={{ 
              borderRadius: 3,
              px: 4,
              py: 1.5,
              fontWeight: 'bold',
              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
              '&:hover': {
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)'
              }
            }}
          >
            Actualizar a Plan Full
          </Button>
        </CardContent>
      </Card>

      {/* Dialog de actualización */}
      <Dialog 
        open={upgradeDialogOpen} 
        onClose={handleCloseUpgrade}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">
              Actualizar a Plan Full
            </Typography>
            <IconButton onClick={handleCloseUpgrade}>
              <CloseDialogIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h4" color="primary.main" fontWeight="bold">
              $25.000
            </Typography>
            <Typography variant="body2" color="text.secondary">
              por mes
            </Typography>
          </Box>

          <Typography variant="h6" gutterBottom>
            Plan Full incluye:
          </Typography>
          
          <List dense>
            {planFeatures.full.map((feature, index) => (
              <ListItem key={index} sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CheckIcon color="success" />
                </ListItemIcon>
                <ListItemText primary={feature} />
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom color="error">
            Plan Limitado - Limitaciones:
          </Typography>
          
          <List dense>
            {planLimitations.limitado.map((limitation, index) => (
              <ListItem key={index} sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CloseIcon color="error" />
                </ListItemIcon>
                <ListItemText 
                  primary={limitation}
                  sx={{
                    '& .MuiListItemText-primary': {
                      color: 'text.secondary',
                      textDecoration: 'line-through'
                    }
                  }}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseUpgrade} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmUpgrade}
            variant="contained"
            color="primary"
            size="large"
            sx={{ 
              borderRadius: 3,
              px: 4,
              fontWeight: 'bold'
            }}
          >
            Suscribirse Ahora
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PlanRestriction;
