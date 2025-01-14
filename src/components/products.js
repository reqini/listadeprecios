import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  CardActions,
  Divider,
} from '@mui/material';
import { FaWhatsapp } from 'react-icons/fa';
import { formatPrice } from '../utils/priceUtils';

const cuotaSimple = require('../../src/assets/cuotas-simples.webp');

const Product = ({ product, cuotaType }) => {
  const cuotasConInteres = ['tres_con_interes', 'seis_con_interes'];
  const cuotasSinInteres = [
    'veinticuatro_sin_interes',
    'veinte_sin_interes',
    'dieciocho_sin_interes',
    'doce_sin_interes',
    'diez_sin_interes',
    'nueve_sin_interes',
    'seis_sin_interes',
    'tres_sin_interes',
  ];

  // Selección de cuotas según el tipo
  const cuotas = cuotaType === 'con_interes' ? cuotasConInteres : cuotasSinInteres;

  // Obtener y formatear el valor de las cuotas
  const getCuotaValue = (cuota) => {
    const cuotaRawValue = product[cuota];
    if (!cuotaRawValue || cuotaRawValue === 'NO' || cuotaRawValue === '$0') {
      return null;
    }
    return formatPrice(parseFloat(cuotaRawValue.replace(/[^\d.-]/g, '')));
  };

  return (
    <Card sx={{ maxWidth: 600, paddingBottom: '12px' }} className="card-product">
      {product.discount && <div className="descuento">{product.discount}</div>}
      <CardMedia
        component="img"
        height="220"
        image={product.imagen || '../descarga.png'}
        alt="Producto"
      />
      <CardContent style={{ display: 'flex', flexDirection: 'column' }}>
        <Typography className="titulo" gutterBottom variant="h6" fontSize={18}>
          {product.descripcion}
        </Typography>
        <Typography variant="body2" fontSize={12} fontStyle="italic">
          Línea <b>{product.linea}</b>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Precio de Negocio: <b>{formatPrice(parseFloat(product.precio_negocio))}</b>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          PSVP lista: <b>{formatPrice(parseFloat(product.psvp_lista))}</b>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Puntos: <b>{product.puntos}</b>
        </Typography>
        <Divider sx={{ my: 2 }} />

        {/* Mostrar cuotas */}
        {cuotas.map((cuota, idx) => {
          const cuotaValue = getCuotaValue(cuota);
          if (cuotaValue) {
            return (
              <div className="flex-center" key={idx}>
                {cuotaType === 'sin_interes' && (
                  <img src={cuotaSimple} alt="sin límites" height="15" />
                )}
                <Typography variant="body2" fontSize={13} fontStyle="italic">
                  <b style={{ color: 'green' }}>
                    {`${cuota.replace(/_/g, ' ')}: `}
                    <i style={{ color: 'black' }}>{cuotaValue}</i>
                  </b>
                </Typography>
              </div>
            );
          }
          return null;
        })}
      </CardContent>
      <CardActions sx={{ display: 'flex', flexDirection: 'column' }}>
        <Button
          fullWidth
          href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
            `¡Te envío el valor de tu próxima Essen:\nProducto: ${product.descripcion}`
          )}`}
          target="_blank"
          variant="contained"
          size="medium"
          color="primary"
          sx={{ my: 1, backgroundColor: '#25D366', color: 'white' }}
          startIcon={<FaWhatsapp />}
        >
          Compartir
        </Button>
        {product.ficha_tecnica ? (
          <Button
            fullWidth
            target="_blank"
            href={product.ficha_tecnica}
            variant="outlined"
            size="medium"
            color="primary"
          >
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
