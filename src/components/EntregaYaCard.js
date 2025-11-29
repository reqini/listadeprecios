import React, { useState } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogContent,
} from '@mui/material';
import {
  LocalShipping as ShippingIcon,
  ErrorOutline as LastUnitIcon,
  Favorite,
  FavoriteBorder,
  WhatsApp as WhatsAppIcon,
  ShoppingCart as ShoppingCartIcon,
  Close as CloseIcon,
  ZoomIn as ZoomInIcon,
} from '@mui/icons-material';
import { formatPrice, parsePrice } from '../utils/priceUtils';

/**
 * Card moderna y vistosa para productos de Entrega Ya
 * Diseño mobile-first con imagen grande y información clara
 */
const EntregaYaCard = ({
  product,
  onAddToCart,
  onToggleFavorite,
  isFavorite = false,
  onProductClick,
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);
  
  // Precio a mostrar (priorizar precio_negocio que es el de entregas-ya)
  const precio = product.precio_negocio || product.precio || product.precio_contado || product.precio_preferencial || 0;
  const precioFormateado = formatPrice(precio);
  
  // Encontrar la mejor cuota sin interés disponible
  const cuotasSinInteres = [
    { key: 'doce_sin_interes', label: '12 cuotas sin interés', num: 12 },
    { key: 'dieciocho_sin_interes', label: '18 cuotas sin interés', num: 18 },
    { key: 'nueve_sin_interes', label: '9 cuotas sin interés', num: 9 },
    { key: 'seis_sin_interes', label: '6 cuotas sin interés', num: 6 },
    { key: 'tres_sin_interes', label: '3 cuotas sin interés', num: 3 },
  ];
  
  let mejorCuota = null;
  for (const cuota of cuotasSinInteres) {
    const cuotaValue = product[cuota.key];
    if (cuotaValue && cuotaValue !== 'NO' && parsePrice(cuotaValue) > 0) {
      mejorCuota = {
        ...cuota,
        precio: parsePrice(cuotaValue),
        precioFormateado: formatPrice(parsePrice(cuotaValue)),
      };
      break; // Usar la primera cuota disponible (mayor número de cuotas)
    }
  }
  
  // Manejar clic en WhatsApp
  const handleWhatsApp = (e) => {
    e.stopPropagation();
    
    const message = `Hola! Me interesa este producto:\n\n*${product.nombre}*\n${product.descripcion ? product.descripcion.substring(0, 100) : ''}\n\nPrecio: ${precioFormateado}\n\n¿Tienen disponibilidad para entrega inmediata?`;
    const whatsappUrl = `https://wa.me/5491166666666?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };
  
  // Manejar clic en card
  const handleCardClick = () => {
    if (onProductClick) {
      onProductClick(product);
    }
  };
  
  // Manejar agregar al carrito
  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
  };
  
  // Manejar favorito
  const handleFavorite = (e) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(product);
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        cursor: onProductClick ? 'pointer' : 'default',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
        },
      }}
      onClick={handleCardClick}
    >
      {/* Contenedor de imagen con overlay de badges */}
      <Box sx={{ position: 'relative' }}>
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            height="240"
            image={!imageError && product.imagen ? product.imagen : 'https://via.placeholder.com/400x240?text=Sin+Imagen'}
            alt={product.nombre}
            onError={() => setImageError(true)}
            onClick={(e) => {
              e.stopPropagation();
              setImageModalOpen(true);
            }}
            sx={{
              objectFit: 'cover',
              backgroundColor: '#f5f5f5',
              minHeight: 240,
              cursor: 'pointer',
              transition: 'opacity 0.2s',
              '&:hover': {
                opacity: 0.9,
              },
            }}
          />
          {/* Botón de zoom sobre la imagen */}
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              setImageModalOpen(true);
            }}
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 1)',
              },
              zIndex: 2,
            }}
            size="small"
            aria-label="Ampliar imagen"
          >
            <ZoomInIcon />
          </IconButton>
        </Box>
        
        {/* Overlay con badges */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            right: 8,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 1,
            flexWrap: 'wrap',
          }}
        >
          {/* Badge "Entrega YA" */}
          <Chip
            icon={<ShippingIcon sx={{ fontSize: 18 }} />}
            label="Entrega YA"
            size="small"
            sx={{
              backgroundColor: '#34a853',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.75rem',
              height: 28,
              '& .MuiChip-icon': {
                color: 'white',
              },
            }}
          />
          
          {/* Badge "¡Última unidad!" */}
          {product.esUltimaUnidad && (
            <Chip
              icon={<LastUnitIcon sx={{ fontSize: 18 }} />}
              label="¡Última unidad!"
              size="small"
              sx={{
                backgroundColor: '#ea4335',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.75rem',
                height: 28,
                '& .MuiChip-icon': {
                  color: 'white',
                },
              }}
            />
          )}
        </Box>
        
        {/* Botón de favorito */}
        {onToggleFavorite && (
          <IconButton
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 1)',
              },
              zIndex: 2,
            }}
            onClick={handleFavorite}
            size="small"
            aria-label="Agregar a favoritos"
          >
            {isFavorite ? (
              <Favorite sx={{ color: '#ea4335' }} />
            ) : (
              <FavoriteBorder sx={{ color: '#666' }} />
            )}
          </IconButton>
        )}
        
        {/* Badge de categoría (si existe) */}
        {product.categoria && (
          <Chip
            label={product.categoria.toUpperCase()}
            size="small"
            sx={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              fontSize: '0.7rem',
              fontWeight: 600,
              height: 24,
            }}
          />
        )}
      </Box>

      {/* Contenido de la card */}
      <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
        {/* Nombre del producto - Título único y más grande */}
        <Typography
          variant="h5"
          component="h3"
          sx={{
            fontWeight: 700,
            fontSize: '1.25rem',
            mb: 0.5,
            lineHeight: 1.3,
            color: 'text.primary',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {product.nombre}
        </Typography>

        {/* Precio destacado - Reducir espacio entre título y precio */}
        <Box sx={{ mb: 2, mt: 1 }}>
          <Typography
            variant="h5"
            component="div"
            sx={{
              fontWeight: 800,
              color: '#000000',
              fontSize: '1.75rem',
            }}
          >
            {precioFormateado}
          </Typography>
          
          {/* Cuotas sin interés con Mercado Pago */}
          {mejorCuota && (
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Chip
                label={`Hasta ${mejorCuota.label}`}
                size="small"
                sx={{
                  backgroundColor: '#009ee3',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  height: 24,
                  alignSelf: 'flex-start',
                  '& .MuiChip-label': {
                    px: 1,
                  },
                }}
              />
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'primary.main',
                }}
              >
                <Typography
                  variant="caption"
                  component="span"
                  sx={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'primary.main',
                  }}
                >
                  {mejorCuota.precioFormateado} por mes con
                </Typography>
                <Box
                  component="img"
                  src="https://http2.mlstatic.com/frontend-assets/ui-commons/images/mercadopago-logo.svg"
                  alt="Mercado Pago"
                  sx={{
                    height: '16px',
                    width: 'auto',
                    verticalAlign: 'middle',
                    display: 'inline-block',
                  }}
                  onError={(e) => {
                    // Fallback a logo local si falla
                    if (e.target.src.includes('mercadopago-logo.svg')) {
                      e.target.src = '/logos-bancos/mercadopago.png';
                    } else {
                      e.target.style.display = 'none';
                    }
                  }}
                />
              </Box>
            </Box>
          )}
        </Box>

        {/* Stock info (opcional) */}
        {product.stock !== undefined && product.stock > 0 && (
          <Typography
            variant="caption"
            color="success.main"
            sx={{
              display: 'block',
              mb: 1,
              fontWeight: 600,
            }}
          >
            Stock disponible: {product.stock}
          </Typography>
        )}
      </CardContent>

      {/* Acciones */}
      <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
        <Button
          variant="contained"
          color="success"
          fullWidth
          startIcon={<WhatsAppIcon />}
          onClick={handleWhatsApp}
          sx={{
            fontWeight: 700,
            textTransform: 'none',
            py: 1.2,
            borderRadius: 2,
          }}
        >
          Consultar
        </Button>
        {onAddToCart && (
          <Tooltip title="Agregar al carrito">
            <IconButton
              variant="outlined"
              color="primary"
              onClick={handleAddToCart}
              sx={{
                border: '1px solid',
                borderColor: 'primary.main',
                borderRadius: 2,
                p: 1.5,
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                },
              }}
              aria-label="Agregar al carrito"
            >
              <ShoppingCartIcon />
            </IconButton>
          </Tooltip>
        )}
      </CardActions>

      {/* Modal para ampliar imagen */}
      <Dialog
        open={imageModalOpen}
        onClose={() => {
          setImageModalOpen(false);
          setImageZoom(1);
        }}
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
          }}
        >
          <IconButton
            onClick={() => {
              setImageModalOpen(false);
              setImageZoom(1);
            }}
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
            src={!imageError && product.imagen ? product.imagen : 'https://via.placeholder.com/800x600?text=Sin+Imagen'}
            alt={product.nombre}
            sx={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain',
              transform: `scale(${imageZoom})`,
              transition: 'transform 0.3s',
              cursor: imageZoom === 1 ? 'zoom-in' : 'zoom-out',
            }}
            onClick={() => {
              setImageZoom(imageZoom === 1 ? 2 : 1);
            }}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default EntregaYaCard;

