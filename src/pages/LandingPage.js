import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IS_CHRISTMAS_MODE } from '../config/christmasConfig';
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
import PremiumPlanCard from '../components/home/PremiumPlanCard';
import {
  Search as SearchIcon,
  AutoAwesome as AutoAwesomeIcon,
  Lightbulb as LightbulbIcon,
  ConnectWithoutContact as ConnectIcon,
  ShowChart as ShowChartIcon,
} from '@mui/icons-material';

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

  return (
    <>
      {/* Header */}
      <AppBar position="fixed" sx={{ bgcolor: 'white', color: 'text.primary', boxShadow: 1 }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <img src={logo} alt="Logo" style={{ height: 40, marginRight: 16 }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              {IS_CHRISTMAS_MODE ? 'Lista de Precios – Especial Navidad 🎁' : 'Lista de Precios'}
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

      {/* Hero Section Moderno */}
      <Box sx={{ 
        pt: { xs: 10, sm: 12, md: 16 }, 
        pb: { xs: 6, sm: 8, md: 10 }, 
        px: { xs: 2, sm: 3, md: 0 },
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Elementos decorativos de fondo */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.1) 0%, transparent 50%)
          `,
          zIndex: 0
        }} />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h1" component="h1" gutterBottom sx={{ 
              fontWeight: 800, 
              mb: 2,
              fontSize: { xs: '2rem', sm: '3rem', md: '4.5rem' },
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.2,
            }}>
              El Catálogo Inteligente para Emprendedoras
            </Typography>
            <Typography variant="h5" sx={{ 
              mb: 4, 
              color: 'text.secondary',
              maxWidth: { xs: '100%', md: 700 }, 
              mx: 'auto',
              fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
              lineHeight: 1.6,
              fontWeight: 400,
            }}>
              Organizá, vendé y crecé con tu negocio de Essen.
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              justifyContent: 'center', 
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              mb: 4,
            }}>
              <Button 
                variant="contained" 
                size="large" 
                onClick={() => navigate('/registro')}
                sx={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontSize: { xs: '1rem', sm: '1.125rem' },
                  fontWeight: 600,
                  borderRadius: 3,
                  boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)',
                  textTransform: 'none',
                  '&:hover': { 
                    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                    boxShadow: '0 6px 24px rgba(102, 126, 234, 0.5)',
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                Probar GRATIS por 60 días
              </Button>
              <Button 
                variant="outlined" 
                size="large"
                onClick={() => {
                  const element = document.getElementById('benefits-section');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                sx={{ 
                  borderColor: 'primary.main', 
                  color: 'primary.main',
                  borderWidth: 2,
                  px: 4,
                  py: 1.5,
                  fontSize: { xs: '1rem', sm: '1.125rem' },
                  fontWeight: 600,
                  borderRadius: 3,
                  textTransform: 'none',
                  '&:hover': { 
                    borderWidth: 2,
                    bgcolor: 'primary.main',
                    color: 'white',
                  }
                }}
              >
                Ver cómo funciona
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Barra de búsqueda visual */}
      <Box sx={{ 
        bgcolor: 'white',
        py: 3,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}>
        <Container maxWidth="md">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: 'grey.50',
              borderRadius: 3,
              px: 2,
              py: 1.5,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
            <Typography variant="body1" sx={{ color: 'text.secondary', flex: 1 }}>
              Buscá productos Essen, recetas o ideas
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Sección de Beneficios */}
      <Box id="benefits-section" sx={{ py: { xs: 6, sm: 8, md: 10 }, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Typography variant="h2" component="h2" sx={{ 
            textAlign: 'center',
            mb: 6,
            fontWeight: 700,
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Todo lo que necesitás para vender más
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                }
              }}>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Avatar sx={{ 
                    bgcolor: 'primary.main', 
                    width: 64, 
                    height: 64, 
                    mx: 'auto', 
                    mb: 2,
                  }}>
                    <ShoppingCartIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Catálogos Inteligentes
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Accedé a todos los catálogos actualizados con precios y cuotas en tiempo real.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                }
              }}>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Avatar sx={{ 
                    bgcolor: 'secondary.main', 
                    width: 64, 
                    height: 64, 
                    mx: 'auto', 
                    mb: 2,
                  }}>
                    <AutoAwesomeIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Buscador con IA
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Encontrá productos, recetas e ideas de venta con búsqueda inteligente.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                }
              }}>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Avatar sx={{ 
                    bgcolor: 'success.main', 
                    width: 64, 
                    height: 64, 
                    mx: 'auto', 
                    mb: 2,
                  }}>
                    <LightbulbIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Ideas para vender
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Generá textos, ideas de reels y contenido para tus redes sociales.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                }
              }}>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Avatar sx={{ 
                    bgcolor: 'info.main', 
                    width: 64, 
                    height: 64, 
                    mx: 'auto', 
                    mb: 2,
                  }}>
                    <ShowChartIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Seguimiento para nuevas emprendedoras
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Herramientas y recursos para acompañarte en tu crecimiento.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Plan de Suscripción */}
      <Box sx={{ 
        bgcolor: 'grey.50', 
        py: { xs: 6, sm: 8, md: 10 },
      }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h2" component="h2" sx={{ 
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Plan Emprendedoras Premium
            </Typography>
          </Box>
          <PremiumPlanCard />
        </Container>
      </Box>

      {/* Sección Inspiracional */}
      <Box sx={{ py: { xs: 6, sm: 8, md: 10 }, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" sx={{ 
                fontWeight: 700,
                mb: 3,
                fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
              }}>
                Conectá con tus clientas
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, fontSize: '1.125rem', color: 'text.secondary' }}>
                Mostrá tus productos con estilo y profesionalismo. Compartí catálogos personalizados que reflejen tu marca.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, fontSize: '1.125rem', color: 'text.secondary' }}>
                Vende más con inteligencia y simplicidad. Herramientas diseñadas especialmente para emprendedoras que buscan crecer.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ 
                bgcolor: 'grey.50',
                borderRadius: 3,
                p: 4,
                textAlign: 'center',
                minHeight: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <ConnectIcon sx={{ fontSize: 120, color: 'primary.main', opacity: 0.3 }} />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Testimonios */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, sm: 8, md: 10 } }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h2" component="h2" sx={{ 
            fontWeight: 700,
            mb: 2,
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Lo que dicen nuestras emprendedoras
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Más de 1,250 emprendedoras ya confían en nuestra plataforma
          </Typography>
        </Box>
        <ModernReviewCarousel />
      </Container>

      {/* Footer Moderno */}
      <Box sx={{ bgcolor: 'grey.900', color: 'white', py: { xs: 4, sm: 6 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Lista de Precios
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: 'grey.400' }}>
                Hecho para emprendedoras que buscan crecer y vender más.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton 
                  color="inherit" 
                  href="https://wa.me/5491151347453" 
                  target="_blank"
                  sx={{ color: 'grey.300', '&:hover': { color: 'white' } }}
                >
                  <WhatsAppIcon />
                </IconButton>
                <IconButton 
                  color="inherit" 
                  href="https://instagram.com/listadeprecios" 
                  target="_blank"
                  sx={{ color: 'grey.300', '&:hover': { color: 'white' } }}
                >
                  <InstagramIcon />
                </IconButton>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ color: 'grey.300' }}>
                Enlaces
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button 
                  color="inherit" 
                  onClick={() => navigate('/login')}
                  sx={{ justifyContent: 'flex-start', color: 'grey.300', '&:hover': { color: 'white' } }}
                >
                  Iniciar Sesión
                </Button>
                <Button 
                  color="inherit" 
                  onClick={() => navigate('/registro')}
                  sx={{ justifyContent: 'flex-start', color: 'grey.300', '&:hover': { color: 'white' } }}
                >
                  Registrarse
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ color: 'grey.300' }}>
                Contacto
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.400', mb: 0.5 }}>
                +54 9 11 5134-7453
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.400' }}>
                reqini@gmail.com
              </Typography>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'grey.400' }}>
              © 2024 Lista de Precios. Todos los derechos reservados.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, color: 'grey.500' }}>
              Hecho para emprendedoras
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
