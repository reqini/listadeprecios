/**
 * Utilidad para detectar si la ruta actual es un catálogo
 * Los catálogos mantienen header y search siempre fixed
 * Las demás secciones tienen header y search relative inicialmente, fixed al hacer scroll
 */
export const isCatalogRoute = (pathname) => {
  const catalogRoutes = [
    '/catalogo3',
    '/catalogo6',
    '/catalogo9',
    '/catalogo10',
    '/catalogo12',
    '/catalogo14',
    '/catalogo15',
    '/catalogo18',
    '/catalogo20',
    '/catalogo24',
    '/preferencial',
  ];
  
  return catalogRoutes.some(route => pathname.startsWith(route));
};

