import React, { useRef, useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Chip,
  useMediaQuery,
  useTheme,
  IconButton,
} from '@mui/material';
import { ErrorOutline as ErrorOutlineIcon, ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import axios from '../utils/axios';
import { formatPrice } from '../utils/priceUtils';

/**
 * Carrusel de productos con entrega inmediata
 * Carga productos desde la hoja "entrega_ya" de Google Sheets
 * 
 * ENDPOINT: /api/entrega-ya
 * Campos principales: precio_negocio, foto/imagen, linea, stock
 */
const FeaturedProductsCarousel = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const scrollContainerRef = useRef(null);
  const location = useLocation();
  const [productosDestacados, setProductosDestacados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Verificar si el carrusel está habilitado por el switch
  const [carouselEnabled, setCarouselEnabled] = React.useState(false);

  // Verificar estado del switch de cocinaty
  useEffect(() => {
    const checkCarouselSwitch = () => {
      const STORAGE_KEY = 'carousel_switch_cocinaty';
      const ONE_HOUR_MS = 60 * 60 * 1000; // 1 hora

      // Verificar si la URL es del tipo /cocinaty/:numero (con switch)
      const pathname = location.pathname.toLowerCase();
      const isCocinatyUrl = pathname.startsWith('/cocinaty/');
      
      // Verificar query param de la URL (para URLs compartidas)
      const searchParams = new URLSearchParams(location.search);
      const urlEnabled = searchParams.get('carousel') === 'enabled';

      // Verificar localStorage (para usuario cocinaty)
      const stored = localStorage.getItem(STORAGE_KEY);
      let localStorageEnabled = false;
      
      if (stored) {
        try {
          const data = JSON.parse(stored);
          const now = Date.now();
          const elapsed = now - data.timestamp;
          
          // Verificar si está habilitado Y no ha expirado
          if (data.enabled && elapsed < ONE_HOUR_MS) {
            localStorageEnabled = true;
          } else {
            // Expiró o está desactivado, limpiar
            localStorage.removeItem(STORAGE_KEY);
            localStorageEnabled = false;
          }
        } catch (error) {
          console.error('Error al verificar switch del carrusel:', error);
          localStorage.removeItem(STORAGE_KEY);
          localStorageEnabled = false;
        }
      }

      // LÓGICA CORREGIDA:
      // 1. Si la URL es /cocinaty/:numero -> mostrar solo si localStorage está activado
      // 2. Si la URL es normal (/catalogo12) -> NO mostrar (sin switch)
      // 3. Si hay localStorage activado (usuario cocinaty con switch ON) -> mostrar
      // 4. Si NO hay localStorage pero hay URL param (URL compartida) -> mostrar
      // 5. Si localStorage está desactivado/expirado -> NO mostrar (incluso con URL param)
      // 6. Si no hay nada -> NO mostrar
      
      if (isCocinatyUrl) {
        // URL tipo /cocinaty/12 - Solo mostrar si localStorage está activado
        setCarouselEnabled(localStorageEnabled);
      } else if (localStorageEnabled) {
        // Switch activado por cocinaty (para URLs compartidas con query param)
        setCarouselEnabled(true);
      } else if (!stored && urlEnabled) {
        // No hay localStorage pero hay URL param (URL compartida válida)
        setCarouselEnabled(true);
      } else {
        // URL normal sin switch o switch desactivado/expirado
        setCarouselEnabled(false);
      }
    };

    checkCarouselSwitch();
    
    // Verificar cada segundo si está habilitado
    const interval = setInterval(checkCarouselSwitch, 1000);
    
    return () => clearInterval(interval);
  }, [location.search, location.pathname]);

  // Cargar productos desde la hoja "entrega_ya" de Google Sheets
  useEffect(() => {
    const loadProductosEntrega = async () => {
      try {
        setLoading(true);
        
        // Intentar cargar desde productos generales y filtrar por hoja "entrega_ya"
        // Primero intentar endpoint específico si existe
        let productosData = [];
        
        try {
          const response = await axios.get('/api/entrega-ya');
          if (response.data && Array.isArray(response.data)) {
            productosData = response.data;
            console.log('✅ Productos cargados desde /api/entrega-ya:', productosData.length);
          }
        } catch (apiError) {
          console.log('⚠️ Endpoint /api/entrega-ya no existe, intentando fallback desde /api/productos...');
          
          // Fallback: cargar desde productos generales
          try {
            const productosResponse = await axios.get('/api/productos');
            const todosProductos = productosResponse.data || [];
            console.log('📦 Total de productos cargados desde /api/productos:', todosProductos.length);
            
            // Buscar productos de la hoja "entrega_ya" o con campos relacionados
            // Variantes posibles del nombre de la hoja
            productosData = todosProductos.filter((producto) => {
              // Verificar si está en la hoja "entrega_ya" (variantes de nombre)
              const enHojaEntregaYa = 
                (producto.hoja && (
                  producto.hoja.toLowerCase() === 'entrega_ya' ||
                  producto.hoja.toLowerCase() === 'entrega ya' ||
                  producto.hoja.toLowerCase() === 'entrega-ya'
                )) ||
                (producto.sheet && (
                  producto.sheet.toLowerCase() === 'entrega_ya' ||
                  producto.sheet.toLowerCase() === 'entrega ya'
                )) ||
                (producto.categoria && producto.categoria.toLowerCase().includes('entrega'));
              
              // Verificar flags de entrega inmediata
              const tieneFlagEntrega = 
                producto.entrega_ya === 'si' ||
                producto.entrega_ya === 'Sí' ||
                producto.entrega_ya === true ||
                producto.entrega_ya === 'SI' ||
                producto.entrega_inmediata === 'si' ||
                producto.entrega_inmediata === 'Sí' ||
                producto.entrega_inmediata === true ||
                producto.entrega_inmediata === 'SI' ||
                producto.envio_inmediato === 'si' ||
                producto.envio_inmediato === 'Sí' ||
                producto.envio_inmediato === 'SI';
              
              return enHojaEntregaYa || tieneFlagEntrega;
            });
            
            console.log('✅ Productos filtrados con entrega inmediata:', productosData.length);
            
            // Si aún no hay datos, mostrar todos los productos con precio_negocio y foto (para debug)
            if (productosData.length === 0) {
              console.warn('⚠️ No se encontraron productos con flags de entrega. Mostrando primeros productos disponibles...');
              // Filtrar productos que tengan precio e imagen (más permisivo)
              productosData = todosProductos
                .filter((p) => {
                  const tienePrecio = p.precio_negocio || p.precio_contado || p.precio_lista || p.psvp_lista;
                  const tieneImagen = p.foto || p.imagen || p.imagen_banner;
                  const vigente = (p.vigencia || '').toLowerCase() !== 'no';
                  return tienePrecio && tieneImagen && vigente;
                })
                .slice(0, 8); // Mostrar hasta 8 productos para verificar que funciona
              console.log('📋 Productos de ejemplo cargados (sin filtro de entrega):', productosData.length);
              if (productosData.length > 0) {
                console.log('📦 Ejemplo de producto encontrado:', {
                  codigo: productosData[0].codigo,
                  descripcion: productosData[0].descripcion,
                  precio: productosData[0].precio_negocio || productosData[0].precio_contado,
                  tieneImagen: !!(productosData[0].foto || productosData[0].imagen),
                });
              }
            }
          } catch (productosError) {
            console.error('❌ Error cargando productos desde /api/productos:', productosError);
            setError('No se pudieron cargar los productos');
          }
        }
        
        // Filtrar solo productos con datos válidos (precio_negocio O precio_contado, imagen, vigente)
        const productosValidos = productosData.filter((producto) => {
          // PRIORIZAR precio_negocio, pero aceptar precio_contado como fallback
          const tienePrecioNegocio = producto.precio_negocio !== undefined && 
                                     producto.precio_negocio !== null && 
                                     producto.precio_negocio !== '';
          const tienePrecioContado = producto.precio_contado !== undefined && 
                                     producto.precio_contado !== null && 
                                     producto.precio_contado !== '';
          const tienePrecio = tienePrecioNegocio || tienePrecioContado || 
                            producto.precio_lista || producto.psvp_lista;
          
          // Más permisivo: aceptar cualquier imagen
          const tieneImagen = producto.foto || producto.imagen || producto.imagen_banner;
          const vigente = (producto.vigencia || '').toLowerCase() !== 'no';
          
          if (!tienePrecio) {
            console.warn('⚠️ Producto sin precio:', {
              codigo: producto.codigo,
              descripcion: producto.descripcion || producto.nombre,
              precio_negocio: producto.precio_negocio,
              precio_contado: producto.precio_contado,
            });
          }
          if (!tieneImagen) {
            console.warn('⚠️ Producto sin imagen:', {
              codigo: producto.codigo,
              descripcion: producto.descripcion || producto.nombre,
            });
          }
          
          return tienePrecio && tieneImagen && vigente;
        });
        
        console.log('✅ Productos válidos para mostrar:', productosValidos.length);
        setProductosDestacados(productosValidos);
        
        if (productosValidos.length === 0) {
          console.warn('⚠️ No se encontraron productos para el carrusel de entrega inmediata');
        }
      } catch (error) {
        console.error('❌ Error general cargando productos de entrega inmediata:', error);
        setError(error.message || 'Error desconocido');
        setProductosDestacados([]);
      } finally {
        setLoading(false);
      }
    };

    loadProductosEntrega();
  }, []);

  // Funciones de scroll y verificación de posición
  const checkScrollPosition = () => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    if (!scrollContainerRef.current || productosDestacados.length === 0) return;
    
    checkScrollPosition();
    
    const container = scrollContainerRef.current;
    container.addEventListener('scroll', checkScrollPosition);
    
    // Verificar en resize
    const handleResize = () => {
      setTimeout(checkScrollPosition, 100);
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      container.removeEventListener('scroll', checkScrollPosition);
      window.removeEventListener('resize', handleResize);
    };
  }, [productosDestacados]);

  const scrollLeft = () => {
    if (!scrollContainerRef.current) return;
    const cardWidth = isMobile ? 260 + 16 : 300 + 24; // ancho card + gap
    scrollContainerRef.current.scrollBy({
      left: -cardWidth,
      behavior: 'smooth',
    });
  };

  const scrollRight = () => {
    if (!scrollContainerRef.current) return;
    const cardWidth = isMobile ? 260 + 16 : 300 + 24; // ancho card + gap
    scrollContainerRef.current.scrollBy({
      left: cardWidth,
      behavior: 'smooth',
    });
  };

  // Si el carrusel no está habilitado por el switch, no mostrar
  if (!carouselEnabled) {
    return null;
  }

  // Mostrar mensaje de carga o error
  if (loading) {
    return (
      <Box sx={{ padding: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Cargando productos...
        </Typography>
      </Box>
    );
  }

  // Mostrar error si existe
  if (error) {
    console.error('Error en carrusel:', error);
  }

  // Si no hay productos destacados, mostrar mensaje en lugar de ocultar
  if (!productosDestacados || productosDestacados.length === 0) {
    return (
      <Box sx={{ padding: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          No hay productos disponibles en este momento.
        </Typography>
        {error && (
          <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
            Error: {error}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        marginBottom: { xs: 4, sm: 5 },
        position: 'relative',
      }}
    >
      {/* Título del carrusel */}
      <Box
        sx={{
          marginBottom: 2,
          paddingX: { xs: 2, sm: 0 },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              color: theme.palette.primary.main,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Cuotas sin interés
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              color: '#222222',
              marginBottom: 0.5,
            }}
          >
            PRODUCTOS CON ENTREGA INMEDIATA
          </Typography>
        </Box>
      </Box>

      {/* Contenedor principal con flechas */}
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          paddingX: { xs: 3, sm: 5 }, // Padding lateral para separar del contenedor
        }}
      >
        {/* Flecha izquierda */}
        {canScrollLeft && (
          <IconButton
            onClick={scrollLeft}
            sx={{
              position: 'absolute',
              left: { xs: 0, sm: 0 },
              zIndex: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 1)',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.3s ease',
            }}
            aria-label="Anterior"
          >
            <ArrowBackIos sx={{ fontSize: { xs: 20, sm: 24 }, color: theme.palette.primary.main }} />
          </IconButton>
        )}

        {/* Contenedor de scroll horizontal con padding lateral */}
        <Box
          ref={scrollContainerRef}
          sx={{
            display: 'flex',
            gap: { xs: 2, sm: 3 },
            overflowX: 'auto',
            overflowY: 'hidden',
            scrollSnapType: 'x mandatory',
            scrollBehavior: 'smooth',
            paddingLeft: { xs: 4, sm: 5 }, // Padding izquierdo fijo para evitar cortes
            paddingRight: { xs: 4, sm: 5 }, // Padding derecho fijo para evitar cortes
            paddingBottom: 2,
            width: '100%',
            justifyContent: 'flex-start', // Siempre alineado a la izquierda, sin centrar
            // Ocultar scrollbar pero mantener funcionalidad
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
        {productosDestacados.map((producto) => {
          // Determinar si mostrar badge de "solo queda una unidad"
          const stockBajo = producto.stock === 1 || 
                           producto.stock_actual === 1 || 
                           producto.unidades_disponibles === 1 ||
                           producto.ultimas_unidades === 'si' ||
                           producto.ultimas_unidades === 'Sí' ||
                           producto.solo_queda_uno === 'si' ||
                           producto.solo_queda_uno === 'Sí';
          
          // Obtener imagen - prioridad: foto > imagen > imagen_banner
          const imagenProducto = producto.foto || producto.imagen || producto.imagen_banner || '../descarga.png';
          
          // Obtener precio - SIEMPRE usar precio_negocio si existe en el objeto (incluso si es 0)
          let precioProducto = 0;
          
          // Verificar si precio_negocio existe como propiedad en el objeto
          if ('precio_negocio' in producto) {
            // Si existe la propiedad, convertir a número (acepta 0 como valor válido)
            const precioNegocioNum = Number(producto.precio_negocio);
            if (!isNaN(precioNegocioNum)) {
              precioProducto = precioNegocioNum; // Usar incluso si es 0
            }
          }
          
          // Solo usar fallback si precio_negocio NO existe como propiedad
          if (!('precio_negocio' in producto)) {
            if (producto.precio_contado !== null && producto.precio_contado !== undefined) {
              const precioContadoNum = Number(producto.precio_contado);
              if (!isNaN(precioContadoNum)) {
                precioProducto = precioContadoNum;
              }
            } else if (producto.precio_lista !== null && producto.precio_lista !== undefined) {
              const precioListaNum = Number(producto.precio_lista);
              if (!isNaN(precioListaNum)) {
                precioProducto = precioListaNum;
              }
            }
          }
          
          // Debug: Log del precio para diagnóstico
          console.log('💰 Precio del producto:', {
            codigo: producto.codigo,
            descripcion: producto.descripcion,
            tiene_precio_negocio: 'precio_negocio' in producto,
            precio_negocio: producto.precio_negocio,
            precio_contado: producto.precio_contado,
            precio_final: precioProducto,
          });
          
          return (
            <Card
              key={producto.id || producto.codigo}
              sx={{
                minWidth: { xs: 260, sm: 300 },
                maxWidth: { xs: 260, sm: 300 },
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                scrollSnapAlign: 'start',
                position: 'relative',
                flexShrink: 0,
                border: '2px solid transparent',
                '&:hover': {
                  transform: 'translateY(-6px) scale(1.02)',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
                  borderColor: theme.palette.primary.main,
                },
              }}
            >
              {/* Badge "Solo queda una unidad disponible" */}
              {stockBajo && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    zIndex: 3,
                  }}
                >
                  <Chip
                    icon={<ErrorOutlineIcon sx={{ fontSize: 16, color: 'white' }} />}
                    label="Aprovechá última unidad"
                    sx={{
                      backgroundColor: '#FF385C',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      height: 32,
                      boxShadow: '0 4px 12px rgba(255, 56, 92, 0.4)',
                      '& .MuiChip-icon': {
                        color: 'white',
                        marginLeft: '8px',
                      },
                      padding: '0 8px',
                    }}
                  />
                </Box>
              )}

              {/* Imagen del producto - Más grande y visual */}
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: { xs: 200, sm: 220 },
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
                    transition: 'transform 0.4s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                    },
                  }}
                  onError={(e) => {
                    e.target.src = '../descarga.png';
                  }}
                />
                {/* Overlay sutil para mejor contraste del texto */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '40%',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)',
                  }}
                />
              </Box>

              {/* Contenido de la card - Más impactante */}
              <CardContent
                sx={{
                  padding: { xs: 2, sm: 2.5 },
                  '&:last-child': { paddingBottom: { xs: 2, sm: 2.5 } },
                  background: 'linear-gradient(to bottom, #ffffff, #fafafa)',
                }}
              >
                {/* Línea del producto */}
                {producto.linea && (
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: theme.palette.primary.main,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: 0.5,
                      display: 'block',
                    }}
                  >
                    {producto.linea}
                  </Typography>
                )}

                {/* Nombre del producto - Más grande y destacado */}
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  sx={{
                    fontSize: { xs: '1rem', sm: '1.125rem' },
                    lineHeight: 1.3,
                    minHeight: { xs: '3rem', sm: '3.4rem' },
                    maxHeight: { xs: '3rem', sm: '3.4rem' },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    color: '#222222',
                    marginBottom: 1.5,
                    fontWeight: 700,
                  }}
                >
                  {producto.descripcion || producto.nombre}
                </Typography>

                {/* Precio - Destacado y grande */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 1,
                    marginTop: 'auto',
                  }}
                >
                  <Typography
                    variant="h5"
                    fontWeight={800}
                    sx={{
                      fontSize: { xs: '1.35rem', sm: '1.5rem' },
                      color: theme.palette.primary.main,
                      lineHeight: 1,
                    }}
                  >
                    {formatPrice(precioProducto)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          );
        })}
        </Box>

        {/* Flecha derecha */}
        {canScrollRight && (
          <IconButton
            onClick={scrollRight}
            sx={{
              position: 'absolute',
              right: { xs: 0, sm: 0 },
              zIndex: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 1)',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.3s ease',
            }}
            aria-label="Siguiente"
          >
            <ArrowForwardIos sx={{ fontSize: { xs: 20, sm: 24 }, color: theme.palette.primary.main }} />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};

export default FeaturedProductsCarousel;
