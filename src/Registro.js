import React, { useState } from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import axios from "./utils/axios";
import { Typography } from '@mui/material';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const handleChangeUsername = (e) => {
    const value = e.target.value;
    setUsername(value.replace(/\s+/g, '').toLowerCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const response = await axios.post(`/api/register`, {
        username,
        password,
      });
  
      console.log("Respuesta del backend:", response.data);
  
      if (response.data.success) {
        // Mostrar mensaje de éxito y redirigir al link de suscripción
        alert('Usuario registrado con éxito. Ahora serás redirigido al plan de suscripción.');
        window.location.href = "https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=2c93808492e620a40192e8bb0f0400ed";
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
    <div className='full-width' style={{ backgroundColor: '#A47A9E' }}>
      <Container className='flex justify-center items-center flex-direction' maxWidth="sm" style={{ paddingTop: 100 }}>
        <Typography variant='h5' color='white' marginBottom='20px'>Registro de usuarios nuevos</Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={0} className='card'>
            <Grid item xs={12} style={{ margin: '10px 0' }}>
              <label>
                <TextField
                  required
                  fullWidth
                  style={{ color: 'black', backgroundColor: 'white' }}
                  id="filled-required-name"
                  label={'crear usuario'}
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
                  label="crear contraseña"
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
