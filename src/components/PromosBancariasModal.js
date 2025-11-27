import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { getBankLogosForCatalogo } from '../utils/catalogoPromosAPI';

/**
 * Modal/Bottom-sheet para mostrar promociones bancarias activas
 * Se abre desde el FAB de promos bancarias
 */
const PromosBancariasModal = ({ open, onClose, catalogoRuta = '/home' }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [bankPromos, setBankPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      loadPromos();
    }
  }, [open, catalogoRuta]);

  const loadPromos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar promos desde la API existente
      const promos = await getBankLogosForCatalogo(catalogoRuta);
      
      // También intentar cargar todas las promos activas desde el endpoint general
      try {
        const { default: axios } = await import('../utils/axios');
        const response = await axios.get('/api/catalogo-promos');
        if (response.data && Array.isArray(response.data)) {
          // Obtener todas las promos activas de todos los catálogos
          const todasPromos = response.data
            .filter(promo => promo.activa !== false && promo.activa !== 'no')
            .flatMap(promo => promo.bancos || [])
            .filter((banco, index, self) => 
              index === self.findIndex(b => 
                (b.id || b.nombre) === (banco.id || banco.nombre)
              )
            );
          
          // Combinar con las promos del catálogo específico
          const promosCombinadas = [...promos, ...todasPromos].filter((banco, index, self) => 
            index === self.findIndex(b => 
              (b.id || b.nombre) === (banco.id || banco.nombre)
            )
          );
          
          setBankPromos(promosCombinadas);
        } else {
          setBankPromos(promos);
        }
      } catch (apiError) {
        // Si falla, usar solo las promos del catálogo
        setBankPromos(promos);
      }
    } catch (err) {
      console.error('Error cargando promos bancarias:', err);
      setError('No se pudieron cargar las promociones bancarias');
      setBankPromos([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          maxHeight: isMobile ? '85vh' : '70vh',
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
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              color: '#222222',
            }}
          >
            💳 Promociones Bancarias
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{
              color: '#717171',
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ marginBottom: 2 }} />

        {/* Contenido */}
        <Box
          sx={{
            maxHeight: { xs: 'calc(85vh - 120px)', sm: 'calc(70vh - 120px)' },
            overflowY: 'auto',
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : bankPromos.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No hay promociones bancarias activas en este momento
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Las promociones se configuran desde el Panel de Administración
              </Typography>
            </Box>
          ) : (
            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2, fontSize: '0.875rem' }}
              >
                Promociones disponibles para este catálogo:
              </Typography>
              
              {/* Lista de bancos con promos */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                {bankPromos.map((banco, index) => (
                  <Box
                    key={banco.id || banco.nombre || index}
                    sx={{
                      padding: 2,
                      borderRadius: 2,
                      border: '1px solid rgba(0,0,0,0.08)',
                      backgroundColor: '#F9F9F9',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      {/* Logo del banco */}
                      {banco.logo_url && (
                        <Box
                          component="img"
                          src={banco.logo_url}
                          alt={banco.nombre || banco.banco || banco.name || 'Banco'}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            objectFit: 'cover',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                          }}
                        />
                      )}
                      
                      {/* Info del banco */}
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            fontSize: '1rem',
                            marginBottom: 0.5,
                          }}
                        >
                          {banco.nombre || banco.banco || banco.name || 'Banco'}
                        </Typography>
                        {banco.descripcion_promo && (
                          <Typography
                            variant="body2"
                            sx={{
                              color: theme.palette.primary.main,
                              fontWeight: 500,
                            }}
                          >
                            {banco.descripcion_promo}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>

              {/* Nota informativa */}
              <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="caption">
                  Estas promociones se aplican automáticamente al seleccionar productos en el catálogo.
                  Los logos de los bancos aparecen en las cards de producto cuando hay promociones activas.
                </Typography>
              </Alert>
            </Box>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default PromosBancariasModal;

