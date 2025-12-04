import React from 'react';
import { IS_CHRISTMAS_MODE } from '../../config/christmasConfig';
import SantaSleighOverlay from './SantaSleighOverlay';

/**
 * Wrapper genérico para habilitar decoraciones navideñas.
 * - Puede montar el trineo de Papá Noel y otras decoraciones globales.
 * - No modifica la lógica de negocio, solo la capa visual.
 */
const ChristmasWrapper = ({
  children,
  showSanta = false,
}) => {
  return (
    <>
      {IS_CHRISTMAS_MODE && showSanta && <SantaSleighOverlay />}
      {children}
    </>
  );
};

export default ChristmasWrapper;


