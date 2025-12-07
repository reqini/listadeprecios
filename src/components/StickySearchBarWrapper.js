/**
 * Wrapper para ModernSearchBar que se vuelve fixed al hacer scroll
 * Usado en todos los catálogos
 */
import React, { useState, useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import ModernSearchBar from './ModernSearchBar';

const StickySearchBarWrapper = ({ value, onChange, placeholder = "Buscar productos por nombre, categoría o banco..." }) => {
  const [isSearchSticky, setIsSearchSticky] = useState(false);
  const searchBarRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Hacer search bar sticky al hacer scroll
      if (searchBarRef.current) {
        const searchBarTop = searchBarRef.current.offsetTop;
        setIsSearchSticky(scrollTop > searchBarTop);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <Box
        ref={searchBarRef}
        sx={{
          position: isSearchSticky ? 'fixed' : 'relative',
          top: isSearchSticky ? 0 : 'auto',
          left: 0,
          right: 0,
          zIndex: isSearchSticky ? 1100 : 'auto',
          backgroundColor: isSearchSticky ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
          backdropFilter: isSearchSticky ? 'blur(10px)' : 'none',
          boxShadow: isSearchSticky ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
          transition: 'all 0.3s ease',
        }}
      >
        <ModernSearchBar
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          sx={{
            paddingX: { xs: 2, sm: 3 },
            paddingY: isSearchSticky ? { xs: 1.5, sm: 2 } : { xs: 2, sm: 2.5 },
            marginBottom: 0,
          }}
        />
      </Box>
      {/* Spacer para compensar el espacio cuando está fixed */}
      {isSearchSticky && (
        <Box sx={{ height: { xs: '88px', sm: '96px' } }} />
      )}
    </>
  );
};

export default StickySearchBarWrapper;

