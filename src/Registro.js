import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Container from '@mui/material/Container';
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
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import axios from "./utils/axios";
import { Typography } from '@mui/material';
import logo from './assets/logo.png';

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
      setError(response.data.message || 'Hubo un problema durante el registro.');
    }

  } catch (error) {
    console.error('Error durante el registro:', error.response?.data?.message || error.message);
    setError(error.response?.data?.message || 'Hubo un problema al registrarse. Intenta de nuevo.');
  } finally {
    setLoading(false);
  }
};



  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        px: 2,
        py: 6,
      }}
    >
      <Container maxWidth="xs" disableGutters>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <img src={logo} alt="logo" height="88" />
          <Typography variant="h6" sx={{ mt: 1.5, color: 'text.secondary' }}>
            Registro de usuarios nuevos
          </Typography>
        </Box>

        <Paper sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                required
                fullWidth
                id="filled-required-name"
                label="Crear usuario"
                value={username}
                onChange={handleChangeUsername}
              />
              <TextField
                required
                fullWidth
                type={showPassword ? 'text' : 'password'}
                id="filled-required-password"
                label="Crear contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
              />
              <TextField
                required
                fullWidth
                type={showConfirmPassword ? 'text' : 'password'}
                id="filled-required-confirm-password"
                label="Confirmar contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={handleClickShowConfirmPassword}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
              />
              <FormControl fullWidth>
                <InputLabel id="rango-label">Selecciona un rango</InputLabel>
                <Select
                  labelId="rango-label"
                  id="rango"
                  label="Selecciona un rango"
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
              <TextField
                required
                fullWidth
                id="filled-required-codigo-emprendedora"
                label="Código de Emprendedora"
                value={codigoEmprendedora}
                onChange={handleCodigoChange}
                error={!!codigoError}
                helperText={codigoError}
              />

              {error && <Alert severity="error">{error}</Alert>}

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={!isFormValid || loading}
              >
                {loading
                  ? 'Procesando...'
                  : 'Registrarse y Activar Suscripción Mensual'
                }
              </Button>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                Después del registro, serás redirigido a Mercado Pago para activar tu suscripción mensual de $10.000
              </Typography>
            </Box>
          </form>
        </Paper>

        <Box
          sx={{
            display: 'flex',
            gap: 2,
            justifyContent: 'center',
            mt: 3,
            flexDirection: { xs: 'column', sm: 'row' },
          }}
        >
          <Button
            variant="outlined"
            size="large"
            fullWidth
            onClick={() => navigate('/')}
          >
            Volver a Home
          </Button>
          <Button
            variant="outlined"
            size="large"
            fullWidth
            onClick={() => navigate('/login')}
          >
            Ir al Login
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Register;
