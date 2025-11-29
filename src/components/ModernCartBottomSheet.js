import React, { useState, useEffect } from "react";
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
import { Close as CloseIcon, Add as AddIcon, Remove as RemoveIcon } from "@mui/icons-material";
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
  const [userClosedManually, setUserClosedManually] = useState(false);

  const getCuotaSeleccionada = (product) => {
    // Si el producto tiene una cuota seleccionada desde Home (selectedCuotaValue), usarla
    if (product.selectedCuotaValue !== undefined && product.selectedCuotaValue !== null && product.selectedCuotaValue > 0) {
      return product.selectedCuotaValue;
    }
    
    // Si tiene selectedCuotaKey, buscar el valor del producto
    if (product.selectedCuotaKey && product[product.selectedCuotaKey]) {
      const raw = product[product.selectedCuotaKey];
      if (raw && typeof raw === "string" && raw.toLowerCase() !== "no") {
        const parsed = parsePrice(raw);
        if (parsed > 0) return parsed;
      }
    }
    
    // Fallback: usar precio_negocio o precio directo (para productos de entregas-ya)
    if (product.precio_negocio) {
      const precioNum = typeof product.precio_negocio === 'number' ? product.precio_negocio : parsePrice(String(product.precio_negocio));
      if (precioNum > 0) return precioNum;
    }
    
    if (product.precio) {
      const precioNum = typeof product.precio === 'number' ? product.precio : parsePrice(String(product.precio));
      if (precioNum > 0) return precioNum;
    }
    
    // Último fallback: usar el cuotaKey por defecto
    const raw = product[cuotaKey];
    if (!raw || typeof raw !== "string" || raw.toLowerCase() === "no") return 0;
    return parsePrice(raw);
  };

  /**
   * Obtiene el texto de cuotas dinámicamente desde el producto
   * Prioridad: selectedCuotaLabel > selectedCuotaKey > cuotasTexto prop
   * MEJORADO: Ahora siempre muestra la cuota correcta del producto
   */
  const getCuotaTexto = (product) => {
    // Si el producto tiene un label de cuota seleccionada, usarlo (más confiable)
    if (product.selectedCuotaLabel && product.selectedCuotaLabel.trim()) {
      return product.selectedCuotaLabel;
    }
    
    // Si tiene selectedCuotaKey, intentar derivar el texto
    if (product.selectedCuotaKey) {
      // Mapeo completo de keys a textos comunes
      const cuotaKeyMap = {
        'tres_sin_interes': '3 cuotas sin interés',
        'seis_sin_interes': '6 cuotas sin interés',
        'nueve_sin_interes': '9 cuotas sin interés',
        'diez_sin_interes': '10 cuotas sin interés',
        'doce_sin_interes': '12 cuotas sin interés',
        'catorce_sin_interes': '14 cuotas sin interés',
        'quince_sin_interes': '15 cuotas sin interés',
        'dieciocho_sin_interes': '18 cuotas sin interés',
        'veinte_sin_interes': '20 cuotas sin interés',
        'veinticuatro_sin_interes': '24 cuotas sin interés',
        // Con interés (si aplica)
        'tres_con_interes': '3 cuotas con interés',
        'seis_con_interes': '6 cuotas con interés',
      };
      
      if (cuotaKeyMap[product.selectedCuotaKey]) {
        return cuotaKeyMap[product.selectedCuotaKey];
      }
      
      // Si el key tiene formato "X_sin_interes", extraer el número
      const matchSinInteres = product.selectedCuotaKey.match(/(\d+)_sin_interes/);
      if (matchSinInteres) {
        return `${matchSinInteres[1]} cuotas sin interés`;
      }
      
      // Si el key tiene formato "X_con_interes", extraer el número
      const matchConInteres = product.selectedCuotaKey.match(/(\d+)_con_interes/);
      if (matchConInteres) {
        return `${matchConInteres[1]} cuotas con interés`;
      }
    }
    
    // Fallback: usar el prop cuotasTexto solo si no hay información del producto
    // Esto mantiene compatibilidad pero prioriza la información del producto
    return cuotasTexto || 'Cuotas disponibles';
  };

  const calcularTotal = () => {
    return cart.reduce((acc, item) => {
      const cantidad = item.cantidad || 1;
      return acc + (getCuotaSeleccionada(item) * cantidad);
    }, 0);
  };

  const total = calcularTotal();

  const limpiarCarrito = () => {
    setCart([]);
    // El carrito se cerrará automáticamente por el useEffect cuando cart.length === 0
  };

  const eliminarItem = (codigo) => {
    setCart((prev) => {
      const nuevoCart = prev.filter((item) => item.codigo !== codigo);
      // Si queda vacío, el useEffect se encargará de cerrarlo
      return nuevoCart;
    });
  };

  const actualizarCantidad = (codigo, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      eliminarItem(codigo);
      return;
    }
    
    setCart((prev) =>
      prev.map((item) =>
        item.codigo === codigo
          ? { ...item, cantidad: nuevaCantidad }
          : item
      )
    );
  };

  // Función para cerrar el carrito
  const handleClose = () => {
    setOpen(false);
    setUserClosedManually(true); // Marcar que el usuario cerró manualmente
  };

  // Función para abrir el carrito
  const handleOpen = () => {
    setOpen(true);
    setUserClosedManually(false); // Resetear el flag al abrir manualmente
  };

  // Abrir carrito automáticamente cuando se agrega un producto
  // Cerrar automáticamente cuando se vacía (con pequeña animación)
  useEffect(() => {
    if (cart.length > 0 && !open && !userClosedManually) {
      // Abrir cuando hay productos y está cerrado, SOLO si el usuario no lo cerró manualmente
      // Pequeño delay para mejor UX (evita abrir/cerrar muy rápido)
      const timer = setTimeout(() => {
        handleOpen();
        setUserClosedManually(false); // Resetear el flag al abrir
      }, 100);
      return () => clearTimeout(timer);
    } else if (cart.length === 0 && open) {
      // Cerrar cuando está vacío (Drawer de MUI maneja la animación)
      setOpen(false);
      setUserClosedManually(false); // Resetear el flag cuando se vacía
    }
  }, [cart.length, open, userClosedManually]); // Incluir dependencias

  // Cerrar con tecla ESC
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && open) {
        handleClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscKey);
      // Bloquear scroll del body cuando el carrito está abierto
      document.body.style.overflow = 'hidden';
    } else {
      // Restaurar scroll cuando se cierra
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  const generarLinkWhatsApp = () => {
    if (cart.length === 0) {
      return "https://api.whatsapp.com/send?text=No%20hay%20productos%20en%20el%20carrito";
    }

    const mensaje = cart
      .map((item) => {
        const cantidad = item.cantidad || 1;
        const precioUnitario = formatPrice(getCuotaSeleccionada(item));
        const precioTotal = formatPrice(getCuotaSeleccionada(item) * cantidad);
        const cantidadTexto = cantidad > 1 ? ` x${cantidad}` : '';
        const cuotaTextoItem = getCuotaTexto(item);
        return `🛍️ ${item.descripcion}${cantidadTexto} - ${cantidad > 1 ? `${precioUnitario} c/u = ${precioTotal}` : precioUnitario} en ${cuotaTextoItem}`;
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
            onClick={handleOpen}
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
        onClose={handleClose}
        PaperProps={{
          sx: {
            maxHeight: isMobile ? '90vh' : '80vh',
            borderTopLeftRadius: isMobile ? 16 : 0,
            borderTopRightRadius: isMobile ? 16 : 0,
          },
        }}
        ModalProps={{
          keepMounted: true,
          // Permitir cerrar con overlay/backdrop click y ESC
          disableEscapeKeyDown: false,
          // Asegurar que el backdrop cierre el drawer
          onBackdropClick: handleClose,
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
        {/* Header con mejor jerarquía visual */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 2,
            paddingBottom: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AddShoppingCartIcon 
              sx={{ 
                color: theme.palette.primary.main,
                fontSize: { xs: '1.5rem', sm: '1.75rem' },
              }} 
            />
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '1.125rem', sm: '1.25rem' },
                  color: '#222222',
                  lineHeight: 1.2,
                }}
              >
                Tu carrito
              </Typography>
              {cart.length > 0 && (
                <Typography
                  variant="caption"
                  sx={{
                    color: '#717171',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                  }}
                >
                  {cart.length} {cart.length === 1 ? 'producto' : 'productos'}
                </Typography>
              )}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {cart.length > 0 && (
              <Box sx={{ textAlign: 'right' }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#717171',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    display: 'block',
                    marginBottom: 0.25,
                  }}
                >
                  Total
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '1.125rem', sm: '1.25rem' },
                    color: theme.palette.primary.main,
                    lineHeight: 1.2,
                  }}
                >
                  {formatPrice(total)}
                </Typography>
              </Box>
            )}
            <IconButton
              onClick={handleClose}
              sx={{
                color: '#717171',
                padding: 1,
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  color: '#222222',
                },
                transition: 'all 0.2s ease',
              }}
              aria-label="Cerrar carrito"
              title="Cerrar (ESC)"
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
          {/* Siempre mostrar contenido, incluso si está vacío */}
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

                  {/* Info del producto - Mejorada jerarquía */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    {/* Nombre del producto */}
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: '0.9375rem', sm: '1rem' },
                        marginBottom: 0.75,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        color: '#222222',
                        lineHeight: 1.4,
                      }}
                    >
                      {item.descripcion}
                    </Typography>
                    
                    {/* Información de cuotas - Más visible y destacada */}
                    <Box 
                      sx={{ 
                        marginBottom: 1,
                        padding: '6px 10px',
                        backgroundColor: 'rgba(0, 0, 0, 0.03)',
                        borderRadius: 1,
                        display: 'inline-block',
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.palette.primary.main,
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          letterSpacing: '0.02em',
                        }}
                      >
                        💳 {getCuotaTexto(item)}
                      </Typography>
                    </Box>
                    
                    {/* Precio - Mejor estructura */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 700,
                            color: theme.palette.primary.main,
                            fontSize: { xs: '1rem', sm: '1.125rem' },
                          }}
                        >
                          {formatPrice(getCuotaSeleccionada(item))}
                        </Typography>
                        {(item.cantidad || 1) > 1 && (
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              sx={{
                                color: '#717171',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                              }}
                            >
                              x {item.cantidad || 1}
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: 700,
                                color: '#222222',
                                fontSize: { xs: '1rem', sm: '1.125rem' },
                                marginLeft: 'auto',
                              }}
                            >
                              = {formatPrice(getCuotaSeleccionada(item) * (item.cantidad || 1))}
                            </Typography>
                          </>
                        )}
                      </Box>
                      {(item.cantidad || 1) > 1 && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#717171',
                            fontSize: '0.75rem',
                            fontStyle: 'italic',
                          }}
                        >
                          Precio unitario: {formatPrice(getCuotaSeleccionada(item))}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Controles de cantidad y eliminar */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    {/* Controles de cantidad */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, border: '1px solid rgba(0,0,0,0.12)', borderRadius: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => actualizarCantidad(item.codigo, (item.cantidad || 1) - 1)}
                        sx={{
                          padding: '4px',
                          color: '#717171',
                          '&:hover': {
                            backgroundColor: 'rgba(0,0,0,0.05)',
                          },
                        }}
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <Typography
                        variant="body2"
                        sx={{
                          minWidth: '24px',
                          textAlign: 'center',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                        }}
                      >
                        {item.cantidad || 1}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => actualizarCantidad(item.codigo, (item.cantidad || 1) + 1)}
                        sx={{
                          padding: '4px',
                          color: '#717171',
                          '&:hover': {
                            backgroundColor: 'rgba(0,0,0,0.05)',
                          },
                        }}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    
                    {/* Botón eliminar */}
                    <IconButton
                      size="small"
                      onClick={() => eliminarItem(item.codigo)}
                      sx={{
                        color: '#717171',
                        padding: '4px',
                        '&:hover': {
                          color: '#FF385C',
                          backgroundColor: 'rgba(255, 56, 92, 0.1)',
                        },
                      }}
                      title="Eliminar producto"
                    >
                      <FaTrashAlt size={14} />
                    </IconButton>
                  </Box>
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

        {/* Footer con acciones - Solo mostrar si hay productos */}
        {cart.length > 0 && (
          <>
            <Divider sx={{ marginBottom: 2 }} />
            
            {/* Resumen de totales - Más claro */}
            <Box 
              sx={{ 
                backgroundColor: '#f8f8f8',
                borderRadius: 2,
                padding: 2,
                marginBottom: 2,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 1 }}>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    color: '#222222',
                    fontSize: '0.9375rem',
                  }}
                >
                  Total
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: theme.palette.primary.main,
                    fontSize: { xs: '1.25rem', sm: '1.5rem' },
                  }}
                >
                  {formatPrice(total)}
                </Typography>
              </Box>
              <Typography
                variant="caption"
                sx={{
                  color: '#717171',
                  fontSize: '0.75rem',
                  display: 'block',
                  textAlign: 'right',
                }}
              >
                {cart.reduce((acc, item) => acc + (item.cantidad || 1), 0)} {cart.reduce((acc, item) => acc + (item.cantidad || 1), 0) === 1 ? 'producto' : 'productos'}
              </Typography>
            </Box>
            
            {/* Botones de acción */}
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
                  padding: { xs: '14px 24px', sm: '16px 28px' },
                  fontSize: { xs: '0.9375rem', sm: '1rem' },
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)',
                  '&:hover': {
                    backgroundColor: '#1da851',
                    boxShadow: '0 4px 12px rgba(37, 211, 102, 0.4)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                Enviar por WhatsApp
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={limpiarCarrito}
                sx={{
                  borderColor: '#d0d0d0',
                  color: '#717171',
                  padding: { xs: '12px 24px', sm: '14px 28px' },
                  fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                  fontWeight: 500,
                  textTransform: 'none',
                  borderRadius: 2,
                  '&:hover': {
                    borderColor: '#FF385C',
                    color: '#FF385C',
                    backgroundColor: 'rgba(255, 56, 92, 0.05)',
                  },
                  transition: 'all 0.2s ease',
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


