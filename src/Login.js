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

const Login = ({ onLogin }) => {
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
      // Simulación de autenticación
      // Aquí harías la solicitud con Axios para autenticar al usuario
      // Ejemplo: 
      // const response = await axios.post('URL_A_TU_BACKEND', { username, password });
  
      // Si la autenticación es exitosa, guarda la sesión
      localStorage.setItem('activeSession', username); // Guardar la sesión activa
      onLogin(username, password, navigate);
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
                  id="filled-required"
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
                  id="filled-required"
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
