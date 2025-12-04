import React from 'react';
import {
  IconButton,
  Tooltip,
  Box,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  ViewColumn as ViewColumnIcon,
  ViewList as ViewListIcon,
  ViewComfy as ViewComfyIcon,
} from '@mui/icons-material';

/**
 * Componente para alternar entre 1 y 2 columnas en mobile
 * UX mejorada:
 * - 2 columnas es el modo principal (estado \"activo\")
 * - Íconos claros: lista (1 col) vs grilla (2 col)
 * - Botón tipo pill con fondo y borde diferenciados
 */
const ColumnLayoutToggle = ({ 
  mobileColumns, 
  onToggle, 
  variant = 'icons', // 'icons' o 'toggle'
  size = 'medium',
  sx = {}
}) => {
  // Variante por defecto: pill compacto con 1 col vs 2 col
  return (
    <Box sx={{ display: 'inline-flex', ...sx }}>
      <ToggleButtonGroup
        value={mobileColumns}
        exclusive
        onChange={(e, newValue) => {
          if (newValue !== null && newValue !== mobileColumns) {
            onToggle();
          }
        }}
        size={size}
        sx={{
          borderRadius: 999,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          '& .MuiToggleButton-root': {
            border: 'none',
            px: size === 'small' ? 1 : 1.5,
            minWidth: size === 'small' ? 38 : 46,
          },
        }}
      >
        <ToggleButton
          value={1}
          aria-label="Ver en 1 columna"
          selected={mobileColumns === 1}
          sx={{
            bgcolor: mobileColumns === 1 ? 'action.selected' : 'transparent',
          }}
        >
          <Tooltip title="Ver en 1 columna">
            <ViewListIcon sx={{ fontSize: size === 'small' ? 18 : 20 }} />
          </Tooltip>
        </ToggleButton>
        <ToggleButton
          value={2}
          aria-label="Ver en 2 columnas"
          selected={mobileColumns === 2}
          sx={{
            bgcolor: mobileColumns === 2 ? 'primary.main' : 'transparent',
            color: mobileColumns === 2 ? 'primary.contrastText' : 'inherit',
          }}
        >
          <Tooltip title="Ver en 2 columnas (recomendado)">
            <ViewComfyIcon sx={{ fontSize: size === 'small' ? 18 : 20 }} />
          </Tooltip>
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

export default ColumnLayoutToggle;

