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
            <Typography lineHeight={1} gutterBottom variant="h6" component="div" style={{marginBottom: 0}}>
            {product.name}
            </Typography>
            <Typography lineHeight={1.4} variant="span" color="text.secondary">
              <b>{product.extent}</b>
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Precio sin interes: <b>${product.price}</b>
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Precio con interes: <b>${product.price * 1.3}</b>
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Puntos: <b>{product.points}</b>
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
