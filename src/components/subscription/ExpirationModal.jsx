import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  Divider,
  CircularProgress,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import PaymentIcon from '@mui/icons-material/Payment';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { checkSubscriptionExpiration } from '../../services/subscriptionCheckService';
import { redirectToCheckout, SUBSCRIPTION_CONFIG } from '../../services/mercadopagoSubscriptionService';
import { cancelSubscription, deleteAccount } from '../../utils/subscriptionAPI';
import { useAuth } from '../../AuthContext';

const ExpirationModal = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [subscriptionState, setSubscriptionState] = useState({
    status: null,
    daysRemaining: null,
  });
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    checkExpiration();
    
    // Verificar cada vez que cambia el status en localStorage
    const interval = setInterval(() => {
      checkExpiration();
    }, 60000); // Cada minuto

    return () => clearInterval(interval);
  }, []);

  const checkExpiration = async () => {
    const result = await checkSubscriptionExpiration();
    setSubscriptionState(result);
    
    if (result.shouldShowModal) {
      setOpen(true);
    }
  };

  const handleRenovar = () => {
    setActionLoading('renovar');
    const username = localStorage.getItem('activeSession') || '';
    const email = localStorage.getItem('userEmail') || '';
    const backUrl = `${window.location.origin}/suscripcion/confirmacion`;
    
    redirectToCheckout(username, email, backUrl);
  };

  const handleCancelar = async () => {
    if (!window.confirm('¿Estás seguro de que querés cancelar tu suscripción? Perderás el acceso a todas las funcionalidades.')) {
      return;
    }

    setActionLoading('cancelar');
    
    try {
      const token = localStorage.getItem('token');
      const result = await cancelSubscription(token);

      if (result.success) {
        // Desloggear y redirigir
        logout();
        localStorage.setItem('subscriptionStatus', 'canceled');
        navigate('/suscripcion/activar');
      } else {
        alert(result.error || 'Error al cancelar la suscripción. Intentá nuevamente.');
        setActionLoading(null);
      }
    } catch (error) {
      console.error('Error al cancelar suscripción:', error);
      alert('Error al cancelar la suscripción. Intentá nuevamente.');
      setActionLoading(null);
    }
  };

  const handleEliminarCuenta = async () => {
    const confirmMessage = '¿Estás SEGURO de que querés eliminar tu cuenta? Esta acción NO se puede deshacer. Se eliminarán todos tus datos y tu suscripción.';
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    const doubleConfirm = window.prompt('Escribí "ELIMINAR" para confirmar:');
    if (doubleConfirm !== 'ELIMINAR') {
      return;
    }

    setActionLoading('eliminar');
    
    try {
      const token = localStorage.getItem('token');
      const result = await deleteAccount(token);

      if (result.success) {
        // Limpiar todo y redirigir
        logout();
        localStorage.clear();
        navigate('/');
        alert('Tu cuenta ha sido eliminada definitivamente.');
      } else {
        alert(result.error || 'Error al eliminar la cuenta. Intentá nuevamente.');
        setActionLoading(null);
      }
    } catch (error) {
      console.error('Error al eliminar cuenta:', error);
      alert('Error al eliminar la cuenta. Intentá nuevamente.');
      setActionLoading(null);
    }
  };

  const handleCerrar = () => {
    // Solo permitir cerrar si no está vencida
    if (subscriptionState.status !== 'expired') {
      setOpen(false);
    }
  };

  const isExpired = subscriptionState.status === 'expired';
  const isExpiringSoon = subscriptionState.status === 'expiring_soon';

  if (!open || (!isExpired && !isExpiringSoon)) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={handleCerrar}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={isExpired}
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isExpired ? (
            <ErrorIcon sx={{ fontSize: 32, color: 'error.main' }} />
          ) : (
            <WarningIcon sx={{ fontSize: 32, color: 'warning.main' }} />
          )}
          <Typography variant="h5" fontWeight="bold">
            {isExpired ? '❌ Tu suscripción expiró' : '⏳ Tu suscripción vence pronto'}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert
          severity={isExpired ? 'error' : 'warning'}
          sx={{ mb: 3 }}
        >
          {isExpired ? (
            <Typography>
              Para seguir usando la app, necesitás renovarla.
            </Typography>
          ) : (
            <Typography>
              Faltan {subscriptionState.daysRemaining} {subscriptionState.daysRemaining === 1 ? 'día' : 'días'} para renovar tu suscripción.
              Si no la renovás, vas a perder el acceso a todas las herramientas.
            </Typography>
          )}
        </Alert>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          ¿Qué querés hacer?
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            startIcon={actionLoading === 'renovar' ? <CircularProgress size={20} /> : <PaymentIcon />}
            onClick={handleRenovar}
            disabled={!!actionLoading}
            sx={{ py: 1.5 }}
          >
            Renovar suscripción (${SUBSCRIPTION_CONFIG.AMOUNT.toLocaleString('es-AR')}/mes)
          </Button>

          {!isExpired && (
            <Button
              variant="outlined"
              fullWidth
              onClick={handleCerrar}
              disabled={!!actionLoading}
            >
              Seguir usando
            </Button>
          )}

          <Button
            variant="outlined"
            color="warning"
            fullWidth
            startIcon={actionLoading === 'cancelar' ? <CircularProgress size={20} /> : <CancelIcon />}
            onClick={handleCancelar}
            disabled={!!actionLoading}
          >
            Cancelar suscripción
          </Button>

          <Button
            variant="outlined"
            color="error"
            fullWidth
            startIcon={actionLoading === 'eliminar' ? <CircularProgress size={20} /> : <DeleteForeverIcon />}
            onClick={handleEliminarCuenta}
            disabled={!!actionLoading}
          >
            Eliminar cuenta
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ExpirationModal;

