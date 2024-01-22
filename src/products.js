// Product.js
import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { Button, CardActionArea, CardActions } from '@mui/material';

const Product = ({ product, onAddToCart }) => {
  return (
    <Card sx={{ maxWidth: 600 }}>
        <CardActionArea>
          <CardMedia
            component="img"
            height="100"
            image="../descarga.png"
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
                Precio de negocio: <b>{product.precio_negocio}</b>
            </Typography>
            <Typography variant="body2" color="text.secondary">
                PSVP lista: <b>{product.psvp_lista}</b>
            </Typography>
            <Typography variant="body2" color="text.secondary">
                puntos: <b>{product.puntos}</b>
            </Typography>
          </CardContent>
        </CardActionArea>
        <CardActions>
          <Button fullWidth onClick={() => onAddToCart(product)} size="small" color="primary">
          Agregar al carrito
          </Button>
        </CardActions>
      </Card>
  );
};

export default Product;
