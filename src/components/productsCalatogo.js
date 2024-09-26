/* eslint-disable */
import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { FaWhatsapp } from 'react-icons/fa';
import { Button, CardActions, IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

const ProductsCalatogo = ({ product, isFavorite, onToggleFavorite, selectedCuota }) => {

  const cuotasMap = {
    "12 cuotas sin interés": 'doce_sin_interes',
    "10 cuotas sin interés": 'diez_sin_interes',
    "9 cuotas sin interés": 'nueve_sin_interes',
    "6 cuotas sin interés": 'seis_sin_interes',
    "3 cuotas sin interés": 'tres_sin_interes',
    "18 cuotas sin interés": 'dieciocho_sin_interes'
  };

  const cuotaKey = cuotasMap[selectedCuota];
  const cuotaValue = product[cuotaKey] !== 'NO' ? product[cuotaKey] : null;

  const createWhatsAppLink = (product) => {
    const message = `¡Hola!, Quiero el precio de este Producto :)!
      Producto: ${product.descripcion}`;

    return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
  };

  return (
    <Card sx={{ maxWidth: 600, paddingBottom: '12px' }} className='card-product-catalogo'>
      {product.discount && <div className='descuento'>{product.discount}</div>}

      <IconButton onClick={onToggleFavorite} color="primary" style={{position: 'absolute', zIndex: 2, right: 10, top: 10, backgroundColor: 'rgba(0,0,0,0.1)'}}>
        {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
      </IconButton>
      <CardMedia
        component="img"
        image={product.imagen ? product.imagen : '../descarga.png'}
        sx={{
          objectFit: 'contain',
          height: 200,
          '@media (max-width: 480px)': {
            height: 100,
          },
        }}
        alt="product"
      />
      <CardContent style={{ display: 'flex', flexDirection: 'column', padding: '6px 16px 0 16px' }}>
        <Typography variant='body2' fontSize={12} fontStyle={'italic'} style={{ marginBottom: 5 }}>
          Línea <b>{product.linea}</b>
        </Typography>
        <Typography
         className='titulo' 
         lineHeight={1} 
         gutterBottom 
         variant="h6" 
         sx={{
          fontSize: 18,
          '@media (max-width: 480px)': {
            fontSize: '12px!important',
            minHeight: '20px!important'
          },
        }}
         >
          {product.descripcion}
        </Typography>
        {cuotaValue && (
          <Typography variant="body2" color="text.secondary" style={{ marginTop: 5 }}>
            {selectedCuota}: <b>{cuotaValue}</b>
          </Typography>
        )}
      </CardContent>
      <CardActions style={{ display: 'flex', flexDirection: 'column' }}>
        <Button
          fullWidth
          href={createWhatsAppLink(product)}
          target="_blank"
          variant="contained"
          size="medium"
          color="primary"
          style={{ backgroundColor: '#25D366', color: 'white', margin: '5px 0 12px 0' }}
          startIcon={<FaWhatsapp />}
        >
          Compartir
        </Button>
        {product.ficha_tecnica ? (
          <Button 
            fullWidth 
            target='_blank' 
            href={product.ficha_tecnica} 
            variant="outlined" 
            size="medium" 
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
        ) : (
          <Button fullWidth variant="disabled" size="medium" color="primary" style={{ margin: 0 }}>
            Sin ficha técnica
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default ProductsCalatogo;
