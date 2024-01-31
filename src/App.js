// App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import axios from "axios"
import Login from './Login';
import Home from './home';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const url = "https://backtest-production.up.railway.app"

const theme = createTheme({
  palette: {
    primary: {
      dark: '#765471',
      main: '#A47A9E',
      light: '#D7AED2',
    },
    secondary: {
      dark: '#E8CD91',
      main: '#FBE5B2',
      light: '#FFF0CC',
    },
  },
});

const App = () => {

  const [loggedIn, setLoggedIn] = useState(() => {
    // Intenta obtener el estado de autenticación desde el almacenamiento local al cargar la aplicación
    const storedAuth = localStorage.getItem('loggedIn');
    return storedAuth ? JSON.parse(storedAuth) : false;
  });

  const handleLogin = async (username, password, navigate) => {
    const result = await axios.post(`${url}/api/login`, {
      username,
      password
    })

    if (result.data && result.data.token) {
      setLoggedIn(true);
      localStorage.setItem('loggedIn', JSON.stringify(true));
      navigate('/home');
    } else {
      alert('Usuario o contraseña incorrectos');
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    localStorage.removeItem('loggedIn');
  };

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={<Login onLogin={handleLogin} />}
          />
          <Route
            path="/home"
            element={loggedIn ? <Home onLogout={handleLogout} /> : <Navigate to="/login" />}
          />
          <Route
            path="/"
            element={<Login onLogin={handleLogin} />}
          />
        </Routes>
      </Router>
    </ThemeProvider>
  )

};

export default App;
