import React, { useState, useEffect } from 'react';
import {
  Snackbar,
  Alert,
  Button,
  Box,
  Typography,
  IconButton
} from '@mui/material';
import {
  GetApp as InstallIcon,
  Close as CloseIcon,
  PhoneAndroid as PhoneIcon
} from '@mui/icons-material';

const PWAInstallToast = () => {
  const [showInstallToast, setShowInstallToast] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar si ya está instalado
    const checkIfInstalled = () => {
      // Verificar si está en modo standalone (PWA instalada)
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return;
      }
      
      // Verificar si está en modo standalone en iOS
      if (window.navigator.standalone === true) {
        setIsInstalled(true);
        return;
      }
      
      // Verificar si ya se mostró el toast en esta sesión
      const toastShown = sessionStorage.getItem('pwa-toast-shown');
      if (toastShown) {
        return;
      }
      
      setIsInstalled(false);
    };

    // Escuchar el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Mostrar toast después de 3 segundos
      setTimeout(() => {
        if (!isInstalled) {
          setShowInstallToast(true);
          sessionStorage.setItem('pwa-toast-shown', 'true');
        }
      }, 3000);
    };

    // Escuchar cuando se instala la PWA
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallToast(false);
      setDeferredPrompt(null);
    };

    // Verificar estado inicial
    checkIfInstalled();

    // Agregar event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Para dispositivos iOS que no soportan beforeinstallprompt
    if (!window.matchMedia('(display-mode: standalone)').matches && 
        window.navigator.standalone !== true) {
      setTimeout(() => {
        if (!isInstalled && !sessionStorage.getItem('pwa-toast-shown')) {
          setShowInstallToast(true);
          sessionStorage.setItem('pwa-toast-shown', 'true');
        }
      }, 5000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Mostrar el prompt de instalación
      deferredPrompt.prompt();
      
      // Esperar a que el usuario responda
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('Usuario aceptó instalar la PWA');
      } else {
        console.log('Usuario rechazó instalar la PWA');
      }
      
      setDeferredPrompt(null);
      setShowInstallToast(false);
    } else {
      // Para iOS o navegadores que no soportan beforeinstallprompt
      // Mostrar instrucciones
      alert('Para instalar esta app:\n\n' +
            'En Chrome: Toca el menú (⋮) y selecciona "Instalar app"\n' +
            'En Safari: Toca el botón Compartir (□↗) y selecciona "Agregar a pantalla de inicio"');
      setShowInstallToast(false);
    }
  };

  const handleClose = () => {
    setShowInstallToast(false);
  };

  if (isInstalled || !showInstallToast) {
    return null;
  }

  return (
    <Snackbar
      open={showInstallToast}
      autoHideDuration={null} // No auto-hide para que el usuario pueda decidir
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{
        '& .MuiSnackbarContent-root': {
          minWidth: { xs: '90vw', sm: '400px' },
          maxWidth: { xs: '90vw', sm: '500px' }
        }
      }}
    >
      <Alert
        severity="info"
        variant="filled"
        onClose={handleClose}
        sx={{
          width: '100%',
          borderRadius: 3,
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              color="inherit"
              size="small"
              onClick={handleInstall}
              startIcon={<InstallIcon />}
              sx={{
                color: 'white',
                fontWeight: 'bold',
                textTransform: 'none',
                fontSize: '0.9rem',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Instalar
            </Button>
            <IconButton
              size="small"
              onClick={handleClose}
              sx={{ color: 'white' }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        }
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PhoneIcon sx={{ fontSize: 20 }} />
          <Box>
            <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>
              📱 Instala nuestra app
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Acceso rápido desde tu pantalla de inicio
            </Typography>
          </Box>
        </Box>
      </Alert>
    </Snackbar>
  );
};

export default PWAInstallToast;
