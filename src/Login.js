import React, { useState } from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import logo from './assets/logo.png';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import axios from "./utils/axios";

const Login = () => {
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
      // Hacemos una solicitud POST al backend para autenticar
      const response = await axios.post(`/api/login`, {
        username,
        password,
      });
  
      console.log("Respuesta del backend:", response.data);
  
      if (response.data.token) {
        // Guardar el token en localStorage
        const existingSession = localStorage.getItem('activeSession');
        
        if (existingSession && existingSession !== username) {
          // Si hay otra sesión activa, cerrarla
          alert('Ya hay una sesión activa en otro dispositivo. Se cerrará esa sesión.');
        }
  
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('activeSession', username);
  
        // Redirigir al home después de un login exitoso
        window.location.href = "/home";
      } else {
        // Mostrar error si el usuario o la contraseña son incorrectos
        alert('Usuario o contraseña incorrectos');
      }
    } catch (error) {
      console.error('Error durante la autenticación:', error.message);
      alert('Hubo un problema al iniciar sesión. Por favor, intenta de nuevo.');
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
                  label={'Usuario'}
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
                  label="Contraseña"
                  value={password}
                  variant="filled"
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                        style={{ position: 'absolute', right: 15, top: '50%', transform: 'translateY(-50%)' }}
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
                {loading ? 'Cargando...' : 'Entrar'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Container>
    </div>
  );
};

export default Login;
