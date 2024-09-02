import React, { useState } from 'react';
import { Card, CardContent, CardMedia, Typography, Button, CardActions, Divider, MenuItem, Select, FormControl, InputLabel, Switch, FormControlLabel } from '@mui/material';
import { FaWhatsapp } from 'react-icons/fa';

const cuotaSimple = require('../src/assets/cuotas-simples.webp');

const Product = ({ product, onAddToCart, catalog = false }) => {
  const [selectedCuota, setSelectedCuota] = useState('');
  const [planCanje, setPlanCanje] = useState(false);

  const handleCuotaChange = (event) => setSelectedCuota(event.target.value);
  const handlePlanCanjeChange = (event) => setPlanCanje(event.target.checked);

  const parsePrice = (priceString) => {
    if (!priceString || typeof priceString !== 'string') return 0;
    const normalizedPrice = priceString.replace(/[^0-9]/g, '').trim(); // Remueve cualquier carácter que no sea un número
    return parseInt(normalizedPrice, 10) || 0;
  };

  const applyPlanCanjeDiscount = (amount) => {
    const discountedAmount = amount - 30000;
    return discountedAmount > 0 ? discountedAmount : 0;
  };

  const formatPrice = (price) => Math.round(price).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const getCuotaPrice = (psvpPrice, cuotaPrice) => {
    const parsedPSVPPrice = parsePrice(psvpPrice);
    const parsedCuotaPrice = parsePrice(cuotaPrice);

    const discountedPSVP = planCanje ? applyPlanCanjeDiscount(parsedPSVPPrice) : parsedPSVPPrice;

    return formatPrice(parsedCuotaPrice > 0 ? (discountedPSVP / (parsedPSVPPrice / parsedCuotaPrice)) : 0);
  };

  const getDiscountedPrice = (price) => {
    const parsedPrice = parsePrice(price);
    return formatPrice(planCanje ? applyPlanCanjeDiscount(parsedPrice) : parsedPrice);
  };

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
        {['dieciocho_sin_interes', 'doce_sin_interes', 'diez_sin_interes', 'nueve_sin_interes', 'seis_sin_interes', 'tres_sin_interes'].map((cuota, idx) =>
          product[cuota] && (
            <div className='flex-center' key={idx}>
              {product.linea !== 'Bazar' && product.linea !== 'Complementos' && product.linea !== 'Repuestos' && (
                <img src={cuotaSimple} alt='sin limites' height="15" />
              )}
              <Typography variant='span' fontSize={13} fontStyle={'italic'}>
                <b style={{ color: 'green' }}>{`${cuota.replace(/_/g, ' ')} de: `}<i style={{ color: 'black' }}>{getCuotaPrice(product.psvp_lista, product[cuota])}</i></b>
              </Typography>
            </div>
          )
        )}
        <FormControl fullWidth variant="outlined" sx={{ my: 2 }}>
          <InputLabel>Selecciona Cuotas</InputLabel>
          <Select value={selectedCuota} onChange={handleCuotaChange} label="Selecciona Cuotas">
            {['dieciocho_sin_interes', 'doce_sin_interes', 'diez_sin_interes', 'nueve_sin_interes', 'seis_sin_interes', 'tres_sin_interes'].map((cuota, idx) =>
              product[cuota] && (
                <MenuItem key={idx} value={getCuotaPrice(product.psvp_lista, product[cuota])}>
                  {`${cuota.replace(/_/g, ' ')} de: ${getCuotaPrice(product.psvp_lista, product[cuota])}`}
                </MenuItem>
              )
            )}
          </Select>
        </FormControl>
        {(product.linea === 'Bazar' || product.linea === 'Complementos' || product.linea === 'Repuestos') && (
          <Typography variant='span' fontSize={13} fontStyle={'italic'} margin={'3px 0'}>
            <i style={{ color: 'red' }}>Solo con promos bancarias</i>
          </Typography>
        )}
        <FormControlLabel control={<Switch checked={planCanje} onChange={handlePlanCanjeChange} />} label="Activar Plan Canje" />
      </CardContent>
      <CardActions sx={{ display: 'flex', flexDirection: 'column' }}>
        {!catalog && (
          <Button fullWidth onClick={() => onAddToCart(product)} variant='contained' size="medium" color="primary">
            Agregar al carrito
          </Button>
        )}
        <Button
          fullWidth
          href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`¡Hola!, Te envío el valor de tu próxima Essen!\nProducto: ${product.descripcion}\nCuota: ${selectedCuota}`)}`}
          target="_blank"
          variant="contained"
          size="medium"
          color="primary"
          sx={{ my: 1, backgroundColor: '#25D366', color: 'white' }}
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
