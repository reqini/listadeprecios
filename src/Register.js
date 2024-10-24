import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import logo from './assets/logo.png';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import axios from 'axios';
import { Typography } from '@mui/material';

// Detectar si estamos en producción o en desarrollo
const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:4000' // URL local para desarrollo
    : 'https://backtest-production-7f88.up.railway.app'; // URL de producción

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${url}/api/register`, {
        username,
        password,
      });

      if (response.data.success) {
        // Registro exitoso, redirigir al login
        alert('Registro exitoso, ahora puedes iniciar sesión.');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error durante el registro:', error.message);
      alert('Hubo un problema al registrarte. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setUsername(value.replace(/\s+/g, '').toLowerCase());
  };

  return (
    <div className='full-width' style={{ backgroundColor: '#FFFFFF' }}>
      <Container className='flex justify-center items-center flex-direction' maxWidth="sm" style={{ paddingTop: 100 }}>
        <img src={logo} alt="logo" height="100" className='mar-b10' />
        <form onSubmit={handleSubmit}>
          <Grid container spacing={0} className='card-register'>
            <Grid item xs={12} style={{ margin: '10px 0' }}>
              <Typography variant='h6' textAlign='center' color='#ffffff' fontWeight={700}>Registro de Usuarios</Typography>
            </Grid>
            <Grid item xs={12} style={{ margin: '10px 0' }}>
              <label>
                <TextField
                    required
                    fullWidth
                    style={{ color: 'black', backgroundColor: 'white' }}
                    id="nombre-input"  // Asegúrate de que el id es único
                    label={'Ingresa tu Nombre'}
                    value={username}
                    variant="filled"
                    onChange={handleChange}
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
                  id="filled-required"  // <--- Este id está repetido en otro lugar
                  label="Ingresa tu clave"
                  value={password}
                  variant="filled"
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="start"
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
              <Button fullWidth color='secondary' type="submit" variant="contained" size="large">
                {loading ? 'Registrando...' : 'Registrarse'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Container>
    </div>
  );
};

export default Register;
