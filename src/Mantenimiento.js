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
        Lamentamos informarte que la app dejará de funcionar.
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
      Solo seguirán disponibles los catálogos, que continúan siendo gratuitos.

La decisión de cerrar la herramienta fue tomada por el desarrollador. Sin embargo, gracias a una líder empática y comprometida con este negocio, los catálogos seguirán disponibles para que nuevas emprendedoras puedan descubrir que vender puede ser simple y práctico.

@cocinatyy - Emprendedora Oficial Essen
      </Typography>
    </Container>
  );
};

export default MaintenancePage;
