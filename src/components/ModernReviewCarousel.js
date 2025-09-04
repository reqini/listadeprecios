import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Star as StarIcon,
  StarHalf as StarHalfIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';

const reviews = [
  {
    name: "Mejia Jara",
    review: "Me encantó! Es mi mejor aliado desde que tengo la app! Práctica y funcional.",
    rating: 5,
  },
  {
    name: "Elizabeth Martínez",
    review: "Un mil! Súper sencillo poder asesorar al cliente con toda la info a un solo toque.",
    rating: 4.5,
  },
  {
    name: "Marisel Chamorro",
    review: "La app está buenísima. Lo mejor: la calculadora de cuotas. También le sumaría poder elegir color de fondo en las placas.",
    rating: 5,
  },
  {
    name: "Solu de Essen",
    review: "La app es un 1000! Súper útil para emprendedoras: combos, catálogos detallados y placas para clientes. Increíble. ❤️",
    rating: 5,
  },
  {
    name: "Pau Amarilla",
    review: "Una app intuitiva, veloz y actualizada, ideal para emprendedores que buscan agilizar sus respuestas. ¡Una herramienta indispensable!",
    rating: 5,
  },
  {
    name: "ig: Aracabralok",
    review: "Es util, te ayuda a tener a mano los valores,promos bancarias etc, es facil de usar.",
    rating: 5,
  }
];

const ModernReviewCarousel = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === reviews.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handlePrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? reviews.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prevIndex) => 
      prevIndex === reviews.length - 1 ? 0 : prevIndex + 1
    );
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;

    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        {Array(fullStars)
          .fill()
          .map((_, i) => (
            <StarIcon key={`star-${i}`} sx={{ color: '#ffb400', fontSize: 20 }} />
          ))}
        {halfStar && <StarHalfIcon sx={{ color: '#ffb400', fontSize: 20 }} />}
      </Box>
    );
  };

  const getVisibleReviews = () => {
    if (isMobile) {
      return [reviews[currentIndex]];
    }
    
    // Desktop: show 3 reviews with current in center
    const prevIndex = currentIndex === 0 ? reviews.length - 1 : currentIndex - 1;
    const nextIndex = currentIndex === reviews.length - 1 ? 0 : currentIndex + 1;
    
    return [reviews[prevIndex], reviews[currentIndex], reviews[nextIndex]];
  };

  const visibleReviews = getVisibleReviews();

  return (
    <Box sx={{ 
      position: 'relative', 
      maxWidth: 1200, 
      mx: 'auto', 
      px: 2,
      py: 4
    }}>
      {/* Navigation Buttons */}
      <IconButton
        onClick={handlePrevious}
        sx={{
          position: 'absolute',
          left: { xs: 10, md: -60 },
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 2,
          bgcolor: 'rgba(255,255,255,0.9)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          '&:hover': {
            bgcolor: 'rgba(255,255,255,1)',
            transform: 'translateY(-50%) scale(1.1)'
          },
          transition: 'all 0.3s ease'
        }}
      >
        <ChevronLeftIcon />
      </IconButton>

      <IconButton
        onClick={handleNext}
        sx={{
          position: 'absolute',
          right: { xs: 10, md: -60 },
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 2,
          bgcolor: 'rgba(255,255,255,0.9)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          '&:hover': {
            bgcolor: 'rgba(255,255,255,1)',
            transform: 'translateY(-50%) scale(1.1)'
          },
          transition: 'all 0.3s ease'
        }}
      >
        <ChevronRightIcon />
      </IconButton>

      {/* Reviews Container */}
      <Box sx={{ 
        display: 'flex', 
        gap: 3, 
        justifyContent: 'center',
        alignItems: 'stretch',
        minHeight: 280
      }}>
        {visibleReviews.map((review, index) => {
          const isCenter = isMobile ? true : index === 1;
          const isSide = !isMobile && index !== 1;
          
          return (
            <Card
              key={`${review.name}-${currentIndex}-${index}`}
              sx={{
                flex: isMobile ? 1 : isCenter ? 1.2 : 0.8,
                maxWidth: isMobile ? '100%' : isCenter ? 400 : 300,
                minHeight: 280,
                borderRadius: 4,
                border: isCenter ? '2px solid' : '1px solid',
                borderColor: isCenter ? 'primary.main' : 'divider',
                boxShadow: isCenter 
                  ? '0 20px 60px rgba(102, 126, 234, 0.3)' 
                  : '0 8px 32px rgba(0,0,0,0.1)',
                transform: isCenter ? 'scale(1)' : 'scale(0.9)',
                opacity: isSide ? 0.7 : 1,
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                '&:hover': {
                  transform: isCenter ? 'scale(1.02)' : 'scale(0.95)',
                  boxShadow: isCenter 
                    ? '0 25px 80px rgba(102, 126, 234, 0.4)' 
                    : '0 12px 40px rgba(0,0,0,0.15)',
                  opacity: 1
                }
              }}
              onClick={() => {
                if (!isMobile && !isCenter) {
                  setCurrentIndex(reviews.findIndex(r => r.name === review.name));
                  setIsAutoPlaying(false);
                }
              }}
            >
              <CardContent sx={{ 
                p: 4, 
                textAlign: 'center', 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                {/* Stars */}
                {renderStars(review.rating)}
                
                {/* Review Text */}
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mb: 3, 
                    fontStyle: 'italic',
                    lineHeight: 1.6,
                    fontSize: isCenter ? '1.1rem' : '1rem',
                    color: 'text.primary'
                  }}
                >
                  "{review.review}"
                </Typography>
                
                {/* Author */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: 'primary.main', 
                      mr: 2, 
                      width: 50, 
                      height: 50,
                      fontSize: '1.2rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {review.name.charAt(0)}
                  </Avatar>
                  <Typography 
                    variant="h6" 
                    fontWeight="bold" 
                    color="primary.main"
                    sx={{ fontSize: isCenter ? '1.1rem' : '1rem' }}
                  >
                    {review.name}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* Dots Indicator */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        mt: 4, 
        gap: 1 
      }}>
        {reviews.map((_, index) => (
          <Box
            key={index}
            onClick={() => {
              setCurrentIndex(index);
              setIsAutoPlaying(false);
            }}
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: index === currentIndex ? 'primary.main' : 'grey.300',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: index === currentIndex ? 'primary.dark' : 'grey.400',
                transform: 'scale(1.2)'
              }
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default ModernReviewCarousel;
