import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

/**
 * Mensaje elegante cuando la API está tardando más de lo habitual.
 * Se muestra solo después de un pequeño delay para no molestar en cargas normales.
 */
const LoadingFallbackCatalog = ({ delayMs = 3000 }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  if (!visible) return null;

  return (
    <Box sx={{ textAlign: 'center', py: 4, px: 2 }}>
      <CircularProgress size={28} sx={{ mb: 2 }} />
      <Typography variant="body1" sx={{ fontWeight: 500 }}>
        El catálogo está tardando más de lo habitual en cargar… reconectando.
      </Typography>
    </Box>
  );
};

export default LoadingFallbackCatalog;


