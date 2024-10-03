import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const useFavicon = () => {
  const location = useLocation();

  useEffect(() => {
    const favicon = document.getElementById('favicon');
    
    // Verifica que el favicon exista antes de intentar modificarlo
    if (favicon) {
      if (location.pathname.includes('catalogo')) {
        favicon.href = '/favicon-catalogo.png';
      } else if (location.pathname.includes('home')) {
        favicon.href = '/favicon.png';
      } else {
        favicon.href = '/favicon.ico'; // Favicon por defecto
      }
    } else {
      console.error("No se encontró el elemento 'favicon' en el DOM.");
    }
  }, [location]);
};

export default useFavicon;
