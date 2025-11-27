import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme,
  Chip,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  FlashOn,
  Star,
  LocalFireDepartment,
} from '@mui/icons-material';
import ModernProductCardAirbnb from './ModernProductCardAirbnb';

/**
 * Banner de productos destacados administrable desde Google Sheets
 * Filtra productos por columnas: destacado, mas_vendida, en_promocion, oferta_relampago
 */
const FeaturedProductsBanner = ({ 
  productos = [], 
  onAddToCart,
  onToggleFavorite,
  selectedCuota = null,
  isContado = false,
  cuotaKey = null,
  cuotasTexto = '',
  bankLogos = [],
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);

  // Filtrar productos destacados desde Google Sheets
  useEffect(() => {
    if (!productos || productos.length === 0) {
      setFeaturedProducts([]);
      return;
    }

    // Buscar productos con flags destacados desde Google Sheets
    const destacados = productos.filter((producto) => {
      // Puede estar destacado por varias razones (administrable desde Sheets):
      const esDestacado = producto.destacado === 'si' || producto.destacado === 'Sí' || producto.destacado === true;
      const esMasVendido = producto.mas_vendida === 'si' || producto.mas_vendida === 'Sí' || producto.mas_vendida === true;
      const enPromocion = producto.en_promocion === 'si' || producto.en_promocion === 'Sí' || producto.en_promocion === true;
      const ofertaRelampago = producto.oferta_relampago === 'si' || producto.oferta_relampago === 'Sí' || producto.oferta_relampago === true;
      const entregaInmediata = producto.entrega_inmediata === 'si' || producto.entrega_inmediata === 'Sí' || producto.entrega_inmediata === true || 
                                producto.envio_inmediato === 'si' || producto.envio_inmediato === 'Sí' || producto.envio_inmediato === true ||
                                producto.entrega_inmediato === 'si' || producto.entrega_inmediato === 'Sí' || producto.entrega_inmediato === true;
      
      // También debe estar vigente
      const vigente = (producto.vigencia || '').toLowerCase() !== 'no';
      
      return vigente && (esDestacado || esMasVendido || enPromocion || ofertaRelampago || entregaInmediata);
    });

    // Ordenar por prioridad (si existe campo prioridad en Sheets)
    const ordenados = destacados.sort((a, b) => {
      const prioridadA = parseFloat(a.prioridad || 0);
      const prioridadB = parseFloat(b.prioridad || 0);
      return prioridadB - prioridadA;
    });

    // Limitar a 8 productos máximo
    setFeaturedProducts(ordenados.slice(0, 8));
  }, [productos]);

  // Auto-play del carrusel
  useEffect(() => {
    if (featuredProducts.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const maxIndex = Math.max(0, Math.ceil(featuredProducts.length / (isMobile ? 1 : 3)) - 1);
        return prev >= maxIndex ? 0 : prev + 1;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredProducts.length, isMobile]);

  const handlePrev = () => {
    const maxIndex = Math.max(0, Math.ceil(featuredProducts.length / (isMobile ? 1 : 3)) - 1);
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    const maxIndex = Math.max(0, Math.ceil(featuredProducts.length / (isMobile ? 1 : 3)) - 1);
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const getVisibleProducts = () => {
    const itemsPerView = isMobile ? 1 : 3;
    const start = currentIndex * itemsPerView;
    return featuredProducts.slice(start, start + itemsPerView);
  };

  const getBadgeForProduct = (producto) => {
    // Prioridad: entrega inmediata primero
    const entregaInmediata = producto.entrega_inmediata === 'si' || producto.entrega_inmediata === 'Sí' || producto.entrega_inmediata === true || 
                            producto.envio_inmediato === 'si' || producto.envio_inmediato === 'Sí' || producto.envio_inmediato === true ||
                            producto.entrega_inmediato === 'si' || producto.entrega_inmediato === 'Sí' || producto.entrega_inmediato === true;
    
    if (entregaInmediata) {
      return { icon: <FlashOn />, label: 'Entrega Inmediata', color: '#4CAF50' };
    }
    if (producto.oferta_relampago === 'si' || producto.oferta_relampago === 'Sí' || producto.oferta_relampago === true) {
      return { icon: <LocalFireDepartment />, label: 'Oferta Relámpago', color: '#FF5722' };
    }
    if (producto.mas_vendida === 'si' || producto.mas_vendida === 'Sí' || producto.mas_vendida === true) {
      return { icon: <TrendingUp />, label: 'Más Vendido', color: '#FF9800' };
    }
    if (producto.en_promocion === 'si' || producto.en_promocion === 'Sí' || producto.en_promocion === true) {
      return { icon: <Star />, label: 'En Promoción', color: '#9C27B0' };
    }
    if (producto.destacado === 'si' || producto.destacado === 'Sí' || producto.destacado === true) {
      return { icon: <FlashOn />, label: 'Destacado', color: '#2196F3' };
    }
    return null;
  };

  if (featuredProducts.length === 0) {
    return null;
  }

  const visibleProducts = getVisibleProducts();

  return (
    <Box
      sx={{
        width: '100%',
        marginBottom: { xs: 3, sm: 4 },
        position: 'relative',
      }}
    >
      {/* Título del banner */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 2,
          paddingX: { xs: 1, sm: 0 },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUp sx={{ fontSize: 28, color: theme.palette.primary.main }} />
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              color: '#222222',
            }}
          >
            Productos Destacados
          </Typography>
        </Box>

        {/* Controles de navegación */}
        {featuredProducts.length > (isMobile ? 1 : 3) && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={handlePrev}
              sx={{
                backgroundColor: 'rgba(0,0,0,0.05)',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.1)',
                },
              }}
            >
              <ChevronLeft />
            </IconButton>
            <IconButton
              onClick={handleNext}
              sx={{
                backgroundColor: 'rgba(0,0,0,0.05)',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.1)',
                },
              }}
            >
              <ChevronRight />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Carrusel de productos */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
          gap: { xs: 2, sm: 2.5 },
          overflow: 'hidden',
        }}
      >
        {visibleProducts.map((producto) => {
          const badge = getBadgeForProduct(producto);
          return (
            <Box
              key={producto.codigo || producto.id}
              sx={{
                position: 'relative',
                transform: 'translateX(0)',
                transition: 'transform 0.3s ease',
              }}
            >
              {/* Badge destacado */}
              {badge && (
                <Chip
                  icon={badge.icon}
                  label={badge.label}
                  sx={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    zIndex: 2,
                    backgroundColor: badge.color,
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    height: 28,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}
                />
              )}

              <ModernProductCardAirbnb
                product={producto}
                onAddToCart={onAddToCart}
                onToggleFavorite={onToggleFavorite}
                selectedCuota={selectedCuota}
                isContado={isContado}
                isNew={producto.nuevo === 'si' || producto.nuevo === true || producto.nuevo === 'Sí'}
                isBestSeller={producto.mas_vendida === 'si' || producto.mas_vendida === true || producto.mas_vendida === 'Sí'}
                stockLow={
                  producto.stock_actual && producto.stock_total &&
                  parseFloat(producto.stock_actual) > 0 && parseFloat(producto.stock_total) > 0 &&
                  (parseFloat(producto.stock_actual) / parseFloat(producto.stock_total)) < 0.2
                }
                ofertaRelampago={producto.oferta_relampago === 'si' || producto.oferta_relampago === 'Sí' || producto.oferta_relampago === true}
                bankLogos={bankLogos}
              />
            </Box>
          );
        })}
      </Box>

      {/* Indicadores */}
      {featuredProducts.length > (isMobile ? 1 : 3) && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 1,
            marginTop: 2,
          }}
        >
          {Array.from({ length: Math.ceil(featuredProducts.length / (isMobile ? 1 : 3)) }).map((_, index) => (
            <Box
              key={index}
              onClick={() => setCurrentIndex(index)}
              sx={{
                width: currentIndex === index ? 32 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: currentIndex === index ? theme.palette.primary.main : 'rgba(0,0,0,0.2)',
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default FeaturedProductsBanner;

