import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  // Paper, // No utilizado por ahora
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
  Palette as PaletteIcon,
  WhatsApp as WhatsAppIcon,
  Instagram as InstagramIcon,
  // Download as DownloadIcon, // No utilizado por ahora
  GetApp as GetAppIcon,
  // Security as SecurityIcon, // No utilizado por ahora
  // Speed as SpeedIcon, // No utilizado por ahora
  // Support as SupportIcon, // No utilizado por ahora
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import logo from '../assets/logo.png';
import ModernReviewCarousel from '../components/ModernReviewCarousel';

const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Estados
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  // Estadísticas de la app
  const [stats] = useState({
    emprendedoras: 1250,
    ventasGeneradas: 45000,
    placasCreadas: 8900,
    rating: 4.9
  });

  // Planes de suscripción
  const plans = [
    {
      name: 'Limitado',
      price: 'Gratis',
      period: 'Siempre',
      features: [
        'Acceso solo a la página principal',
        'Recuperación de contraseña',
        'Información básica de productos',
        'Soporte por email'
      ],
      limitations: [
        'Sin acceso a catálogos completos',
        'Sin generación de placas',
        'Sin gestión de clientes',
        'Sin estadísticas avanzadas'
      ],
      color: 'primary',
      popular: false,
      buttonText: 'Comenzar Gratis',
      buttonVariant: 'outlined',
      planId: 'limitado'
    },
    {
      name: 'Full',
      price: '$25.000',
      period: 'por mes',
      features: [
        'Acceso completo a todos los catálogos',
        'Generación de placas con IA',
        'Gestión ilimitada de clientes',
        'Estadísticas avanzadas y reportes',
        'Soporte prioritario por WhatsApp',
        'Templates premium y personalización',
        'Exportación de datos',
        'Integración con redes sociales'
      ],
      limitations: [],
      color: 'secondary',
      popular: true,
      buttonText: 'Suscribirse Ahora',
      buttonVariant: 'contained',
      planId: 'full'
    }
  ];

  // Detectar si la app se puede instalar
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallApp = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setSnackbar({
          open: true,
          message: '¡App instalada exitosamente!',
          severity: 'success'
        });
      }
      setInstallPrompt(null);
    }
  };

  const handleContactSubmit = () => {
    // Simular envío de formulario
    setSnackbar({
      open: true,
      message: '¡Mensaje enviado! Te contactaremos pronto.',
      severity: 'success'
    });
    setContactDialogOpen(false);
    setContactForm({ name: '', email: '', phone: '', message: '' });
  };

  const handlePlanSelect = (plan) => {
    if (plan.planId === 'limitado') {
      // Plan gratuito - ir directo al registro
      navigate('/registro?plan=limitado');
    } else if (plan.planId === 'full') {
      // Plan de pago - ir al registro y luego a Mercado Pago
      navigate('/registro?plan=full');
    }
  };

  const StatCard = ({ icon: Icon, value, label, color = 'primary' }) => (
    <Card sx={{ 
      height: '100%', 
      textAlign: 'center', 
      p: 3,
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: 3,
      border: '1px solid rgba(255,255,255,0.2)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
      }
    }}>
      <CardContent>
        <Avatar sx={{ 
          bgcolor: `${color}.main`, 
          width: 80, 
          height: 80, 
          mx: 'auto', 
          mb: 2,
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
        }}>
          <Icon sx={{ fontSize: 40 }} />
        </Avatar>
        <Typography variant="h3" component="div" color={`${color}.main`} fontWeight="bold" sx={{ mb: 1 }}>
          {value}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
      </CardContent>
    </Card>
  );

  const FeatureCard = ({ icon: Icon, title, description, color = 'primary' }) => (
    <Card sx={{ 
      height: '100%', 
      p: 4, 
      textAlign: 'center',
      borderRadius: 3,
      border: '1px solid rgba(0,0,0,0.05)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
        borderColor: `${color}.main`
      }
    }}>
      <CardContent>
        <Avatar sx={{ 
          bgcolor: `${color}.main`, 
          width: 100, 
          height: 100, 
          mx: 'auto', 
          mb: 3,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
        }}>
          <Icon sx={{ fontSize: 50 }} />
        </Avatar>
        <Typography variant="h5" component="h3" gutterBottom fontWeight="bold" sx={{ mb: 2 }}>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <>
      {/* Header */}
      <AppBar position="fixed" sx={{ bgcolor: 'white', color: 'text.primary', boxShadow: 1 }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <img src={logo} alt="Logo" style={{ height: 40, marginRight: 16 }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              Lista de Precios
            </Typography>
          </Box>
          
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button color="inherit" onClick={() => navigate('/login')}>
                Iniciar Sesión
              </Button>
              <Button variant="contained" onClick={() => navigate('/registro')}>
                Registrarse
              </Button>
            </Box>
          )}
          
          {isMobile && (
            <IconButton onClick={() => setMobileMenuOpen(true)}>
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Menú Móvil */}
      <Dialog 
        open={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)}
        fullScreen
        PaperProps={{
          sx: {
            bgcolor: 'white',
            color: 'text.primary'
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <img src={logo} alt="Logo" style={{ height: 32, marginRight: 12 }} />
              <Typography variant="h6" fontWeight="bold">
                Lista de Precios
              </Typography>
            </Box>
            <IconButton onClick={() => setMobileMenuOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Button 
              variant="outlined" 
              fullWidth 
              size="large"
              onClick={() => {
                navigate('/login');
                setMobileMenuOpen(false);
              }}
              sx={{ py: 1.5, fontSize: '1.1rem' }}
            >
              Iniciar Sesión
            </Button>
            <Button 
              variant="contained" 
              fullWidth 
              size="large"
              onClick={() => {
                navigate('/registro');
                setMobileMenuOpen(false);
              }}
              sx={{ py: 1.5, fontSize: '1.1rem' }}
            >
              Registrarse
            </Button>
            <Button 
              variant="text" 
              fullWidth 
              size="large"
              onClick={() => {
                setContactDialogOpen(true);
                setMobileMenuOpen(false);
              }}
              sx={{ py: 1.5, fontSize: '1.1rem' }}
            >
              Contacto
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Hero Section */}
      <Box sx={{ 
        pt: { xs: 10, md: 12 }, 
        pb: { xs: 6, md: 8 }, 
        px: { xs: 2, md: 0 },
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        minHeight: { xs: '100vh', md: 'auto' }
      }}>
        {/* Elementos decorativos de fondo */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%)
          `,
          zIndex: 0
        }} />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <img 
              src={logo} 
              alt="Logo Lista de Precios" 
              style={{ 
                height: 100, 
                filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))',
                marginBottom: '20px'
              }} 
            />
          </Box>
          <Typography variant="h1" component="h1" gutterBottom sx={{ 
            fontWeight: 900, 
            mb: { xs: 2, md: 3 },
            fontSize: { xs: '2rem', sm: '2.5rem', md: '4rem' },
            background: 'linear-gradient(45deg, #fff 30%, #f0f0f0 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 4px 8px rgba(0,0,0,0.3)',
            lineHeight: { xs: 1.2, md: 1.1 }
          }}>
            La Revolución para Emprendedoras
          </Typography>
          <Typography variant="h4" sx={{ 
            mb: { xs: 3, md: 4 }, 
            opacity: 0.95, 
            maxWidth: { xs: '100%', md: 900 }, 
            mx: 'auto',
            fontSize: { xs: '1rem', sm: '1.2rem', md: '1.5rem' },
            lineHeight: { xs: 1.4, md: 1.6 },
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            px: { xs: 1, md: 0 }
          }}>
            🚀 Crea catálogos profesionales, genera placas con IA y gestiona tus ventas 
            desde una sola plataforma. Únete a más de <strong>{stats.emprendedoras.toLocaleString()}</strong> emprendedoras exitosas.
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            gap: { xs: 2, md: 3 }, 
            justifyContent: 'center', 
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            mb: { xs: 4, md: 6 },
            px: { xs: 2, md: 0 }
          }}>
            <Button 
              variant="contained" 
              size="large" 
              fullWidth={isMobile}
              onClick={() => navigate('/registro')}
              sx={{ 
                bgcolor: 'white', 
                color: 'primary.main',
                px: { xs: 3, md: 4 },
                py: { xs: 1.5, md: 1.5 },
                fontSize: { xs: '1rem', md: '1.1rem' },
                fontWeight: 'bold',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                transform: 'translateY(0)',
                transition: 'all 0.3s ease',
                maxWidth: { xs: '100%', sm: '300px' },
                '&:hover': { 
                  bgcolor: 'grey.100',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.4)'
                }
              }}
            >
              🚀 Comenzar Gratis
            </Button>
            <Button 
              variant="outlined" 
              size="large"
              fullWidth={isMobile}
              onClick={() => setContactDialogOpen(true)}
              sx={{ 
                borderColor: 'white', 
                color: 'white',
                borderWidth: 2,
                px: { xs: 3, md: 4 },
                py: { xs: 1.5, md: 1.5 },
                fontSize: { xs: '1rem', md: '1.1rem' },
                fontWeight: 'bold',
                borderRadius: 3,
                backdropFilter: 'blur(10px)',
                bgcolor: 'rgba(255,255,255,0.1)',
                transform: 'translateY(0)',
                transition: 'all 0.3s ease',
                maxWidth: { xs: '100%', sm: '300px' },
                '&:hover': { 
                  borderColor: 'white', 
                  bgcolor: 'rgba(255,255,255,0.2)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 32px rgba(255,255,255,0.2)'
                }
              }}
            >
              📱 Ver Demo
            </Button>
          </Box>

          {/* Estadísticas */}
          <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mt: { xs: 4, md: 6 } }}>
            <Grid item xs={6} md={3}>
              <StatCard 
                icon={PeopleIcon} 
                value={stats.emprendedoras.toLocaleString()} 
                label="Emprendedoras Activas" 
                color="success"
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard 
                icon={TrendingUpIcon} 
                value={`$${stats.ventasGeneradas.toLocaleString()}`} 
                label="Ventas Generadas" 
                color="warning"
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard 
                icon={PaletteIcon} 
                value={stats.placasCreadas.toLocaleString()} 
                label="Placas Creadas" 
                color="info"
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard 
                icon={StarIcon} 
                value={stats.rating} 
                label="Rating Promedio" 
                color="secondary"
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Características */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 }, px: { xs: 2, md: 0 } }}>
        <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
          <Typography variant="h2" component="h2" gutterBottom sx={{ 
            fontWeight: 800,
            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
            fontSize: { xs: '1.8rem', sm: '2.2rem', md: '3rem' }
          }}>
            Todo lo que necesitas para triunfar
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ 
            maxWidth: { xs: '100%', md: 600 }, 
            mx: 'auto',
            fontSize: { xs: '1rem', md: '1.25rem' },
            px: { xs: 2, md: 0 }
          }}>
            Herramientas profesionales diseñadas específicamente para emprendedoras que quieren crecer
          </Typography>
        </Box>
        
        <Grid container spacing={{ xs: 3, md: 4 }}>
          <Grid item xs={12} md={4}>
            <FeatureCard
              icon={PaletteIcon}
              title="Generación de Placas con IA"
              description="Crea placas profesionales automáticamente con inteligencia artificial. Sin fondo, perfectas para redes sociales."
              color="primary"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FeatureCard
              icon={ShoppingCartIcon}
              title="Catálogos Dinámicos"
              description="Mantén tus precios actualizados en tiempo real. Catálogos automáticos para todas las cuotas."
              color="secondary"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FeatureCard
              icon={BusinessIcon}
              title="Gestión de Clientes"
              description="Organiza tus clientes, envía catálogos por WhatsApp y lleva el control de tus ventas."
              color="success"
            />
          </Grid>
        </Grid>
      </Container>

      {/* Planes de Suscripción */}
      <Box sx={{ 
        bgcolor: 'grey.50', 
        py: { xs: 6, md: 10 },
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
          zIndex: 0
        }
      }}>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, px: { xs: 2, md: 0 } }}>
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
            <Typography variant="h2" component="h2" gutterBottom sx={{ 
              fontWeight: 800,
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
              fontSize: { xs: '1.8rem', sm: '2.2rem', md: '3rem' }
            }}>
              Elige tu Plan
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ 
              maxWidth: { xs: '100%', md: 600 }, 
              mx: 'auto',
              fontSize: { xs: '1rem', md: '1.25rem' },
              px: { xs: 2, md: 0 }
            }}>
              Comienza gratis y escala cuando estés lista para crecer
            </Typography>
          </Box>
          
          <Grid container spacing={{ xs: 2, md: 3 }} justifyContent="center">
            {plans.map((plan) => (
              <Grid item xs={12} md={4} key={plan.name}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    position: 'relative',
                    border: plan.popular ? 3 : 1,
                    borderColor: plan.popular ? 'primary.main' : 'divider',
                    transform: plan.popular ? { xs: 'scale(1)', md: 'scale(1.05)' } : 'scale(1)',
                    transition: 'all 0.3s ease',
                    borderRadius: 4,
                    boxShadow: plan.popular 
                      ? '0 20px 60px rgba(102, 126, 234, 0.3)' 
                      : '0 8px 32px rgba(0,0,0,0.1)',
                    '&:hover': {
                      transform: plan.popular ? { xs: 'scale(1.02)', md: 'scale(1.08)' } : 'scale(1.02)',
                      boxShadow: plan.popular 
                        ? '0 25px 80px rgba(102, 126, 234, 0.4)' 
                        : '0 12px 40px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  {plan.popular && (
                    <Chip 
                      label="Más Popular" 
                      color="primary" 
                      sx={{ 
                        position: 'absolute', 
                        top: -12, 
                        left: '50%', 
                        transform: 'translateX(-50%)',
                        zIndex: 10,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }}
                    />
                  )}
                  
                  <CardContent sx={{ p: { xs: 3, md: 4 }, textAlign: 'center' }}>
                    <Typography variant="h5" component="h3" gutterBottom fontWeight="bold">
                      {plan.name}
                    </Typography>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h3" component="div" color={`${plan.color}.main`} fontWeight="bold">
                        {plan.price}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {plan.period}
                      </Typography>
                    </Box>
                    
                    <List sx={{ mb: 3 }}>
                      {plan.features.map((feature, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <CheckIcon color="success" />
                          </ListItemIcon>
                          <ListItemText primary={feature} />
                        </ListItem>
                      ))}
                      {plan.limitations && plan.limitations.length > 0 && (
                        <>
                          <Divider sx={{ my: 2 }} />
                          <Typography variant="subtitle2" color="text.secondary" sx={{ px: 2, mb: 1 }}>
                            Limitaciones:
                          </Typography>
                          {plan.limitations.map((limitation, index) => (
                            <ListItem key={`limitation-${index}`} sx={{ px: 0 }}>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <CloseIcon color="error" />
                              </ListItemIcon>
                              <ListItemText 
                                primary={limitation} 
                                sx={{ 
                                  '& .MuiListItemText-primary': { 
                                    color: 'text.secondary',
                                    textDecoration: 'line-through'
                                  } 
                                }} 
                              />
                            </ListItem>
                          ))}
                        </>
                      )}
                    </List>
                    
                    <Button
                      variant={plan.buttonVariant}
                      color={plan.color}
                      fullWidth
                      size="large"
                      onClick={() => handlePlanSelect(plan)}
                      sx={{ 
                        mt: 3,
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        borderRadius: 3,
                        boxShadow: plan.popular ? '0 8px 24px rgba(102, 126, 234, 0.3)' : 'none',
                        '&:hover': {
                          boxShadow: plan.popular ? '0 12px 32px rgba(102, 126, 234, 0.4)' : '0 4px 16px rgba(0,0,0,0.1)'
                        }
                      }}
                    >
                      {plan.buttonText}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonios */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h2" component="h2" gutterBottom sx={{ 
            fontWeight: 800,
            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2
          }}>
            Lo que dicen nuestras emprendedoras
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Más de 1,250 emprendedoras ya confían en nuestra plataforma
          </Typography>
        </Box>
        
        <ModernReviewCarousel />
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: '#000000', color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <img src={logo} alt="Logo" style={{ height: 32, marginRight: 12 }} />
                <Typography variant="h6" fontWeight="bold">
                  Lista de Precios
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 2 }}>
                La plataforma líder para emprendedoras. Crea, vende y crece con nosotros.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton color="inherit" href="https://wa.me/5491151347453" target="_blank">
                  <WhatsAppIcon />
                </IconButton>
                <IconButton color="inherit" href="https://instagram.com/listadeprecios" target="_blank">
                  <InstagramIcon />
                </IconButton>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Contacto
              </Typography>
              <List dense>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <PhoneIcon />
                  </ListItemIcon>
                  <ListItemText primary="+54 9 11 5134-7453" />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <EmailIcon />
                  </ListItemIcon>
                  <ListItemText primary="reqini@gmail.com" />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <LocationIcon />
                  </ListItemIcon>
                  <ListItemText primary="Dr Pedro Chutro 440, Haedo" />
                </ListItem>
              </List>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Enlaces Rápidos
              </Typography>
              <List dense>
                <ListItem sx={{ px: 0 }}>
                  <Button color="inherit" onClick={() => navigate('/login')}>
                    Iniciar Sesión
                  </Button>
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <Button color="inherit" onClick={() => navigate('/registro')}>
                    Registrarse
                  </Button>
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <Button color="inherit" onClick={() => setContactDialogOpen(true)}>
                    Contacto
                  </Button>
                </ListItem>
              </List>
            </Grid>
          </Grid>
          
          <Box sx={{ borderTop: 1, borderColor: 'rgba(255,255,255,0.2)', mt: 4, pt: 3, textAlign: 'center' }}>
            <Typography variant="body2">
              © 2024 Lista de Precios. Todos los derechos reservados.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Botón de Instalación PWA */}
      {installPrompt && (
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={handleInstallApp}
        >
          <GetAppIcon />
        </Fab>
      )}

      {/* Dialog de Contacto */}
      <Dialog open={contactDialogOpen} onClose={() => setContactDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Contactanos
            <IconButton onClick={() => setContactDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre"
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Teléfono"
                value={contactForm.phone}
                onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mensaje"
                multiline
                rows={4}
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContactDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleContactSubmit} variant="contained">
            Enviar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default LandingPage;
