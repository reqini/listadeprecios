import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { FaWhatsapp } from 'react-icons/fa';
import { Button, CardActions } from '@mui/material';
import { formatPrice } from '../utils/priceUtils';

const ProductsCalatogo = ({ product, selectedCuota, showPriceOnly = false, isContado = false }) => {
  const sumarEnvio = localStorage.getItem("sumarEnvio") === "true";
  const aplicaEnvio = ['Bazar', 'Repuestos'].includes(product.linea);

  const SHIPPING_COST = 17362;

  // Mapeo de cuotas con sus respectivos campos
  const cuotasMap = {
    "24 cuotas sin interés": 'veinticuatro_sin_interes',
    "20 cuotas sin interés": 'veinte_sin_interes',
    "18 cuotas sin interés": 'dieciocho_sin_interes',
    "12 cuotas sin interés": 'doce_sin_interes',
    "14 cuotas sin interés": 'catorce_sin_interes',
    "10 cuotas sin interés": 'diez_sin_interes',
    "9 cuotas sin interés": 'nueve_sin_interes',
    "6 cuotas sin interés": 'seis_sin_interes',
    "3 cuotas sin interés": 'tres_sin_interes',
  };

  const cuotaKey = cuotasMap[selectedCuota];
  let cuotaValue = null;

  // Validar y procesar cuota seleccionada
  if (cuotaKey && product[cuotaKey] && product[cuotaKey] !== 'NO') {
    try {
      cuotaValue = parseFloat(product[cuotaKey].replace(/[^0-9.-]/g, '')) || null;
    } catch {
      cuotaValue = null;
    }
  }

  // Procesar precio de negocio
  const precioNegocio = product.precio_negocio
    ? parseFloat(product.precio_negocio.replace(/[^0-9.-]/g, '')) || null
    : null;

  // Determinar precio final según el contexto
  const precioFinal = isContado
  ? (precioNegocio || 0) + (sumarEnvio && aplicaEnvio ? SHIPPING_COST : 0)
  : (cuotaValue || parseFloat(product.psvp_lista?.replace(/[^0-9.-]/g, '')) || 0) +
    (sumarEnvio && aplicaEnvio ? SHIPPING_COST : 0);



  return (
    <Card sx={{ maxWidth: 600, paddingBottom: '12px' }} className="card-product-catalogo">
      {product.discount && <div className="descuento">{product.discount}</div>}
      <CardMedia
        component="img"
        image={product.imagen ? product.imagen : '../descarga.png'}
        sx={{
          objectFit: 'contain',
          height: 200,
          position: 'relative',
          '@media (max-width: 480px)': {
            height: 100,
          },
        }}
        alt="Imagen del producto"
      />
      <CardContent style={{ display: 'flex', flexDirection: 'column', padding: '6px 16px 0 16px' }}>
        {product.event && <div className="descuento-black mar-b10">{product.event}</div>}
        <Typography variant="body2" fontSize={12} fontStyle="italic" style={{ marginBottom: 5 }}>
          Línea <b>{product.linea}</b>
        </Typography>
        <Typography
          className="titulo"
          lineHeight={1}
          gutterBottom
          variant="h6"
          sx={{
            fontSize: 18,
            '@media (max-width: 480px)': {
              fontSize: '12px!important',
              minHeight: '20px!important',
            },
          }}
        >
          {product.descripcion}
        </Typography>

        {/* Mostrar el precio según el contexto */}
        {isContado ? (
          <Typography variant="body2" color="text.secondary" style={{ marginTop: 5 }}>
            Precio de Negocio: <b>{formatPrice(precioFinal)}</b>
          </Typography>
        ) : selectedCuota && cuotaValue ? (
            <Typography variant="body2" color="text.secondary" style={{ marginTop: 5 }}>
              {selectedCuota}: <b>{formatPrice(precioFinal)}</b>
            </Typography>
          ) : (
          <Typography variant="body2" color="text.secondary" style={{ marginTop: 5 }}>
            No disponible
          </Typography>
        )}
      </CardContent>
      <CardActions style={{ display: 'flex', flexDirection: 'column' }}>
        <Button
          fullWidth
          href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
            `¡Quiero este Producto :)!\nProducto: ${product.descripcion}`
          )}`}
          target="_blank"
          variant="contained"
          size="medium"
          color="primary"
          style={{ backgroundColor: '#25D366', color: 'white', margin: '5px 0 12px 0' }}
          startIcon={<FaWhatsapp />}
        >
          Compartir
        </Button>
        <Button
          fullWidth
          target="_blank"
          href={product.ficha_tecnica}
          variant={!product.ficha_tecnica ? 'text' : 'outlined'}
          size="medium"
          disabled={!product.ficha_tecnica}
          color="primary"
          sx={{
            marginLeft: '0px!important',
            '@media (max-width: 480px)': {
              fontSize: '12px!important',
            },
          }}
        >
          Ficha técnica
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductsCalatogo;
