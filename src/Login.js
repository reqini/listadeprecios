
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
/* import { Typography } from '@mui/material'; */

import logo from './logo.png';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    onLogin(username, password, navigate);
  };

  return (
    <div className='background-image full-width'>
      <Container className='flex justify-center items-center flex-direction' maxWidth="sm" style={{paddingTop:100}}>
        <img src={logo} alt="logo" height="100" className='mar-b10' />
        {/* <Typography textAlign={'center'} variant='h2' style={{margin: '30px 0'}}>Red Sin limites</Typography> */}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={0} className='card'>
              <Grid item xs={12} style={{margin: '10px 0'}}>
                  <label>
                      <TextField
                          required
                          fullWidth
                          style={{color: 'black'}}
                          id="filled-required"
                          label={'username'}          
                          defaultValue={username}
                          variant="filled"
                          onChange={(e) => setUsername(e.target.value)}
                      />
                  </label>
              </Grid>
              <Grid item xs={12} style={{margin: '10px 0'}}>
                  <label>
                      <TextField
                          required
                          fullWidth
                          type='password'
                          style={{color: 'black'}}
                          id="filled-required"
                          label={'Código de emprendedora'}          
                          defaultValue={password}
                          variant="filled"
                          onChange={(e) => setPassword(e.target.value)}
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
      </Container>
    </div>
    
  );
};

export default Login;
