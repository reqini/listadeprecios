import React from "react";
import { Box, Alert, Typography, Button } from "@mui/material";

/**
 * Estado de error genérico con retry opcional. Para los catch que hoy
 * solo hacen console.error sin feedback visual para el usuario.
 */
const ErrorState = ({ title = "Ocurrió un error", message, onRetry, sx }) => (
  <Box sx={{ textAlign: "center", py: 6, px: 2, ...sx }}>
    <Alert severity="error" sx={{ mb: 2, textAlign: "left" }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {message && <Typography variant="body2">{message}</Typography>}
    </Alert>
    {onRetry && (
      <Button variant="contained" onClick={onRetry}>
        Reintentar
      </Button>
    )}
  </Box>
);

export default ErrorState;
