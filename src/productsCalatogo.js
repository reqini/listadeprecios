// Product.js
import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { FaWhatsapp } from 'react-icons/fa';
import { Button, CardActions } from '@mui/material';


  const ProductsCalatogo = ({ product }) => {
  
    const createWhatsAppLink = (product, cuota) => {
      const message = `¡Hola!, Te envio el valor de tu próxima Essen!
      Producto: ${product.descripcion}`;
  
      return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    };
    
  return (
    <Card sx={{ maxWidth: 600, paddingBottom: '12px' }} className='card-product'>
          {product.discount && <div className='descuento'>{product.discount}</div>}
          <CardMedia
            component="img"
            height="220"
            image={product.imagen ? product.imagen : '../descarga.png'}
            alt="green iguana"
          />
          <CardContent style={{display: 'flex', flexDirection: 'column', padding: '6px 16px 0 16px'}}>
            <Typography variant='body2' fontSize={12} fontStyle={'italic'} style={{marginBottom: 5}}>
              Línea <b>{product.linea}</b>
            </Typography>
            <Typography className='titulo' lineHeight={1} gutterBottom variant="h6" fontSize={18}>
            {product.descripcion}
            </Typography>
            {/* <Typography variant="body2" color="text.secondary">
                Precio: <b>{product.psvp_lista.replace(/[,]/g, ".")}</b>
            </Typography> */}
          </CardContent>
        <CardActions style={{display: 'flex', flexDirection: 'column'}}>
          <Button
            fullWidth
            href={createWhatsAppLink(product)}
            target="_blank"
            variant="contained"
            size="medium"
            color="primary"
            style={{backgroundColor: '#25D366', color: 'white', margin: '5px 0 12px 0'}}
            startIcon={<FaWhatsapp />}
        >
          Compartir
          </Button>
          {product.ficha_tecnica ? <Button fullWidth target='_blank' href={product.ficha_tecnica} variant="outlined" size="medium" color="primary" style={{margin: 0}}>
            Ficha técnica
          </Button> :
          <Button fullWidth variant="disabled" size="medium" color="primary" style={{margin: 0}}>
            Sin ficha técnica
          </Button>
          }
        </CardActions>
      </Card>
  );
};

export default ProductsCalatogo;
