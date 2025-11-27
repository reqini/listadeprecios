import React from 'react';
import { Box, Typography } from '@mui/material';

/**
 * Componente para mostrar una fila de mini logos de bancos
 * Se muestra debajo del precio o cuotas en las cards
 * Estilo minimalista con miniaturas uniformes
 */
const BankLogosRow = ({ bankLogos = [], maxVisible = 4 }) => {
  if (!bankLogos || bankLogos.length === 0) return null;

  const visibleLogos = bankLogos.slice(0, maxVisible);
  const remainingCount = bankLogos.length - maxVisible;

  const getBankLogoUrl = (logoUrl, bancoNombre) => {
    // Si hay logo_url directo, usarlo
    if (logoUrl && logoUrl.trim()) {
      const url = logoUrl.trim();
      if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) {
        return url;
      }
      // Si es un nombre de archivo, buscar en carpeta de logos
      return `/logos-bancos/${url}`;
    }
    
    // Mapeo de nombres de bancos a logos locales (fallback robusto)
    const bankLogoMap = {
      // Nación
      'BANCO DE LA NACION': '/logos-bancos/nacion.png',
      'BANCO DE LA NACION ARGENTINA': '/logos-bancos/nacion.png',
      'NACION': '/logos-bancos/nacion.png',
      'NACIÓN': '/logos-bancos/nacion.png',
      // Galicia
      'BANCO DE GALICIA': '/logos-bancos/galicia.png',
      'GALICIA': '/logos-bancos/galicia.png',
      // Santander
      'SANTANDER': '/logos-bancos/santander.png',
      'BANCO SANTANDER': '/logos-bancos/santander.png',
      // BBVA
      'BBVA': '/logos-bancos/bbva.png',
      'BBVA FRANCES': '/logos-bancos/bbva.png',
      // Macro
      'MACRO': '/logos-bancos/macro.png',
      'BANCO MACRO': '/logos-bancos/macro.png',
      // Patagonia
      'PATAGONIA': '/logos-bancos/patagonia.png',
      'BANCO PATAGONIA': '/logos-bancos/patagonia.png',
      // Naranja
      'NARANJA': '/logos-bancos/naranja.png',
      'TARJETA NARANJA': '/logos-bancos/naranja.png',
      // Otras tarjetas comunes
      'VISA': '/logos-bancos/visa.png',
      'MASTERCARD': '/logos-bancos/mastercard.png',
      'MERCADOPAGO': '/logos-bancos/mercadopago.png',
      'MP': '/logos-bancos/mercadopago.png',
    };
    
    if (!bancoNombre) return null;
    
    const normalizedName = bancoNombre.toString().toUpperCase().trim();
    
    // Buscar coincidencia exacta o parcial
    const logoKey = Object.keys(bankLogoMap).find(key => {
      const keyNormalized = key.replace('BANCO ', '').trim();
      return (
        normalizedName === key ||
        normalizedName.includes(keyNormalized) ||
        keyNormalized.includes(normalizedName) ||
        normalizedName.replace(/[^A-Z]/g, '') === keyNormalized.replace(/[^A-Z]/g, '')
      );
    });
    
    if (logoKey) {
      return bankLogoMap[logoKey];
    }
    
    // Último intento: buscar por nombre parcial común
    if (normalizedName.includes('NACION')) return '/logos-bancos/nacion.png';
    if (normalizedName.includes('GALICIA')) return '/logos-bancos/galicia.png';
    if (normalizedName.includes('SANTANDER')) return '/logos-bancos/santander.png';
    if (normalizedName.includes('MACRO')) return '/logos-bancos/macro.png';
    if (normalizedName.includes('PATAGONIA')) return '/logos-bancos/patagonia.png';
    
    return null;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        marginTop: 1.5,
        paddingTop: 1.5,
        borderTop: '1px solid rgba(0,0,0,0.08)',
        flexWrap: 'wrap',
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontSize: '0.75rem',
          color: '#222222',
          fontWeight: 600,
          marginRight: 0.5,
        }}
      >
        Tenés cuotas con —
      </Typography>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          flexWrap: 'wrap',
        }}
      >
        {visibleLogos.map((banco, index) => {
          const logoUrl = getBankLogoUrl(
            banco.logo_url || banco.logoUrl,
            banco.nombre || banco.banco || banco.name
          );

          if (!logoUrl) return null;

          return (
            <Box
              key={index}
              component="img"
              src={logoUrl}
              alt={banco.nombre || banco.banco || banco.name || `Banco ${index + 1}`}
              onError={(e) => {
                e.target.style.display = 'none'; // Ocultar si falla la carga
              }}
              sx={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                objectFit: 'cover',
                marginLeft: '6px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.18)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.1)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                },
              }}
              title={banco.nombre || banco.banco || banco.name || ''}
            />
          );
        })}

        {remainingCount > 0 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: { xs: 40, sm: 44 },
              height: { xs: 24, sm: 28 },
              backgroundColor: '#F5F5F5',
              borderRadius: 1,
              paddingX: 0.5,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.65rem',
                fontWeight: 600,
                color: '#717171',
              }}
            >
              +{remainingCount}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default BankLogosRow;

