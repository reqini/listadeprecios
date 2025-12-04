import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
// import Card from '@mui/material/Card'; // No utilizado después de convertir a modal
// import CardContent from '@mui/material/CardContent'; // No utilizado después de convertir a modal
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import InfoIcon from '@mui/icons-material/Info';
import axios from "./utils/axios";
import { mercadopagoService } from './utils/mercadopago';
import { redirectToCheckout, SUBSCRIPTION_CONFIG } from './services/mercadopagoSubscriptionService';
import { Typography } from '@mui/material';
import Image from './assets/background.jpg';

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedPlan = searchParams.get('plan') || 'limitado';
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [codigoEmprendedora, setCodigoEmprendedora] = useState('');
  const [codigoError, setCodigoError] = useState('');
  const [rango, setRango] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [planInfo, setPlanInfo] = useState(null);
  const [planModalOpen, setPlanModalOpen] = useState(false);

  const rangos = [
    "Demostrador/a",
    "Demostrador/a plata",
    "Demostrador/a oro",
    "Coordinador/a",
    "Coordinador/a diamante",
    "Ejecutivo/a",
    "Ejecutivo/a senior",
    "Ejecutivo/a máster",
    "Ejecutivo/a premium",
    "Empresario/a",
    "Empresario/a VIP",
  ];

  useEffect(() => {
    // Cargar información del plan seleccionado
    const plan = mercadopagoService.getPlanInfo(selectedPlan);
    setPlanInfo(plan);
  }, [selectedPlan]);

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const handleClickShowConfirmPassword = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const handleChangeUsername = (e) => {
    const value = e.target.value;
    setUsername(value.replace(/\s+/g, '').toLowerCase());
  };

  const handleCodigoChange = (e) => {
    const value = e.target.value;
    
    if (!/^\d*$/.test(value)) {
      setCodigoError("Solo se permiten números.");
      return;
    }

    if (value.length > 8) {
      return; // No permite más de 8 dígitos
    }

    setCodigoEmprendedora(value);
    setCodigoError('');
  };

const isFormValid =
  username &&
  password &&
  confirmPassword &&
  rango &&
  codigoEmprendedora &&
  //tipoUsuario && // 👈 agregado
  password === confirmPassword;


const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setCodigoError('');

  if (password !== confirmPassword) {
    setError('Las contraseñas no coinciden.');
    return;
  }

  if (!rango) {
    setError('Por favor selecciona un rango.');
    return;
  }

  if (!/^\d{6,8}$/.test(codigoEmprendedora)) {
    setCodigoError("El código debe ser numérico y tener entre 6 y 8 dígitos.");
    return;
  }

  try {
    setLoading(true);

    const payload = {
      username,
      password,
      rango,
      codigo_emprendedora: codigoEmprendedora,
      plan: selectedPlan, // Agregar el plan seleccionado
    };

    const response = await axios.post(`/auth/register`, payload);

    if (response.data.success) {
      localStorage.setItem("registeredUsername", username);
      localStorage.setItem("subscriptionStatus", "none"); // Marcar como sin suscripción

      // Redirigir a la pantalla de activar suscripción (OBLIGATORIO)
      navigate('/suscripcion/activar');
    } else {
      setCodigoError(response.data.message || 'Hubo un problema durante el registro.');
    }

  } catch (error) {
    console.error('Error durante el registro:', error.response?.data?.message || error.message);
    setCodigoError(error.response?.data?.message || 'Hubo un problema al registrarse. Intenta de nuevo.');
  } finally {
    setLoading(false);
  }
};



  return (
    <div
      className="full-width background-image"
      style={{ 
        backgroundImage: `url(${Image})`,
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh'
      }}
    >
      <Container
        className="flex justify-center items-center flex-direction"
        maxWidth="sm"
        style={{ paddingTop: 100 }}
      >
        <Typography
          className="title-registro"
          textAlign="center"
          variant="h5"
          marginBottom="20px"
        >
          Registro de usuarios nuevos
        </Typography>

        {/* Botón para ver información del Plan */}
        {planInfo && (
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<InfoIcon />}
              onClick={() => setPlanModalOpen(true)}
              sx={{
                borderRadius: 3,
                px: 3,
                py: 1.5,
                fontWeight: 'bold',
                boxShadow: '0 4px 20px rgba(156, 39, 176, 0.3)',
                '&:hover': {
                  boxShadow: '0 8px 32px rgba(156, 39, 176, 0.4)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Ver detalles del {planInfo.name}
            </Button>
          </Box>
        )}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={0} className="card">
            <Grid item xs={12} style={{ margin: '10px 0' }}>
              <TextField
                required
                fullWidth
                style={{ color: 'black', backgroundColor: 'white' }}
                id="filled-required-name"
                label="Crear usuario"
                value={username}
                variant="filled"
                onChange={handleChangeUsername}
              />
            </Grid>
            <Grid item xs={12} style={{ margin: '10px 0' }}>
              <TextField
                required
                fullWidth
                type={showPassword ? 'text' : 'password'}
                style={{ color: 'black', backgroundColor: 'white' }}
                id="filled-required-password"
                label="Crear contraseña"
                value={password}
                variant="filled"
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                      style={{
                        position: 'absolute',
                        right: 15,
                        top: '50%',
                        transform: 'translateY(-50%)',
                      }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} style={{ margin: '10px 0' }}>
              <TextField
                required
                fullWidth
                type={showConfirmPassword ? 'text' : 'password'}
                style={{ color: 'black', backgroundColor: 'white' }}
                id="filled-required-confirm-password"
                label="Confirmar contraseña"
                value={confirmPassword}
                variant="filled"
                onChange={(e) => setConfirmPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={handleClickShowConfirmPassword}
                      edge="end"
                      style={{
                        position: 'absolute',
                        right: 15,
                        top: '50%',
                        transform: 'translateY(-50%)',
                      }}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} style={{ margin: '10px 0' }}>
              <FormControl
                fullWidth
                variant="filled"
                style={{ backgroundColor: 'white' }}
              >
                <InputLabel id="rango-label">Selecciona un rango</InputLabel>
                <Select
                  labelId="rango-label"
                  id="rango"
                  value={rango}
                  onChange={(e) => setRango(e.target.value)}
                  required
                >
                  {rangos.map((rangoOption, index) => (
                    <MenuItem key={index} value={rangoOption}>
                      {rangoOption}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} style={{ margin: '10px 0' }}>
              <TextField
                required
                fullWidth
                style={{ color: 'black', backgroundColor: 'white' }}
                id="filled-required-codigo-emprendedora"
                label="Código de Emprendedora"
                value={codigoEmprendedora}
                variant="filled"
                onChange={handleCodigoChange}
                error={!!codigoError}
                helperText={codigoError}
              />
            </Grid>
            {/* <Grid item xs={12} style={{ margin: '10px 0' }}>
              <FormControl fullWidth variant="filled" style={{ backgroundColor: 'white' }}>
                <InputLabel id="tipo-usuario-label">Tipo de usuario</InputLabel>
                <Select
                  labelId="tipo-usuario-label"
                  id="tipo_usuario"
                  value={tipoUsuario}
                  onChange={(e) => setTipoUsuario(e.target.value)}
                  required
                >
                  <MenuItem value="limitado">Gratis (solo lista de precios)</MenuItem>
                  <MenuItem value="full">Usuario full (con todas las herramientas)</MenuItem>
                </Select>
              </FormControl>
            </Grid> */}

            {error && (
              <Grid
                item
                xs={12}
                style={{
                  margin: '10px 0',
                  color: 'red',
                  textAlign: 'center',
                }}
              >
                {error}
              </Grid>
            )}
            <Grid item xs={12} style={{ margin: '10px 0' }}>
              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={!isFormValid || loading}
                color="primary"
              >
                {loading 
                  ? 'Procesando...' 
                  : 'Registrarse y Activar Suscripción Mensual'
                }
              </Button>
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Después del registro, serás redirigido a Mercado Pago para activar tu suscripción mensual de $10.000
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Container>

      {/* Modal de Información del Plan */}
      <Dialog 
        open={planModalOpen} 
        onClose={() => setPlanModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" fontWeight="bold">
              {planInfo?.name}
            </Typography>
            <IconButton onClick={() => setPlanModalOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {planInfo && (
            <>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Chip 
                  label={planInfo.price === 0 ? 'Gratis' : `$${planInfo.price}`}
                  color={planInfo.price === 0 ? 'success' : 'primary'}
                  variant="filled"
                  sx={{ 
                    fontSize: '1.1rem', 
                    py: 2, 
                    px: 3,
                    fontWeight: 'bold'
                  }}
                />
              </Box>
              
              <Typography variant="h6" gutterBottom>
                Características incluidas:
              </Typography>
              
              <List dense>
                {planInfo.features.map((feature, index) => (
                  <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText primary={feature} />
                  </ListItem>
                ))}
              </List>

              {planInfo.limitations && planInfo.limitations.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="h6" gutterBottom color="error">
                    Limitaciones:
                  </Typography>
                  
                  <List dense>
                    {planInfo.limitations.map((limitation, index) => (
                      <ListItem key={`limitation-${index}`} sx={{ px: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CloseIcon color="error" />
                        </ListItemIcon>
                        <ListItemText
                          primary={limitation}
                          sx={{
                            '& .MuiListItemText-primary': {
                              color: 'text.secondary',
                              textDecoration: 'line-through',
                              fontSize: '0.875rem'
                            }
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setPlanModalOpen(false)}
            color="inherit"
            sx={{ mr: 1 }}
          >
            Cerrar
          </Button>
          <Button 
            onClick={() => {
              setPlanModalOpen(false);
              // Aquí podrías agregar lógica para cambiar de plan si es necesario
            }}
            variant="contained"
            color="primary"
            sx={{ 
              borderRadius: 3,
              px: 4,
              fontWeight: 'bold'
            }}
          >
            Continuar con este Plan
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Register;
