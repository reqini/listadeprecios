import React, { useRef, useState, useEffect } from 'react';
import { TextField, Box, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { styled } from '@mui/material/styles';
import { useLocation } from 'react-router-dom';
import { isCatalogRoute } from '../utils/isCatalogRoute';

/**
 * Buscador sticky que se comporta diferente según la ruta:
 * - En catálogos: siempre fixed
 * - En Home: siempre fixed (header relative)
 * - En otras secciones: relative inicialmente, fixed al hacer scroll
 */
const StickySearchBarWithScroll = ({ value, onChange, placeholder = "Buscar Producto" }) => {
  const location = useLocation();
  const searchBarRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const isCatalog = isCatalogRoute(location.pathname);

  // En catálogos: siempre fixed
  // En Home: relative inicialmente, fixed al hacer scroll (para no tapar el header)
  // En otras secciones: fixed al hacer scroll
  useEffect(() => {
    if (isCatalog) {
      setIsScrolled(true); // Siempre fixed en catálogos
      return;
    }

    // En Home y otras secciones: activar fixed solo al hacer scroll
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 100); // Cambiar a fixed después de 100px de scroll
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Verificar estado inicial

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isCatalog]);

  const StickyContainer = styled(Box)(({ theme, isfixed, iscatalog }) => {
    const shouldBeFixed = isfixed || iscatalog;
    return {
      position: shouldBeFixed ? 'fixed' : 'relative',
      top: shouldBeFixed ? 0 : 'auto',
      left: 0,
      right: 0,
      zIndex: shouldBeFixed ? 999 : 'auto', // Debajo del carrito (1000) pero sobre otros elementos
      padding: theme.spacing(1.5, 2),
      backgroundColor: '#fff',
      boxShadow: shouldBeFixed ? '0 4px 10px rgba(0,0,0,0.08)' : 'none',
      borderBottom: shouldBeFixed ? '1px solid rgba(0,0,0,0.06)' : 'none',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    };
  });

  const SearchWrapper = styled(Box)(({ theme }) => ({
    maxWidth: '800px',
    width: '100%',
    margin: '0 auto',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  }));

  return (
    <>
      {/* Spacer solo cuando está fixed */}
      {(isScrolled || isCatalog) && (
        <Box
          sx={{
            height: { xs: '80px', sm: '80px' },
          }}
        />
      )}
      
      <StickyContainer 
        ref={searchBarRef} 
        isfixed={isScrolled}
        iscatalog={isCatalog}
      >
        <SearchWrapper>
              <TextField
                fullWidth
                value={value}
                onChange={onChange}
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

export default StickySearchBarWithScroll;

