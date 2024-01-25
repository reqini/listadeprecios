// App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import axios from "axios"

import Login from './Login';
import Home from './home';
// import usersData from './usersData';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const url = "https://backtest-production.up.railway.app"

const App = () => {

  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogin = async (username, password, navigate) => {
    const result = await axios.post(`${url}/api/login`, {
      username,
      password
    })

    // const user = usersData.find((u) => u.username === username && u.password === password);
    // if (user) { 

    if (result.data && result.data.token) {
      setLoggedIn(true);
      navigate('/home');
    } else {
      alert('Usuario o contraseña incorrectos');
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
  };

  return (
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
          element={<Link to="/login">Ir al Login</Link>}
        />
      </Routes>
    </Router>
  )

};

export default App;
