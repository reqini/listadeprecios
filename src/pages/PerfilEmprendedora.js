import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  IconButton,
  InputAdornment,
  Alert,
  Snackbar,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  // FormControlLabel, // No utilizado por ahora
  Tabs,
  Tab,
  Badge,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Visibility,
  VisibilityOff,
  Edit as EditIcon,
  Save as SaveIcon,
  // Cancel as CancelIcon, // No utilizado por ahora
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Language as LanguageIcon,
  Analytics as AnalyticsIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  ShoppingCart as ShoppingCartIcon,
  PhotoCamera as PhotoCameraIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import Navbar from '../components/Navbar';
import FreePlanWelcome from '../components/FreePlanWelcome';
import { profileAPI } from '../utils/profileAPI';
import { usePlanPermissions } from '../hooks/usePlanPermissions';

const PerfilEmprendedora = () => {
  const navigate = useNavigate();
  const { userPlan, canAccess } = usePlanPermissions();
  
  // Estados principales
  const [user, setUser] = useState({
    username: localStorage.getItem('activeSession') || '',
    email: '',
    phone: '',
    address: '',
    businessName: '',
    businessType: '',
    avatar: '',
    preferences: {
      notifications: true,
      darkMode: false,
      language: 'es',
      theme: 'default'
    }
  });

  // Estados de UI
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [changePasswordDialog, setChangePasswordDialog] = useState(false);

  // Estados para cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Estados para estadísticas (simuladas)
  const [stats, setStats] = useState({
    totalVentas: 0,
    clientesActivos: 0,
    placasGeneradas: 0,
    rating: 4.8
  });

  useEffect(() => {
    // Cargar datos del usuario desde localStorage o API
    loadUserData();
    loadStats();
  }, []);

  const loadUserData = async () => {
    try {
      const username = localStorage.getItem('activeSession');
      if (username) {
        const response = await profileAPI.getProfile(username);
        if (response.success) {
          setUser(response.data);
        } else {
          console.error('Error al cargar perfil:', response.message);
        }
      }
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
    }
  };

  const loadStats = async () => {
    try {
      const username = localStorage.getItem('activeSession');
      if (username) {
        const response = await profileAPI.getUserStats(username);
        if (response.success) {
          setStats(response.data);
        } else {
          console.error('Error al cargar estadísticas:', response.message);
        }
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const username = localStorage.getItem('activeSession');
      if (username) {
        const response = await profileAPI.updateProfile(username, user);
        if (response.success) {
          setSnackbar({
            open: true,
            message: response.message,
            severity: 'success'
          });
          setIsEditing(false);
        } else {
          setSnackbar({
            open: true,
            message: response.message,
            severity: 'error'
          });
        }
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error al actualizar el perfil',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSnackbar({
        open: true,
        message: 'Las contraseñas no coinciden',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      const username = localStorage.getItem('activeSession');
      if (username) {
        const response = await profileAPI.changePassword(username, passwordData);
        if (response.success) {
          setSnackbar({
            open: true,
            message: response.message,
            severity: 'success'
          });
          setChangePasswordDialog(false);
          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } else {
          setSnackbar({
            open: true,
            message: response.message,
            severity: 'error'
          });
        }
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error al cambiar la contraseña',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('activeSession');
    navigate('/login');
  };

  const handleUpgrade = () => {
    navigate('/registro?plan=full');
  };

  const StatCard = ({ title, value, icon: Icon, color = 'primary', trend = null }) => (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="h2" color={color}>
              {value}
            </Typography>
            {trend && (
              <Box display="flex" alignItems="center" mt={1}>
                <TrendingUpIcon color="success" fontSize="small" />
                <Typography variant="body2" color="success.main" ml={0.5}>
                  +{trend}% este mes
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56 }}>
            <Icon />
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  // Si es plan gratuito, mostrar solo el componente de bienvenida
  if (userPlan === 'limitado') {
    return (
      <>
        <Navbar
          title="👤 Perfil de Emprendedora"
          onLogout={handleLogout}
          user={{ username: user.username }}
        />
        <FreePlanWelcome onUpgrade={handleUpgrade} />
      </>
    );
  }

  return (
    <>
      <Navbar
        title="👤 Perfil de Emprendedora"
        onLogout={handleLogout}
        user={{ username: user.username }}
      />
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header del Perfil */}
        <Paper elevation={3} sx={{ p: 4, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <IconButton
                    size="small"
                    sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
                  >
                    <PhotoCameraIcon fontSize="small" />
                  </IconButton>
                }
              >
                <Avatar
                  sx={{ width: 120, height: 120, border: '4px solid white', fontSize: '3rem' }}
                  src={user.avatar}
                >
                  {user.username?.charAt(0).toUpperCase()}
                </Avatar>
              </Badge>
            </Grid>
            <Grid item xs>
              <Typography variant="h3" component="h1" gutterBottom>
                ¡Hola, {user.username}! 👋
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
                Emprendedora exitosa y líder inspiradora
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Chip
                  icon={<StarIcon />}
                  label={`${stats.rating}/5.0`}
                  color="warning"
                  variant="filled"
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
                <Chip
                  icon={<CheckCircleIcon />}
                  label="Cuenta Verificada"
                  color="success"
                  variant="filled"
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              </Box>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
                onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
                disabled={loading}
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                }}
              >
                {isEditing ? 'Guardar' : 'Editar Perfil'}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Estadísticas */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Ventas Totales"
              value={`$${stats.totalVentas.toLocaleString()}`}
              icon={ShoppingCartIcon}
              color="success"
              trend={12}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Clientes Activos"
              value={stats.clientesActivos}
              icon={PersonIcon}
              color="primary"
              trend={8}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Placas Generadas"
              value={stats.placasGeneradas}
              icon={PaletteIcon}
              color="secondary"
              trend={15}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Rating Promedio"
              value={stats.rating}
              icon={StarIcon}
              color="warning"
            />
          </Grid>
        </Grid>

        {/* Tabs de Perfil */}
        <Paper elevation={2}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab icon={<PersonIcon />} label="Información Personal" />
            <Tab icon={<SecurityIcon />} label="Seguridad" />
            <Tab icon={<NotificationsIcon />} label="Preferencias" />
            <Tab icon={<AnalyticsIcon />} label="Estadísticas" />
          </Tabs>

          {/* Tab 1: Información Personal */}
          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nombre de Usuario"
                  value={user.username}
                  disabled
                  InputProps={{
                    startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  value={user.phone}
                  onChange={(e) => setUser({ ...user, phone: e.target.value })}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Dirección"
                  value={user.address}
                  onChange={(e) => setUser({ ...user, address: e.target.value })}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nombre del Negocio"
                  value={user.businessName}
                  onChange={(e) => setUser({ ...user, businessName: e.target.value })}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tipo de Negocio"
                  value={user.businessType}
                  onChange={(e) => setUser({ ...user, businessType: e.target.value })}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* Tab 2: Seguridad */}
          <TabPanel value={activeTab} index={1}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Cambiar Contraseña
              </Typography>
              <Button
                variant="outlined"
                startIcon={<SecurityIcon />}
                onClick={() => setChangePasswordDialog(true)}
                sx={{ mb: 3 }}
              >
                Cambiar Contraseña
              </Button>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" gutterBottom>
                Seguridad de la Cuenta
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Autenticación de dos factores"
                    secondary="Recomendado para mayor seguridad"
                  />
                  <ListItemSecondaryAction>
                    <Switch edge="end" />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <WarningIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Sesiones activas"
                    secondary="1 dispositivo conectado"
                  />
                </ListItem>
              </List>
            </Box>
          </TabPanel>

          {/* Tab 3: Preferencias */}
          <TabPanel value={activeTab} index={2}>
            <Typography variant="h6" gutterBottom>
              Configuración de la Aplicación
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <NotificationsIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Notificaciones"
                  secondary="Recibir notificaciones sobre nuevas ventas y clientes"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={user.preferences.notifications}
                    onChange={(e) => setUser({
                      ...user,
                      preferences: { ...user.preferences, notifications: e.target.checked }
                    })}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <PaletteIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Modo Oscuro"
                  secondary="Cambiar el tema de la aplicación"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={user.preferences.darkMode}
                    onChange={(e) => setUser({
                      ...user,
                      preferences: { ...user.preferences, darkMode: e.target.checked }
                    })}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LanguageIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Idioma"
                  secondary="Español (Argentina)"
                />
              </ListItem>
            </List>
          </TabPanel>

          {/* Tab 4: Estadísticas */}
          <TabPanel value={activeTab} index={3}>
            <Typography variant="h6" gutterBottom>
              Rendimiento del Negocio
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Ventas por Mes
                    </Typography>
                    <LinearProgress variant="determinate" value={75} sx={{ mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      $9,350 de $12,000 objetivo
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Satisfacción del Cliente
                    </Typography>
                    <LinearProgress variant="determinate" value={96} sx={{ mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      4.8/5.0 estrellas promedio
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </Paper>

        {/* Dialog para cambio de contraseña */}
        <Dialog open={changePasswordDialog} onClose={() => setChangePasswordDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Cambiar Contraseña</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Contraseña Actual"
              type={showPassword ? "text" : "password"}
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Nueva Contraseña"
              type={showNewPassword ? "text" : "password"}
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowNewPassword(!showNewPassword)}>
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Confirmar Nueva Contraseña"
              type={showConfirmPassword ? "text" : "password"}
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setChangePasswordDialog(false)}>Cancelar</Button>
            <Button onClick={handleChangePassword} variant="contained" disabled={loading}>
              {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar para notificaciones */}
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
      </Container>
    </>
  );
};

export default PerfilEmprendedora;
