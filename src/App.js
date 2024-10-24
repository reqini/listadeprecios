import React, { useState } from "react"; 
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Register from "./Registro";
import Login from "./Login";
import Home from "./home"; 
import Catalogo from "./catalogo";
import Catalogo3 from "./catalogo3";
import Catalogo6 from "./catalogo6";
import Catalogo9 from "./catalogo9";
import Catalogo12 from "./catalogo12";
import Catalogo18 from "./catalogo18";
import Catalogo20 from "./catalogo20";
import Catalogo24 from "./catalogo24";
import { AuthProvider, useAuth } from './AuthContext';
import axios from 'axios';

// Detectar si estamos en producción o en desarrollo
const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8080' // URL local para desarrollo
    : 'https://backtest-production-7f88.up.railway.app'; // URL de producción

const theme = createTheme({
  palette: {
    primary: {
      dark: "#765471",
      main: "#A47A9E",
      light: "#D7AED2",
    },
    secondary: {
      dark: "#E8CD91",
      main: "#FBE5B2",
      light: "#FFF0CC",
    },
  },
});

const App = () => {
  const [auth, setAuth] = useState({
    token: localStorage.getItem("token") || null,
  });

  // Función para manejar el login
  const handleLogin = async (username, password) => {
    try {
      const result = await axios.post(`${url}/api/login`, { username, password });

      if (result.data.token) {
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("username", result.data.username);  // Guarda el username autenticado
        setAuth({ token: result.data.token });
        window.location.href = "/home"; // Redirige a home
      } else {
        alert("Usuario o contraseña incorrectos");
      }
    } catch (error) {
      console.error("Error durante la autenticación:", error);
      alert("Hubo un problema al iniciar sesión. Por favor, intenta de nuevo.");
    }
  };

  // Función para manejar el logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username"); // Elimina el nombre de usuario del localStorage
    setAuth({ token: null });
    window.location.href = "/login"; // Redirige al login después del logout
  };

  return (
    <ThemeProvider theme={theme}>
      <AuthProvider value={{ auth, setAuth }}>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginRoute handleLogin={handleLogin} />} />
            <Route path="/registro" element={<Register />} />
            <Route path="/home" element={<PrivateRoute component={Home} handleLogout={handleLogout} />} />
            <Route path="/catalogo" element={<PrivateRoute component={Catalogo} />} />
            <Route path="/catalogo3" element={<PrivateRoute component={Catalogo3} />} />
            <Route path="/catalogo6" element={<PrivateRoute component={Catalogo6} />} />
            <Route path="/catalogo9" element={<PrivateRoute component={Catalogo9} />} />
            <Route path="/catalogo12" element={<PrivateRoute component={Catalogo12} />} />
            <Route path="/catalogo18" element={<PrivateRoute component={Catalogo18} />} />
            <Route path="/catalogo20" element={<PrivateRoute component={Catalogo20} />} />
            <Route path="/catalogo24" element={<PrivateRoute component={Catalogo24} />} />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

// Componente para manejar rutas privadas
const PrivateRoute = ({ component: Component, handleLogout }) => {
  const { auth } = useAuth();

  if (!auth || !auth.token) {
    return <Navigate to="/login" />;
  }

  return <Component handleLogout={handleLogout} />; // Pasamos `handleLogout` a `Home`
};

// Componente para manejar la redirección del login si ya está autenticado
const LoginRoute = ({ handleLogin }) => {
  const { auth } = useAuth();

  if (auth && auth.token) {
    return <Navigate to="/home" />;
  }

  return <Login onLogin={handleLogin} />;
};

export default App;
