import React from "react";
import { Box, Typography, Button } from "@mui/material";

/**
 * Estado vacío genérico: título + subtítulo opcional + ícono opcional +
 * acción opcional. Generaliza el bloque que se agregó a mano en los
 * catálogos (ej. "Por ahora no hay productos en N cuotas sin interés").
 */
const EmptyState = ({ icon, title, subtitle, actionLabel, onAction, sx }) => (
  <Box sx={{ textAlign: "center", py: 8, px: 2, ...sx }}>
    {icon && <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>{icon}</Box>}
    <Typography variant="h6" gutterBottom>
      {title}
    </Typography>
    {subtitle && (
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    )}
    {actionLabel && onAction && (
      <Button variant="contained" onClick={onAction} sx={{ mt: 3 }}>
        {actionLabel}
      </Button>
    )}
  </Box>
);

export default EmptyState;
