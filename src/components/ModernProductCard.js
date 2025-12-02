import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import {
  AddShoppingCart as AddCartIcon,
  Info as InfoIcon,
  TrendingUp as TrendingIcon,
  FlashOn as FlashIcon,
  Instagram as InstagramIcon,
} from "@mui/icons-material";
import { FaWhatsapp } from "react-icons/fa";
import { parsePrice, formatPrice } from "../utils/priceUtils";
import StoryGenerator from "./StoryGenerator";
// Animaciones simples con CSS

const ModernProductCard = ({ 
  product, 
  onAddToCart, 
  onShare,
  isNew = false,
  isPromo = false,
  isBestSeller = false,
  stock = null, // Stock disponible para la barra de progreso
}) => {
  const [selectedCuota, setSelectedCuota] = useState(null);
  const [stockProgress, setStockProgress] = useState(100);
  const [urgencyMessage, setUrgencyMessage] = useState("");
  const [openStoryDialog, setOpenStoryDialog] = useState(false);

  // Calcular stock y mensaje de urgencia
  useEffect(() => {
    if (stock !== null && stock !== undefined) {
      const progress = Math.min((stock / 10) * 100, 100); // Asumiendo 10 como stock máximo
      setStockProgress(progress);
      
      if (stock <= 3) {
        setUrgencyMessage("🚨 Últimas 3 unidades");
      } else if (stock <= 5) {
        setUrgencyMessage("⚡ Pocas unidades disponibles");
      } else {
        setUrgencyMessage("");
      }
    }
  }, [stock]);

  // Obtener mejor cuota disponible
  useEffect(() => {
    const cuotasPrioridad = [
      "doce_sin_interes",
      "dieciocho_sin_interes",
      "nueve_sin_interes",
      "seis_sin_interes",
      "tres_sin_interes",
    ];

    for (const cuota of cuotasPrioridad) {
      const cuotaValue = product[cuota];
      if (cuotaValue && cuotaValue !== "NO" && parsePrice(cuotaValue) > 0) {
        setSelectedCuota({
          key: cuota,
          value: cuotaValue,
          label: cuota.replace(/_/g, " ").replace(/sin interes/g, "cuotas sin interés"),
        });
        break;
      }
    }
  }, [product]);

  const getCuotaNumber = (cuotaKey) => {
    const match = cuotaKey?.match(/\d+/);
    return match ? match[0] : "";
  };

  const precioNegocio = parsePrice(product.precio_negocio || 0);
  const cuotaPrice = selectedCuota ? parsePrice(selectedCuota.value) : precioNegocio;

  // Generar chips de financiación disponibles
  const getAvailableFinancingChips = () => {
    const chips = [];
    const cuotasMap = {
      "doce_sin_interes": "12 cuotas",
      "dieciocho_sin_interes": "18 cuotas",
      "veinticuatro_sin_interes": "24 cuotas",
      "nueve_sin_interes": "9 cuotas",
      "seis_sin_interes": "6 cuotas",
      "tres_sin_interes": "Ahora 3",
    };

    Object.entries(cuotasMap).forEach(([key, label]) => {
      const value = product[key];
      if (value && value !== "NO" && parsePrice(value) > 0) {
        chips.push({
          key,
          label,
          price: formatPrice(parsePrice(value)),
        });
      }
    });

    return chips.slice(0, 3); // Mostrar máximo 3 chips
  };

  const financingChips = getAvailableFinancingChips();

  const handleShare = () => {
    if (onShare) {
      onShare(product, selectedCuota);
    } else {
      // Compartir por WhatsApp
      const mensaje = `🛍️ ${product.descripcion}\n💳 ${selectedCuota?.label || "Precio de negocio"}: ${formatPrice(cuotaPrice)}\n\n¡Aprovechá esta oferta!`;
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(mensaje)}`, '_blank');
    }
  };

  const handleShareStory = () => {
    setOpenStoryDialog(true);
  };

  const handleCloseStoryDialog = () => {
    setOpenStoryDialog(false);
  };

  return (
    <Box
      sx={{
        width: '100%',
        marginBottom: '16px',
        animation: 'fadeIn 0.3s ease-in',
        '@keyframes fadeIn': {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      <Card
        sx={{
          width: '100%',
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
          },
        }}
      >
        {/* Badges superiores */}
        <Box sx={{ position: 'relative', width: '100%' }}>
          <CardMedia
            component="img"
            height="280"
            image={product.imagen || "../descarga.png"}
            alt={product.descripcion}
            sx={{
              objectFit: 'cover',
              width: '100%',
            }}
            loading="lazy"
          />
          
          {/* Badges superpuestos */}
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            {isNew && (
              <Chip
                icon={<FlashIcon />}
                label="NUEVO"
                size="small"
                sx={{
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  fontWeight: 'bold',
                }}
              />
            )}
            {isPromo && product.discount && (
              <Chip
                label={product.discount}
                size="small"
                sx={{
                  backgroundColor: '#FF5722',
                  color: 'white',
                  fontWeight: 'bold',
                }}
              />
            )}
            {isBestSeller && (
              <Chip
                icon={<TrendingIcon />}
                label="MÁS VENDIDO"
                size="small"
                sx={{
                  backgroundColor: '#FFC107',
                  color: '#000',
                  fontWeight: 'bold',
                }}
              />
            )}
          </Box>

          {/* Barra de progreso de stock */}
          {stockProgress < 100 && (
            <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 1.5, bgcolor: 'rgba(0,0,0,0.7)' }}>
              <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold', display: 'block', mb: 0.5 }}>
                {urgencyMessage || "Últimas unidades"}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={stockProgress}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: 'rgba(255,255,255,0.3)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: stockProgress < 30 ? '#f44336' : '#FFC107',
                  },
                }}
              />
            </Box>
          )}
        </Box>

        <CardContent sx={{ p: 2.5 }}>
          {/* Título y línea */}
          <Typography
            variant="h6"
            sx={{
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              fontWeight: 700,
              mb: 1,
              lineHeight: 1.3,
              minHeight: '3rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {product.descripcion}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.85rem' }}>
            Línea <strong>{product.linea}</strong>
          </Typography>

          {/* Chips de financiación */}
          {financingChips.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {financingChips.map((chip) => (
                <Chip
                  key={chip.key}
                  label={`${chip.label} $${chip.price}`}
                  size="small"
                  sx={{
                    backgroundColor: '#E3F2FD',
                    color: '#1976D2',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                  }}
                />
              ))}
            </Box>
          )}

          {/* Precio destacado */}
          <Box sx={{ mb: 2 }}>
            {selectedCuota ? (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                  Desde
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    color: 'primary.main',
                    fontSize: { xs: '1.5rem', sm: '1.75rem' },
                  }}
                >
                  {formatPrice(cuotaPrice)}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                  en {getCuotaNumber(selectedCuota.key)} cuotas sin interés
                </Typography>
              </Box>
            ) : (
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: 'primary.main',
                  fontSize: { xs: '1.5rem', sm: '1.75rem' },
                }}
              >
                {formatPrice(precioNegocio)}
              </Typography>
            )}
          </Box>

          {/* Acciones */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<AddCartIcon />}
              onClick={() => onAddToCart(product)}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none',
              }}
            >
              Agregar al carrito
            </Button>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                fullWidth
                variant="contained"
                size="medium"
                startIcon={<FaWhatsapp />}
                onClick={handleShare}
                sx={{
                  backgroundColor: '#25D366',
                  color: '#FFFFFF',
                  borderColor: '#25D366',
                  boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)',
                  '&:hover': {
                    backgroundColor: '#1da851',
                    borderColor: '#1da851',
                    boxShadow: '0 4px 12px rgba(37, 211, 102, 0.4)',
                  },
                  textTransform: 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                WhatsApp
              </Button>
              
              <Button
                fullWidth
                variant="outlined"
                size="medium"
                startIcon={<InstagramIcon />}
                onClick={handleShareStory}
                sx={{
                  background: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)',
                  color: 'white',
                  borderColor: 'transparent',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #e6851e 0%,#d55a2e 25%,#c71f35 50%,#b71d58 75%,#a71470 100%)',
                  },
                  textTransform: 'none',
                }}
              >
                Story
              </Button>
              
              {product.ficha_tecnica && (
                <Tooltip title="Ficha técnica">
                  <IconButton
                    href={product.ficha_tecnica}
                    target="_blank"
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            {/* Dialog para Story Generator */}
            <Dialog 
              open={openStoryDialog} 
              onClose={handleCloseStoryDialog}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle>
                Crear Story para Instagram
              </DialogTitle>
              <DialogContent>
                <StoryGenerator
                  product={product}
                  cuota={selectedCuota?.label || "Precio especial"}
                  precio={formatPrice(cuotaPrice)}
                  onClose={handleCloseStoryDialog}
                />
              </DialogContent>
            </Dialog>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ModernProductCard;
