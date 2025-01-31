import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ReactGA from "react-ga4"; // Importar Google Analytics

import Login from "./Login";
import Home from "./home";
import Registro from "./Registro";
import Catalogo from "./catalogo";
import Catalogo3 from "./catalogo3";
import Catalogo6 from "./catalogo6";
import Catalogo9 from "./catalogo9";
import Catalogo12 from "./catalogo12";
import Catalogo18 from "./catalogo18";
import Catalogo20 from "./catalogo20";
import Catalogo24 from "./catalogo24";
import Contado from "./contado";
import { AuthProvider, useAuth } from "./AuthContext";

// Configuración de Google Analytics
const TRACKING_ID = "G-5S2G3FYSPS"; // Reemplazá con tu ID real
ReactGA.initialize(TRACKING_ID);

// Tema personalizado
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

// Ruta privada
const PrivateRoute = ({ children }) => {
  const { auth } = useAuth();
  if (!auth || !auth.token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Ruta para login
const LoginRoute = () => {
  const { auth } = useAuth();
  if (auth && auth.token) {
    return <Navigate to="/home" replace />;
  }
  return <Login />;
};

// Componente para rastrear cambios de ruta en Google Analytics
const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: location.pathname });
  }, [location]);

  return null;
};

const App = () => {
  useEffect(() => {
    // Limpieza automática de datos almacenados
    try {
      const authData = localStorage.getItem("token");
      if (!authData || typeof authData !== "string") {
        localStorage.clear();
        sessionStorage.clear();
      }
    } catch (error) {
      console.error("Error limpiando datos almacenados:", error);
      localStorage.clear();
      sessionStorage.clear();
    }
  }, []);

  useEffect(() => {
    // Detectar nuevas versiones del Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
                  alert("Hay una nueva versión disponible. La aplicación se actualizará automáticamente.");
                  window.location.reload();
                }
              };
            }
          };
        }
      });
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <AnalyticsTracker /> {/* Tracker de Google Analytics */}
          <Routes>
            <Route path="/login" element={<LoginRoute />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/cat" element={<Catalogo />} />
            <Route path="/cat3" element={<Catalogo3 />} />
            <Route path="/cat6" element={<Catalogo6 />} />
            <Route path="/cat9" element={<Catalogo9 />} />
            <Route path="/cat12" element={<Catalogo12 />} />
            <Route path="/cat18" element={<Catalogo18 />} />
            <Route path="/cat20" element={<Catalogo20 />} />
            <Route path="/cat24" element={<Catalogo24 />} />
            <Route path="/cont-02-25" element={<Contado />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
