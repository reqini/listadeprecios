/**
 * Modern Footer - Footer minimalista y profesional
 * Links básicos, diseño limpio
 */

import React from 'react';
import { Box, Typography, Link, Container } from '@mui/material';

const ModernFooter = () => {
  return (
    <Box
      component="footer"
      sx={{
        mt: 8,
        pt: 4,
        pb: 4,
        borderTop: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.default',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Hecho para emprendedoras ❤️
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link
              href="https://www.instagram.com/cocinatyy"
              target="_blank"
              rel="noreferrer"
              underline="hover"
              sx={{ color: 'text.secondary', fontSize: '0.875rem' }}
            >
              @Cocinatyy
            </Link>
            <Link
              href="https://www.instagram.com/lrecchini/"
              target="_blank"
              rel="noreferrer"
              underline="hover"
              sx={{ color: 'text.secondary', fontSize: '0.875rem' }}
            >
              Luciano Recchini
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default ModernFooter;

