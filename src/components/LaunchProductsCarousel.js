import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme,
  Chip,
  Card,
  CardMedia,
  CardContent,
  Button,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  LocalShipping,
  RocketLaunch,
  FlashOn,
} from '@mui/icons-material';
import { formatPrice } from '../utils/priceUtils';

/**
 * Carrousel de productos de lanzamiento / entrega inmediata
 * Estilo MercadoLibre mobile con scroll horizontal suave
 * Solo muestra productos con imagen_banner válida
 */
const LaunchProductsCarousel = ({
  productos = [],
  onAddToCart,
  onProductClick,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const scrollContainerRef = useRef(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Filtrar productos de lanzamiento / entrega inmediata con imagen_banner
  useEffect(() => {
    if (!productos || productos.length === 0) {
      setFilteredProducts([]);
      return;
    }

    const productosFiltrados = productos.filter((producto) => {
      // Debe estar vigente
      const vigente = (producto.vigencia || '').toLowerCase() !== 'no';
      if (!vigente) return false;

      // Debe tener lanzamiento o entrega_inmediata activo
      const esLanzamiento =
        producto.lanzamiento === 'si' ||
        producto.lanzamiento === 'Sí' ||
        producto.lanzamiento === true ||
        producto.lanzamiento === 'SI';
      
      const entregaInmediata =
        producto.entrega_inmediata === 'si' ||
        producto.entrega_inmediata === 'Sí' ||
        producto.entrega_inmediata === true ||
        producto.envio_inmediato === 'si' ||
        producto.envio_inmediato === 'Sí' ||
        producto.entrega_inmediato === 'si';

      if (!esLanzamiento && !entregaInmediata) return false;

      // DEBE tener imagen_banner válida
      const imagenBanner = producto.imagen_banner || producto.imagenBanner || producto.banner_imagen;
      if (!imagenBanner || !imagenBanner.trim()) return false;

      // Validar que sea una URL válida o ruta válida
      const urlValida = imagenBanner.trim().length > 0;
      return urlValida;
    });

    // Ordenar por prioridad si existe
    const ordenados = productosFiltrados.sort((a, b) => {
      const prioridadA = parseFloat(a.prioridad || 0);
      const prioridadB = parseFloat(b.prioridad || 0);
      if (prioridadA !== prioridadB) return prioridadB - prioridadA;
      
      // Si no hay prioridad, lanzamiento primero
      const aEsLanzamiento = a.lanzamiento === 'si' || a.lanzamiento === 'Sí' || a.lanzamiento === true;
      const bEsLanzamiento = b.lanzamiento === 'si' || b.lanzamiento === 'Sí' || b.lanzamiento === true;
      if (aEsLanzamiento && !bEsLanzamiento) return -1;
      if (!aEsLanzamiento && bEsLanzamiento) return 1;
      
      return 0;
    });

    setFilteredProducts(ordenados);
  }, [productos]);

  // Verificar si se puede hacer scroll
  const checkScrollButtons = () => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  useEffect(() => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    container.addEventListener('scroll', checkScrollButtons);
    checkScrollButtons();

    // Re-check on resize
    const handleResize = () => {
      setTimeout(checkScrollButtons, 100);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      container.removeEventListener('scroll', checkScrollButtons);
      window.removeEventListener('resize', handleResize);
    };
  }, [filteredProducts]);

  const scroll = (direction) => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const cardWidth = isMobile ? 240 + 16 : 280 + 24; // width + gap
    const scrollAmount = cardWidth * (isMobile ? 1.2 : 1); // Mostrar 1.2 cards en mobile
    
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleProductClick = (producto) => {
    if (onProductClick) {
      onProductClick(producto);
    }
  };

  const handleAddToCart = (e, producto) => {
    e.stopPropagation(); // Evitar que se active el click del card
    if (onAddToCart) {
      onAddToCart(producto);
    }
  };

  // Ocultar si no hay productos
  if (filteredProducts.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        width: '100%',
        marginBottom: { xs: 4, sm: 5 },
        position: 'relative',
        paddingX: { xs: 0, sm: 0 },
      }}
    >
      {/* Título y badges */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: { xs: 2, sm: 2.5 },
          paddingX: { xs: 2, sm: 0 },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <RocketLaunch
            sx={{
              fontSize: { xs: 28, sm: 32 },
              color: theme.palette.primary.main,
            }}
          />
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              color: '#222222',
            }}
          >
            Lanzamientos
          </Typography>
        </Box>

        {/* Controles de navegación */}
        {filteredProducts.length > (isMobile ? 1 : 3) && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              sx={{
                backgroundColor: canScrollLeft ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0.02)',
                '&:hover': {
                  backgroundColor: canScrollLeft ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.02)',
                },
                '&.Mui-disabled': {
                  backgroundColor: 'rgba(0,0,0,0.02)',
                },
              }}
            >
              <ChevronLeft />
            </IconButton>
            <IconButton
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              sx={{
                backgroundColor: canScrollRight ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0.02)',
                '&:hover': {
                  backgroundColor: canScrollRight ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.02)',
                },
                '&.Mui-disabled': {
                  backgroundColor: 'rgba(0,0,0,0.02)',
                },
              }}
            >
              <ChevronRight />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Scroll container horizontal */}
      <Box
        ref={scrollContainerRef}
        sx={{
          display: 'flex',
          gap: { xs: 2, sm: 3 },
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollSnapType: 'x mandatory',
          scrollBehavior: 'smooth',
          paddingX: { xs: 2, sm: 0 },
          paddingBottom: 2,
          // Ocultar scrollbar pero mantener funcionalidad
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch', // Smooth scroll en iOS
        }}
      >
        {filteredProducts.map((producto) => {
          const imagenBanner =
            producto.imagen_banner || producto.imagenBanner || producto.banner_imagen || producto.imagen || '';
          
          const esLanzamiento =
            producto.lanzamiento === 'si' ||
            producto.lanzamiento === 'Sí' ||
            producto.lanzamiento === true;
          
          const entregaInmediata =
            producto.entrega_inmediata === 'si' ||
            producto.entrega_inmediata === 'Sí' ||
            producto.envio_inmediato === 'si' ||
            producto.entrega_inmediato === 'si';

          // Precio del producto (parsear si es string)
          const precioRaw =
            producto.precio_final ||
            producto.precioFinal ||
            producto.precio ||
            producto.precio_lista ||
            0;
          
          const precioFinal = typeof precioRaw === 'string' 
            ? parseFloat(precioRaw.toString().replace(/[^\d.-]/g, '')) || 0
            : precioRaw || 0;

          return (
            <Card
              key={producto.codigo || producto.id}
              onClick={() => handleProductClick(producto)}
              sx={{
                minWidth: { xs: 240, sm: 280 },
                maxWidth: { xs: 240, sm: 280 },
                borderRadius: '14px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                scrollSnapAlign: 'start',
                position: 'relative',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.16)',
                },
              }}
            >
              {/* Badge */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  zIndex: 2,
                }}
              >
                {entregaInmediata && (
                  <Chip
                    icon={<LocalShipping sx={{ fontSize: 16 }} />}
                    label="Entrega Inmediata"
                    sx={{
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      height: 26,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    }}
                  />
                )}
                {esLanzamiento && !entregaInmediata && (
                  <Chip
                    icon={<RocketLaunch sx={{ fontSize: 16 }} />}
                    label="Nuevo Lanzamiento"
                    sx={{
                      backgroundColor: '#FF5722',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      height: 26,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    }}
                  />
                )}
              </Box>

              {/* Imagen */}
              <CardMedia
                component="img"
                image={imagenBanner}
                alt={producto.descripcion || producto.nombre || 'Producto'}
                onError={(e) => {
                  // Fallback a imagen normal si banner falla
                  if (producto.imagen) {
                    e.target.src = producto.imagen;
                  } else {
                    e.target.style.display = 'none';
                  }
                }}
                sx={{
                  width: '100%',
                  height: { xs: 180, sm: 220 },
                  objectFit: 'cover',
                  backgroundColor: '#f5f5f5',
                }}
              />

              {/* Contenido */}
              <CardContent
                sx={{
                  padding: { xs: '12px', sm: '16px' },
                  '&:last-child': {
                    paddingBottom: { xs: '12px', sm: '16px' },
                  },
                }}
              >
                {/* Nombre */}
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                    color: '#222222',
                    marginBottom: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    minHeight: { xs: '2.5rem', sm: '2.8rem' },
                  }}
                >
                  {producto.descripcion || producto.nombre || 'Sin nombre'}
                </Typography>

                {/* Precio */}
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '1.125rem', sm: '1.25rem' },
                    color: theme.palette.primary.main,
                    marginBottom: 1.5,
                  }}
                >
                  {formatPrice(precioFinal)}
                </Typography>

                {/* Botón Agregar */}
                <Button
                  variant="contained"
                  fullWidth
                  onClick={(e) => handleAddToCart(e, producto)}
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    fontWeight: 600,
                    fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                    paddingY: { xs: '8px', sm: '10px' },
                    borderRadius: 2,
                    textTransform: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    },
                  }}
                >
                  Agregar al carrito
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
};

export default LaunchProductsCarousel;

