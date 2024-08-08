// Product.js
import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { Button, CardActionArea, CardActions, Divider, Tooltip } from '@mui/material';
import ReportGmailerrorredIcon from '@mui/icons-material/ReportGmailerrorred';

const cuotaSimple = require('../src/assets/cuotas-simples.webp')
const Product = ({ product, onAddToCart, catalog = false, off }) => {
  
  return (
    <Card sx={{ maxWidth: 600, paddingBottom: '12px' }} className='card-product'>
        <CardActionArea>
          {off && <div className='descuento'>{off}</div>}
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
             Linea <b>{product.linea}</b>
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Precio de Negocio: <b>{product.precio_negocio.replace(/[,]/g, ".")}</b>
            </Typography>
            <Typography variant="body2" color="text.secondary">
                PSVP lista: <b>{product.psvp_lista.replace(/[,]/g, ".")}</b>
            </Typography>
            <Typography variant="body2" color="text.secondary">
                puntos: <b>{product.puntos}</b>
            </Typography>
            <Divider style={{margin: '10px 0'}}/>
            {product.dieciocho_sin_interes && 
            <div className='flex-center'>
              {/* {product.linea !== 'Bazar' && product.linea !== 'Complementos' && product.linea !== 'Repuestos' ? (
                <img src={cuotaSimple} alt='sin limites' height="15" />
              ) : null} */}
              <Typography variant='span' fontSize={13} fontStyle={'italic'} style={{ display: 'flex', alignItems: 'center'}}>
                <b style={{color: 'green'}}>18 sin interes de: <i style={{color: 'black'}}>{product.dieciocho_sin_interes !== '' ? product.dieciocho_sin_interes : null}</i></b>
                <Tooltip title="ver promos bancarias" placement="top"><ReportGmailerrorredIcon fontSize="small" color='primary' style={{marginLeft: 5}} /></Tooltip>
              </Typography>
            </div>
            }
            {product.doce_sin_interes && 
            <div className='flex-center'>
              {product.linea !== 'Bazar' && product.linea !== 'Complementos' && product.linea !== 'Repuestos' ? (
                <img src={cuotaSimple} alt='sin limites' height="15" />
              ) : null}
              <Typography variant='span' fontSize={13} fontStyle={'italic'} margin={'3px 0'}>
                <b style={{color: 'green'}}>12 sin interes de: <i style={{color: 'black'}}>{product.doce_sin_interes !== '' ? product.doce_sin_interes : null}</i></b>
              </Typography>
            </div>
            }
            {product.diez_sin_interes && 
            <div className='flex-center'>
              {/* {product.linea !== 'Bazar' && product.linea !== 'Complementos' && product.linea !== 'Repuestos' ? (
                <img src={cuotaSimple} alt='sin limites' height="15" />
              ) : null} */}
              <Typography variant='span' fontSize={13} fontStyle={'italic'} margin={'3px 0'} style={{ display: 'flex', alignItems: 'center'}}>
                <b style={{color: 'green'}}>10 sin interes de: <i style={{color: 'black'}}>{product.diez_sin_interes !== '' ? product.diez_sin_interes : null}</i></b>
                <Tooltip title="ver promos bancarias" placement="top"><ReportGmailerrorredIcon fontSize="small" color='primary' style={{marginLeft: 5}} /></Tooltip>
              </Typography>
            </div>
            }
            {product.nueve_sin_interes && 
            <div className='flex-center'>
              {product.linea !== 'Bazar' && product.linea !== 'Complementos' && product.linea !== 'Repuestos' ? (
                <img src={cuotaSimple} alt='sin limites' height="15" />
              ) : null}
              <Typography variant='span' fontSize={13} fontStyle={'italic'} margin={'3px 0'}>
              <b style={{color: 'green'}}>9 sin interes de: <i style={{color: 'black'}}>{product.nueve_sin_interes !== '' ? product.nueve_sin_interes : null}</i></b>
              </Typography>
            </div>
            }
            {product.seis_sin_interes && 
            <div className='flex-center'>
              {product.linea !== 'Bazar' && product.linea !== 'Complementos' && product.linea !== 'Repuestos' ? (
                <img src={cuotaSimple} alt='sin limites' height="15" />
              ) : null}
              <Typography variant='span' fontSize={13} fontStyle={'italic'} margin={'3px 0'}>
              <b style={{color: 'green'}}>6 sin interes de: <i style={{color: 'black'}}>{product.seis_sin_interes !== '' ? product.seis_sin_interes : null}</i></b>
              </Typography>
            </div>
            }
            {product.tres_sin_interes && 
            <div className='flex-center'>
              {product.linea !== 'Bazar' && product.linea !== 'Complementos' && product.linea !== 'Repuestos' ? (
                <img src={cuotaSimple} alt='sin limites' height="15" />
              ) : null}
              <Typography variant='span' fontSize={13} fontStyle={'italic'} margin={'3px 0'}>
              <b style={{color: 'green'}}>3 sin interes de: <i style={{color: 'black'}}>{product.tres_sin_interes !== '' ? product.tres_sin_interes : null}</i></b>
              </Typography>
            </div>
            }
            {product.linea === 'Bazar' || product.linea === 'Complementos' || product.linea === 'Repuestos' ? (
                <Typography variant='span' fontSize={13} fontStyle={'italic'} margin={'3px 0'}>
                <i style={{color: 'red'}}>Solo con promos bancarias</i>
                </Typography>
            ) : null}
          </CardContent>
        </CardActionArea>
        <CardActions style={{display: 'flex', flexDirection: 'column'}}>
          {catalog === false ? <Button fullWidth onClick={() => onAddToCart(product)} variant='contained' size="medium" color="primary" style={{marginBottom: 12}}>
          Agregar al carrito
          </Button> : 
          null
          }
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
