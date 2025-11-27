import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { FaWhatsapp } from 'react-icons/fa';
import { Close as CloseIcon, ZoomIn as ZoomInIcon, Favorite, FavoriteBorder } from '@mui/icons-material';
import { formatPrice } from '../utils/priceUtils';

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
}) => {
  const [shippingCost, setShippingCost] = useState(21036);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [touchStart, setTouchStart] = useState(null);
  const [lastTouchDistance, setLastTouchDistance] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

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

  const cuotaKey = cuotasMap[selectedCuota];
  let cuotaValue = null;

  // Validar y procesar cuota seleccionada (MANTENER LÓGICA ORIGINAL)
  if (cuotaKey && product[cuotaKey] && product[cuotaKey] !== 'NO') {
    try {
      cuotaValue = parseFloat(product[cuotaKey].replace(/[^0-9.-]/g, '')) || null;
    } catch {
      cuotaValue = null;
    }
  }

  // Procesar precio de negocio (MANTENER LÓGICA ORIGINAL)
  const precioNegocio = product.precio_negocio
    ? parseFloat(product.precio_negocio.replace(/[^0-9.-]/g, '')) || null
    : null;

  const SHIPPING_COST = 18697;

  // Determinar precio final según el contexto (MANTENER LÓGICA ORIGINAL)
  const precioFinal = isContado
    ? (precioNegocio || 0) + (sumarEnvio && aplicaEnvio ? SHIPPING_COST : 0)
    : (cuotaValue || parseFloat(product.psvp_lista?.replace(/[^0-9.-]/g, '')) || 0) +
      (sumarEnvio && aplicaEnvio ? SHIPPING_COST : 0);

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

  const handleWheel = (e) => {
    if (imageModalOpen) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setImageZoom((prev) => Math.max(1, Math.min(3, prev + delta)));
    }
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
      setTouchStart({ distance, centerX: (touch1.clientX + touch2.clientX) / 2, centerY: (touch1.clientY + touch2.clientY) / 2 });
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
    setTouchStart(null);
  };

  useEffect(() => {
    if (imageModalOpen) {
      window.addEventListener('wheel', handleWheel, { passive: false });
      return () => window.removeEventListener('wheel', handleWheel);
    }
  }, [imageModalOpen]);

  // Cargar favoritos desde localStorage al montar
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      try {
        const favorites = JSON.parse(savedFavorites);
        const isProductFavorite = favorites.some(fav => fav.id === product.id || fav.codigo === product.codigo);
        setIsFavorite(isProductFavorite);
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    }
  }, [product.id, product.codigo]);

  // Manejar toggle de favoritos
  const handleToggleFavorite = (e) => {
    e.stopPropagation(); // Evitar que se abra el modal de imagen
    
    const savedFavorites = localStorage.getItem('favorites');
    let favorites = savedFavorites ? JSON.parse(savedFavorites) : [];
    
    const existingIndex = favorites.findIndex(fav => 
      (fav.id && fav.id === product.id) || (fav.codigo && fav.codigo === product.codigo)
    );

    if (existingIndex >= 0) {
      // Eliminar de favoritos
      favorites = favorites.filter((_, index) => index !== existingIndex);
      setIsFavorite(false);
    } else {
      // Agregar a favoritos
      favorites.push(product);
      setIsFavorite(true);
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
    
    // Llamar al callback si existe (para notificaciones, etc.)
    if (onToggleFavorite) {
      onToggleFavorite(product, !isFavorite);
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
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)',
            transform: 'translateY(-2px)',
          },
        }}
      >
        {/* Imagen protagonista - Mobile first - Ratio optimizado */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            paddingTop: { xs: '80%', sm: '75%' }, // Ratio 4:5 en mobile, 4:3 en desktop - Más proporcionado
            overflow: 'hidden',
            backgroundColor: '#f5f5f5',
            cursor: 'pointer',
          }}
          onClick={handleImageClick}
        >
          {/* Badge de descuento si existe */}
          {product.discount && (
            <Chip
              label={product.discount}
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                zIndex: 2,
                backgroundColor: '#FF385C',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.75rem',
                height: 28,
              }}
            />
          )}

          {/* Botón de favoritos - Corazón sobre la imagen */}
          {onToggleFavorite && (
            <IconButton
              onClick={handleToggleFavorite}
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                zIndex: 3,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                width: { xs: '40px', sm: '44px' },
                height: { xs: '40px', sm: '44px' },
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
                    fontSize: { xs: '1.5rem', sm: '1.75rem' },
                  }} 
                />
              ) : (
                <FavoriteBorder 
                  sx={{ 
                    color: '#222222',
                    fontSize: { xs: '1.5rem', sm: '1.75rem' },
                  }} 
                />
              )}
            </IconButton>
          )}

          {/* Badges minimalistas */}
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              zIndex: 2,
            }}
          >
            {isNew && (
              <Chip
                label="Nuevo"
                size="small"
                sx={{
                  backgroundColor: '#000000',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.7rem',
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
                  fontSize: '0.7rem',
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
                  fontSize: '0.7rem',
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

        {/* Contenido - Estilo minimalista */}
        <CardContent
          sx={{
            padding: { xs: '16px', sm: '20px' },
            display: 'flex',
            flexDirection: 'column',
            gap: 1, // Reducido de 1.5 a 1 para acercar elementos
          }}
        >
          {/* Línea del producto */}
          <Typography
            variant="caption"
            sx={{
              color: '#717171',
              fontSize: '0.875rem',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: 0.5, // Reducido para acercar al título
            }}
          >
            Línea {product.linea}
          </Typography>

          {/* Título - Más grande y protagonista */}
          <Typography
            variant="h6"
            sx={{
              fontSize: { xs: '1.25rem', sm: '1.375rem' }, // Aumentado de 1.125/1.25 a 1.25/1.375
              fontWeight: 700,
              color: '#222222',
              lineHeight: 1.3,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              marginBottom: 0, // Sin margen inferior para acercar más
              marginTop: 0, // Eliminado margen superior para acercar más a línea
              minHeight: { xs: '3.2rem', sm: '3.6rem' }, // Ajustado por el tamaño mayor
            }}
          >
            {product.descripcion}
          </Typography>

          {/* Precio destacado */}
          <Box sx={{ marginTop: 0 }}> {/* Sin margen superior para acercar máximo */}
            {isContado ? (
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
                  {formatPrice(precioFinal)}
                </Typography>
              </Box>
            ) : selectedCuota && cuotaValue ? (
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
                  {selectedCuota}
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
                  {formatPrice(precioFinal)}
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

          {/* Botones de acción - Mejor alineados y proporcionales */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              marginTop: 2,
            }}
          >
            <Button
              fullWidth
              variant="contained"
              onClick={() => onAddToCart(product)}
              sx={{
                backgroundColor: '#222222',
                color: 'white',
                padding: { xs: '14px 20px', sm: '16px 24px' },
                fontSize: { xs: '0.9375rem', sm: '1rem' },
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                '&:hover': {
                  backgroundColor: '#000000',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Agregar al carrito
            </Button>

            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'stretch' }}>
              <Button
                fullWidth
                variant="outlined"
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `¡Quiero este Producto :)!\nProducto: ${product.descripcion}`
                )}`}
                target="_blank"
                startIcon={<FaWhatsapp />}
                sx={{
                  borderColor: '#25D366',
                  color: '#25D366',
                  padding: { xs: '12px 16px', sm: '14px 20px' },
                  fontSize: { xs: '0.9375rem', sm: '1rem' },
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                  minHeight: { xs: '44px', sm: '48px' },
                  '&:hover': {
                    borderColor: '#1da851',
                    backgroundColor: 'rgba(37, 211, 102, 0.08)',
                    borderWidth: '2px',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                WhatsApp
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
                    padding: { xs: '12px 16px', sm: '14px 20px' },
                    fontSize: { xs: '0.9375rem', sm: '1rem' },
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 2,
                    minHeight: { xs: '44px', sm: '48px' },
                    '&:hover': {
                      borderColor: '#222222',
                      backgroundColor: 'rgba(0,0,0,0.05)',
                      borderWidth: '2px',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Ficha técnica
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

