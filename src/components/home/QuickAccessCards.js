/**
 * Quick Access Cards - Accesos rápidos modernos
 * Cards grandes con iconos, hover suaves, diseño tipo SaaS
 */

import React from 'react';
import { Grid, Card, CardContent, Box, Typography, Fade } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Search as SearchIcon,
  List as ListIcon,
  Restaurant as RecipeIcon,
  Lightbulb as IdeaIcon,
  People as PeopleIcon,
  Favorite as FavoriteIcon,
  Store as StoreIcon,
} from '@mui/icons-material';

const QuickAccessCards = () => {
  const navigate = useNavigate();

  const quickAccessItems = [
    {
      id: 'catalogs',
      title: 'Catálogos',
      description: 'Explorá todos los catálogos disponibles',
      icon: <ListIcon sx={{ fontSize: 48 }} />,
      color: '#667eea',
      onClick: () => navigate('/catalogo3'),
    },
    {
      id: 'search',
      title: 'Buscador Inteligente',
      description: 'Encontrá productos con IA',
      icon: <SearchIcon sx={{ fontSize: 48 }} />,
      color: '#f093fb',
      onClick: () => navigate('/buscador-inteligente'),
    },
    {
      id: 'recipes',
      title: 'Recetas',
      description: 'Ideas para cocinar y vender',
      icon: <RecipeIcon sx={{ fontSize: 48 }} />,
      color: '#4facfe',
      onClick: () => navigate('/home'), // TODO: crear ruta de recetas
    },
    {
      id: 'ideas',
      title: 'Ideas para Vender',
      description: 'Tips y estrategias de venta',
      icon: <IdeaIcon sx={{ fontSize: 48 }} />,
      color: '#43e97b',
      onClick: () => navigate('/home'), // TODO: crear ruta de ideas
    },
    {
      id: 'clients',
      title: 'Mis Clientes',
      description: 'Gestioná tu lista de clientes',
      icon: <PeopleIcon sx={{ fontSize: 48 }} />,
      color: '#fa709a',
      onClick: () => navigate('/ventas'),
    },
    {
      id: 'favorites',
      title: 'Favoritos',
      description: 'Tus productos favoritos',
      icon: <FavoriteIcon sx={{ fontSize: 48 }} />,
      color: '#fee140',
      onClick: () => navigate('/home'), // TODO: crear sistema de favoritos
    },
  ];

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
        Accesos Rápidos
      </Typography>
      <Grid container spacing={3}>
        {quickAccessItems.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Fade in timeout={600 + index * 100}>
              <Card
                onClick={item.onClick}
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  borderRadius: 3,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}dd 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        mb: 2,
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        mb: 1,
                        fontSize: { xs: '1.125rem', sm: '1.25rem' },
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                      }}
                    >
                      {item.description}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default QuickAccessCards;

