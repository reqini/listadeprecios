import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import axios from "axios";
import Login from "./Login";
import Home from "./home";
import Catalogo from "./catalogo";
import Catalogo6 from "./catalogo6";
import Catalogo12 from "./catalogo12";
import Catalogo18 from "./catalogo18";
import Catalogo24 from "./catalogo24";
import MaintenancePage from "./Mantenimiento";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

const url = "https://backtest-production-7f88.up.railway.app";

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
  const [loggedIn, setLoggedIn] = useState(() => {
    const storedAuth = localStorage.getItem("loggedIn");
    return storedAuth ? JSON.parse(storedAuth) : false;
  });

  const handleLogin = async (username, password, navigate) => {
    const result = await axios.post(`${url}/api/login`, {
      username,
      password,
    });

    if (result.data && result.data.token) {
      setLoggedIn(true);
      localStorage.setItem("loggedIn", JSON.stringify(true));
      navigate("/home");
    } else {
      alert("Usuario o contraseña incorrectos");
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    localStorage.removeItem("loggedIn");
  };

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          {/* Si el usuario ya está autenticado, redirige desde /login a /home */}
          <Route
            path="/login"
            element={
              loggedIn ? <Navigate to="/home" /> : <Login onLogin={handleLogin} />
            }
          />

          {/* Ruta protegida para /home */}
          <Route
            path="/home"
            element={
              loggedIn ? (
                <Home onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* Ruta abierta para /catalogo */}
          <Route path="/catalogo" element={<Catalogo />} />
          {/* Ruta abierta para /catalogo6 */}
          <Route path="/catalogo6" element={<Catalogo6 />} />
          {/* Ruta abierta para /catalogo12 */}
          <Route path="/catalogo12" element={<Catalogo12 />} />
          {/* Ruta abierta para /catalogo18 */}
          <Route path="/catalogo18" element={<Catalogo18 />} />
          {/* Ruta abierta para /catalogo24 */}
          <Route path="/catalogo24" element={<Catalogo24 />} />

          {/* Redirección por defecto: si está autenticado, va a /home, sino a /login */}
          {/* <Route path="/" element={<Navigate to={loggedIn ? "/home" : "/login"} />} /> */}
          <Route path="/" element={<MaintenancePage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
