import React, { useState, useEffect, useRef } from 'react';
import { TextField, Box, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { styled } from '@mui/material/styles';

/**
 * Buscador sticky estilo Airbnb - SIEMPRE FIXED Y VISIBLE
 * Diseño moderno y elegante, siempre visible en la parte superior
 */
const StickySearchBar = ({ value, onChange, placeholder = "Buscar Producto" }) => {
  const searchBarRef = useRef(null);

  const StickyContainer = styled(Box)(({ theme }) => ({
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999, // Menor que el carrito (1000) pero mayor que otros elementos
    padding: theme.spacing(1.5, 2),
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 2px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
    borderBottom: '1px solid rgba(0,0,0,0.06)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  }));

  const SearchWrapper = styled(Box)(({ theme }) => ({
    maxWidth: '800px',
    width: '100%',
    margin: '0 auto',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  }));

  return (
    <>
      {/* Spacer para que el contenido no quede debajo del buscador fixed */}
      <Box
        sx={{
          height: { xs: '88px', sm: '88px' }, // Altura del buscador fixed
        }}
      />
      
      <StickyContainer ref={searchBarRef}>
        <SearchWrapper>
          <TextField
            fullWidth
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon 
                    sx={{ 
                      color: '#717171',
                      fontSize: { xs: '1.25rem', sm: '1.5rem' },
                    }} 
                  />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: '#f7f7f7',
                height: { xs: '48px', sm: '56px' },
                fontSize: { xs: '0.9375rem', sm: '1rem' },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: '#f0f0f0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                },
                '&.Mui-focused': {
                  backgroundColor: 'white',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  '& fieldset': {
                    borderColor: '#222222',
                    borderWidth: '2px',
                  },
                },
                '& fieldset': {
                  borderColor: 'rgba(0,0,0,0.12)',
                  borderWidth: '1px',
                },
              },
              '& .MuiInputBase-input': {
                padding: { xs: '12px 14px', sm: '14px 16px' },
                '&::placeholder': {
                  color: '#717171',
                  opacity: 1,
                  fontSize: { xs: '0.9375rem', sm: '1rem' },
                },
              },
            }}
          />
        </SearchWrapper>
      </StickyContainer>
    </>
  );
};

export default StickySearchBar;

