/**
 * Hook reutilizable para hacer el search bar fixed al hacer scroll
 * Usado en todos los catálogos
 */
import { useState, useEffect, useRef } from 'react';

export const useStickySearchBar = () => {
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

  return { isSearchSticky, searchBarRef };
};

