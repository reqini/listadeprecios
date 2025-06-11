import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { FaWhatsapp } from 'react-icons/fa';
import { Button, CardActions } from '@mui/material';
import { formatPrice } from '../utils/priceUtils';

const ProductCatalogoPreferencial = ({ product, sumarEnvio, costoEnvio }) => {
  // Procesar precio preferencial
  const precioPreferencial = product.precio_preferencial
    ? parseFloat(product.precio_preferencial.replace(/[^0-9.-]/g, '')) || 0
    : 0;

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
        <Typography variant="body2" color="text.secondary" style={{ marginTop: 5 }}>
          Precio Preferencial: <b>{formatPrice(precioPreferencial)}</b>
        </Typography>
        {sumarEnvio && (
          <Typography variant="body2" sx={{ color: 'green', fontWeight: 500, marginTop: 1 }}>
            📦 Esta compra suma un envío de: <b>{formatPrice(costoEnvio)}</b>
          </Typography>
        )}
      </CardContent>
      <CardActions style={{ display: 'flex', flexDirection: 'column' }}>
        <Button
          fullWidth
          href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
            `¡Quiero este Producto :)!\nProducto: ${product.descripcion}\nPrecio Preferencial: ${formatPrice(precioPreferencial)}`
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

export default ProductCatalogoPreferencial;
