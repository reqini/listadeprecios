/**
 * Featured Search Bar - Barra de búsqueda destacada para Home
 * Más grande y llamativa que la del Navbar
 */

import React, { useState } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  useTheme,
  Fade,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';

const FeaturedSearchBar = ({
  value = '',
  onChange,
  placeholder = 'Buscar productos, recetas, ideas o inspiración…',
  onClear,
  sx = {},
}) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (event) => {
    const newValue = event.target.value;
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleClear = () => {
    if (onChange) {
      onChange('');
    }
    if (onClear) {
      onClear();
    }
  };

  return (
    <Fade in timeout={600}>
      <Box
        sx={{
          width: '100%',
          mb: 4,
          ...sx,
        }}
      >
        <TextField
          fullWidth
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          variant="outlined"
          autoComplete="off"
          inputProps={{
            autoCapitalize: 'off',
            autoCorrect: 'off',
            spellCheck: 'false',
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon
                  sx={{
                    color: isFocused ? theme.palette.primary.main : '#717171',
                    fontSize: { xs: '1.5rem', sm: '1.75rem' },
                    transition: 'color 0.3s ease',
                  }}
                />
              </InputAdornment>
            ),
            endAdornment: value && (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleClear}
                  size="small"
                  aria-label="Limpiar búsqueda"
                  sx={{
                    color: '#999',
                    '&:hover': {
                      color: theme.palette.error.main,
                    },
                  }}
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
            sx: {
              backgroundColor: 'white',
              borderRadius: 3,
              fontSize: { xs: '1rem', sm: '1.125rem' },
              height: { xs: 56, sm: 64 },
              boxShadow: isFocused
                ? `0 8px 24px ${theme.palette.primary.main}25`
                : '0 4px 16px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: `0 6px 20px ${theme.palette.primary.main}20`,
              },
              '& fieldset': {
                borderColor: isFocused
                  ? theme.palette.primary.main
                  : 'transparent',
                borderWidth: isFocused ? '2px' : '1px',
              },
            },
          }}
        />
      </Box>
    </Fade>
  );
};

export default FeaturedSearchBar;

