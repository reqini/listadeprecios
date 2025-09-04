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
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import axios from "./utils/axios";
import { mercadopagoService } from './utils/mercadopago';
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

      if (selectedPlan === 'full') {
        // Plan de pago - crear suscripción en Mercado Pago
        const userData = {
          username,
          email: username + '@ejemplo.com', // En producción esto vendría del formulario
        };

        const subscriptionResponse = await mercadopagoService.createSubscription(userData, 'full');
        
        if (subscriptionResponse.success) {
          // Redirigir a Mercado Pago
          window.location.href = subscriptionResponse.initPoint;
        } else {
          setError('Error al procesar el pago. Intenta de nuevo.');
        }
      } else {
        // Plan gratuito - ir directo al login
        navigate('/login?registered=true');
      }

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
      style={{ backgroundImage: `url(${Image})` }}
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

        {/* Información del Plan Seleccionado */}
        {planInfo && (
          <Card sx={{ mb: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  {planInfo.name}
                </Typography>
                <Chip 
                  label={planInfo.price === 0 ? 'Gratis' : `$${planInfo.price}`}
                  color={planInfo.price === 0 ? 'success' : 'primary'}
                  variant="filled"
                />
              </Box>
              
              <List dense>
                {planInfo.features.map((feature, index) => (
                  <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={feature} />
                  </ListItem>
                ))}
                {planInfo.limitations && planInfo.limitations.length > 0 && (
                  <>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" color="text.secondary" sx={{ px: 2, mb: 1 }}>
                      Limitaciones:
                    </Typography>
                    {planInfo.limitations.map((limitation, index) => (
                      <ListItem key={`limitation-${index}`} sx={{ px: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CloseIcon color="error" fontSize="small" />
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
                  </>
                )}
              </List>
            </CardContent>
          </Card>
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
                color={selectedPlan === 'full' ? 'secondary' : 'primary'}
              >
                {loading 
                  ? 'Procesando...' 
                  : selectedPlan === 'full' 
                    ? 'Registrarse y Pagar $2.990' 
                    : 'Registrarse Gratis'
                }
              </Button>
            </Grid>
          </Grid>
        </form>
      </Container>
    </div>
  );
};

export default Register;
