import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Divider,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../AuthContext';
import { adminAPI } from '../utils/adminAPI';

const AdminPanel = () => {
  const { auth } = useAuth();
  const [costos, setCostos] = useState({
    costoEnvio: 21036,
    costoPlanCanje: 0
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Verificar que solo cocinaty pueda acceder
  useEffect(() => {
    if (auth?.username !== 'cocinaty') {
      window.location.href = '/login';
      return;
    }
  }, [auth]);

  // Cargar costos actuales
  useEffect(() => {
    const loadCostos = async () => {
      try {
        setLoading(true);
        const response = await adminAPI.getCostos();
        if (response.success) {
          setCostos(response.data);
        }
      } catch (error) {
        console.error('Error al cargar costos:', error);
        // Usar valores por defecto si falla la API
        setCostos({
          costoEnvio: 21036,
          costoPlanCanje: 0
        });
      } finally {
        setLoading(false);
      }
    };

    if (auth?.username === 'cocinaty') {
      loadCostos();
    }
  }, [auth]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await adminAPI.updateCostos(costos);
      
      if (response.success) {
        setSnackbar({
          open: true,
          message: 'Costos actualizados correctamente',
          severity: 'success'
        });
        
        // Actualizar localStorage para que se refleje inmediatamente
        localStorage.setItem('costoEnvio', costos.costoEnvio.toString());
        localStorage.setItem('costoPlanCanje', costos.costoPlanCanje.toString());
        
        // Disparar evento personalizado para notificar a otros componentes
        window.dispatchEvent(new CustomEvent('costosUpdated', { 
          detail: costos 
        }));
      } else {
        throw new Error(response.message || 'Error al actualizar costos');
      }
    } catch (error) {
      console.error('Error al guardar costos:', error);
      setSnackbar({
        open: true,
        message: 'Error al actualizar costos. Intenta nuevamente.',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field) => (event) => {
    const value = parseFloat(event.target.value) || 0;
    setCostos(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (auth?.username !== 'cocinaty') {
    return null; // No mostrar nada si no es cocinaty
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center" color="primary">
          🔧 Panel de Administración
        </Typography>
        
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Usuario: <strong>{auth?.username}</strong>
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              💰 Gestión de Costos
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Costo de Envío"
                type="number"
                value={costos.costoEnvio}
                onChange={handleChange('costoEnvio')}
                fullWidth
                variant="outlined"
                helperText="Costo que se suma a productos de Bazar y Repuestos"
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                }}
              />

              <TextField
                label="Costo de Plan Canje"
                type="number"
                value={costos.costoPlanCanje}
                onChange={handleChange('costoPlanCanje')}
                fullWidth
                variant="outlined"
                helperText="Costo adicional para el plan de canje"
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                }}
              />
            </Box>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleSave}
                disabled={saving}
                sx={{ minWidth: 200 }}
              >
                {saving ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Guardando...
                  </>
                ) : (
                  '💾 Guardar Cambios'
                )}
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>ℹ️ Información:</strong> Los cambios se aplicarán inmediatamente en toda la aplicación.
            Los usuarios verán los nuevos costos sin necesidad de recargar la página.
          </Typography>
        </Alert>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminPanel;
