import { useLocation } from 'react-router-dom';

/**
 * Hook para detectar si el catálogo está siendo usado desde una ruta dinámica
 * Retorna true si la URL es del tipo /{slug}/{cuota}
 */
export const useIsIndividualCatalog = () => {
  const location = useLocation();
  const pathname = location.pathname;
  
  // Verificar si es una ruta dinámica tipo /{slug}/{cuota}
  // No debe empezar con /catalogo ni /home, etc.
  const isDynamicRoute = /^\/[^/]+\/\d+$/.test(pathname);
  
  // No debe ser una ruta conocida estática
  const staticRoutes = [
    '/home',
    '/login',
    '/catalogo',
    '/preferencial',
    '/contado',
  ];
  
  const isStaticRoute = staticRoutes.some(route => pathname.startsWith(route));
  
  return isDynamicRoute && !isStaticRoute;
};

