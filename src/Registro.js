import React, { useState } from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import logo from './assets/logo.png';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import axios from 'axios';

// Detectar si estamos en producción o en desarrollo
const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8080' // URL local para desarrollo
    : 'https://backtest-production-7f88.up.railway.app'; // URL de producción

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Toggle para mostrar u ocultar la contraseña
  const handleClickShowPassword = () => setShowPassword(!showPassword);

  // Controlar el cambio del nombre de usuario
  const handleChangeUsername = (e) => {
    const value = e.target.value;
    setUsername(value.replace(/\s+/g, '').toLowerCase());
  };

  // Enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      // Hacemos una solicitud POST al backend para registrar
      const response = await axios.post(`${url}/api/register`, {
        username,
        password,
      });
  
      console.log("Respuesta del backend:", response.data);
  
      if (response.data.success) {
        // Mostrar mensaje de éxito y redirigir al login
        alert('Usuario registrado con éxito. Ahora puedes iniciar sesión.');
        window.location.href = "/login";  // Redirige manualmente a la página de login
      } else {
        alert('Hubo un problema durante el registro. Intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error durante el registro:', error.message);
      alert('Hubo un problema al registrarse. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='full-width' style={{ backgroundColor: '#FFEDC4' }}>
      <Container className='flex justify-center items-center flex-direction' maxWidth="sm" style={{ paddingTop: 100 }}>
        <img src={logo} alt="logo" height="100" className='mar-b10' />
        <form onSubmit={handleSubmit}>
          <Grid container spacing={0} className='card'>
            <Grid item xs={12} style={{ margin: '10px 0' }}>
              <label>
                <TextField
                  required
                  fullWidth
                  style={{ color: 'black', backgroundColor: 'white' }}
                  id="filled-required-name"
                  label={'Nombre'}
                  value={username}
                  variant="filled"
                  onChange={handleChangeUsername}
                />
              </label>
            </Grid>
            <Grid item xs={12} style={{ margin: '10px 0' }}>
              <label>
                <TextField
                  required
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  style={{ color: 'black', backgroundColor: 'white' }}
                  id="filled-required-code"
                  label="Código de emprendedora"
                  value={password}
                  variant="filled"
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                        style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    ),
                  }}
                />
              </label>
            </Grid>
            <Grid item xs={12} style={{ margin: '10px 0' }}>
              <Button fullWidth type="submit" variant="contained" size="large" disabled={loading}>
                {loading ? 'Registrando...' : 'Registrar'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Container>
    </div>
  );
};

export default Register;
