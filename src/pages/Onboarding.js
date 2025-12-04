import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  ShoppingCart as ShoppingCartIcon,
  Share as ShareIcon,
  LocalOffer as LocalOfferIcon,
  List as ListIcon,
  Support as SupportIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

const steps = [
  {
    title: 'Búsqueda de Productos',
    description: 'Usá el buscador para encontrar cualquier producto del catálogo. Podés buscar por nombre, categoría o banco.',
    icon: <SearchIcon sx={{ fontSize: 48 }} />,
  },
  {
    title: 'Ver Promociones',
    description: 'Descubrí las mejores promociones y ofertas especiales. Filtra por banco y encuentra cuotas sin interés.',
    icon: <LocalOfferIcon sx={{ fontSize: 48 }} />,
  },
  {
    title: 'Agregar al Carrito',
    description: 'Agregá productos a tu carrito para compartirlos fácilmente con tus clientes. El carrito está siempre disponible en la parte inferior.',
    icon: <ShoppingCartIcon sx={{ fontSize: 48 }} />,
  },
  {
    title: 'Compartir por WhatsApp',
    description: 'Compartí productos directamente por WhatsApp con un solo clic. Perfecto para enviar ofertas a tus clientes.',
    icon: <ShareIcon sx={{ fontSize: 48 }} />,
  },
  {
    title: 'Navegar Catálogos',
    description: 'Explorá diferentes catálogos según el número de cuotas que busques. Cada catálogo tiene productos filtrados especialmente.',
    icon: <ListIcon sx={{ fontSize: 48 }} />,
  },
  {
    title: 'Soporte',
    description: '¿Tenés dudas? Contactá nuestro soporte prioritario. Estamos acá para ayudarte en todo lo que necesites.',
    icon: <SupportIcon sx={{ fontSize: 48 }} />,
  },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      // Guardar que completó el onboarding
      localStorage.setItem('onboardingCompleted', 'true');
      navigate('/home');
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSkip = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    navigate('/home');
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            ¡Bienvenido/a a la app! 🎉
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Te vamos a mostrar cómo usar todas las funcionalidades
          </Typography>
        </Box>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((step, index) => (
            <Step key={index} completed={index < activeStep}>
              <StepLabel />
            </Step>
          ))}
        </Stepper>

        <Card sx={{ mb: 4, minHeight: 400 }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Box sx={{ color: 'primary.main', mb: 3 }}>
              {steps[activeStep].icon}
            </Box>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              {steps[activeStep].title}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2, maxWidth: 500, mx: 'auto' }}>
              {steps[activeStep].description}
            </Typography>
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
            startIcon={<ArrowBackIcon />}
          >
            Anterior
          </Button>

          <Button
            onClick={handleSkip}
            variant="text"
            color="inherit"
          >
            Saltar
          </Button>

          <Button
            variant="contained"
            onClick={handleNext}
            endIcon={activeStep === steps.length - 1 ? <CheckCircleIcon /> : <ArrowForwardIcon />}
            size="large"
          >
            {activeStep === steps.length - 1 ? 'Comenzar a usar la app' : 'Siguiente'}
          </Button>
        </Box>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Paso {activeStep + 1} de {steps.length}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Onboarding;

