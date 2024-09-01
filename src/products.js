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
    const normalizedPrice = priceString.replace(/[^0-9.-]+/g, '').trim();
    return parseFloat(normalizedPrice) || 0;
  };

  const applyPlanCanjeDiscount = (amount) => {
    const discountedAmount = amount - 30000;
    return discountedAmount > 0 ? discountedAmount : 0;
  };

  const formatPrice = (price) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(price);

  const getPriceWithDiscount = () => {
    const price = parsePrice(product.precio_negocio);
    return planCanje ? applyPlanCanjeDiscount(price) : price;
  };

  const calculateCuota = (months) => {
    const priceWithDiscount = getPriceWithDiscount();
    return formatPrice(priceWithDiscount / months);
  };

  return (
    <Card sx={{ maxWidth: 600, paddingBottom: '12px' }} className='card-product'>
      {product.discount && <div className='descuento'>{product.discount}</div>}
      <CardMedia component="img" height="220" image={product.imagen || '../descarga.png'} alt="Producto" />
      <CardContent style={{ display: 'flex', flexDirection: 'column' }}>
        <Typography className='titulo' gutterBottom variant="h6" fontSize={18}>{product.descripcion}</Typography>
        <Typography variant='body2' fontSize={12} fontStyle={'italic'}>Línea <b>{product.linea}</b></Typography>
        <Typography variant="body2" color="text.secondary">Precio de Negocio: <b>{formatPrice(getPriceWithDiscount())}</b></Typography>
        <Typography variant="body2" color="text.secondary">PSVP lista: <b>{product.psvp_lista}</b></Typography>
        <Typography variant="body2" color="text.secondary">Puntos: <b>{product.puntos}</b></Typography>
        <Divider sx={{ my: 2 }} />
        {product.dieciocho_sin_interes && (
          <div className='flex-center'>
            <img src={cuotaSimple} alt='sin limites' height="15" />
            <Typography variant='span' fontSize={13} fontStyle={'italic'}>
              <b style={{ color: 'green' }}>18 sin interés de: <i style={{ color: 'black' }}>{calculateCuota(18)}</i></b>
            </Typography>
          </div>
        )}
        {product.doce_sin_interes && (
          <div className='flex-center'>
            <img src={cuotaSimple} alt='sin limites' height="15" />
            <Typography variant='span' fontSize={13} fontStyle={'italic'}>
              <b style={{ color: 'green' }}>12 sin interés de: <i style={{ color: 'black' }}>{calculateCuota(12)}</i></b>
            </Typography>
          </div>
        )}
        {product.diez_sin_interes && (
          <div className='flex-center'>
            <img src={cuotaSimple} alt='sin limites' height="15" />
            <Typography variant='span' fontSize={13} fontStyle={'italic'}>
              <b style={{ color: 'green' }}>10 sin interés de: <i style={{ color: 'black' }}>{calculateCuota(10)}</i></b>
            </Typography>
          </div>
        )}
        {product.nueve_sin_interes && (
          <div className='flex-center'>
            <img src={cuotaSimple} alt='sin limites' height="15" />
            <Typography variant='span' fontSize={13} fontStyle={'italic'}>
              <b style={{ color: 'green' }}>9 sin interés de: <i style={{ color: 'black' }}>{calculateCuota(9)}</i></b>
            </Typography>
          </div>
        )}
        {product.seis_sin_interes && (
          <div className='flex-center'>
            <img src={cuotaSimple} alt='sin limites' height="15" />
            <Typography variant='span' fontSize={13} fontStyle={'italic'}>
              <b style={{ color: 'green' }}>6 sin interés de: <i style={{ color: 'black' }}>{calculateCuota(6)}</i></b>
            </Typography>
          </div>
        )}
        {product.tres_sin_interes && (
          <div className='flex-center'>
            <img src={cuotaSimple} alt='sin limites' height="15" />
            <Typography variant='span' fontSize={13} fontStyle={'italic'}>
              <b style={{ color: 'green' }}>3 sin interés de: <i style={{ color: 'black' }}>{calculateCuota(3)}</i></b>
            </Typography>
          </div>
        )}
        <FormControl fullWidth variant="outlined" sx={{ my: 2 }}>
          <InputLabel>Selecciona Cuotas</InputLabel>
          <Select value={selectedCuota} onChange={handleCuotaChange} label="Selecciona Cuotas">
            {product.dieciocho_sin_interes && (
              <MenuItem value={calculateCuota(18)}>
                18 sin interés de: {calculateCuota(18)}
              </MenuItem>
            )}
            {product.doce_sin_interes && (
              <MenuItem value={calculateCuota(12)}>
                12 sin interés de: {calculateCuota(12)}
              </MenuItem>
            )}
            {product.diez_sin_interes && (
              <MenuItem value={calculateCuota(10)}>
                10 sin interés de: {calculateCuota(10)}
              </MenuItem>
            )}
            {product.nueve_sin_interes && (
              <MenuItem value={calculateCuota(9)}>
                9 sin interés de: {calculateCuota(9)}
              </MenuItem>
            )}
            {product.seis_sin_interes && (
              <MenuItem value={calculateCuota(6)}>
                6 sin interés de: {calculateCuota(6)}
              </MenuItem>
            )}
            {product.tres_sin_interes && (
              <MenuItem value={calculateCuota(3)}>
                3 sin interés de: {calculateCuota(3)}
              </MenuItem>
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
