
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import logo from './logo.png';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
/* import logoSinlimites from './sin-limites.png'; */

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const handleChangePass = (e) => {
    setPassword(e.target.value);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    onLogin(username, password, navigate);
  };

  const handleChange = (e) => {
    // Obtener el valor del campo de texto
    const value = e.target.value;

    // Eliminar espacios y convertir a minúsculas
    const processedValue = value.replace(/\s+/g, '').toLowerCase();

    // Actualizar el estado con el valor procesado
    setUsername(processedValue);
  };

  return (
    <div className='full-width' style={{backgroundColor: '#FFEDC4'}}>
      <Container className='flex justify-center items-center flex-direction' maxWidth="sm" style={{paddingTop:100}}>
        <img src={logo} alt="logo" height="100" className='mar-b10' />
        <form onSubmit={handleSubmit}>
          <Grid container spacing={0} className='card'>
              <Grid item xs={12} style={{margin: '10px 0'}}>
                  <label>
                      <TextField
                          required
                          fullWidth
                          style={{ color: 'black', backgroundColor: 'white' }}
                          id="filled-required"
                          label={'Nombre'}          
                          defaultValue={username}
                          variant="filled"
                          onChange={handleChange}
                      />
                  </label>
              </Grid>
              <Grid item xs={12} style={{margin: '10px 0'}}>
                  <label>
                    <TextField
                      required
                      fullWidth
                      type={showPassword ? 'text' : 'password'} // Cambia el tipo según el estado
                      style={{ color: 'black', backgroundColor: 'white' }}
                      id="filled-required"
                      label="Código de emprendedora"
                      value={password} // Usa value en lugar de defaultValue para controlar el componente
                      variant="filled"
                      onChange={handleChangePass}
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
              <Grid item xs={12} style={{margin: '10px 0'}}>
                  <Button fullWidth type="submit" variant="contained" size="large">
                      {loading ? 'Cargando' : 'Entrar'}
                  </Button>
              </Grid>
          </Grid>       
        </form>
        {/* <img src={logoSinlimites} alt="logo" height="50" style={{marginTop: 24}} /> */}
      </Container>
    </div>
    
  );
};

export default Login;
