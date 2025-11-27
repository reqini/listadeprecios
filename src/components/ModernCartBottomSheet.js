import React, { useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  Button,
  Divider,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { FaWhatsapp, FaTrashAlt } from "react-icons/fa";
import { Close as CloseIcon } from "@mui/icons-material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import { formatPrice, parsePrice } from "../utils/priceUtils";

/**
 * Carrito moderno con bottom sheet en mobile
 * Mantiene TODA la lógica del carrito original
 */
const ModernCartBottomSheet = ({
  cart,
  setCart,
  cuotaKey = "tres_sin_interes",
  cuotasTexto = "3 cuotas",
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(false);

  const getCuotaSeleccionada = (product) => {
    const raw = product[cuotaKey];
    if (!raw || typeof raw !== "string" || raw.toLowerCase() === "no") return 0;
    return parsePrice(raw);
  };

  const calcularTotal = () => {
    return cart.reduce((acc, item) => acc + getCuotaSeleccionada(item), 0);
  };

  const total = calcularTotal();

  const limpiarCarrito = () => {
    setCart([]);
  };

  const eliminarItem = (codigo) => {
    setCart((prev) => prev.filter((item) => item.codigo !== codigo));
  };

  const generarLinkWhatsApp = () => {
    if (cart.length === 0) {
      return "https://api.whatsapp.com/send?text=No%20hay%20productos%20en%20el%20carrito";
    }

    const mensaje = cart
      .map((item) => {
        const precio = formatPrice(getCuotaSeleccionada(item));
        return `🛍️ ${item.descripcion} - ${precio} en ${cuotasTexto}`;
      })
      .join("%0A");

    return `https://api.whatsapp.com/send?text=✨ Hola me gustaria consultar por:%0A${mensaje}%0A%0ATotal: ${formatPrice(
      total
    )}`;
  };

  // Botón flotante para abrir el carrito - SIEMPRE visible cuando hay productos
  return (
    <>
      {/* Botón flotante - siempre visible cuando hay productos */}
      {cart.length > 0 && !open && (
        <Box
          sx={{
            position: 'fixed',
            bottom: isMobile ? 20 : 20,
            right: isMobile ? 20 : 'calc(50% + 300px)',
            zIndex: 1000,
          }}
        >
          <Button
            variant="contained"
            onClick={() => setOpen(true)}
            startIcon={<AddShoppingCartIcon />}
            sx={{
              borderRadius: 3,
              padding: { xs: '14px 24px', sm: '16px 28px' },
              fontSize: { xs: '0.875rem', sm: '1rem' },
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
              backgroundColor: theme.palette.primary.main,
              '&:hover': {
                boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                Tu selección
              </Typography>
              <Box
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.3)',
                  borderRadius: 2,
                  padding: '4px 10px',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                }}
              >
                {formatPrice(total)}
              </Box>
            </Box>
          </Button>
        </Box>
      )}

      {/* Bottom sheet / Drawer - solo se abre cuando open es true */}
      <Drawer
        anchor="bottom"
        open={open}
        onClose={() => setOpen(false)}
      PaperProps={{
        sx: {
          maxHeight: isMobile ? '90vh' : '80vh',
          borderTopLeftRadius: isMobile ? 16 : 0,
          borderTopRightRadius: isMobile ? 16 : 0,
        },
      }}
      ModalProps={{
        keepMounted: true,
      }}
    >
      <Box
        sx={{
          padding: { xs: 2, sm: 3 },
          maxWidth: { xs: '100%', sm: 600 },
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AddShoppingCartIcon sx={{ color: theme.palette.primary.main }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                fontSize: { xs: '1.125rem', sm: '1.25rem' },
              }}
            >
              Tu selección
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.125rem', sm: '1.25rem' },
                color: theme.palette.primary.main,
              }}
            >
              {formatPrice(total)}
            </Typography>
            <IconButton
              onClick={() => setOpen(false)}
              sx={{
                color: '#717171',
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        <Divider sx={{ marginBottom: 2 }} />

        {/* Lista de productos */}
        <Box
          sx={{
            maxHeight: { xs: 'calc(90vh - 220px)', sm: 'calc(80vh - 220px)' },
            overflowY: 'auto',
            marginBottom: 2,
          }}
        >
          {cart.length > 0 ? (
            cart.map((item, index) => (
              <Box key={item.codigo}>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    paddingY: 2,
                  }}
                >
                  {/* Imagen del producto */}
                  <Box
                    component="img"
                    src={item.imagen || '../descarga.png'}
                    alt={item.descripcion}
                    sx={{
                      width: 80,
                      height: 80,
                      objectFit: 'cover',
                      borderRadius: 2,
                      backgroundColor: '#f5f5f5',
                    }}
                  />

                  {/* Info del producto */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: '0.9375rem', sm: '1rem' },
                        marginBottom: 0.5,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {item.descripcion}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#717171',
                        fontSize: '0.875rem',
                        marginBottom: 0.5,
                      }}
                    >
                      {cuotasTexto}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 600,
                        color: theme.palette.primary.main,
                      }}
                    >
                      {formatPrice(getCuotaSeleccionada(item))}
                    </Typography>
                  </Box>

                  {/* Botón eliminar */}
                  <IconButton
                    onClick={() => eliminarItem(item.codigo)}
                    sx={{
                      color: '#717171',
                      '&:hover': {
                        color: '#FF385C',
                        backgroundColor: 'rgba(255, 56, 92, 0.1)',
                      },
                    }}
                  >
                    <FaTrashAlt />
                  </IconButton>
                </Box>
                {index < cart.length - 1 && <Divider />}
              </Box>
            ))
          ) : (
            <Box
              sx={{
                textAlign: 'center',
                padding: { xs: 4, sm: 6 },
              }}
            >
              <AddShoppingCartIcon
                sx={{
                  fontSize: 64,
                  color: '#d0d0d0',
                  marginBottom: 2,
                }}
              />
              <Typography
                variant="body1"
                sx={{
                  color: '#717171',
                  fontSize: '1rem',
                }}
              >
                No hay productos en tu selección
              </Typography>
            </Box>
          )}
        </Box>

        {/* Footer con acciones */}
        {cart.length > 0 && (
          <>
            <Divider sx={{ marginBottom: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Button
                fullWidth
                variant="contained"
                href={generarLinkWhatsApp()}
                target="_blank"
                startIcon={<FaWhatsapp />}
                sx={{
                  backgroundColor: '#25D366',
                  color: 'white',
                  padding: { xs: '12px 24px', sm: '14px 28px' },
                  fontSize: { xs: '0.9375rem', sm: '1rem' },
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: '#1da851',
                  },
                }}
              >
                Enviar por WhatsApp
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={limpiarCarrito}
                sx={{
                  borderColor: '#717171',
                  color: '#222222',
                  padding: { xs: '10px 24px', sm: '12px 28px' },
                  fontSize: { xs: '0.9375rem', sm: '1rem' },
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                  '&:hover': {
                    borderColor: '#222222',
                    backgroundColor: 'rgba(0,0,0,0.05)',
                  },
                }}
              >
                Limpiar carrito
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Drawer>
    </>
  );
};

export default ModernCartBottomSheet;

