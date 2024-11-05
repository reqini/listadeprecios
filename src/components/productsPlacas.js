import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { formatPrice } from '../utils/priceUtils';

const ProductsPlacas = ({ product, selectedCuota }) => {
  const cuotasMap = {
    "24 cuotas sin interés": 'veinticuatro_sin_interes',
    "20 cuotas sin interés": 'veinte_sin_interes',
    "18 cuotas sin interés": 'dieciocho_sin_interes',
    "12 cuotas sin interés": 'doce_sin_interes',
    "10 cuotas sin interés": 'diez_sin_interes',
    "9 cuotas sin interés": 'nueve_sin_interes',
    "6 cuotas sin interés": 'seis_sin_interes',
    "3 cuotas sin interés": 'tres_sin_interes',
  };

  const cuotaKey = cuotasMap[selectedCuota];
  let cuotaValue = product[cuotaKey] !== 'NO' ? product[cuotaKey] : null;

  if (cuotaValue) {
    cuotaValue = parseFloat(cuotaValue.replace(/[^\d.-]/g, ''));
  }

  return (
    <Card sx={{ maxWidth: 600, paddingBottom: '12px', minHeight: 400 }} className='card-product-catalogo'>
      {product.discount && <div className='descuento'>{product.discount}</div>}
      <CardMedia
        component="img"
        image={product.imagen ? product.imagen : '../descarga.png'}
        sx={{
          objectFit: 'contain',
          height: 200,
        }}
        alt="product"
      />
      <CardContent style={{ padding: '6px 16px 0 16px' }}>
        <Typography variant='body2' fontSize={15} fontStyle={'italic'} style={{ marginBottom: 5 }}>
          Línea <b>{product.linea}</b>
        </Typography>
        <Typography variant="h6" sx={{ fontSize: 25 }}>
          {product.descripcion}
        </Typography>

        {cuotaValue && (
         <div>
            <Typography variant="h6" color="text.secondary" style={{ marginTop: 5 }}>
            {selectedCuota}
            </Typography>
            <Typography variant="h6" fontSize={30} color="primary" margin={0}>
              <b>{formatPrice(cuotaValue)}</b>
            </Typography>
         </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductsPlacas;
