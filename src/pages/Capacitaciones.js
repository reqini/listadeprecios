import React from 'react';
import { Box } from '@mui/material';
import CapacitacionesSection from '../components/CapacitacionesSection';
import Navbar from '../components/Navbar';

const Capacitaciones = () => {
  return (
    <>
      <Navbar
        title="Capacitaciones Gratuitas"
        onLogout={() => {
          localStorage.removeItem('token');
          localStorage.removeItem('activeSession');
          window.location.href = '/login';
        }}
        user={{ username: localStorage.getItem("activeSession") || "" }}
      />
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8f9ff 0%, #e8f0ff 100%)',
        pt: 2
      }}>
        <CapacitacionesSection />
      </Box>
    </>
  );
};

export default Capacitaciones;
