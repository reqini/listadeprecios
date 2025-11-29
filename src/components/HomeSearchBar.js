import React, { useState } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';

/**
 * Buscador sólido y funcional para Home
 * Mobile-first con diseño limpio y filtrado en tiempo real
 */
const HomeSearchBar = ({
  value = '',
  onChange,
  placeholder = 'Buscar productos por nombre, categoría o banco...',
  onClear,
  sx = {},
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (event) => {
    const newValue = event.target.value;
    if (onChange) {
      // Pasar el valor directamente para filtrado en tiempo real
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
    <Box
      sx={{
        width: '100%',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: 'white',
        boxShadow: isFocused
          ? `0 4px 12px ${theme.palette.primary.main}20`
          : '0 2px 8px rgba(0,0,0,0.08)',
        transition: 'all 0.3s ease',
        borderBottom: `1px solid ${isFocused ? theme.palette.primary.main : '#e0e0e0'}`,
        paddingX: { xs: 2, sm: 3 },
        paddingY: { xs: 1.5, sm: 2 },
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
          'data-testid': 'home-search-input',
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon
                sx={{
                  color: isFocused ? theme.palette.primary.main : '#717171',
                  fontSize: { xs: '1.25rem', sm: '1.5rem' },
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
                    backgroundColor: `${theme.palette.error.main}10`,
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
          sx: {
            backgroundColor: '#f8f9fa',
            borderRadius: { xs: 1, sm: 1.5 },
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: '#f0f1f2',
            },
            '&.Mui-focused': {
              backgroundColor: 'white',
            },
            '& fieldset': {
              borderColor: isFocused
                ? `${theme.palette.primary.main}60`
                : '#e0e0e0',
              borderWidth: isFocused ? '2px' : '1px',
            },
          },
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            fontSize: { xs: '0.95rem', sm: '1rem' },
            paddingLeft: { xs: 1, sm: 1.5 },
          },
        }}
      />
    </Box>
  );
};

export default HomeSearchBar;

