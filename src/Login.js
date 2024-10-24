import React, { useState } from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import logo from './assets/logo.png';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import axios from 'axios'; // Importamos axios para hacer solicitudes

const url = "http://localhost:4000"; // Asegúrate de que esta es la URL correcta de tu backend

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const response = await axios.post(`${url}/api/login`, {
        username,
        password,
      });
  
      console.log("Respuesta del backend:", response.data);
  
      if (response.data.token) {
        // Guarda el token y el username en el localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('activeSession', response.data.username);
  
        // Aquí realizamos la redirección de manera más explícita
        window.location.href = "/home";  // Redirige manualmente a la página de home
      } else {
        alert('Usuario o contraseña incorrectos');
      }
    } catch (error) {
      console.error('Error durante la autenticación:', error.message);
      alert('Hubo un problema al iniciar sesión. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };
  

  const handleChange = (e) => {
    const value = e.target.value;
    setUsername(value.replace(/\s+/g, '').toLowerCase());
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
              <Button fullWidth type="submit" variant="contained" size="large">
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
