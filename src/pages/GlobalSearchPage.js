import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GlobalProductSearch from '../components/GlobalProductSearch';
import Navbar from '../components/Navbar';
import { useAuth } from '../AuthContext';

/**
 * Página de Búsqueda Global
 * Renderiza el componente GlobalProductSearch en pantalla completa
 */
const GlobalSearchPage = () => {
  const { logout, auth } = useAuth();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(true);

  const handleProductClick = (product) => {
    // Si es producto local, podría navegar a su detalle
    // Por ahora solo cerrar y mostrar en consola
    console.log('Producto seleccionado:', product);
  };

  const handleCloseSearch = () => {
    navigate('/home');
  };

  return (
    <>
      <Navbar
        title="Búsqueda Global"
        onLogout={logout}
        user={auth?.user || { username: localStorage.getItem('activeSession') || '' }}
      />
      {isSearchOpen && (
        <GlobalProductSearch
          onProductClick={handleProductClick}
          onClose={handleCloseSearch}
        />
      )}
    </>
  );
};

export default GlobalSearchPage;

