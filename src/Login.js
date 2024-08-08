
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import logo from './logo.png';
import logoSinlimites from './sin-limites.png';

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
                          style={{color: 'black'}}
                          id="filled-required"
                          label={'Nombre'}          
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
                          type='Codigo de EIE'
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
        <img src={logoSinlimites} alt="logo" height="50" style={{marginTop: 24}} />
      </Container>
    </div>
    
  );
};

export default Login;
