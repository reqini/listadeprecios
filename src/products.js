// Product.js
import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
/* import ShareButton from './shereButton'; */
import { Button, CardActionArea, CardActions } from '@mui/material';

const Product = ({ product, onAddToCart, catalog = false}) => {
  
  return (
    <Card sx={{ maxWidth: 600, paddingBottom: '12px' }} className='card-product'>
        <CardActionArea>
          <CardMedia
            component="img"
            height="200"
            image={product.imagen ? product.imagen : '../descarga.png'}
            alt="green iguana"
          />
          <CardContent>
            <Typography className='titulo' lineHeight={1} gutterBottom variant="h6" fontSize={18} component="div" style={{marginBottom: 0}}>
            {product.descripcion}
            </Typography>
            <Typography variant='span' fontSize={14} fontStyle={'italic'}>
             Linea <b>{product.linea}</b>
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Precio de preferencial: <b>{product.precio_preferencial.replace(/[,]/g, ".")}</b>
            </Typography>
            <Typography variant="body2" color="text.secondary">
                PSVP lista: <b>{product.psvp_lista.replace(/[,]/g, ".")}</b>
            </Typography>
            <Typography variant="body2" color="text.secondary">
                puntos: <b>{product.puntos}</b>
            </Typography>
          </CardContent>
        </CardActionArea>
        <CardActions style={{display: 'flex', flexDirection: 'column'}}>
          {catalog === false ? <Button fullWidth onClick={() => onAddToCart(product)} variant='contained' size="medium" color="primary" style={{marginBottom: 12}}>
          Agregar al carrito
          </Button> : 
          null
          }
          <Button fullWidth target='_blank' href={product.ficha_tecnica} variant="outlined" size="medium" color="primary" style={{margin: 0}}>
            Ficha técnica
          </Button>
        </CardActions>
      </Card>
  );
};

export default Product;
