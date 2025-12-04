import React, { useState } from 'react';
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
import Box from '@mui/material/Box';
import axios from "./utils/axios";
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

        {/* Botones de navegación */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            justifyContent: 'center',
            alignItems: 'center',
            mt: 3,
            flexDirection: { xs: 'column', sm: 'row' },
            width: '100%',
            maxWidth: 600,
            mx: 'auto'
          }}
        >
          <Button
            variant="outlined"
            size="large"
            fullWidth
            onClick={() => navigate('/')}
            sx={{
              py: 1.5,
              fontWeight: 'bold',
              borderRadius: 2,
              borderColor: 'primary.main',
              color: 'primary.main',
              '&:hover': {
                borderColor: 'primary.dark',
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            Volver a Home
          </Button>
          <Button
            variant="outlined"
            size="large"
            fullWidth
            onClick={() => navigate('/login')}
            sx={{
              py: 1.5,
              fontWeight: 'bold',
              borderRadius: 2,
              borderColor: 'secondary.main',
              color: 'secondary.main',
              '&:hover': {
                borderColor: 'secondary.dark',
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            Ir al Login
          </Button>
        </Box>
      </Container>

    </div>
  );
};

export default Register;
