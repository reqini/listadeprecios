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
 * Opción 1: Iconos (ViewColumn y ViewComfy)
 * Opción 2: Switch/ToggleButton
 */
const ColumnLayoutToggle = ({ 
  mobileColumns, 
  onToggle, 
  variant = 'icons', // 'icons' o 'toggle'
  size = 'medium',
  sx = {}
}) => {
  if (variant === 'toggle') {
    return (
      <ToggleButtonGroup
        value={mobileColumns}
        exclusive
        onChange={(e, newValue) => {
          if (newValue !== null) {
            onToggle();
          }
        }}
        size={size}
        sx={{ 
          height: size === 'small' ? 32 : 40,
          ...sx 
        }}
      >
        <ToggleButton value={1} aria-label="1 columna">
          <ViewListIcon sx={{ fontSize: size === 'small' ? 18 : 20 }} />
        </ToggleButton>
        <ToggleButton value={2} aria-label="2 columnas">
          <ViewComfyIcon sx={{ fontSize: size === 'small' ? 18 : 20 }} />
        </ToggleButton>
      </ToggleButtonGroup>
    );
  }

  // Variante con iconos (default)
  return (
    <Box sx={{ display: 'flex', gap: 0.5, ...sx }}>
      <Tooltip title={mobileColumns === 1 ? 'Ver en 2 columnas' : 'Ver en 1 columna'}>
        <IconButton
          onClick={onToggle}
          size={size}
          color={mobileColumns === 1 ? 'default' : 'primary'}
          sx={{
            border: mobileColumns === 1 ? '1px solid' : '1px solid',
            borderColor: mobileColumns === 1 ? 'divider' : 'primary.main',
            bgcolor: mobileColumns === 1 ? 'transparent' : 'primary.light',
            '&:hover': {
              bgcolor: mobileColumns === 1 ? 'action.hover' : 'primary.main',
              borderColor: mobileColumns === 1 ? 'text.secondary' : 'primary.dark',
            },
          }}
        >
          {mobileColumns === 1 ? (
            <ViewColumnIcon sx={{ fontSize: size === 'small' ? 18 : 20 }} />
          ) : (
            <ViewComfyIcon sx={{ fontSize: size === 'small' ? 18 : 20 }} />
          )}
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default ColumnLayoutToggle;

