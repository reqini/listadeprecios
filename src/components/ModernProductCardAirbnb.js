import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Dialog,
  DialogContent,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Divider,
} from '@mui/material';
import { FaWhatsapp } from 'react-icons/fa';
import { Close as CloseIcon, ZoomIn as ZoomInIcon, Favorite, FavoriteBorder } from '@mui/icons-material';
import { formatPrice, parsePrice } from '../utils/priceUtils';
import BankPromoBadge from './BankPromoBadge';
import BankLogosRow from './BankLogosRow';
import { IS_CHRISTMAS_MODE } from '../config/christmasConfig';

/**
 * Card moderna estilo Airbnb - Mantiene TODA la funcionalidad de ProductsCalatogo
 * - Mobile-first con imagen protagonista
 * - Estilo minimalista tipo Airbnb
 * - Modal fullscreen para imágenes con zoom
 * - Badges minimalistas opcionales
 */
const ModernProductCardAirbnb = ({ 
  product, 
  selectedCuota, 
  isContado = false, 
  onAddToCart,
  // Props opcionales para badges
  isNew = false,
  isBestSeller = false,
  stockLow = false,
  onToggleFavorite, // Función callback para manejar favoritos
  bankPromo, // Promo de banco asociada (opcional) - DEPRECATED: usar bankLogos
  bankLogos = [], // Array de logos de bancos para mostrar como miniaturas
  showAllData = false, // Prop para mostrar todos los datos (precio negocio, PSVP, puntos, todas las cuotas, etc.)
  isCompactMode = false, // Modo compacto para vista de 2 columnas en mobile
}) => {
  const [shippingCost, setShippingCost] = useState(21036);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  // touchStart removido - no se usa actualmente
  const [lastTouchDistance, setLastTouchDistance] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedCuotaHome, setSelectedCuotaHome] = useState(''); // Para selector de cuotas en home

  const sumarEnvio = localStorage.getItem("sumarEnvio") === "true";
  const aplicaEnvio = ['Bazar', 'Repuestos'].includes(product.linea);

  // Cargar costo de envío dinámico (MANTENER LÓGICA ORIGINAL)
  useEffect(() => {
    const loadShippingCost = () => {
      const costo = localStorage.getItem('costoEnvio');
      if (costo) {
        setShippingCost(parseFloat(costo));
      }
    };

    loadShippingCost();

    const handleCostosUpdate = (event) => {
      setShippingCost(event.detail.costoEnvio);
    };

    window.addEventListener('costosUpdated', handleCostosUpdate);
    return () => window.removeEventListener('costosUpdated', handleCostosUpdate);
  }, []);

  // Mapeo de cuotas (MANTENER LÓGICA ORIGINAL)
  const cuotasMap = {
    "24 cuotas sin interés": 'veinticuatro_sin_interes',
    "20 cuotas sin interés": 'veinte_sin_interes',
    "18 cuotas sin interés": 'dieciocho_sin_interes',
    "15 cuotas sin interés": 'quince_sin_interes',
    "14 cuotas sin interés": 'catorce_sin_interes',
    "12 cuotas sin interés": 'doce_sin_interes',
    "10 cuotas sin interés": 'diez_sin_interes',
    "9 cuotas sin interés": 'nueve_sin_interes',
    "6 cuotas sin interés": 'seis_sin_interes',
    "3 cuotas sin interés": 'tres_sin_interes',
  };

  // Si showAllData está activo y hay una cuota seleccionada desde el selector, usar esa
  let cuotaKeyToUse = cuotasMap[selectedCuota];
  if (showAllData && selectedCuotaHome) {
    cuotaKeyToUse = selectedCuotaHome;
  }
  
  let cuotaValue = null;

  // Validar y procesar cuota seleccionada (MANTENER LÓGICA ORIGINAL)
  if (cuotaKeyToUse && product[cuotaKeyToUse] && product[cuotaKeyToUse] !== 'NO') {
    try {
      cuotaValue = parseFloat(product[cuotaKeyToUse].replace(/[^0-9.-]/g, '')) || null;
    } catch {
      cuotaValue = null;
    }
  }

  // Procesar precio de negocio (MANTENER LÓGICA ORIGINAL)
  const precioNegocio = product.precio_negocio
    ? parseFloat(product.precio_negocio.replace(/[^0-9.-]/g, '')) || null
    : null;

  const SHIPPING_COST = 18697;

  // Determinar precio final según el contexto - ACTUALIZADO para recalcular cuando cambia selectedCuotaHome
  // Recalcular cuotaValue cuando cambia selectedCuotaHome
  const cuotaValueDynamic = useMemo(() => {
    if (showAllData && selectedCuotaHome && product[selectedCuotaHome] && product[selectedCuotaHome] !== 'NO') {
      try {
        return parseFloat(product[selectedCuotaHome].replace(/[^0-9.-]/g, '')) || null;
      } catch {
        return null;
      }
    }
    return cuotaValue;
  }, [showAllData, selectedCuotaHome, product, cuotaValue]);

  const precioFinal = useMemo(() => {
    if (isContado) {
      return (precioNegocio || 0) + (sumarEnvio && aplicaEnvio ? SHIPPING_COST : 0);
    }
    
    // Usar cuotaValueDynamic que se recalcula cuando cambia selectedCuotaHome
    return (cuotaValueDynamic || parseFloat(product.psvp_lista?.replace(/[^0-9.-]/g, '')) || 0) +
      (sumarEnvio && aplicaEnvio ? SHIPPING_COST : 0);
  }, [isContado, precioNegocio, sumarEnvio, aplicaEnvio, cuotaValueDynamic, product]);

  // Manejo del modal de imagen con zoom
  const handleImageClick = () => {
    setImageModalOpen(true);
    setImageZoom(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const handleCloseModal = () => {
    setImageModalOpen(false);
    setImageZoom(1);
    setImagePosition({ x: 0, y: 0 });
  };

  // Manejo de pinch-to-zoom para mobile
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      setLastTouchDistance(distance);
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && lastTouchDistance !== null) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      const scale = distance / lastTouchDistance;
      setImageZoom((prev) => Math.max(1, Math.min(5, prev * scale)));
      setLastTouchDistance(distance);
    }
  };

  const handleTouchEnd = () => {
    setLastTouchDistance(null);
  };

  useEffect(() => {
    if (!imageModalOpen) return;

  const handleWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setImageZoom((prev) => Math.max(1, Math.min(3, prev + delta)));
    };
    
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [imageModalOpen]);

  // Función helper para verificar si un producto está en favoritos
  const checkIfFavorite = (favList, product) => {
    if (!favList || !Array.isArray(favList)) return false;
    return favList.some(fav => {
      // Comparar por id o codigo (el que exista)
      if (product.id && fav.id) {
        return String(fav.id) === String(product.id);
      }
      if (product.codigo && fav.codigo) {
        return String(fav.codigo) === String(product.codigo);
      }
      return false;
    });
  };

  // Cargar favoritos desde localStorage al montar y sincronizar
  useEffect(() => {
    const loadFavorites = () => {
      try {
        const savedFavorites = localStorage.getItem('favorites');
        if (savedFavorites) {
          const favorites = JSON.parse(savedFavorites);
          // Eliminar duplicados por id o codigo
          const uniqueFavorites = favorites.filter((fav, index, self) =>
            index === self.findIndex(f => 
              (f.id && fav.id && String(f.id) === String(fav.id)) ||
              (f.codigo && fav.codigo && String(f.codigo) === String(fav.codigo))
            )
          );
          
          // Si había duplicados, actualizar localStorage
          if (uniqueFavorites.length !== favorites.length) {
            localStorage.setItem('favorites', JSON.stringify(uniqueFavorites));
          }
          
          const isProductFavorite = checkIfFavorite(uniqueFavorites, product);
          setIsFavorite(isProductFavorite);
        } else {
          setIsFavorite(false);
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
        setIsFavorite(false);
      }
    };

    loadFavorites();
    
    // Escuchar cambios en localStorage desde otras pestañas/ventanas
    const handleStorageChange = (e) => {
      if (e.key === 'favorites') {
        loadFavorites();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id, product.codigo]); // Solo necesitamos id y codigo, no el objeto completo

  // Manejar toggle de favoritos - CORREGIDO para evitar duplicados
  const handleToggleFavorite = (e) => {
    e.stopPropagation(); // Evitar que se abra el modal de imagen
    
    try {
      const savedFavorites = localStorage.getItem('favorites');
      let favorites = savedFavorites ? JSON.parse(savedFavorites) : [];
      
      // Eliminar duplicados existentes antes de agregar/quitar
      favorites = favorites.filter((fav, index, self) =>
        index === self.findIndex(f => 
          (f.id && fav.id && String(f.id) === String(fav.id)) ||
          (f.codigo && fav.codigo && String(f.codigo) === String(fav.codigo))
        )
      );
      
      const isCurrentlyFavorite = checkIfFavorite(favorites, product);
      
      if (isCurrentlyFavorite) {
        // Eliminar de favoritos - comparación robusta
        favorites = favorites.filter(fav => {
          if (product.id && fav.id) {
            return String(fav.id) !== String(product.id);
          }
          if (product.codigo && fav.codigo) {
            return String(fav.codigo) !== String(product.codigo);
          }
          return true; // Mantener si no coincide
        });
        setIsFavorite(false);
      } else {
        // Agregar a favoritos - asegurar que no esté ya
        if (!checkIfFavorite(favorites, product)) {
          favorites.push(product);
          setIsFavorite(true);
        }
      }

      localStorage.setItem('favorites', JSON.stringify(favorites));
      
      // Disparar evento personalizado para sincronizar entre componentes
      window.dispatchEvent(new CustomEvent('favoritesUpdated', { detail: favorites }));
      
      // Llamar al callback si existe (para notificaciones, etc.)
      if (onToggleFavorite) {
        onToggleFavorite(product, !isCurrentlyFavorite);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const imageUrl = product.imagen || '../descarga.png';

  return (
    <>
      <Card
        sx={{
          width: '100%',
          borderRadius: { xs: 2, sm: 3 },
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: '1px solid rgba(0,0,0,0.08)',
          backgroundColor: '#ffffff',
          position: 'relative',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)',
            transform: 'translateY(-2px)',
          },
        }}
      >
        {/* Borde navideño superior minimalista */}
        {IS_CHRISTMAS_MODE && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #c62828, #d4af37, #1b5e20)',
              borderRadius: '4px 4px 0 0',
              zIndex: 1,
            }}
          />
        )}
        {/* Imagen protagonista - Mobile first - Ratio optimizado */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            paddingTop: { 
              xs: isCompactMode ? '70%' : '80%', // Ratio más pequeño en modo compacto
              sm: '75%' 
            },
            overflow: 'hidden',
            backgroundColor: '#f5f5f5',
            cursor: 'pointer',
          }}
          onClick={handleImageClick}
        >
          {/* Ícono navideño minimalista (no afecta layout) */}
          {IS_CHRISTMAS_MODE && (
            <Box
              sx={{
                position: 'absolute',
                top: 10,
                left: 10,
                fontSize: '14px',
                opacity: 0.85,
                zIndex: 3,
                pointerEvents: 'none',
              }}
            >
              🎄
            </Box>
          )}

          {/* Badge de descuento si existe */}
          {product.discount && (
            <Chip
              label={product.discount}
              sx={{
                position: 'absolute',
                top: isCompactMode ? 8 : 12,
                left: isCompactMode ? 8 : 12,
                zIndex: 2,
                backgroundColor: '#FF385C',
                color: 'white',
                fontWeight: 600,
                fontSize: isCompactMode ? '0.65rem' : '0.75rem',
                height: isCompactMode ? 24 : 28,
                padding: isCompactMode ? '0 6px' : '0 8px',
              }}
            />
          )}

          {/* Botón de favoritos - Corazón sobre la imagen */}
          {onToggleFavorite && (
            <IconButton
              onClick={handleToggleFavorite}
              sx={{
                position: 'absolute',
                top: isCompactMode ? 8 : 12,
                right: isCompactMode ? 8 : 12,
                zIndex: 3,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                width: isCompactMode ? '32px' : { xs: '40px', sm: '44px' },
                height: isCompactMode ? '32px' : { xs: '40px', sm: '44px' },
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              {isFavorite ? (
                <Favorite 
                  sx={{ 
                    color: '#FF385C',
                    fontSize: isCompactMode ? '1.2rem' : { xs: '1.5rem', sm: '1.75rem' },
                  }} 
                />
              ) : (
                <FavoriteBorder 
                  sx={{ 
                    color: '#222222',
                    fontSize: isCompactMode ? '1.2rem' : { xs: '1.5rem', sm: '1.75rem' },
                  }} 
                />
              )}
            </IconButton>
          )}

          {/* Badges minimalistas */}
          <Box
            sx={{
              position: 'absolute',
              top: isCompactMode ? 8 : 12,
              left: isCompactMode ? 8 : 12,
              display: 'flex',
              flexDirection: 'column',
              gap: isCompactMode ? 0.5 : 1,
              zIndex: 2,
            }}
          >
            {/* Oferta relámpago - Administrable desde datos */}
            {product.oferta_relampago && 
             (product.oferta_relampago === 'si' || product.oferta_relampago === 'Sí' || product.oferta_relampago === true) && (
              <Chip
                label="⚡ Oferta relámpago"
                size="small"
                sx={{
                  backgroundColor: '#FF6B35',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  boxShadow: '0 2px 4px rgba(255, 107, 53, 0.3)',
                }}
              />
            )}
            
            {isNew && (
              <Chip
                label="Nuevo"
                size="small"
                sx={{
                  backgroundColor: '#000000',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: isCompactMode ? '0.6rem' : '0.7rem',
                  height: isCompactMode ? 20 : 24,
                  padding: isCompactMode ? '0 4px' : '0 6px',
                }}
              />
            )}
            {isBestSeller && (
              <Chip
                label="Más vendido"
                size="small"
                sx={{
                  backgroundColor: '#000000',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: isCompactMode ? '0.6rem' : '0.7rem',
                  height: isCompactMode ? 20 : 24,
                  padding: isCompactMode ? '0 4px' : '0 6px',
                }}
              />
            )}
            {stockLow && (
              <Chip
                label="Últimas unidades"
                size="small"
                sx={{
                  backgroundColor: '#FF385C',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: isCompactMode ? '0.6rem' : '0.7rem',
                  height: isCompactMode ? 20 : 24,
                  padding: isCompactMode ? '0 4px' : '0 6px',
                }}
              />
            )}
          </Box>

          {/* Icono de zoom en hover */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: 0,
              transition: 'opacity 0.3s',
              zIndex: 1,
              pointerEvents: 'none',
              '.MuiCard-root:hover &': {
                opacity: 1,
              },
            }}
          >
            <ZoomInIcon sx={{ color: 'white', fontSize: 40 }} />
          </Box>

          {/* Imagen */}
          <Box
            component="img"
            src={imageUrl}
            alt={product.descripcion || 'Producto'}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s',
              '.MuiCard-root:hover &': {
                transform: 'scale(1.05)',
              },
            }}
          />

          {/* Event badge si existe */}
          {product.event && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 12,
                left: 12,
                right: 12,
                backgroundColor: 'rgba(0,0,0,0.8)',
                color: 'white',
                padding: '8px 12px',
                borderRadius: 2,
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              {product.event}
            </Box>
          )}
        </Box>

        {/* Contenido - Estilo minimalista - Espacios reducidos */}
        <CardContent
          sx={{
            padding: isCompactMode ? '8px' : { xs: '12px', sm: '16px' },
            display: 'flex',
            flexDirection: 'column',
            gap: isCompactMode ? 0.25 : 0.5,
          }}
        >
          {/* Línea del producto */}
          <Typography
            variant="caption"
            sx={{
              color: '#717171',
              fontSize: isCompactMode ? '0.65rem' : '0.75rem',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: isCompactMode ? 0 : 0.25,
              lineHeight: 1.2,
            }}
          >
            Línea {product.linea}
          </Typography>

          {/* Título - Más grande y protagonista */}
          <Typography
            variant="h6"
            sx={{
              fontSize: isCompactMode ? '0.875rem' : { xs: '1.125rem', sm: '1.25rem' },
              fontWeight: 700,
              color: '#222222',
              lineHeight: 1.2,
              display: '-webkit-box',
              WebkitLineClamp: isCompactMode ? 2 : 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              marginBottom: 0,
              marginTop: 0,
              minHeight: isCompactMode ? '2.2rem' : { xs: '2.7rem', sm: '3rem' },
            }}
          >
            {product.descripcion}
          </Typography>

          {/* Precio destacado */}
          <Box sx={{ marginTop: isCompactMode ? 0.125 : 0.25 }}>
            {isContado ? (
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#717171',
                    fontSize: isCompactMode ? '0.7rem' : '0.875rem',
                    display: 'block',
                    marginBottom: isCompactMode ? 0.25 : 0.5,
                  }}
                >
                  Precio de Negocio
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontSize: isCompactMode ? '1.125rem' : { xs: '1.5rem', sm: '1.75rem' },
                    fontWeight: 800,
                    color: '#222222',
                    lineHeight: 1.2,
                  }}
                >
                  {formatPrice(precioFinal)}
                </Typography>
              </Box>
            ) : (selectedCuota || (showAllData && selectedCuotaHome)) && cuotaValueDynamic ? (
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#717171',
                    fontSize: isCompactMode ? '0.65rem' : '0.75rem',
                    display: 'block',
                    marginBottom: isCompactMode ? 0.125 : 0.25,
                  }}
                >
                  {showAllData && selectedCuotaHome
                    ? `${selectedCuotaHome.match(/\d+/)?.[0] || ''} cuotas sin interés`
                    : selectedCuota || 'Cuota'}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontSize: isCompactMode ? '1.125rem' : { xs: '1.5rem', sm: '1.75rem' },
                    fontWeight: 800,
                    color: '#222222',
                    lineHeight: 1.2,
                  }}
                >
                  {formatPrice(precioFinal)}
                </Typography>
              </Box>
            ) : showAllData && precioNegocio ? (
              // Cuando showAllData está activo y no hay cuota seleccionada, mostrar precio de negocio
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#717171',
                    fontSize: '0.875rem',
                    display: 'block',
                    marginBottom: 0.5,
                  }}
                >
                  Precio de Negocio
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontSize: { xs: '1.5rem', sm: '1.75rem' },
                    fontWeight: 800,
                    color: '#222222',
                    lineHeight: 1.2,
                  }}
                >
                  {formatPrice(precioNegocio)}
                </Typography>
              </Box>
            ) : (
              <Typography
                variant="body2"
                sx={{
                  color: '#717171',
                  fontSize: '0.875rem',
                }}
              >
                No disponible
              </Typography>
            )}

            {/* Aviso de envío */}
            {sumarEnvio && aplicaEnvio && (
              <Typography
                variant="caption"
                sx={{
                  color: '#FF385C',
                  fontSize: '0.75rem',
                  display: 'block',
                  marginTop: 0.5,
                }}
              >
                + Envío: {formatPrice(shippingCost)}
              </Typography>
            )}
          </Box>

          {/* Logos de bancos - Nueva lógica por catálogo */}
          {bankLogos && bankLogos.length > 0 ? (
            <BankLogosRow bankLogos={bankLogos} maxVisible={4} />
          ) : bankPromo ? (
            // Fallback al badge antiguo si no hay logos nuevos
            <BankPromoBadge bankPromo={bankPromo} />
          ) : null}

          {/* Sección de datos adicionales cuando showAllData es true */}
          {showAllData && (
            <Box
              sx={{
                marginTop: 1.5,
                padding: 2,
                backgroundColor: '#F9F9F9',
                borderRadius: 2,
                border: '1px solid rgba(0,0,0,0.08)',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: '#717171',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: 1.5,
                  display: 'block',
                }}
              >
                Información del Producto
              </Typography>

              {/* Precio de Negocio */}
              {product.precio_negocio && (
                <Typography
                  variant="body2"
                  sx={{
                    color: '#222222',
                    fontSize: '0.875rem',
                    marginBottom: 1,
                  }}
                >
                  Precio de Negocio: <strong>{formatPrice(parsePrice(product.precio_negocio))}</strong>
                </Typography>
              )}

              {/* PSVP Lista */}
              {product.psvp_lista && (
                <Typography
                  variant="body2"
                  sx={{
                    color: '#222222',
                    fontSize: '0.875rem',
                    marginBottom: 1,
                  }}
                >
                  PSVP Lista: <strong>{formatPrice(parsePrice(product.psvp_lista))}</strong>
                </Typography>
              )}

              {/* Puntos */}
              {product.puntos && (
                <Typography
                  variant="body2"
                  sx={{
                    color: '#222222',
                    fontSize: '0.875rem',
                    marginBottom: 1,
                  }}
                >
                  Puntos: <strong>{product.puntos}</strong>
                </Typography>
              )}

              {/* Precio Preferencial */}
              {product.precio_preferencial && (
                <Typography
                  variant="body2"
                  sx={{
                    color: '#222222',
                    fontSize: '0.875rem',
                    marginBottom: 1.5,
                  }}
                >
                  Precio Preferencial: <strong style={{ color: '#FF385C' }}>{formatPrice(parsePrice(product.precio_preferencial))}</strong>
                </Typography>
              )}

              <Divider sx={{ my: 1.5 }} />

              {/* Selector de cuotas - Todas las cuotas disponibles */}
              <FormControl fullWidth sx={{ marginTop: 1 }}>
                <InputLabel sx={{ fontSize: '0.875rem' }}>Selecciona una cuota</InputLabel>
                <Select
                  value={selectedCuotaHome || ''}
                  onChange={(e) => {
                    setSelectedCuotaHome(e.target.value);
                  }}
                  label="Selecciona una cuota"
                  sx={{ fontSize: '0.875rem' }}
                >
                  {[
                    'veinticuatro_sin_interes',
                    'veinte_sin_interes',
                    'dieciocho_sin_interes',
                    'doce_sin_interes',
                    'catorce_sin_interes',
                    'diez_sin_interes',
                    'nueve_sin_interes',
                    'seis_sin_interes',
                    'tres_sin_interes',
                  ].map((cuotaKey) => {
                    const cuotaValue = product[cuotaKey];
                    if (!cuotaValue || cuotaValue === 'NO') return null;
                    const parsedValue = parsePrice(cuotaValue);
                    if (parsedValue <= 0) return null;
                    
                    const cuotaNumero = cuotaKey.match(/\d+/);
                    const label = cuotaNumero
                      ? `${cuotaNumero[0]} cuotas sin interés`
                      : cuotaKey.replace(/_/g, ' ');
                    
                    return (
                      <MenuItem key={cuotaKey} value={cuotaKey}>
                        {label} de {formatPrice(parsedValue)}
                      </MenuItem>
                    );
                  }).filter(Boolean)}
                </Select>
              </FormControl>
            </Box>
          )}

          {/* Botones de acción - Mejor alineados y proporcionales */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1, // Reducido de 1.5 a 1
              marginTop: 1, // Reducido de 2 a 1
            }}
          >
            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                // Si hay cuota seleccionada en Home, incluirla en el producto
                const productToAdd = showAllData && selectedCuotaHome 
                  ? { 
                      ...product, 
                      selectedCuotaKey: selectedCuotaHome,
                      selectedCuotaValue: cuotaValueDynamic || cuotaValue,
                      selectedCuotaLabel: `${selectedCuotaHome.match(/\d+/)?.[0] || ''} cuotas sin interés`
                    }
                  : product;
                onAddToCart(productToAdd);
              }}
              disabled={showAllData && !selectedCuotaHome && !precioNegocio}
              sx={{
                backgroundColor: '#222222',
                color: 'white',
                padding: isCompactMode ? '10px 14px' : { xs: '14px 20px', sm: '16px 24px' },
                fontSize: isCompactMode ? '0.75rem' : { xs: '0.9375rem', sm: '1rem' },
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                minHeight: isCompactMode ? '36px' : 'auto',
                '&:hover': {
                  backgroundColor: '#000000',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                },
                '&:disabled': {
                  backgroundColor: '#cccccc',
                  color: '#888888',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {showAllData && !selectedCuotaHome && !precioNegocio 
                ? 'Selecciona una cuota' 
                : isCompactMode ? 'Agregar' : 'Agregar al carrito'}
            </Button>

            <Box sx={{ display: 'flex', gap: isCompactMode ? 1 : 1.5, alignItems: 'stretch' }}>
              <Button
                fullWidth
                variant="contained"
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `¡Quiero este Producto :)!\nProducto: ${product.descripcion}`
                )}`}
                target="_blank"
                startIcon={!isCompactMode ? <FaWhatsapp style={{ fontSize: '1rem' }} /> : null}
                sx={{
                  backgroundColor: '#25D366',
                  color: '#FFFFFF',
                  padding: isCompactMode ? '8px 10px' : { xs: '12px 16px', sm: '14px 20px' },
                  fontSize: isCompactMode ? '0.75rem' : { xs: '0.9375rem', sm: '1rem' },
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                  minHeight: isCompactMode ? '36px' : { xs: '44px', sm: '48px' },
                  boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)',
                  '&:hover': {
                    backgroundColor: '#1da851',
                    boxShadow: '0 4px 12px rgba(37, 211, 102, 0.4)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {isCompactMode ? 'Consultar' : 'WhatsApp'}
              </Button>

              {product.ficha_tecnica && (
                <Button
                  fullWidth
                  variant="outlined"
                  href={product.ficha_tecnica}
                  target="_blank"
                  sx={{
                    borderColor: '#717171',
                    color: '#222222',
                    padding: isCompactMode ? '8px 10px' : { xs: '12px 16px', sm: '14px 20px' },
                    fontSize: isCompactMode ? '0.75rem' : { xs: '0.9375rem', sm: '1rem' },
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 2,
                    minHeight: isCompactMode ? '36px' : { xs: '44px', sm: '48px' },
                    '&:hover': {
                      borderColor: '#222222',
                      backgroundColor: 'rgba(0,0,0,0.05)',
                      borderWidth: '2px',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {isCompactMode ? 'Ficha' : 'Ficha técnica'}
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Modal fullscreen para imagen */}
      <Dialog
        open={imageModalOpen}
        onClose={handleCloseModal}
        maxWidth={false}
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            backgroundColor: 'rgba(0,0,0,0.95)',
            margin: 0,
            maxWidth: '100%',
            maxHeight: '100%',
            width: '100%',
            height: '100%',
            borderRadius: 0,
          },
        }}
      >
        <DialogContent
          sx={{
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
            touchAction: 'none',
          }}
          onMouseMove={(e) => {
            if (imageZoom > 1 && e.touches === undefined) {
              setImagePosition({
                x: e.clientX - window.innerWidth / 2,
                y: e.clientY - window.innerHeight / 2,
              });
            }
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <IconButton
            onClick={handleCloseModal}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 10,
              color: 'white',
              backgroundColor: 'rgba(255,255,255,0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.3)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>

          <Box
            component="img"
            src={imageUrl}
            alt={product.descripcion}
            sx={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              transform: `scale(${imageZoom}) translate(${imagePosition.x * (imageZoom - 1) / 100}px, ${imagePosition.y * (imageZoom - 1) / 100}px)`,
              transition: imageZoom === 1 ? 'transform 0.3s' : 'none',
              cursor: imageZoom > 1 ? 'move' : 'zoom-in',
            }}
            onClick={() => {
              if (imageZoom === 1) {
                setImageZoom(2);
              } else {
                setImageZoom(1);
                setImagePosition({ x: 0, y: 0 });
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ModernProductCardAirbnb;

