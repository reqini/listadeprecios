/**
 * Página wrapper para el buscador unificado
 */

import React from 'react';
import Navbar from '../components/Navbar';
import UnifiedSearch from '../components/UnifiedSearch';
import { useAuth } from '../AuthContext';
import Container from '@mui/material/Container';

const UnifiedSearchPage = () => {
  const { logout } = useAuth();

  return (
    <>
      <Navbar
        title="🔍 Buscador Inteligente"
        onLogout={logout}
      />
      <Container maxWidth={false} sx={{ p: 0, height: 'calc(100vh - 64px)' }}>
        <UnifiedSearch fullScreen={false} />
      </Container>
    </>
  );
};

export default UnifiedSearchPage;

