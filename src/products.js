// Product.js
import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { FaWhatsapp } from 'react-icons/fa';
import { Button, CardActions, Divider, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import AlertComponent from './alert';
/* import imageCompression from 'browser-image-compression'; */

  const cuotaSimple = require('../src/assets/cuotas-simples.webp')

  const Product = ({ product, onAddToCart, catalog = false, off }) => {
    const [selectedCuota, setSelectedCuota] = useState('');
   /*  const [compressedImage, setCompressedImage] = useState(product.imagen); */
  
    const handleCuotaChange = (event) => {
      setSelectedCuota(event.target.value);
    };
  
    const compressImage = async (imageUrl) => {
      try {
        /* const response = await fetch(imageUrl); */
        /* const blob = await response.blob(); */
        /* const file = new File([blob], 'image.jpg', { type: blob.type }); */
  
        /* const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
        }; */
  
        /* const compressedFile = await imageCompression(file, options); */
        /* const compressedImageUrl = URL.createObjectURL(compressedFile); */
        /* setCompressedImage(compressedImageUrl); */
      } catch (error) {
        console.error('Error compressing image:', error);
      }
    };
  
    const createWhatsAppLink = (product, cuota) => {
      const message = `¡Hola!, Te envio el valor de tu próxima Essen!
      Producto: ${product.descripcion}
      Cuota: ${cuota}`;
  
      return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    };
  
    React.useEffect(() => {
      if (product.imagen) {
        compressImage(product.imagen);
      }
    }, [product.imagen]);
    
  return (
    <Card sx={{ maxWidth: 600, paddingBottom: '12px' }} className='card-product'>
          {product.discount && <div className='descuento'>{product.discount}</div>}
          <CardMedia
            component="img"
            height="220"
            image={product.imagen ? product.imagen : '../descarga.png'}
            alt="green iguana"
          />
          <CardContent style={{display: 'flex', flexDirection: 'column'}}>
            <Typography className='titulo' lineHeight={1} gutterBottom variant="h6" fontSize={18} component="div" style={{marginBottom: 0}}>
            {product.descripcion}
            </Typography>
            <Typography variant='body2' fontSize={12} fontStyle={'italic'}>
              Línea <b>{product.linea}</b>
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Precio de Negocio: <b>{product.precio_negocio.replace(/[,]/g, ".")}</b>
            </Typography>
            <Typography variant="body2" color="text.secondary">
                PSVP lista: <b>{product.psvp_lista.replace(/[,]/g, ".")}</b>
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Puntos: <b>{product.puntos}</b>
            </Typography>
            <Divider style={{margin: '10px 0'}}/>
            {product.dieciocho_sin_interes && 
            <div className='flex-center'>
              {/* {product.linea !== 'Bazar' && product.linea !== 'Complementos' && product.linea !== 'Repuestos' ? (
                <img src={cuotaSimple} alt='sin limites' height="15" />
              ) : null} */}
              <Typography variant='span' fontSize={13} fontStyle={'italic'} style={{ display: 'flex', alignItems: 'center'}}>
                <b style={{color: 'green'}}>18 sin interés de: <i style={{color: 'black'}}>$ {product.dieciocho_sin_interes !== '' ? product.dieciocho_sin_interes : null}</i></b>
                <AlertComponent />
              </Typography>
            </div>
            }
            {product.doce_sin_interes && 
            <div className='flex-center'>
              {product.linea !== 'Bazar' && product.linea !== 'Complementos' && product.linea !== 'Repuestos' ? (
                <img src={cuotaSimple} alt='sin limites' height="15" />
              ) : null}
              <Typography variant='span' fontSize={13} fontStyle={'italic'} margin={'3px 0'}>
                <b style={{color: 'green'}}>12 sin interés de: <i style={{color: 'black'}}>{product.doce_sin_interes !== '' ? product.doce_sin_interes : null}</i></b>
              </Typography>
            </div>
            }
            {product.diez_sin_interes && 
            <div className='flex-center'>
              {/* {product.linea !== 'Bazar' && product.linea !== 'Complementos' && product.linea !== 'Repuestos' ? (
                <img src={cuotaSimple} alt='sin limites' height="15" />
              ) : null} */}
              <Typography variant='span' fontSize={13} fontStyle={'italic'} margin={'3px 0'} style={{ display: 'flex', alignItems: 'center'}}>
                <b style={{color: 'green'}}>10 sin interés de: <i style={{color: 'black'}}>{product.diez_sin_interes !== '' ? product.diez_sin_interes : null}</i></b>
                <AlertComponent />
              </Typography>
            </div>
            }
            {product.nueve_sin_interes && 
            <div className='flex-center'>
              {product.linea !== 'Bazar' && product.linea !== 'Complementos' && product.linea !== 'Repuestos' ? (
                <img src={cuotaSimple} alt='sin limites' height="15" />
              ) : null}
              <Typography variant='span' fontSize={13} fontStyle={'italic'} margin={'3px 0'}>
              <b style={{color: 'green'}}>9 sin interés de: <i style={{color: 'black'}}>{product.nueve_sin_interes !== '' ? product.nueve_sin_interes : null}</i></b>
              </Typography>
            </div>
            }
            {product.seis_sin_interes && 
            <div className='flex-center'>
              {product.linea !== 'Bazar' && product.linea !== 'Complementos' && product.linea !== 'Repuestos' ? (
                <img src={cuotaSimple} alt='sin limites' height="15" />
              ) : null}
              <Typography variant='span' fontSize={13} fontStyle={'italic'} margin={'3px 0'}>
              <b style={{color: 'green'}}>6 sin interés de: <i style={{color: 'black'}}>{product.seis_sin_interes !== '' ? product.seis_sin_interes : null}</i></b>
              </Typography>
            </div>
            }
            {product.tres_sin_interes && 
            <div className='flex-center'>
              {product.linea !== 'Bazar' && product.linea !== 'Complementos' && product.linea !== 'Repuestos' ? (
                <img src={cuotaSimple} alt='sin limites' height="15" />
              ) : null}
              <Typography variant='span' fontSize={13} fontStyle={'italic'} margin={'3px 0'}>
              <b style={{color: 'green'}}>3 sin interés de: <i style={{color: 'black'}}>{product.tres_sin_interes !== '' ? product.tres_sin_interes : null}</i></b>
              </Typography>
            </div>
            }
            {/* Cuotas disponibles */}
            <FormControl fullWidth variant="outlined" style={{ marginTop: '10px', marginBottom: '10px' }}>
              <InputLabel>Selecciona Cuotas</InputLabel>
              <Select value={selectedCuota} onChange={handleCuotaChange} label="Selecciona Cuotas">
                {product.dieciocho_sin_interes && (
                  <MenuItem value={`18 sin interés de: $${product.dieciocho_sin_interes}`}>
                    18 sin interés de: ${product.dieciocho_sin_interes}
                  </MenuItem>
                )}
                {product.doce_sin_interes && (
                  <MenuItem value={`12 sin interés de: ${product.doce_sin_interes}`}>
                    12 sin interés de: {product.doce_sin_interes}
                  </MenuItem>
                )}
                {product.diez_sin_interes && (
                  <MenuItem value={`10 sin interés de: ${product.diez_sin_interes}`}>
                    10 sin interés de: {product.diez_sin_interes}
                  </MenuItem>
                )}
                {product.nueve_sin_interes && (
                  <MenuItem value={`9 sin interés de: ${product.nueve_sin_interes}`}>
                    9 sin interés de: {product.nueve_sin_interes}
                  </MenuItem>
                )}
                {product.seis_sin_interes && (
                  <MenuItem value={`6 sin interés de: $${product.seis_sin_interes}`}>
                    6 sin interés de: {product.seis_sin_interes}
                  </MenuItem>
                )}
                {product.tres_sin_interes && (
                  <MenuItem value={`3 sin interés de: $${product.tres_sin_interes}`}>
                    3 sin interés de: {product.tres_sin_interes}
                  </MenuItem>
                )}
              </Select>
            </FormControl>
            {product.linea === 'Bazar' || product.linea === 'Complementos' || product.linea === 'Repuestos' ? (
                <Typography variant='span' fontSize={13} fontStyle={'italic'} margin={'3px 0'}>
                <i style={{color: 'red'}}>Solo con promos bancarias</i>
                </Typography>
            ) : null}
          </CardContent>
        <CardActions style={{display: 'flex', flexDirection: 'column'}}>
          {catalog === false ? <Button fullWidth onClick={() => onAddToCart(product)} variant='contained' size="medium" color="primary">
          Agregar al carrito
          </Button> : 
          null
          }
          <Button
            fullWidth
            href={createWhatsAppLink(product, selectedCuota)}
            target="_blank"
            variant="contained"
            size="medium"
            color="primary"
            style={selectedCuota ? {backgroundColor: '#25D366', color: 'white', margin: '12px 0'} : {margin: '12px 0'}}
            disabled={!selectedCuota}
            startIcon={selectedCuota ? <FaWhatsapp /> : null}
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

export default Product;
