import React from 'react';
import { Chip } from '@mui/material';
import { IS_CHRISTMAS_MODE } from '../../config/christmasConfig';

/**
 * Badge navideño reutilizable para cards de producto.
 * Se mantiene muy sutil para no romper la estética general.
 */
const ChristmasBadge = ({ variant = 'gift', sx = {} }) => {
  if (!IS_CHRISTMAS_MODE) return null;

  const label =
    variant === 'special'
      ? '🎁 Especial Navidad'
      : '✨ Ideal para regalar';

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        background:
          'linear-gradient(135deg, rgba(212,175,55,0.9), rgba(255,255,255,0.95))',
        color: '#5D4037',
        fontWeight: 700,
        fontSize: '0.7rem',
        borderRadius: 999,
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
        border: '1px solid rgba(255,255,255,0.9)',
        ...sx,
      }}
    />
  );
};

export default ChristmasBadge;


