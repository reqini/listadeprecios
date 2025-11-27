import React from 'react';
import { Box, Typography } from '@mui/material';

/**
 * Badge minimalista para mostrar promoción de banco
 * Muestra logo del banco y texto de la promo
 */
const BankPromoBadge = ({ bankPromo }) => {
  if (!bankPromo || !bankPromo.activa) return null;

  const getBankLogo = (bancoNombre, logoUrl) => {
    if (logoUrl) {
      return logoUrl;
    }
    
    // Mapeo de nombres de bancos a logos locales (fallback)
    const bankLogoMap = {
      'BANCO DE LA NACION': '/logos-bancos/nacion.png',
      'BANCO DE GALICIA': '/logos-bancos/galicia.png',
      'SANTANDER': '/logos-bancos/santander.png',
      'BBVA': '/logos-bancos/bbva.png',
      'MACRO': '/logos-bancos/macro.png',
      'PATAGONIA': '/logos-bancos/patagonia.png',
      'NARANJA': '/logos-bancos/naranja.png',
    };
    
    const normalizedName = (bancoNombre || '').toUpperCase();
    const logoKey = Object.keys(bankLogoMap).find(key => 
      normalizedName.includes(key.replace('BANCO ', ''))
    );
    
    return logoKey ? bankLogoMap[logoKey] : null;
  };

  const logoUrl = getBankLogo(bankPromo.banco, bankPromo.logo_url);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        padding: '8px 12px',
        backgroundColor: '#F5F5F5',
        borderRadius: 2,
        border: '1px solid rgba(0,0,0,0.08)',
        marginTop: 1,
      }}
    >
      {logoUrl && (
        <Box
          component="img"
          src={logoUrl}
          alt={bankPromo.banco || 'Banco'}
          onError={(e) => {
            e.target.style.display = 'none'; // Ocultar si falla la carga
          }}
          sx={{
            width: 32,
            height: 20,
            objectFit: 'contain',
          }}
        />
      )}
      <Typography
        variant="caption"
        sx={{
          fontSize: '0.75rem',
          fontWeight: 600,
          color: '#222222',
        }}
      >
        {bankPromo.descripcion_promo || bankPromo.descripcion || 'Promo especial'}
      </Typography>
    </Box>
  );
};

export default BankPromoBadge;

