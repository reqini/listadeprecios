import React, { useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
} from '@mui/material';
import AdminPromosBancos from '../components/AdminPromosBancos';
import Navbar from '../components/Navbar';
import { useAuth } from '../AuthContext';

const AdminPanel = () => {
  const { logout } = useAuth();
  const username = localStorage.getItem('activeSession');

  // Verificar que solo cocinaty pueda acceder
  useEffect(() => {
    if (username !== 'cocinaty') {
      window.location.href = '/home';
      return;
    }
  }, [username]);

  if (username !== 'cocinaty') {
    return null; // No mostrar nada si no es cocinaty
  }

  return (
    <>
      {/* Header visible en Admin */}
      <Navbar
        title="Panel de Administración"
        onLogout={logout}
        user={{ username: username || localStorage.getItem("activeSession") || "" }}
      />
      
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom align="center" color="primary">
            🔧 Panel de Administración
          </Typography>
          
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Usuario: <strong>{username || 'cocinaty'}</strong>
          </Typography>

          {/* Admin de Promos */}
          <Box sx={{ mt: 3 }}>
            <AdminPromosBancos />
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default AdminPanel;
