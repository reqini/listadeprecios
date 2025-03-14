import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ReactGA from "react-ga4";

import Login from "./Login";
import Home from "./home";
import Registro from "./Registro";
/* import Catalogo from "./catalogo"; */
import Catalogo3 from "./catalogo3";
import Catalogo6 from "./catalogo6";
import Catalogo9 from "./catalogo9";
import Catalogo12 from "./catalogo12";
import Catalogo18 from "./catalogo18";
import Catalogo20 from "./catalogo20";
import Catalogo24 from "./catalogo24";
import Contado from "./contado";
import { AuthProvider, useAuth } from "./AuthContext";

// **🔹 NUEVO: Importar el Dashboard de Emprendedoras**
import Emprendedoras from "./Emprendedoras";
import GeneradorDePlacas from "./GeneradorDePlacas";

// Configuración de Google Analytics
const TRACKING_ID = "G-5S2G3FYSPS";
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

// Ruta privada para proteger páginas autenticadas
const PrivateRoute = ({ children }) => {
  const { auth } = useAuth();
  return auth?.token ? children : <Navigate to="/login" replace />;
};

// Ruta para login con redirección si ya está autenticado
const LoginRoute = () => {
  const { auth } = useAuth();
  return auth?.token ? <Navigate to="/home" replace /> : <Login />;
};

// Componente para rastrear cambios de ruta con Google Analytics y Hotjar
const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: location.pathname });
  }, [location]);

  return null;
};

const App = () => {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
                  alert("Nueva versión disponible. Se actualizará automáticamente.");
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
          <AnalyticsTracker />
          <Routes>
            <Route path="/login" element={<LoginRoute />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
            {/* <Route path="/mar-25-cat" element={<Catalogo />} /> */}
            <Route path="/mar-25-cat3" element={<Catalogo3 />} />
            <Route path="/mar-25-cat6" element={<Catalogo6 />} />
            <Route path="/mar-25-cat9" element={<Catalogo9 />} />
            <Route path="/mar-25-cat12" element={<Catalogo12 />} />
            <Route path="/mar-25-cat18" element={<Catalogo18 />} />
            <Route path="/mar-25-cat20" element={<Catalogo20 />} />
            <Route path="/mar-25-cat24" element={<Catalogo24 />} />
            <Route path="/mar-25-cont" element={<Contado />} />
            <Route path="/generarPlaca" element={<GeneradorDePlacas />} />

            {/* 🔹 NUEVA RUTA PROTEGIDA PARA EL DASHBOARD (EMPRENDEDORAS) */}
            <Route path="/emprendedoras" element={<PrivateRoute><Emprendedoras /></PrivateRoute>} />

            {/* Redirección por defecto al login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
