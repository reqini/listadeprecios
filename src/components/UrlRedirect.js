import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Componente para redirigir URLs mal formadas
 * Ejemplo: /cocinaty12 → /cocinaty/12
 */
const UrlRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const pathname = location.pathname;
    
    // Detectar URLs mal formadas tipo /cocinaty12, /cocinaty6, etc.
    const malformedMatch = pathname.match(/^\/cocinaty(\d+)$/);
    
    if (malformedMatch) {
      const cuota = malformedMatch[1];
      const correctUrl = `/cocinaty/${cuota}`;
      console.log(`Redirigiendo URL mal formada: ${pathname} → ${correctUrl}`);
      navigate(correctUrl, { replace: true });
      return;
    }
    
    // Detectar otros posibles patrones mal formados (slug seguido de número sin barra)
    const generalMalformedMatch = pathname.match(/^\/([a-zA-Z]+)(\d+)$/);
    
    if (generalMalformedMatch) {
      const slug = generalMalformedMatch[1];
      const cuota = generalMalformedMatch[2];
      
      // Solo redirigir si el slug no es una ruta conocida
      const knownRoutes = [
        'catalogo', 'home', 'login', 'registro', 'preferencial', 
        'contado', 'generarPlaca', 'emprendedoras', 'ventas', 'faqs'
      ];
      
      if (!knownRoutes.includes(slug)) {
        const correctUrl = `/${slug}/${cuota}`;
        console.log(`Redirigiendo URL mal formada: ${pathname} → ${correctUrl}`);
        navigate(correctUrl, { replace: true });
        return;
      }
    }
  }, [location.pathname, navigate]);

  return null; // Este componente no renderiza nada
};

export default UrlRedirect;

