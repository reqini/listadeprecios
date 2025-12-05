/**
 * Recommended Section - Productos recomendados y contenido útil
 * Sección moderna tipo dashboard
 */

import React from 'react';
import { Box, Typography, Grid, Card, CardMedia, CardContent, Fade } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const RecommendedSection = ({ products = [], loading }) => {
  const navigate = useNavigate();

  // Tomar productos aleatorios (máximo 6)
  const recommendedProducts = products
    .filter(p => p.imagen || p.foto)
    .slice(0, 6);

  if (loading) {
    return null;
  }

  return (
    <Box sx={{ mb: 6 }}>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 600,
          mb: 3,
          fontSize: { xs: '1.5rem', sm: '1.75rem' },
        }}
      >
        Recomendado para vos
      </Typography>
      {recommendedProducts.length > 0 ? (
        <Grid container spacing={3}>
          {recommendedProducts.map((product, index) => (
            <Grid item xs={6} sm={4} md={3} key={product.codigo || index}>
              <Fade in timeout={800 + index * 100}>
                <Card
                  onClick={() => navigate('/catalogo3')}
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    borderRadius: 2,
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={product.imagen || product.foto || '/placeholder.jpg'}
                    alt={product.descripcion || product.nombre || 'Producto'}
                    sx={{
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                      },
                    }}
                  />
                  <CardContent sx={{ p: 2 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                      }}
                    >
                      {product.descripcion || product.nombre || 'Producto'}
                    </Typography>
                    {product.precio_negocio && (
                      <Typography
                        variant="h6"
                        sx={{
                          mt: 1,
                          fontWeight: 600,
                          fontSize: { xs: '1rem', sm: '1.125rem' },
                        }}
                      >
                        ${new Intl.NumberFormat('es-AR').format(product.precio_negocio)}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Cargando recomendaciones...
        </Typography>
      )}
    </Box>
  );
};

export default RecommendedSection;

