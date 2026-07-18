import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
} from '@mui/material';
import AdminPromosBancos from '../components/AdminPromosBancos';
import Navbar from '../components/Navbar';
import { useAdminAuth } from '../AdminAuthContext';

// El control de acceso real ya lo hace AdminRoute (App.js), leyendo el rol
// desde `profiles` vía Supabase + RLS. Este componente ya no re-implementa
// ese chequeo — solo consume la sesión para mostrar el email y desloguear.
const AdminPanel = () => {
  const { session, logoutAdmin } = useAdminAuth();
  const email = session?.user?.email ?? '';

  return (
    <>
      {/* Header visible en Admin */}
      <Navbar
        title="Panel de Administración"
        onLogout={logoutAdmin}
        user={{ username: email }}
      />

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom align="center" color="primary">
            🔧 Panel de Administración
          </Typography>

          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Usuario: <strong>{email}</strong>
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
