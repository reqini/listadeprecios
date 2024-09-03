import React from 'react';
import { Container, Typography } from '@mui/material';
const Image = require('./assets/mantenimiento.avif');

const MaintenancePage = () => {
  return (
    <Container
      sx={{
        height: '100vh',
        width:"100vw",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        backgroundColor: '#ffffff',
      }}
    >
      <img src={Image} alt="Estamos tranajando"  style={{maxWidth: 350, width: '100%'}}/>
      <Typography variant="h4" gutterBottom>
        Estamos actualizando los datos
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        Disculpa las molestias, estamos trabajando para mejorar tu experiencia. Por favor, vuelve más tarde.
      </Typography>
    </Container>
  );
};

export default MaintenancePage;
