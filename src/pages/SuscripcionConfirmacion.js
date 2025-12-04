import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { getSubscriptionStatus } from '../services/mercadopagoSubscriptionService';
import axios from '../utils/axios';

const SuscripcionConfirmacion = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // Si no hay token, puede que el usuario haya venido desde Mercado Pago
        // Esperar un momento y reintentar
        setTimeout(() => {
          const retryToken = localStorage.getItem('token');
          if (retryToken) {
            fetchSubscription(retryToken);
          } else {
            setLoading(false);
            setError('No se encontró sesión activa. Por favor, iniciá sesión.');
          }
        }, 2000);
        return;
      }

      await fetchSubscription(token);
    } catch (err) {
      console.error('Error al verificar suscripción:', err);
      setLoading(false);
      setError('Error al verificar el estado de tu suscripción. Intentá nuevamente en unos segundos.');
    }
  };

  const fetchSubscription = async (token) => {
    try {
      const result = await getSubscriptionStatus(token);
      
      if (result.success) {
        setSubscription(result.data);
        setLoading(false);
      } else {
        // Si aún no se procesó el webhook, mostrar estado intermedio
        const preapprovalId = searchParams.get('preapproval_id');
        const status = searchParams.get('status');
        
        if (preapprovalId && status === 'authorized') {
          setLoading(false);
          setError(null);
          // Mostrar mensaje de espera
          setSubscription({
            status: 'pending',
            message: 'Estamos confirmando tu pago, actualizá en unos segundos.',
          });
          
          // Reintentar en 5 segundos
          setTimeout(checkSubscriptionStatus, 5000);
        } else {
          setError(result.error || 'No se pudo obtener el estado de tu suscripción.');
          setLoading(false);
        }
      }
    } catch (err) {
      console.error('Error al obtener suscripción:', err);
      setLoading(false);
      setError('Error al obtener el estado de tu suscripción.');
    }
  };

  const handleCopyAccessCode = () => {
    if (subscription?.access_code) {
      navigator.clipboard.writeText(subscription.access_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGoToHome = () => {
    navigate('/home');
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="h6">Verificando tu suscripción...</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Esto puede tardar unos segundos
          </Typography>
        </Paper>
      </Container>
    );
  }

  if (error && !subscription) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button
            fullWidth
            variant="contained"
            onClick={checkSubscriptionStatus}
            sx={{ mb: 2 }}
          >
            Reintentar
          </Button>
          <Button fullWidth variant="outlined" onClick={() => navigate('/login')}>
            Ir al Login
          </Button>
        </Paper>
      </Container>
    );
  }

  if (subscription?.status === 'pending') {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 2 }}>
            {subscription.message || 'Estamos confirmando tu pago...'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Este proceso puede tardar unos segundos. La página se actualizará automáticamente.
          </Typography>
        </Paper>
      </Container>
    );
  }

  if (subscription?.subscription_status === 'active') {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom fontWeight="bold">
              ¡Bienvenido/a! 🎉
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Tu suscripción mensual fue activada correctamente
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {subscription.access_code && (
            <Card sx={{ mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Tu código de acceso único:
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mt: 2,
                    p: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 1,
                  }}
                >
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    sx={{ fontFamily: 'monospace', letterSpacing: 2 }}
                  >
                    {subscription.access_code}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ContentCopyIcon />}
                    onClick={handleCopyAccessCode}
                    sx={{
                      color: 'white',
                      borderColor: 'white',
                      '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                    }}
                  >
                    {copied ? 'Copiado!' : 'Copiar'}
                  </Button>
                </Box>
                <Typography variant="body2" sx={{ mt: 2, opacity: 0.9 }}>
                  ⚠️ Guardá este código en un lugar seguro. Lo vas a necesitar para soporte.
                </Typography>
              </CardContent>
            </Card>
          )}

          <Alert severity="success" sx={{ mb: 3 }}>
            Ya podés usar todas las funcionalidades de la app con tu suscripción activa.
          </Alert>

          {/* Guardar estado de suscripción en localStorage */}
          {(() => {
            localStorage.setItem('subscriptionStatus', 'active');
            if (subscription.access_code) {
              localStorage.setItem('accessCode', subscription.access_code);
            }
            return null;
          })()}

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={() => navigate('/onboarding')}
            sx={{ mt: 2 }}
          >
            Comenzar recorrido
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Tu suscripción aún no está activa. Por favor, esperá unos segundos o contactá soporte.
        </Alert>
        <Button fullWidth variant="contained" onClick={checkSubscriptionStatus} sx={{ mb: 2 }}>
          Reintentar
        </Button>
        <Button fullWidth variant="outlined" onClick={() => navigate('/login')}>
          Ir al Login
        </Button>
      </Paper>
    </Container>
  );
};

export default SuscripcionConfirmacion;

