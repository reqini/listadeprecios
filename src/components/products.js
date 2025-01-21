import React, { useState, useCallback } from 'react';
import {
  Card, CardContent, CardMedia, Typography, Button, CardActions, Divider,
  MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { FaWhatsapp } from 'react-icons/fa';
import { parsePrice, formatPrice } from '../utils/priceUtils';

const cuotaSimple = require('../../src/assets/cuotas-simples.webp');

const Product = ({ product, onAddToCart, catalog = false }) => {
  
  const [selectedCuota, setSelectedCuota] = useState('');

  const handleCuotaChange = useCallback((event) => setSelectedCuota(event.target.value), []);

  // Función para mapear los nombres de las cuotas a números
  const parseCuotaString = (cuotaString) => {
    const stringToNumberMap = {
      uno: 1,
      dos: 2,
      tres: 3,
      cuatro: 4,
      cinco: 5,
      seis: 6,
      siete: 7,
      ocho: 8,
      nueve: 9,
      diez: 10,
      once: 11,
      doce: 12,
      trece: 13,
      catorce: 14,
      quince: 15,
      dieciseis: 16,
      diecisiete: 17,
      dieciocho: 18,
      diecinueve: 19,
      veinte: 20,
      veintiuno: 21,
      veintidos: 22,
      veintitres: 23,
      veinticuatro: 24,
    };

    const match = cuotaString?.match(/^[a-z]+/i); // Encuentra la parte inicial del string
    return match ? stringToNumberMap[match[0].toLowerCase()] || null : null;
  };

  const getCuotaPrice = (psvpPrice, cuotaPrice) => {
    const parsedPSVPPrice = parsePrice(psvpPrice);
    const parsedCuotaPrice = parsePrice(cuotaPrice);
    return formatPrice(parsedCuotaPrice > 0 ? parsedPSVPPrice / (parsedPSVPPrice / parsedCuotaPrice) : 0);
  };

  const getDiscountedPrice = (price) => {
    const parsedPrice = parsePrice(price);
    return formatPrice(parsedPrice);
  };

  const cuotas = ['veinticuatro_sin_interes', 'veinte_sin_interes', 'dieciocho_sin_interes', 'doce_sin_interes', 'diez_sin_interes', 'nueve_sin_interes', 'seis_sin_interes', 'tres_sin_interes'];

  return (
    <Card sx={{ maxWidth: 600, paddingBottom: '12px' }} className='card-product'>
      {product.discount && <div className='descuento'>{product.discount}</div>}
      <CardMedia component="img" height="220" image={product.imagen || '../descarga.png'} alt="Producto" />
      <CardContent style={{ display: 'flex', flexDirection: 'column' }}>
        <Typography className='titulo' gutterBottom variant="h6" fontSize={18}>{product.descripcion}</Typography>
        <Typography variant='body2' fontSize={12} fontStyle={'italic'}>Línea <b>{product.linea}</b></Typography>
        <Typography variant="body2" color="text.secondary">Precio de Negocio: <b>{getDiscountedPrice(product.precio_negocio)}</b></Typography>
        <Typography variant="body2" color="text.secondary">PSVP lista: <b>{getDiscountedPrice(product.psvp_lista)}</b></Typography>
        <Typography variant="body2" color="text.secondary">Puntos: <b>{product.puntos}</b></Typography>
        <Divider sx={{ my: 2 }} />
        {cuotas.map((cuota, idx) => {
          const cuotaValue = product[cuota];

          // Validar que cuotaValue sea válida
          const isValidCuota =
            cuotaValue &&
            cuotaValue !== 'NO' &&
            cuotaValue !== '$0' &&
            cuotaValue !== '0' &&
            cuotaValue !== 0 &&
            !isNaN(parseFloat(cuotaValue.replace(/[^\d.]/g, '')));

          if (isValidCuota) {
            return (
              <div className='flex-center' key={idx}>
                {!['Bazar', 'Complementos', 'Repuestos'].includes(product.linea) && (
                  <img src={cuotaSimple} alt='sin limites' height="15" />
                )}
                <Typography variant='span' fontSize={13} fontStyle={'italic'}>
                  <b style={{ color: 'green' }}>
                    {`${cuota.replace(/_/g, ' ')} de: `}
                    <i style={{ color: 'black' }}>{getCuotaPrice(product.psvp_lista, product[cuota])}</i>
                  </b>
                </Typography>
              </div>
            );
          }

          return null;
        })}

        <FormControl fullWidth variant="outlined" sx={{ my: 2 }}>
          <InputLabel>Selecciona Cuotas</InputLabel>
          <Select value={selectedCuota} onChange={handleCuotaChange} label="Selecciona Cuotas">
            <MenuItem value={getDiscountedPrice(product.precio_negocio)}>
              {`Precio de Negocio: ${getDiscountedPrice(product.precio_negocio)}`}
            </MenuItem>
            {cuotas.map((cuota, idx) =>
              product[cuota] && product[cuota] !== 'NO' && (
                <MenuItem key={idx} value={getCuotaPrice(product.psvp_lista, product[cuota])}>
                  {`${cuota.replace(/_/g, ' ')} de: ${getCuotaPrice(product.psvp_lista, product[cuota])}`}
                </MenuItem>
              )
            )}
          </Select>
        </FormControl>
        {['Bazar', 'Complementos', 'Repuestos'].includes(product.linea) ? (
          <Typography variant="body2" color="red">Solo con promos bancarias</Typography>
        ) : null}
      </CardContent>

      <CardActions sx={{ display: 'flex', flexDirection: 'column' }}>
        {!catalog && (
          <Button fullWidth onClick={() => onAddToCart(product)} variant='contained' size="medium" color="primary">
            Agregar al carrito
          </Button>
        )}
        <Button
          fullWidth
          href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`¡Hola! Te envío el valor de tu próxima Essen:
            Producto: ${product.descripcion}
            Cuota: ${
              selectedCuota
                ? selectedCuota === getDiscountedPrice(product.precio_negocio)
                  ? `${selectedCuota} en 1 cuota`
                  : `${selectedCuota} en ${
                      cuotas.reduce((match, cuota) => {
                        const cuotaValue = product[cuota];

                        // Validar que la cuota sea válida
                        const isValidCuota =
                          cuotaValue &&
                          cuotaValue !== "NO" &&
                          cuotaValue !== "$0" &&
                          cuotaValue !== 0 &&
                          !isNaN(parseFloat(cuotaValue.replace(/[^\d.]/g, "")));

                        if (
                          isValidCuota &&
                          getCuotaPrice(product.psvp_lista, cuotaValue) === selectedCuota
                        ) {
                          return parseCuotaString(cuota) || "sin coincidencia"; // Convertir el nombre a número
                        }
                        return match;
                      }, "sin coincidencia")
                    } sin interés`
                : "Cuota no seleccionada"
            }`)}`}
          target="_blank"
          variant="contained"
          size="medium"
          color="primary"
          sx={{ my: 1, backgroundColor: "#25D366", color: "white" }}
          disabled={!selectedCuota}
          startIcon={selectedCuota ? <FaWhatsapp /> : null}
        >
          Compartir
        </Button>
        {product.ficha_tecnica ? (
          <Button fullWidth target='_blank' href={product.ficha_tecnica} variant="outlined" size="medium" color="primary">
            Ficha técnica
          </Button>
        ) : (
          <Button fullWidth variant="disabled" size="medium" color="primary">
            Sin ficha técnica
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default Product;
