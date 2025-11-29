import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Chip,
  useTheme,
  Skeleton,
  LinearProgress,
} from '@mui/material';
import { 
  LocalShipping as ShippingIcon,
  ErrorOutline as ErrorOutlineIcon,
} from '@mui/icons-material';
import { formatPrice } from '../utils/priceUtils';

// Importar estilos de slick
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

/**
 * Carrusel estilo MercadoLibre para productos de entrega inmediata
 * Usa react-slick para control preciso: 3 cards en desktop, 1.25 en mobile
 */
const CarouselEntregaInmediata = ({ productos = [], cuotaActual = 12, nombreUsuario = '' }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [sliderRef, setSliderRef] = useState(null);

  // Obtener precio según cuota
  const getPrecioPorCuota = (producto, cuota) => {
    const cuotaKey = `precio_${cuota}_cuotas`;
    const precioNegocio = producto.precio_negocio;
    
    // Priorizar precio_negocio si existe
    if (precioNegocio !== null && precioNegocio !== undefined && precioNegocio !== '') {
      return Number(precioNegocio) || 0;
    }
    
    // Buscar precio por cuota
    const precioCuota = producto[cuotaKey] || producto.precio_contado || producto.precio_lista || 0;
    return Number(precioCuota) || 0;
  };

  useEffect(() => {
    if (productos && productos.length > 0) {
      setLoading(false);
    }
  }, [productos]);

  // Si no hay productos, no mostrar nada
  if (!productos || productos.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <Box sx={{ padding: 2 }}>
        <Skeleton variant="rectangular" width="100%" height={200} />
        <LinearProgress sx={{ mt: 2 }} />
      </Box>
    );
  }

  const visibleProducts = productos.slice(0, 10); // Máximo 10 productos

  // Configuración de react-slick
  const settings = {
    infinite: true,
    speed: 500,
    arrows: false, // Usaremos flechas custom
    swipeToSlide: true,
    draggable: true,
    slidesToShow: 3, // Default desktop: 3 cards
    slidesToScroll: 1,
    centerMode: false,
    responsive: [
      {
        breakpoint: 768, // Mobile
        settings: {
          slidesToShow: 1.25, // 1 card completa + preview de la siguiente
          slidesToScroll: 1,
          centerMode: false,
        },
      },
      {
        breakpoint: 1200, // Desktop
        settings: {
          slidesToShow: 3, // 3 cards visibles
          slidesToScroll: 1,
          centerMode: false,
        },
      },
    ],
  };

  // Estilos para las flechas custom
  const arrowStyles = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 2,
    backgroundColor: 'white',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    borderRadius: '50%',
    width: { xs: 32, sm: 40 },
    height: { xs: 32, sm: 40 },
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: 'none',
    '&:hover': {
      backgroundColor: '#f5f5f5',
      transform: 'translateY(-50%) scale(1.1)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    },
  };

  return (
    <Box
      sx={{
        width: '100%',
        marginBottom: { xs: 3, sm: 4 },
        position: 'relative',
        backgroundColor: '#FFF9E6', // Fondo amarillo claro estilo ML
        paddingY: { xs: 2, sm: 3 },
        borderRadius: { xs: 0, sm: 2 },
      }}
    >
      {/* Título del carrusel */}
      <Box
        sx={{
          paddingX: { xs: 2, sm: 3 },
          marginBottom: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <ShippingIcon sx={{ color: theme.palette.success.main, fontSize: 28 }} />
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1rem', sm: '1.25rem' },
              color: '#333',
              lineHeight: 1.2,
            }}
          >
            Entrega Inmediata
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              color: '#666',
            }}
          >
            Productos disponibles ahora
          </Typography>
        </Box>
      </Box>

      {/* Contenedor del carrusel con flechas */}
      <Box
        sx={{
          position: 'relative',
          paddingX: { xs: 1, sm: 2 },
        }}
      >
        {/* Flecha izquierda */}
        <Box
          component="button"
          onClick={() => sliderRef?.slickPrev()}
          sx={{
            ...arrowStyles,
            left: { xs: 0, sm: -20 },
          }}
          aria-label="Anterior"
        >
          <Typography
            sx={{
              fontSize: { xs: '1rem', sm: '1.25rem' },
              color: theme.palette.primary.main,
              fontWeight: 700,
            }}
          >
            ‹
          </Typography>
        </Box>

        {/* Slider */}
        <Box
          sx={{
            paddingX: { xs: 5, sm: 6 }, // Espacio para las flechas
            '& .slick-slide': {
              paddingX: { xs: 1, sm: 1.5 },
            },
            '& .slick-list': {
              marginX: { xs: 0, sm: 0 },
            },
          }}
        >
          <Slider {...settings} ref={setSliderRef}>
            {visibleProducts.map((producto, index) => {
              const imagenProducto = producto.foto || producto.imagen || producto.imagen_banner || '../descarga.png';
              const precio = getPrecioPorCuota(producto, cuotaActual);
              
              return (
                <Box key={producto.id || producto.codigo || index}>
                  <Card
                    sx={{
                      borderRadius: '12px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      backgroundColor: 'white',
                      marginX: { xs: 0.5, sm: 1 },
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                      },
                    }}
                    onClick={() => {
                      console.log('Producto clickeado:', producto);
                    }}
                  >
                    {/* Imagen */}
                    <Box
                      sx={{
                        position: 'relative',
                        width: '100%',
                        height: { xs: 140, sm: 160 },
                        overflow: 'hidden',
                        backgroundColor: '#f5f5f5',
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={imagenProducto}
                        alt={producto.descripcion || producto.nombre || 'Producto'}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                        onError={(e) => {
                          e.target.src = '../descarga.png';
                        }}
                      />
                      
                      {/* Badge Entrega Inmediata */}
                      <Chip
                        label="Entrega Inmediata"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          backgroundColor: theme.palette.success.main,
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.65rem',
                          height: 24,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        }}
                      />
                      
                      {/* Badge Última Unidad - Mostrar si stock es 1 o última unidad */}
                      {(() => {
                        const stock = producto.stock || producto.stock_actual || producto.unidades_disponibles;
                        const ultimasUnidades = producto.ultimas_unidades || producto.solo_queda_uno;
                        const isLastUnit = 
                          stock === 1 || 
                          stock === '1' ||
                          ultimasUnidades === 'si' || 
                          ultimasUnidades === 'Sí' ||
                          ultimasUnidades === true ||
                          producto.solo_queda_uno === 'si' ||
                          producto.solo_queda_uno === 'Sí' ||
                          producto.solo_queda_uno === true;
                        
                        if (!isLastUnit) return null;
                        
                        return (
                          <Chip
                            icon={<ErrorOutlineIcon sx={{ fontSize: 16, color: 'white' }} />}
                            label="Última unidad"
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 8,
                              left: 8,
                              zIndex: 3,
                              backgroundColor: '#FF385C',
                              color: 'white',
                              fontWeight: 700,
                              fontSize: '0.7rem',
                              height: 28,
                              boxShadow: '0 4px 12px rgba(255, 56, 92, 0.4)',
                              '& .MuiChip-icon': {
                                color: 'white',
                                marginLeft: '6px',
                              },
                              padding: '0 8px',
                            }}
                          />
                        );
                      })()}
                    </Box>

                    {/* Contenido */}
                    <CardContent
                      sx={{
                        padding: { xs: 1.5, sm: 2 },
                        '&:last-child': { paddingBottom: { xs: 1.5, sm: 2 } },
                      }}
                    >
                      {/* Nombre del producto */}
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          color: '#333',
                          marginBottom: 0.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          minHeight: { xs: 36, sm: 40 },
                          lineHeight: 1.3,
                        }}
                      >
                        {producto.descripcion || producto.nombre || 'Producto'}
                      </Typography>

                      {/* Precio */}
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          fontSize: { xs: '1rem', sm: '1.25rem' },
                          color: theme.palette.primary.main,
                          marginTop: 1,
                        }}
                      >
                        {formatPrice(precio)}
                      </Typography>

                      {/* Cuotas */}
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          color: '#666',
                          display: 'block',
                          marginTop: 0.5,
                        }}
                      >
                        En {cuotaActual} cuotas sin interés
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              );
            })}
          </Slider>
        </Box>

        {/* Flecha derecha */}
        <Box
          component="button"
          onClick={() => sliderRef?.slickNext()}
          sx={{
            ...arrowStyles,
            right: { xs: 0, sm: -20 },
          }}
          aria-label="Siguiente"
        >
          <Typography
            sx={{
              fontSize: { xs: '1rem', sm: '1.25rem' },
              color: theme.palette.primary.main,
              fontWeight: 700,
            }}
          >
            ›
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default CarouselEntregaInmediata;
